// backend/src/routes/invoiceRoutes.js

import express from 'express';
import Invoice from '../models/Invoice.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendInvoiceEmail } from '../utils/emailService.js';
import { sendWhatsAppInvoice } from '../utils/whatsappService.js';

const router = express.Router();

// POST /api/invoices — Create new invoice and send notifications
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerLocation,
      planName,
      planPrice,
      planSpeed,
      features,
      connectionType,
      notes,
      sendNotifications = true
    } = req.body;

    console.log('📥 Received invoice creation request:', {
      customerName,
      customerEmail: customerEmail ? '***' : 'missing',
      customerPhone: customerPhone ? '***' : 'missing',
      customerLocation,
      planName,
      planPrice,
      sendNotifications
    });

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !customerLocation || !planName) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, phone, location, and plan name are required'
      });
    }

    // Create and save invoice
    const invoice = new Invoice({
      customerName,
      customerEmail,
      customerPhone,
      customerLocation,
      planName,
      planPrice,
      planSpeed,
      features,
      connectionType,
      notes
    });

    await invoice.save();
    console.log('✅ Invoice saved successfully:', invoice.invoiceNumber);

    let emailResult = null;
    let whatsappResult = null;

    if (sendNotifications) {
      try {
        console.log('📧 Sending notifications...');
        emailResult = await sendInvoiceEmail(invoice);
        console.log('✅ Email sent successfully');

        // Send WhatsApp message (without blocking response)
        sendWhatsAppInvoice(invoice)
          .then(() => console.log('✅ WhatsApp message sent successfully'))
          .catch(err => console.error('❌ WhatsApp sending failed:', err.message));
      } catch (err) {
        console.error('❌ Error during notification dispatch:', err);
        // Notifications are best-effort — don't fail the request
      }
    }

    // Return response immediately (WhatsApp is fire-and-forget)
    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice
    });

  } catch (error) {
    console.error('❌ Error creating invoice:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/invoices — Get all invoices (protected)
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = {};
    if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
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
      invoices
    });
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices'
    });
  }
});

// GET /api/invoices/:id — Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({ success: true, invoice });
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice'
    });
  }
});

// PUT /api/invoices/:id/status — Update invoice status (protected)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, paid, or cancelled'
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
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated',
      invoice
    });
  } catch (error) {
    console.error('❌ Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice status'
    });
  }
});

// POST /api/invoices/:id/resend-notifications — Resend notifications (protected)
router.post('/:id/resend-notifications', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const [emailResult, whatsappResult] = await Promise.allSettled([
      sendInvoiceEmail(invoice),
      sendWhatsAppInvoice(invoice)
    ]);

    res.json({
      success: true,
      message: 'Notifications resent successfully',
      notifications: {
        email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: emailResult.reason?.message || 'Unknown error' },
        whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false, error: whatsappResult.reason?.message || 'Unknown error' }
      }
    });
  } catch (error) {
    console.error('❌ Error resending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending notifications'
    });
  }
});

// DELETE /api/invoices/:id — Delete invoice (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice'
    });
  }
});

export default router;