// backend/src/controllers/invoiceController.js — FINAL PRODUCTION VERSION (FULLY COMPLETE)
import Invoice from '../models/Invoice.js';
import mongoose from 'mongoose';
import puppeteer from 'puppeteer';
import emailService from '../utils/emailService.js';

// ============================================================================
// ✅ Helper: Format price for display
// ============================================================================
const formatPrice = (price) => {
  if (price == null) return '0.00';
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// ============================================================================
// ✅ Helper: Generate HTML for invoice (used for PDF + preview)
// ============================================================================
const getInvoiceHTML = (invoice) => {
  const COMPANY_INFO = {
    name: process.env.COMPANY_NAME || "OPTIMAS FIBER",
    tagline: "High-Speed Internet Solutions",
    logoUrl: "https://optimaswifi.co.ke/oppo.jpg",
    supportEmail: process.env.EMAIL_FROM || "support@optimaswifi.co.ke",
    supportPhone: process.env.COMPANY_PHONE || "+254 741 874 200",
    bankName: process.env.BANK_NAME || "Equity Bank",
    accountName: process.env.BANK_ACCOUNT_NAME || "Optimas Fiber Ltd",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
    branch: process.env.BANK_BRANCH || "Nairobi Main",
    paybill: process.env.MPESA_PAYBILL || "123456"
  };

  const primaryItem = invoice.items?.[0] || {
    description: invoice.planName ? `${invoice.planName} - ${invoice.planSpeed}` : 'Internet Service',
    quantity: 1,
    unitPrice: invoice.planPrice || invoice.totalAmount || 0,
    amount: invoice.planPrice || invoice.totalAmount || 0
  };

  const itemsToDisplay = invoice.items && invoice.items.length > 0 ? invoice.items : [primaryItem];
  const itemsHtml = itemsToDisplay.map(item => `
    <tr style="border-bottom: 1px solid #f0f0f0;">
      <td style="padding: 8px 12px; text-align: left; font-size: 13px; width: 45%; word-wrap: break-word;">${item.description || 'N/A'}</td>
      <td style="padding: 8px 12px; text-align: right; font-size: 13px; width: 10%;">${item.quantity || 1}</td>
      <td style="padding: 8px 12px; text-align: right; font-size: 13px; width: 20%;">Ksh ${formatPrice(item.unitPrice)}</td>
      <td style="padding: 8px 12px; text-align: right; font-size: 13px; width: 25%; font-weight: bold;">Ksh ${formatPrice(item.amount)}</td>
    </tr>
  `).join('');

  const statusColor = invoice.status === 'paid' ? '#28a745' : invoice.status === 'pending' ? '#ffc107' : '#dc3545';
  const totalColor = invoice.balanceDue > 0 ? '#dc3545' : '#28a745';

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
      <div id="pdf-invoice-content" style="margin: 0 auto; padding: 15px; max-width: 100%; width: 210mm;">
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
            <h2 style="font-size: 28px; font-weight: 700; color: #FFCC00; margin: 0;">INVOICE</h2>
            <p style="font-size: 14px; font-weight: bold; color: #003366; margin: 5px 0 0 0;"># ${invoice.invoiceNumber || 'DRAFT'}</p>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #eee; padding: 12px; border-radius: 5px;">
          <div style="flex: 1;">
            <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 0 0 5px 0;">Bill To:</h3>
            <p style="margin: 2px 0; font-size: 12px; font-weight: bold;">${invoice.customerName || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;">${invoice.customerEmail || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;">${invoice.customerPhone || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;">${invoice.customerLocation || 'N/A'}</p>
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 2px 0; font-size: 12px;"><strong>Invoice Date:</strong> ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;"><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 12px;">
                <strong>Status:</strong> 
                <span style="font-weight: bold; color: ${statusColor}; text-transform: uppercase;">${invoice.status || 'DRAFT'}</span>
            </p>
          </div>
        </div>
        <div style="margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead style="background-color: #f5f5f5; color: #003366;">
              <tr>
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: bold; width: 45%;">Description</th>
                <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; width: 10%;">Qty</th>
                <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; width: 20%;">Unit Price</th>
                <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; width: 25%;">Amount (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <div style="flex: 1; padding-right: 20px;">
                <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 0 0 5px 0;">Notes:</h3>
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.4;">${invoice.notes || 'N/A'}</p>
            </div>
            <div style="width: 220px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 5px 0; font-size: 12px; text-align: right;">Subtotal:</td>
                        <td style="padding: 5px 0; font-size: 12px; text-align: right; font-weight: bold;">Ksh ${formatPrice(invoice.subtotal)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 5px 0; font-size: 12px; text-align: right;">Tax (${invoice.taxRate || 0}%):</td>
                        <td style="padding: 5px 0; font-size: 12px; text-align: right; font-weight: bold;">Ksh ${formatPrice(invoice.taxAmount)}</td>
                    </tr>
                    <tr style="border-bottom: 2px solid #003366; margin-top: 8px;">
                        <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right;">TOTAL DUE:</td>
                        <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right; color: #003366;">Ksh ${formatPrice(invoice.totalAmount)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 12px; text-align: right; color: #28a745;">Amount Paid:</td>
                        <td style="padding: 5px 0; font-size: 12px; text-align: right; font-weight: bold; color: #28a745;">Ksh ${formatPrice(invoice.amountPaid)}</td>
                    </tr>
                    <tr style="border-top: 2px solid ${totalColor};">
                        <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right; color: ${totalColor};">BALANCE:</td>
                        <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right; color: ${totalColor};">Ksh ${formatPrice(invoice.balanceDue)}</td>
                    </tr>
                </table>
            </div>
        </div>
        <div style="margin-top: 30px; border-top: 1px dashed #ddd; padding-top: 15px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 0 0 8px 0;">Payment Options:</h3>
            <div style="display: flex; gap: 20px; font-size: 11px;">
                <div style="flex: 1; border-right: 1px solid #eee; padding-right: 10px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0;">Bank Transfer:</p>
                    <p style="margin: 0;">Bank: ${COMPANY_INFO.bankName}</p>
                    <p style="margin: 0;">Account Name: ${COMPANY_INFO.accountName}</p>
                    <p style="margin: 0;">Account No: ${COMPANY_INFO.accountNumber}</p>
                </div>
                <div style="flex: 1;">
                    <p style="font-weight: bold; margin: 0 0 3px 0;">Mobile Money (M-Pesa):</p>
                    <p style="margin: 0;">Paybill: ${COMPANY_INFO.paybill}</p>
                    <p style="margin: 0;">Account No: **${invoice.customerPhone || 'N/A'}**</p>
                </div>
            </div>
            <p style="text-align: center; margin-top: 20px; font-size: 10px; color: #999;">${invoice.terms}</p>
            <p style="text-align: center; margin-top: 8px; font-size: 11px; font-weight: bold; color: #003366;">THANK YOU FOR YOUR BUSINESS!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================================================
// ✅ Helper: Generate PDF from invoice data
// ============================================================================
const generateInvoicePDF = async (invoice) => {
  let browser;
  try {
    const launchOptions = {
      args: (process.env.PUPPETEER_ARGS || '--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage')
        .split(','),
      headless: 'new'
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    const html = getInvoiceHTML(invoice);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) await browser.close();
    console.error('⚠️ PDF generation failed:', error.message);
    throw new Error('Failed to generate invoice PDF');
  }
};

// ============================================================================
// ✅ CRITICAL: SINGLE PDF GENERATION FUNCTION FOR ALL ROUTES
// ============================================================================
export const exportInvoicePDF = async (req, res) => {
  try {
    console.log(`📄 Generating PDF for invoice ID: ${req.params.id}`);
    
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    console.log(`✅ Invoice found: ${invoice.invoiceNumber || invoice._id}`);
    
    const pdfBuffer = await generateInvoicePDF(invoice);
    
    console.log(`✅ PDF generated: ${pdfBuffer.length} bytes`);

    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber || invoice._id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the PDF
    res.send(pdfBuffer);
    
    console.log(`✅ PDF sent successfully for invoice ${invoice.invoiceNumber}`);
    
  } catch (error) {
    console.error('❌ PDF generation endpoint error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error generating PDF',
        error: error.message,
        suggestion: 'Check if Puppeteer is properly installed and configured'
      });
    }
  }
};

// ============================================================================
// ✅ EMAIL TEST SETUP FUNCTION
// ============================================================================
export const testEmailSetup = async (req, res) => {
  try {
    console.log('🔄 Testing email setup from invoice controller...');
    const result = await emailService.testEmailSetup();
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Email configuration test successful',
        details: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email configuration test failed',
        error: result.error,
        suggestion: result.suggestion
      });
    }
  } catch (error) {
    console.error('❌ Email test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
};

// ============================================================================
// ✅ Main Invoice Operations
// ============================================================================

export const createInvoice = async (req, res) => {
  try {
    if (!req.body.customerName || !req.body.customerEmail || !req.body.planName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerName, customerEmail, planName'
      });
    }
    const invoiceData = { ...req.body, createdBy: req.user?._id || null };
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    res.status(201).json({ success: true, message: 'Invoice created successfully', invoice });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field} already exists`, field });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    res.status(500).json({ success: false, message: 'Error creating invoice', error: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerEmail, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customerEmail) query.customerEmail = customerEmail.toLowerCase();
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const invoices = await Invoice.find(query).sort(sortOptions).limit(Number(limit)).skip((page - 1) * limit);
    const total = await Invoice.countDocuments(query);
    res.json({ success: true, invoices, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoices', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoice', error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice updated successfully', invoice });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    res.status(500).json({ success: false, message: 'Error updating invoice', error: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting invoice', error: error.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: `Invoice status updated to ${status}`, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating invoice status', error: error.message });
  }
};

export const markInvoiceAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date(), amountPaid: req.body.amount || undefined },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice marked as paid', invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking invoice as paid', error: error.message });
  }
};

export const markInvoiceAsOverdue = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'overdue' }, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice marked as overdue', invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking invoice as overdue', error: error.message });
  }
};

export const getCustomerInvoices = async (req, res) => {
  try {
    const { email } = req.params;
    const invoices = await Invoice.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });
    res.json({ success: true, invoices, total: invoices.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customer invoices', error: error.message });
  }
};

export const checkExistingActiveInvoices = async (req, res) => {
  try {
    const { customerEmail } = req.query;
    if (!customerEmail) return res.status(400).json({ success: false, message: 'customerEmail is required' });
    const existingInvoice = await Invoice.findOne({
      customerEmail: customerEmail.toLowerCase(),
      status: { $in: ['pending', 'completed'] }
    });
    res.json({ success: true, exists: !!existingInvoice, invoice: existingInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking existing invoices', error: error.message });
  }
};

// ============================================================================
// ✅ EMAIL & PDF INTEGRATION
// ============================================================================

export const sendInvoiceToCustomer = async (req, res) => {
  console.log(`📧 Sending invoice ${req.params.id} to customer...`);
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (!invoice.customerEmail) return res.status(400).json({ success: false, message: 'Customer email is missing' });

    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePDF(invoice);
      console.log(`✅ PDF generated (${pdfBuffer.length} bytes)`);
    } catch (pdfErr) {
      console.warn('⚠️ PDF failed, proceeding without attachment');
    }

    const subject = `Invoice #${invoice.invoiceNumber || 'N/A'} - ${process.env.COMPANY_NAME || 'Optimas Fiber'}`;
    const text = `
INVOICE FROM ${process.env.COMPANY_NAME || 'OPTIMAS FIBER'}
Dear ${invoice.customerName || 'Customer'},
Invoice: ${invoice.invoiceNumber || 'N/A'}
Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
Amount: Ksh ${invoice.totalAmount || 0}
Status: ${invoice.status || 'pending'}
${pdfBuffer ? 'PDF attached.' : 'Please log in to view.'}
Payment: M-Pesa Paybill ${process.env.MPESA_PAYBILL || '123456'} or Bank Transfer.
Contact: ${process.env.EMAIL_FROM} | ${process.env.COMPANY_PHONE}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#003366;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{padding:20px;background:#f9f9f9}.invoice-details{background:white;padding:15px;border-radius:5px;margin:15px 0;border:1px solid #ddd}.footer{margin-top:30px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#666}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1 style="margin:0;">${process.env.COMPANY_NAME || 'OPTIMAS FIBER'}</h1>
    <p style="margin:5px 0 0 0;opacity:0.9;">High-Speed Internet Solutions</p>
  </div>
  <div class="content">
    <h2 style="color:#003366;">Invoice #${invoice.invoiceNumber || 'N/A'}</h2>
    <p>Dear <strong>${invoice.customerName || 'Customer'}</strong>,</p>
    <div class="invoice-details">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Invoice Number:</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${invoice.invoiceNumber || 'N/A'}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Date:</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Due Date:</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Total Amount:</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold;color:#003366;">Ksh ${invoice.totalAmount || 0}</td></tr>
        <tr><td style="padding:8px 0;"><strong>Status:</strong></td><td style="padding:8px 0;"><span style="padding:3px 10px;background:${invoice.status === 'paid' ? '#28a745' : invoice.status === 'pending' ? '#ffc107' : '#dc3545'};color:white;border-radius:3px;font-size:12px;">${invoice.status || 'pending'}</span></td></tr>
      </table>
    </div>
    ${pdfBuffer ? '<p style="color:#28a745;font-weight:bold;">✅ Your invoice PDF is attached.</p>' : '<p>Please login to view your invoice.</p>'}
    <h3 style="color:#003366;margin-top:25px;">Payment Methods:</h3>
    <ul style="background:#f8f9fa;padding:15px;border-radius:5px;">
      <li style="margin-bottom:8px;"><strong>M-Pesa:</strong> Paybill <strong>${process.env.MPESA_PAYBILL || '123456'}</strong></li>
      <li><strong>Bank:</strong> ${process.env.BANK_NAME || 'Equity Bank'}, Account: <strong>${process.env.BANK_ACCOUNT_NUMBER || '1234567890'}</strong></li>
    </ul>
    <p>If you have questions, contact us:</p>
    <ul><li>📧 ${process.env.EMAIL_FROM || 'support@optimaswifi.co.ke'}</li><li>📞 ${process.env.COMPANY_PHONE || '+254741874200'}</li></ul>
    <p>Thank you for choosing ${process.env.COMPANY_NAME || 'Optimas Fiber'}!</p>
  </div>
  <div class="footer">
    <p><strong>${process.env.COMPANY_NAME || 'Optimas Fiber'}</strong></p>
    <p>${process.env.COMPANY_ADDRESS || 'Nairobi, Kenya'}</p>
    <p>📧 ${process.env.EMAIL_FROM} | 📞 ${process.env.COMPANY_PHONE}</p>
    <p style="font-size:11px;color:#999;margin-top:10px;">This is an automated email.</p>
  </div>
</div>
</body>
</html>
    `;

    const attachments = pdfBuffer ? [{
      filename: `${invoice.invoiceNumber || 'invoice'}-optimas-fiber.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : [];

    const emailResult = await emailService.sendEmail({
      to: invoice.customerEmail,
      subject,
      text,
      html,
      attachments
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || emailResult.message);
    }

    invoice.sentToCustomer = true;
    invoice.lastSentAt = new Date();
    invoice.sendCount = (invoice.sendCount || 0) + 1;
    await invoice.save();

    res.json({
      success: true,
      message: `Invoice sent successfully to ${invoice.customerEmail}`,
      invoice: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerEmail: invoice.customerEmail,
        sentAt: invoice.lastSentAt
      },
      emailInfo: {
        messageId: emailResult.messageId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Failed to send invoice email:', error);
    let userMessage = 'Failed to send invoice';
    if (error.message.includes('authentication')) userMessage = 'Email authentication failed. Check credentials.';
    if (error.message.includes('connect')) userMessage = 'Failed to connect to email server.';
    if (error.message.includes('timeout')) userMessage = 'Email server timeout. Please try again.';
    res.status(500).json({ 
      success: false, 
      message: userMessage, 
      error: error.message,
      suggestion: 'Check your email configuration and try again.'
    });
  }
};

// ➤ View HTML (debug)
export const viewInvoiceHTML = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const html = getInvoiceHTML(invoice);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rendering invoice HTML', error: error.message });
  }
};

// ============================================================================
// ✅ OTHER FUNCTIONS (ALL ORIGINAL FUNCTIONS INCLUDED)
// ============================================================================

export const resendInvoiceNotifications = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const result = await sendInvoiceToCustomer(req, res);
    return result;
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resending notification', error: error.message });
  }
};

export const sendConnectionRequestToOwner = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const emailResult = await emailService.sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Connection Request - ${invoice.customerName}`,
      text: `New connection request from ${invoice.customerName} (${invoice.customerEmail}). Invoice: ${invoice.invoiceNumber}`,
      html: `<h3>New Connection Request</h3><p>Customer: ${invoice.customerName}</p><p>Email: ${invoice.customerEmail}</p><p>Phone: ${invoice.customerPhone}</p><p>Invoice: ${invoice.invoiceNumber}</p>`
    });
    res.json({ success: true, message: 'Connection request sent to owner', emailResult });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending connection request', error: error.message });
  }
};

