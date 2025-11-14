// backend/src/controllers/receiptController.js
import Receipt from '../models/Receipt.js';
import Invoice from '../models/Invoice.js';
import { sendReceiptEmail } from '../utils/emailService.js';
import { sendWhatsAppReceipt } from '../utils/whatsappService.js';

/**
 * GET /api/receipts
 * Fetch all receipts. If a receipt doesn't exist for a paid invoice, generate it automatically.
 * Supports search by client name, email, phone, or receipt number.
 */
export const getReceipts = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // 1️⃣ Fetch all paid invoices
    let invoiceQuery = { status: 'paid' };
    const invoices = await Invoice.find(invoiceQuery).sort({ paidAt: -1 });

    // 2️⃣ Generate receipts for invoices without receipts
    for (const invoice of invoices) {
      const existing = await Receipt.findOne({ invoiceId: invoice._id });
      if (!existing) {
        const newReceipt = new Receipt({
          invoiceId: invoice._id,
          clientName: invoice.customerName,
          clientEmail: invoice.customerEmail,
          clientPhone: invoice.customerPhone,
          clientLocation: invoice.customerLocation,
          packageName: invoice.planName,
          packagePrice: invoice.planPrice,
          packageSpeed: invoice.planSpeed,
          paymentAmount: invoice.finalAmount,
          paymentMethod: invoice.paymentMethod,
          paymentDate: invoice.paidAt,
          status: 'sent'
        });
        await newReceipt.save();
      }
    }

    // 3️⃣ Fetch receipts (after ensuring they exist)
    let query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { clientName: regex },
        { clientEmail: regex },
        { clientPhone: regex },
        { receiptNumber: regex },
        { packageName: regex }
      ];
    }

    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      receipts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Error fetching receipts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch receipts' });
  }
};

/**
 * GET /api/receipts/:id
 * Fetch single receipt by ID
 */
export const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    res.status(200).json({ success: true, receipt });
  } catch (error) {
    console.error('❌ Error fetching receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch receipt' });
  }
};

/**
 * POST /api/receipts/:id/resend
 * Resend receipt via Email/WhatsApp
 */
export const resendReceiptNotifications = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    // Resend via Email
    let emailSent = false;
    try {
      await sendReceiptEmail(receipt);
      receipt.sentViaEmail = true;
      emailSent = true;
    } catch (err) {
      console.error('❌ Failed to send email:', err.message);
    }

    // Resend via WhatsApp
    let whatsappSent = false;
    try {
      await sendWhatsAppReceipt(receipt);
      receipt.sentViaWhatsApp = true;
      whatsappSent = true;
    } catch (err) {
      console.error('❌ Failed to send WhatsApp:', err.message);
    }

    await receipt.save();

    res.status(200).json({
      success: true,
      message: `Notifications resent. Email: ${emailSent}, WhatsApp: ${whatsappSent}`,
      receipt
    });
  } catch (error) {
    console.error('❌ Error resending notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to resend notifications' });
  }
};
