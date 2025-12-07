// backend/src/controllers/receiptController.js - FULLY UPDATED WITH EMAIL + PDF
import Receipt from '../models/Receipt.js';
import Invoice from '../models/Invoice.js';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

/**
 * ===============================
 *      Basic CRUD Operations
 * ===============================
 */
export const createReceipt = async (req, res) => {
    try {
        const receiptData = { ...req.body, createdBy: req.user?._id, issuedBy: req.user?.name || 'System' };

        if (!receiptData.customerName || !receiptData.customerEmail || !receiptData.total) {
            return res.status(400).json({ success: false, message: 'Missing required fields: customerName, customerEmail, total' });
        }

        const receipt = new Receipt(receiptData);
        await receipt.save();

        res.status(201).json({ success: true, message: 'Receipt created successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReceipts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, customerEmail, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = {};
        if (status) query.status = status;
        if (customerEmail) query.customerEmail = customerEmail.toLowerCase();
        if (search) query.$or = [
            { receiptNumber: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { customerEmail: { $regex: search, $options: 'i' } },
            { customerPhone: { $regex: search, $options: 'i' } },
            { invoiceNumber: { $regex: search, $options: 'i' } }
        ];

        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        const receipts = await Receipt.find(query).sort(sortOptions).limit(limit * 1).skip((page - 1) * limit);
        const total = await Receipt.countDocuments(query);

        res.json({ success: true, receipts, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
        res.json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
        res.json({ success: true, message: 'Receipt updated successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndDelete(req.params.id);
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
        res.json({ success: true, message: 'Receipt deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ===============================
 *    Enhanced Operations
 * ===============================
 */
export const generateReceiptFromInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const receipt = await Receipt.generateFromInvoice(invoice);
        res.status(201).json({ success: true, message: 'Receipt generated from invoice successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const duplicateReceipt = async (req, res) => {
    try {
        const original = await Receipt.findById(req.params.id);
        if (!original) return res.status(404).json({ success: false, message: 'Receipt not found' });

        const receiptData = { ...original.toObject(), _id: undefined, receiptNumber: undefined, createdAt: undefined, updatedAt: undefined };
        const duplicate = new Receipt(receiptData);
        await duplicate.save();

        res.status(201).json({ success: true, message: 'Receipt duplicated successfully', receipt: duplicate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ===============================
 *    Status & Payment Management
 * ===============================
 */
export const updateReceiptStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

        const receipt = await Receipt.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

        res.json({ success: true, message: `Receipt status updated to ${status}`, receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markReceiptAsPaid = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            { status: 'paid', paymentDate: new Date(), amountPaid: req.body.amount || undefined },
            { new: true }
        );
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

        res.json({ success: true, message: 'Receipt marked as paid', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const processReceiptRefund = async (req, res) => {
    try {
        const { refundAmount, reason } = req.body;
        if (!refundAmount || refundAmount <= 0) return res.status(400).json({ success: false, message: 'Valid refund amount is required' });

        const receipt = await Receipt.findById(req.params.id);
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

        await receipt.processRefund(refundAmount, reason);

        res.json({ success: true, message: 'Refund processed successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ===============================
 *    Bulk Operations
 * ===============================
 */
export const bulkUpdateReceipts = async (req, res) => {
    try {
        const { ids, updateData } = req.body;
        if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ success: false, message: 'Array of receipt IDs is required' });
        if (!updateData || !Object.keys(updateData).length) return res.status(400).json({ success: false, message: 'Update data is required' });

        const allowedFields = ['status', 'notes', 'tags', 'customFields'];
        const sanitizedUpdate = {};
        for (const key of allowedFields) if (updateData[key] !== undefined) sanitizedUpdate[key] = updateData[key];

        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        const result = await Receipt.updateMany({ _id: { $in: objectIds } }, { $set: sanitizedUpdate });

        res.json({ success: true, message: `${result.modifiedCount} receipt(s) updated`, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================================
// ✅ Send Receipt via Email with PDF Attachment — FULLY IMPLEMENTED
// ============================================================================

const formatPrice = (price) => {
  if (price == null) return '0.00';
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getReceiptHTML = (receipt) => {
  const COMPANY_INFO = {
    name: "OPTIMAS FIBER",
    tagline: "High-Speed Internet Solutions",
    logoUrl: "https://optimaswifi.co.ke/oppo.jpg",
    supportEmail: "support@optimaswifi.co.ke",
    supportPhone: "+254 741 874 200",
    bankName: "Equity Bank",
    accountName: "Optimas Fiber Ltd",
    paybill: "123456"
  };

  const statusColor = receipt.status === 'paid' ? '#28a745' : '#ffc107';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; }
      </style>
    </head>
    <body>
      <div id="pdf-receipt-content" style="margin: 0 auto; padding: 15px; max-width: 100%; width: 210mm;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #003366; padding-bottom: 10px; margin-bottom: 15px;">
          <div style="flex-grow: 1;">
            <h1 style="font-size: 24px; font-weight: 900; color: #003366; margin: 0;">${COMPANY_INFO.name}</h1>
            <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${COMPANY_INFO.tagline}</p>
            <div style="font-size: 11px; color: #666; margin-top: 8px;">
                <p style="margin: 0;">Email: ${COMPANY_INFO.supportEmail}</p>
                <p style="margin: 0;">Phone: ${COMPANY_INFO.supportPhone}</p>
            </div>
          </div>
          <div style="text-align: right; min-width: 130px;">
            <img src="${COMPANY_INFO.logoUrl}" alt="Company Logo" style="max-height: 50px; max-width: 90px; object-fit: contain; margin-bottom: 5px;" />
            <h2 style="font-size: 28px; font-weight: 700; color: #28a745; margin: 0;">RECEIPT</h2>
            <p style="font-size: 14px; font-weight: bold; color: #003366; margin: 5px 0 0 0;"># ${receipt.receiptNumber || 'N/A'}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #eee; padding: 12px; border-radius: 5px;">
          <div style="flex: 1;">
            <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 0 0 5px 0;">Received From:</h3>
            <p style="margin: 2px 0; font-size: 12px; font-weight: bold;">${receipt.customerName || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;">${receipt.customerEmail || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;">${receipt.customerPhone || 'N/A'}</p>
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 2px 0; font-size: 12px;"><strong>Receipt Date:</strong> ${receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;"><strong>Invoice #:</strong> ${receipt.invoiceNumber || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;">
                <strong>Status:</strong> 
                <span style="font-weight: bold; color: ${statusColor}; text-transform: uppercase;">${receipt.status || 'paid'}</span>
            </p>
          </div>
        </div>

        <div style="margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead style="background-color: #f5f5f5; color: #003366;">
              <tr>
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: bold;">Description</th>
                <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold;">Amount (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px; text-align: left; font-size: 13px;">Payment for: ${receipt.description || 'Internet Service'}</td>
                <td style="padding: 8px 12px; text-align: right; font-size: 13px; font-weight: bold;">Ksh ${formatPrice(receipt.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="width: 220px; margin-left: auto; font-size: 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 2px solid #28a745;">
              <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right;">TOTAL PAID:</td>
              <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right; color: #28a745;">Ksh ${formatPrice(receipt.total)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 30px; border-top: 1px dashed #ddd; padding-top: 15px; font-size: 11px; color: #666;">
          <p>Payment Method: ${receipt.paymentMethod || 'N/A'}</p>
          <p>Reference: ${receipt.paymentReference || 'N/A'}</p>
          <p style="margin-top: 10px; text-align: center;">${receipt.notes || 'Thank you for your payment!'}</p>
          <p style="text-align: center; margin-top: 15px; font-weight: bold; color: #003366;">OFFICIAL RECEIPT — NO FURTHER PAYMENT REQUIRED</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendReceiptToCustomer = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    if (!receipt.customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email is missing' });
    }

    console.log(`📧 Sending receipt ${receipt.receiptNumber} to ${receipt.customerEmail}`);

    // === Generate PDF ===
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const html = getReceiptHTML(receipt);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // === Send Email ===
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.optimaswifi.co.ke',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: (process.env.SMTP_SECURE === 'true') || true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"OPTIMAS FIBER" <${process.env.EMAIL_FROM || 'support@optimaswifi.co.ke'}>`,
      to: receipt.customerEmail,
      subject: `Receipt ${receipt.receiptNumber || 'N/A'} from Optimas Fiber`,
      text: `Dear ${receipt.customerName || 'Customer'},\n\nThank you for your payment. Please find your official receipt attached.`,
      html: `<p>Dear ${receipt.customerName || 'Customer'},</p><p>Thank you for your payment. Please find your official receipt attached.</p><p>Optimas Fiber</p>`,
      attachments: [{
        filename: `${receipt.receiptNumber || 'receipt'}-optimas-fiber.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    await transporter.sendMail(mailOptions);

    // === Update DB tracking fields ===
    receipt.sentToCustomer = true;
    receipt.lastSentAt = new Date();
    receipt.sendCount = (receipt.sendCount || 0) + 1;
    await receipt.save();

    res.json({ success: true, message: 'Receipt sent to customer successfully', receipt });

  } catch (error) {
    console.error('❌ Error sending receipt email:', error);
    res.status(500).json({ success: false, message: 'Error sending receipt email', error: error.message });
  }
};

/**
 * ===============================
 *    System & Placeholder Operations
 * ===============================
 */
export const checkReceiptSystemStatus = async (req, res) => res.json({ success: true, status: 'Receipt system operational' });
export const validateReceiptData = async (req, res) => res.json({ success: true, message: 'Receipt data validation executed (stub)' });
export const cleanupReceipts = async (req, res) => res.json({ success: true, message: 'Cleanup operation executed (stub)' });
export const getReceiptTemplates = async (req, res) => res.json({ success: true, templates: [] });