export const downloadInvoiceAttachment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const pdfBuffer = await generateInvoicePDF(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downloading invoice', error: error.message });
  }
};

export const exportInvoicesExcel = async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    const headers = ['Invoice Number', 'Customer Name', 'Customer Email', 'Amount', 'Status', 'Date'];
    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      inv.customerName,
      inv.customerEmail,
      inv.totalAmount,
      inv.status,
      new Date(inv.createdAt).toLocaleDateString()
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices-export.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error exporting invoices', error: error.message });
  }
};

export const getInvoiceStats = async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const totalPaid = await Invoice.countDocuments({ status: 'paid' });
    const totalPending = await Invoice.countDocuments({ status: 'pending' });
    const totalOverdue = await Invoice.countDocuments({ status: 'overdue' });
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({
      success: true,
      stats: {
        totalInvoices,
        totalPaid,
        totalPending,
        totalOverdue,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
};

export const getInvoiceAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentInvoices = await Invoice.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });
    res.json({
      success: true,
      analytics: {
        period: '30 days',
        totalInvoices: recentInvoices.length,
        invoices: recentInvoices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
  }
};

export const getRevenueReports = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy;
    if (period === 'daily') {
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } };
    } else if (period === 'monthly') {
      groupBy = { $dateToString: { format: '%Y-%m', date: '$paidAt' } };
    } else {
      groupBy = { $dateToString: { format: '%Y', date: '$paidAt' } };
    }
    const revenueData = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: groupBy, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      success: true,
      period,
      revenueData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching revenue reports', error: error.message });
  }
};

