// backend/src/controllers/invoiceController.js - COMPLETELY UPDATED (InvoiceNumber Removed)
import Invoice from '../models/Invoice.js';
import { sendInvoiceEmail } from '../utils/emailService.js';
import { sendWhatsAppInvoice } from '../utils/whatsappService.js';

/**
 * @desc Create new invoice and optionally send notifications
 * @route POST /api/invoices
 * @access Public
 */
export const createInvoice = async (req, res) => {
  try {
    const {
      planPrice,
      notes,
      sendNotifications = true,
      status = 'pending',
      invoiceDate,
      dueDate,
    } = req.body;

    // ✅ Sanitize input
    const customerName = (req.body.customerName || '').trim();
    const customerEmail = (req.body.customerEmail || '').trim();
    const customerPhone = (req.body.customerPhone || '').trim();
    const customerLocation = (req.body.customerLocation || '').trim();
    const planName = (req.body.planName || '').trim();
    const planSpeed = (req.body.planSpeed || '').trim();
    const connectionType = (req.body.connectionType || '').trim();
    const features = Array.isArray(req.body.features) ? req.body.features : [];

    console.log('📥 Received invoice creation request:', {
      customerName,
      customerEmail,
      customerPhone,
      planName,
      planPrice,
      // ❌ NO invoiceNumber logging
    });

    // ✅ UPDATED: Enhanced validation - NO invoiceNumber in required fields
    const requiredFields = [
      'customerName', 'customerEmail', 'customerPhone', 
      'customerLocation', 'planName', 'planPrice', 'planSpeed'
      // ❌ REMOVED: 'invoiceNumber' completely
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]?.trim());
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: missingFields.map(field => `${field} is required`)
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
    }

    // ✅ Ensure planPrice is a valid number
    let parsedPlanPrice;
    if (typeof planPrice === 'string') {
      parsedPlanPrice = parseInt(planPrice.replace(/,/g, ''), 10);
    } else {
      parsedPlanPrice = Number(planPrice);
    }

    if (isNaN(parsedPlanPrice) || parsedPlanPrice <= 0) {
      console.log('❌ Invalid plan price:', planPrice);
      return res.status(400).json({
        success: false,
        message: 'Invalid plan price. Must be a positive number.',
      });
    }

    // ✅ Handle dates - use provided dates or generate defaults
    const now = new Date();
    const finalInvoiceDate = invoiceDate ? new Date(invoiceDate) : now;
    const finalDueDate = dueDate ? new Date(dueDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // ✅ Create invoice data - NO invoiceNumber field
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
      notes,
      // ❌ NO invoiceNumber field - completely removed
      status: ['pending', 'paid', 'cancelled', 'overdue'].includes(status) ? status : 'pending',
      invoiceDate: finalInvoiceDate,
      dueDate: finalDueDate,
    };

    console.log('📝 Creating invoice with data:', {
      customerName: invoiceData.customerName,
      planPrice: invoiceData.planPrice,
      status: invoiceData.status
      // ❌ NO invoiceNumber logging
    });

    // ✅ Create and save invoice
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    console.log('✅ Invoice saved successfully with ID:', invoice._id);

    // ✅ Send notifications asynchronously
    if (sendNotifications) {
      try {
        console.log('📧 Sending email and WhatsApp notifications...');
        await sendInvoiceEmail(invoice);

        sendWhatsAppInvoice(invoice)
          .then(() => console.log('✅ WhatsApp message sent successfully'))
          .catch((err) => console.error('❌ WhatsApp sending failed:', err.message));
      } catch (notifyError) {
        console.error('⚠️ Notification sending failed:', notifyError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully and notifications triggered.',
      invoice,
    });
  } catch (error) {
    console.error('❌ Error creating invoice:', error);

    // ✅ Enhanced Mongoose validation error handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => {
        let msg = err.message;
        const pathMatch = msg.match(/Path `(.+?)`/);
        if (pathMatch) {
          msg = msg.replace(`Path \`${pathMatch[1]}\` `, `Field '${pathMatch[1]}' `);
        }
        return msg.replace('is required.', 'is required');
      });

      return res.status(400).json({
        success: false,
        message: `Validation Error: ${validationErrors.join(' | ')}`,
        details: validationErrors,
        error: 'VALIDATION_ERROR'
      });
    }

    // ✅ Duplicate key error (shouldn't occur since invoiceNumber is removed)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate entry detected: ${field} '${error.keyValue[field]}' already exists`,
        error: 'DUPLICATE_ENTRY'
      });
    }

    // ✅ Generic error
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while creating invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

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
        // ❌ REMOVED: invoiceNumber from search
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
    
    // ✅ SIMPLIFIED: Only search by MongoDB ID (invoiceNumber removed)
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }
    
    res.json({ 
      success: true, 
      invoice 
    });
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
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

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'paid' && { paidAt: new Date() }) // Set paidAt when status changes to paid
      },
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
        email:
          emailResult.status === 'fulfilled'
            ? { success: true }
            : { success: false, error: emailResult.reason?.message },
        whatsapp:
          whatsappResult.status === 'fulfilled'
            ? { success: true }
            : { success: false, error: whatsappResult.reason?.message },
      },
    });
  } catch (error) {
    console.error('❌ Error resending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending notifications',
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
    });
  }
};