// backend/src/controllers/invoiceController.js - COMPLETELY UPDATED WITH DEBUGGING
import Invoice from '../models/Invoice.js';
import { sendInvoiceEmail } from '../utils/emailService.js';
import { sendWhatsAppInvoice } from '../utils/whatsappService.js';

/**
 * @desc Create new invoice and optionally send notifications
 * @route POST /api/invoices
 * @access Public
 */
export const createInvoice = async (req, res) => {
  console.log('🔍 [DEBUG] Starting invoice creation process...');
  console.log('🔍 [DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const {
      planPrice,
      notes,
      sendNotifications = true,
      status = 'pending',
      invoiceDate,
      dueDate,
    } = req.body;

    // ✅ Sanitize input with defaults
    const customerName = (req.body.customerName || '').trim();
    const customerEmail = (req.body.customerEmail || '').trim().toLowerCase();
    const customerPhone = (req.body.customerPhone || '').trim();
    const customerLocation = (req.body.customerLocation || '').trim();
    const planName = (req.body.planName || '').trim();
    const planSpeed = (req.body.planSpeed || '').trim();
    const connectionType = (req.body.connectionType || 'Fiber Optic').trim();
    const features = Array.isArray(req.body.features) ? req.body.features : [];

    console.log('🔍 [DEBUG] Sanitized fields:', {
      customerName: customerName ? '✓' : '✗',
      customerEmail: customerEmail ? '✓' : '✗', 
      customerPhone: customerPhone ? '✓' : '✗',
      customerLocation: customerLocation ? '✓' : '✗',
      planName: planName ? '✓' : '✗',
      planSpeed: planSpeed ? '✓' : '✗',
      planPrice: planPrice !== undefined ? '✓' : '✗',
      connectionType: connectionType ? '✓' : '✗'
    });

    // ✅ Enhanced validation with better error messages
    const requiredFields = [
      { field: 'customerName', value: customerName, message: 'Customer name is required' },
      { field: 'customerEmail', value: customerEmail, message: 'Customer email is required' },
      { field: 'customerPhone', value: customerPhone, message: 'Customer phone is required' },
      { field: 'customerLocation', value: customerLocation, message: 'Customer location is required' },
      { field: 'planName', value: planName, message: 'Plan name is required' },
      { field: 'planSpeed', value: planSpeed, message: 'Plan speed is required' },
      { field: 'planPrice', value: planPrice, message: 'Plan price is required' }
    ];

    const missingFields = requiredFields.filter(item => !item.value);
    
    if (missingFields.length > 0) {
      console.log('❌ [DEBUG] Missing required fields:', missingFields.map(f => f.field));
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.map(f => f.field).join(', ')}`,
        details: missingFields.map(f => f.message)
      });
    }

    // ✅ Validate email format
    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
      console.log('❌ [DEBUG] Invalid email format:', customerEmail);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format. Please provide a valid email address.',
      });
    }

    // ✅ Enhanced planPrice validation
    let parsedPlanPrice;
    try {
      if (typeof planPrice === 'string') {
        parsedPlanPrice = parseInt(planPrice.replace(/,/g, ''), 10);
      } else {
        parsedPlanPrice = Number(planPrice);
      }

      if (isNaN(parsedPlanPrice)) {
        throw new Error('Not a number');
      }
      
      if (parsedPlanPrice <= 0) {
        throw new Error('Must be positive');
      }
      
      console.log('✅ [DEBUG] Plan price parsed successfully:', parsedPlanPrice);
    } catch (priceError) {
      console.log('❌ [DEBUG] Invalid plan price:', planPrice, 'Error:', priceError.message);
      return res.status(400).json({
        success: false,
        message: `Invalid plan price: "${planPrice}". Must be a positive number.`,
      });
    }

    // ✅ Handle dates
    const now = new Date();
    const finalInvoiceDate = invoiceDate ? new Date(invoiceDate) : now;
    const finalDueDate = dueDate ? new Date(dueDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // ✅ Create invoice data
    const invoiceData = {
      customerName,
      customerEmail,
      customerPhone,
      customerLocation,
      planName,
      planSpeed,
      planPrice: parsedPlanPrice,
      features,
      connectionType,
      notes: notes || '',
      status: ['pending', 'paid', 'cancelled', 'overdue'].includes(status) ? status : 'pending',
      invoiceDate: finalInvoiceDate,
      dueDate: finalDueDate,
    };

    console.log('🔍 [DEBUG] Final invoice data to save:', {
      ...invoiceData,
      planPrice: parsedPlanPrice,
      featuresCount: features.length
    });

    // ✅ Create and save invoice with detailed logging
    console.log('🔍 [DEBUG] Creating Invoice instance...');
    let invoice;
    try {
      invoice = new Invoice(invoiceData);
      console.log('✅ [DEBUG] Invoice instance created');
    } catch (modelError) {
      console.error('❌ [DEBUG] Error creating Invoice instance:', modelError);
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice data format',
        error: process.env.NODE_ENV === 'development' ? modelError.message : undefined
      });
    }

    console.log('🔍 [DEBUG] Saving invoice to database...');
    try {
      await invoice.save();
      console.log('✅ [DEBUG] Invoice saved successfully! ID:', invoice._id);
      console.log('✅ [DEBUG] Invoice displayId:', invoice.displayId);
    } catch (saveError) {
      console.error('❌ [DEBUG] Error saving invoice:', saveError);
      throw saveError; // Re-throw to be caught by the main catch block
    }

    // ✅ Send notifications (non-blocking)
    if (sendNotifications) {
      console.log('🔍 [DEBUG] Sending notifications...');
      try {
        const notificationPromises = [];
        
        if (sendInvoiceEmail) {
          notificationPromises.push(
            sendInvoiceEmail(invoice)
              .then(() => console.log('✅ [DEBUG] Email sent successfully'))
              .catch(err => console.error('❌ [DEBUG] Email failed:', err.message))
          );
        }
        
        if (sendWhatsAppInvoice) {
          notificationPromises.push(
            sendWhatsAppInvoice(invoice)
              .then(() => console.log('✅ [DEBUG] WhatsApp sent successfully'))
              .catch(err => console.error('❌ [DEBUG] WhatsApp failed:', err.message))
          );
        }
        
        await Promise.allSettled(notificationPromises);
        console.log('✅ [DEBUG] All notifications processed');
      } catch (notifyError) {
        console.warn('⚠️ [DEBUG] Notification system error:', notifyError.message);
        // Don't fail the request if notifications fail
      }
    }

    console.log('🎉 [DEBUG] Invoice creation completed successfully!');
    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully!',
      invoice,
    });

  } catch (error) {
    console.error('❌ [DEBUG] CATCH BLOCK - Invoice creation failed!');
    console.error('❌ [DEBUG] Error name:', error.name);
    console.error('❌ [DEBUG] Error message:', error.message);
    console.error('❌ [DEBUG] Error code:', error.code);
    console.error('❌ [DEBUG] Error stack:', error.stack);

    // ✅ Enhanced error handling
    if (error.name === 'ValidationError') {
      console.error('❌ [DEBUG] Validation errors detected');
      const validationErrors = Object.values(error.errors).map((err) => {
        console.error(`❌ [DEBUG] Validation error - Path: ${err.path}, Message: ${err.message}`);
        return `${err.path}: ${err.message}`;
      });

      return res.status(400).json({
        success: false,
        message: `Validation failed: ${validationErrors.join('; ')}`,
        details: validationErrors,
        error: 'VALIDATION_ERROR'
      });
    }

    if (error.name === 'CastError') {
      console.error('❌ [DEBUG] Cast error:', error);
      return res.status(400).json({
        success: false,
        message: `Invalid data format for field: ${error.path}`,
        error: 'CAST_ERROR'
      });
    }

    if (error.code === 11000) {
      console.error('❌ [DEBUG] Duplicate key error:', error.keyValue);
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate entry: ${field} '${error.keyValue[field]}' already exists`,
        error: 'DUPLICATE_ENTRY'
      });
    }

    // ✅ Database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      console.error('❌ [DEBUG] Database connection error:', error.message);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.',
        error: 'DATABASE_UNAVAILABLE'
      });
    }

    // ✅ Generic error with detailed info in development
    console.error('❌ [DEBUG] Unhandled error type:', error.name);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while creating invoice',
      ...(process.env.NODE_ENV === 'development' && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    });
  }
};