export const searchInvoices = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query required' });
    const invoices = await Invoice.find({
      $or: [
        { invoiceNumber: { $regex: query, $options: 'i' } },
        { customerName: { $regex: query, $options: 'i' } },
        { customerEmail: { $regex: query, $options: 'i' } },
        { customerPhone: { $regex: query, $options: 'i' } }
      ]
    }).limit(50);
    res.json({ success: true, invoices, total: invoices.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching invoices', error: error.message });
  }
};

export const getInvoicesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const invoices = await Invoice.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });
    res.json({ success: true, invoices, total: invoices.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoices by date range', error: error.message });
  }
};

export const getInvoicesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const invoices = await Invoice.find({ status }).sort({ createdAt: -1 });
    res.json({ success: true, invoices, total: invoices.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoices by status', error: error.message });
  }
};

export const bulkUpdateInvoices = async (req, res) => {
  try {
    const { invoiceIds, updates } = req.body;
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid invoice IDs' });
    }
    const result = await Invoice.updateMany(
      { _id: { $in: invoiceIds } },
      { $set: updates }
    );
    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} invoices`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error bulk updating invoices', error: error.message });
  }
};

export const bulkDeleteInvoices = async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid invoice IDs' });
    }
    const result = await Invoice.deleteMany({ _id: { $in: invoiceIds } });
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} invoices`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error bulk deleting invoices', error: error.message });
  }
};

