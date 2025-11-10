import express from 'express';
import Invoice from '../models/Invoice.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendInvoiceEmail } from '../utils/emailService.js';
import { sendWhatsAppInvoice } from '../utils/whatsappService.js';

const router = express.Router();

// Create new invoice and send notifications
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
      sendNotifications = true // Default to true
    } = req.body;

    // Log incoming request for debugging
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
      console.log('❌ Missing required fields:', {
        customerName: !customerName,
        customerEmail: !customerEmail,
        customerPhone: !customerPhone,
        customerLocation: !customerLocation,
        planName: !planName
      });
      
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

    // Send notifications if requested
    let emailResult = null;
    let whatsappResult = null;

    if (sendNotifications) {
      try {
        console.log('📧 Sending notifications...');
        
        // Send email
        emailResult = await sendInvoiceEmail(invoice);
        console.log('✅ Email sent successfully');
        
        // Send WhatsApp (with a small delay to avoid rate limiting)
        setTimeout(async () => {
          try {
            whatsappResult = await sendWhatsAppInvoice(invoice);
            console.log('✅ WhatsApp message sent successfully');
          } catch (whatsappError) {
            console.error('❌ WhatsApp sending failed:', whatsappError);
            whatsappResult = { success: false, error: whatsappError.message };
          }
        }, 1000);
        
      } catch (notificationError) {
        console.error('❌ Error sending notifications:', notificationError);
        // Don't fail the request if notifications fail
      }
    }

    // CORS-friendly success response
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice: invoice,
      notifications: {
        email: emailResult,
        whatsapp: whatsappResult
      }
    });

  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    
    // CORS-friendly error response
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
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

    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all invoices (protected)
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Invoice.countDocuments(query);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.json({
      success: true,
      count: invoices.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      invoices
    });
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices'
    });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      // CORS headers for error response
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // CORS headers for success response
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    
    // CORS headers for error response
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
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

// Update invoice status (protected)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.json({
      success: true,
      message: 'Invoice status updated',
      invoice
    });
  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(500).json({
      success: false,
      message: 'Error updating invoice'
    });
  }
});

// Resend notifications for an invoice (protected)
router.post('/:id/resend-notifications', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const emailResult = await sendInvoiceEmail(invoice);
    const whatsappResult = await sendWhatsAppInvoice(invoice);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.json({
      success: true,
      message: 'Notifications resent successfully',
      notifications: {
        email: emailResult,
        whatsapp: whatsappResult
      }
    });
  } catch (error) {
    console.error('❌ Error resending notifications:', error);
    
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(500).json({
      success: false,
      message: 'Error resending notifications'
    });
  }
});

// Delete invoice (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice'
    });
  }
});

export default router;