/**
 * @desc Get paginated invoices
 * @route GET /api/invoices
 * @access Public
 */
export const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const query = {};
    
    // Status filter
    if (status && ['pending', 'paid', 'cancelled', 'overdue'].includes(status)) {
      query.status = status;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      count: invoices.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      invoices,
    });
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc Get single invoice by ID
 * @route GET /api/invoices/:id
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 [DEBUG] Fetching invoice by ID:', id);
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      console.log('❌ [DEBUG] Invoice not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }
    
    console.log('✅ [DEBUG] Invoice found:', invoice._id);
    res.json({ 
      success: true, 
      invoice 
    });
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc Update invoice status
 * @route PATCH /api/invoices/:id/status
 */
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'paid', 'cancelled', 'overdue'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, paid, cancelled, or overdue.',
      });
    }

    const updateData = { status };
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      invoice,
    });
  } catch (error) {
    console.error('❌ Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice status',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc Resend invoice notifications
 * @route POST /api/invoices/:id/resend
 */
export const resendInvoiceNotifications = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const [emailResult, whatsappResult] = await Promise.allSettled([
      sendInvoiceEmail(invoice),
      sendWhatsAppInvoice(invoice),
    ]);

    res.json({
      success: true,
      message: 'Notifications resent successfully',
      notifications: {
        email: {
          success: emailResult.status === 'fulfilled',
          error: emailResult.status === 'rejected' ? emailResult.reason?.message : null
        },
        whatsapp: {
          success: whatsappResult.status === 'fulfilled',
          error: whatsappResult.status === 'rejected' ? whatsappResult.reason?.message : null
        }
      },
    });
  } catch (error) {
    console.error('❌ Error resending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending notifications',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc Delete invoice
 * @route DELETE /api/invoices/:id
 */
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * @desc Get invoice statistics
 * @route GET /api/invoices/stats/summary
 */
export const getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$planPrice' }
        }
      }
    ]);

    const totalInvoices = await Invoice.countDocuments();
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$planPrice' } } }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        totalInvoices,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching invoice stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice statistics',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};