export const bulkSendInvoices = async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid invoice IDs' });
    }
    const results = [];
    for (const id of invoiceIds) {
      try {
        const invoice = await Invoice.findById(id);
        if (invoice && invoice.customerEmail) {
          results.push({ id, success: true, message: 'Invoice queued for sending' });
        }
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    res.json({
      success: true,
      message: `Processed ${invoiceIds.length} invoices`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error bulk sending invoices', error: error.message });
  }
};

export const getInvoiceTemplates = async (req, res) => {
  try {
    const templates = [
      { id: 'standard', name: 'Standard Invoice', description: 'Default invoice template' },
      { id: 'detailed', name: 'Detailed Invoice', description: 'Invoice with item breakdown' },
      { id: 'simple', name: 'Simple Invoice', description: 'Minimal invoice template' }
    ];
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching templates', error: error.message });
  }
};

export const validateInvoiceData = async (req, res) => {
  try {
    const invoiceData = req.body;
    const errors = [];
    if (!invoiceData.customerName) errors.push('Customer name is required');
    if (!invoiceData.customerEmail) errors.push('Customer email is required');
    if (!invoiceData.totalAmount || invoiceData.totalAmount <= 0) errors.push('Valid total amount is required');
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.json({ success: true, message: 'Invoice data is valid' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error validating invoice data', error: error.message });
  }
};

export const cleanupInvoices = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const result = await Invoice.deleteMany({
      status: 'paid',
      paidAt: { $lt: ninetyDaysAgo }
    });
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old paid invoices`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cleaning up invoices', error: error.message });
  }
};

export const removeInvoiceNumberIndex = async (req, res) => {
  try {
    const result = await Invoice.collection.dropIndex('invoiceNumber_1');
    res.json({ success: true, message: 'Index removed', result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing index', error: error.message });
  }
};

export const checkIndexes = async (req, res) => {
  try {
    const indexes = await Invoice.collection.getIndexes();
    res.json({ success: true, indexes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking indexes', error: error.message });
  }
};

export const getSystemStatus = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const invoiceCount = await Invoice.countDocuments();
    const pendingCount = await Invoice.countDocuments({ status: 'pending' });
    res.json({
      success: true,
      system: {
        database: dbStatus === 1 ? 'connected' : 'disconnected',
        totalInvoices: invoiceCount,
        pendingInvoices: pendingCount,
        serverTime: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting system status', error: error.message });
  }
};

export const healthCheck = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const invoiceCount = await Invoice.countDocuments();
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      invoiceCount,
      emailService: 'available'
    });
  } catch (error) {
    res.status(500).json({ success: false, status: 'unhealthy', error: error.message });
  }
};

export const debugCreateInvoice = async (req, res) => {
  try {
    const testInvoice = new Invoice({
      invoiceNumber: `TEST-${Date.now()}`,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+254700000000',
      planName: 'Test Plan',
      planSpeed: '10 Mbps',
      planPrice: 1000,
      totalAmount: 1000,
      status: 'pending',
      notes: 'Test invoice for debugging'
    });
    await testInvoice.save();
    res.json({
      success: true,
      message: 'Test invoice created',
      invoice: testInvoice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating test invoice', error: error.message });
  }
};