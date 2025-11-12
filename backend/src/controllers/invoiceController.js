// backend/src/controllers/invoiceController.js
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

    console.log('📥 Received invoice creation request with plan price:', planPrice);

    // ✅ Basic validation
    if (!customerName || !customerEmail || !customerPhone || !customerLocation || !planName) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: name, email, phone, location, and plan name are required',
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

    // ✅ Create a new instance (ensures pre-save middleware runs)
    const invoice = new Invoice({
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
    });

    await invoice.save(); // ← this triggers the pre('save') hook in your model

    console.log('✅ Invoice saved successfully with invoiceNumber:', invoice.invoiceNumber);

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

    // ✅ Mongoose validation error
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
      });
    }

    // ✅ Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected (invoice number or unique field already exists)',
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
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = {};
    if (status && ['pending', 'paid', 'cancelled', 'overdue'].includes(status)) {
      query.status = status;
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
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }
    res.json({ success: true, invoice });
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
      { status },
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
