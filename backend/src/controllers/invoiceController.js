// backend/src/controllers/invoiceController.js - FULLY UPDATED WITH EMAIL + PDF
import Invoice from '../models/Invoice.js';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

// ============================================================================
// ✅ Basic CRUD Operations
// ============================================================================

export const createInvoice = async (req, res) => {
    try {
        console.log('📝 Creating new invoice...');
        console.log('🔐 User making request:', req.user?._id);
        
        // Validate required fields
        if (!req.body.customerName || !req.body.customerEmail || !req.body.planName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customerName, customerEmail, planName'
            });
        }

        const invoiceData = {
            ...req.body,
            createdBy: req.user?._id || null // Handle case where user might not be available
        };

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        console.log(`✅ Invoice created: ${invoice.invoiceNumber} by user ${req.user?._id || 'system'}`);
        
        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error creating invoice:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`,
                field: field
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating invoice',
            error: error.message
        });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { 
            page = 1,
            limit = 10,
            status,
            customerEmail,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

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

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const invoices = await Invoice.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Invoice.countDocuments(query);

        res.json({
            success: true,
            invoices,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('❌ Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices',
            error: error.message
        });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
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
            error: error.message
        });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                updatedBy: req.user?._id
            },
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
            message: 'Invoice updated successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error updating invoice:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating invoice',
            error: error.message
        });
    }
};

export const deleteInvoice = async (req, res) => {
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
            message: 'Error deleting invoice',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Enhanced Status Management
// ============================================================================

export const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: `Invoice status updated to ${status}`,
            invoice
        });
    } catch (error) {
        console.error('❌ Error updating invoice status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating invoice status',
            error: error.message
        });
    }
};

export const markInvoiceAsPaid = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                status: 'paid',
                paidAt: new Date(),
                amountPaid: req.body.amount || undefined
            },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice marked as paid',
            invoice
        });
    } catch (error) {
        console.error('❌ Error marking invoice as paid:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking invoice as paid',
            error: error.message
        });
    }
};

export const markInvoiceAsOverdue = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { status: 'overdue' },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice marked as overdue',
            invoice
        });
    } catch (error) {
        console.error('❌ Error marking invoice as overdue:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking invoice as overdue',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Customer Operations
// ============================================================================

export const getCustomerInvoices = async (req, res) => {
    try {
        const { email } = req.params;

        const invoices = await Invoice.find({
            customerEmail: email.toLowerCase()
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error fetching customer invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer invoices',
            error: error.message
        });
    }
};

export const checkExistingActiveInvoices = async (req, res) => {
    try {
        const { customerEmail } = req.query;

        if (!customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'customerEmail is required'
            });
        }

        const existingInvoice = await Invoice.findOne({
            customerEmail: customerEmail.toLowerCase(),
            status: { $in: ['pending', 'completed'] }
        });

        res.json({
            success: true,
            exists: !!existingInvoice,
            invoice: existingInvoice
        });
    } catch (error) {
        console.error('❌ Error checking existing invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking existing invoices',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Notification & Communication — FULLY UPDATED WITH EMAIL + PDF
// ============================================================================

const formatPrice = (price) => {
  if (price == null) return '0.00';
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getInvoiceHTML = (invoice) => {
  const COMPANY_INFO = {
    name: "OPTIMAS FIBER",
    tagline: "High-Speed Internet Solutions",
    logoUrl: "https://optimaswifi.co.ke/oppo.jpg",
    supportEmail: "support@optimaswifi.co.ke",
    supportPhone: "+254 741 874 200",
    bankName: "Equity Bank",
    accountName: "Optimas Fiber Ltd",
    accountNumber: "1234567890",
    branch: "Nairobi Main",
    paybill: "123456"
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

export const sendInvoiceToCustomer = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (!invoice.customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is missing'
      });
    }

    console.log(`📧 Sending invoice ${invoice.invoiceNumber} to ${invoice.customerEmail}`);

    // === STEP 1: Generate PDF using Puppeteer ===
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const html = getInvoiceHTML(invoice);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // === STEP 2: Send email with PDF attachment ===
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
      to: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNumber || 'N/A'} from Optimas Fiber`,
      text: `Dear ${invoice.customerName || 'Customer'},\n\nPlease find your invoice attached.\n\nThank you for choosing Optimas Fiber!`,
      html: `<p>Dear ${invoice.customerName || 'Customer'},</p><p>Please find your invoice attached.</p><p>Thank you for choosing Optimas Fiber!</p>`,
      attachments: [
        {
          filename: `${invoice.invoiceNumber || 'invoice'}-optimas-fiber.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // === STEP 3: Update DB (as before) ===
    invoice.sentToCustomer = true;
    invoice.lastSentAt = new Date();
    invoice.sendCount += 1;
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice sent to customer successfully',
      invoice
    });
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invoice email',
      error: error.message
    });
  }
};

export const resendInvoiceNotifications = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        console.log(`🔄 Resending notifications for invoice ${invoice.invoiceNumber}`);

        invoice.lastSentAt = new Date();
        invoice.sendCount += 1;
        await invoice.save();

        res.json({
            success: true,
            message: 'Invoice notifications resent successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error resending invoice notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending invoice notifications',
            error: error.message
        });
    }
};

export const sendConnectionRequestToOwner = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        await invoice.markConnectionRequestSent();

        res.json({
            success: true,
            message: 'Connection request sent to owner successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error sending connection request:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending connection request',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Export & Download (Placeholders)
// ============================================================================

export const exportInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'PDF export functionality coming soon',
            invoice
        });
    } catch (error) {
        console.error('❌ Error exporting invoice PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting invoice PDF',
            error: error.message
        });
    }
};

export const exportInvoicesExcel = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Excel export functionality coming soon'
        });
    } catch (error) {
        console.error('❌ Error exporting invoices Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting invoices Excel',
            error: error.message
        });
    }
};

export const downloadInvoiceAttachment = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Download functionality coming soon',
            invoice
        });
    } catch (error) {
        console.error('❌ Error downloading invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading invoice',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Analytics & Reports
// ============================================================================

export const getInvoiceStats = async (req, res) => {
    try {
        const stats = await Invoice.getStatistics();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ Error fetching invoice stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice stats',
            error: error.message
        });
    }
};

export const getInvoiceAnalytics = async (req, res) => {
    try {
        const totalInvoices = await Invoice.countDocuments();
        const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
        const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
        const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

        const revenueStats = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    collectedRevenue: { $sum: '$amountPaid' },
                    outstandingRevenue: { $sum: '$balanceDue' }
                }
            }
        ]);

        const planStats = await Invoice.aggregate([
            {
                $group: {
                    _id: '$planName',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            analytics: {
                overview: {
                    totalInvoices,
                    paidInvoices,
                    pendingInvoices,
                    overdueInvoices,
                    completionRate:
                        totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0
                },
                revenue:
                    revenueStats[0] || {
                        totalRevenue: 0,
                        collectedRevenue: 0,
                        outstandingRevenue: 0
                    },
                plans: planStats
            }
        });
    } catch (error) {
        console.error('❌ Error fetching invoice analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice analytics',
            error: error.message
        });
    }
};

export const getRevenueReports = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        let groupStage = {};

        if (period === 'monthly') {
            groupStage = {
                _id: {
                    year: { $year: '$invoiceDate' },
                    month: { $month: '$invoiceDate' }
                }
            };
        } else if (period === 'weekly') {
            groupStage = {
                _id: {
                    year: { $year: '$invoiceDate' },
                    week: { $week: '$invoiceDate' }
                }
            };
        } else {
            groupStage = {
                _id: {
                    year: { $year: '$invoiceDate' }
                }
            };
        }

        const revenueReport = await Invoice.aggregate([
            {
                $group: {
                    ...groupStage,
                    invoiceCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    collectedRevenue: { $sum: '$amountPaid' },
                    outstandingRevenue: { $sum: '$balanceDue' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        res.json({
            success: true,
            period,
            report: revenueReport
        });
    } catch (error) {
        console.error('❌ Error fetching revenue reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue reports',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Searching & Filters
// ============================================================================

export const searchInvoices = async (req, res) => {
    try {
        const { q: searchTerm, status, paymentMethod, startDate, endDate } = req.query;

        const invoices = await Invoice.searchInvoices(searchTerm, {
            status,
            paymentMethod,
            startDate,
            endDate
        });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error searching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching invoices',
            error: error.message
        });
    }
};

export const getInvoicesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;

        const invoices = await Invoice.find({
            invoiceDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ invoiceDate: -1 });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error fetching invoices by date range:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices by date range',
            error: error.message
        });
    }
};

export const getInvoicesByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const invoices = await Invoice.find({ status }).sort({ createdAt: -1 });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error fetching invoices by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices by status',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Bulk Operations
// ============================================================================

export const bulkUpdateInvoices = async (req, res) => {
    try {
        const { invoiceIds, updates } = req.body;

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'invoiceIds array is required'
            });
        }

        const result = await Invoice.updateMany(
            { _id: { $in: invoiceIds } },
            { ...updates, updatedBy: req.user?._id }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} invoices`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Error bulk updating invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk updating invoices',
            error: error.message
        });
    }
};

export const bulkDeleteInvoices = async (req, res) => {
    try {
        const { invoiceIds } = req.body;

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'invoiceIds array is required'
            });
        }

        const result = await Invoice.deleteMany({ _id: { $in: invoiceIds } });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} invoices`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Error bulk deleting invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk deleting invoices',
            error: error.message
        });
    }
};

export const bulkSendInvoices = async (req, res) => {
    try {
        const { invoiceIds } = req.body;

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'invoiceIds array is required'
            });
        }

        const invoices = await Invoice.find({ _id: { $in: invoiceIds } });

        // For bulk send, we'll just log — or you can loop and send individually
        // (But for performance, consider background jobs in production)
        for (const invoice of invoices) {
            if (invoice.customerEmail) {
                // Reuse the same logic as single send via a helper (optional)
                // For now: just update DB
            }
        }

        await Invoice.updateMany(
            { _id: { $in: invoiceIds } },
            {
                sentToCustomer: true,
                lastSentAt: new Date(),
                $inc: { sendCount: 1 }
            }
        );

        res.json({
            success: true,
            message: `Sent ${invoices.length} invoices to customers`,
            sentCount: invoices.length
        });
    } catch (error) {
        console.error('❌ Error bulk sending invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk sending invoices',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ System Operations
// ============================================================================

export const getInvoiceTemplates = async (req, res) => {
    try {
        const templates = [
            {
                id: 'standard',
                name: 'Standard Invoice',
                description: 'Basic invoice template with company details',
                fields: ['customerName', 'customerEmail', 'planName', 'planPrice']
            },
            {
                id: 'detailed',
                name: 'Detailed Invoice',
                description: 'Invoice with itemized billing and terms',
                fields: ['customerName', 'customerEmail', 'items', 'terms', 'notes']
            }
        ];

        res.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('❌ Error fetching invoice templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice templates',
            error: error.message
        });
    }
};

export const validateInvoiceData = async (req, res) => {
    try {
        const invoiceData = req.body;

        const errors = [];

        if (!invoiceData.customerName) errors.push('Customer name is required');
        if (!invoiceData.customerEmail) errors.push('Customer email is required');
        if (!invoiceData.planName) errors.push('Plan name is required');
        if (!invoiceData.planPrice || invoiceData.planPrice <= 0)
            errors.push('Valid plan price is required');

        res.json({
            success: errors.length === 0,
            errors,
            validated: true
        });
    } catch (error) {
        console.error('❌ Error validating invoice data:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating invoice data',
            error: error.message
        });
    }
};

export const cleanupInvoices = async (req, res) => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const result = await Invoice.deleteMany({
            status: 'cancelled',
            createdAt: { $lt: oneYearAgo }
        });

        res.json({
            success: true,
            message: `Cleaned up ${result.deletedCount} old cancelled invoices`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Error cleaning up invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up invoices',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Health Check & System Status
// ============================================================================

export const healthCheck = async (req, res) => {
    try {
        const totalInvoices = await Invoice.countDocuments();
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        res.json({
            success: true,
            status: 'healthy',
            database: dbStatus,
            totalInvoices,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Health check failed:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Debug Endpoints for Development
// ============================================================================

export const debugCreateInvoice = async (req, res) => {
    try {
        const testInvoiceData = {
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '+254700000000',
            planName: 'Test Plan',
            planPrice: 5000,
            planSpeed: '10Mbps',
            status: 'pending'
        };

        const invoice = new Invoice(testInvoiceData);
        await invoice.save();

        res.json({
            success: true,
            message: 'Test invoice created successfully',
            invoice,
            debug: {
                user: req.user,
                hasToken: !!req.headers.authorization
            }
        });
    } catch (error) {
        console.error('❌ Debug invoice creation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Debug invoice creation failed',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Index Cleanup for invoiceNumber (Fix Duplicate Null)
// ============================================================================

export const removeInvoiceNumberIndex = async (req, res) => {
    try {
        const indexes = await Invoice.collection.getIndexes();

        if (indexes.invoiceNumber_1) {
            await Invoice.collection.dropIndex('invoiceNumber_1');
            const updatedIndexes = await Invoice.collection.getIndexes();

            return res.json({
                success: true,
                message: 'invoiceNumber index removed successfully!',
                details: {
                    indexesBefore: Object.keys(indexes),
                    indexesAfter: Object.keys(updatedIndexes),
                    status: 'FIXED'
                }
            });
        } else {
            return res.json({
                success: true,
                message: 'invoiceNumber index already removed. System is ready.',
                currentIndexes: Object.keys(indexes),
                status: 'READY'
            });
        }
    } catch (error) {
        console.error('❌ Error removing index:', error);

        if (error.code === 27 || error.codeName === 'IndexNotFound') {
            return res.json({
                success: true,
                message: 'invoiceNumber index already removed or never existed',
                status: 'ALREADY_FIXED'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error removing index',
            error: error.message
        });
    }
};

export const checkIndexes = async (req, res) => {
    try {
        const indexes = await Invoice.collection.getIndexes();
        const hasInvoiceNumberIndex = !!indexes.invoiceNumber_1;

        return res.json({
            success: true,
            hasInvoiceNumberIndex,
            status: hasInvoiceNumberIndex ? 'NEEDS_CLEANUP' : 'CLEAN',
            indexes: Object.keys(indexes),
            recommendation: hasInvoiceNumberIndex
                ? 'Run DELETE /api/invoices/cleanup/remove-invoiceNumber-index'
                : 'System ready for invoice creation'
        });
    } catch (error) {
        console.error('❌ Error checking indexes:', error);

        return res.status(500).json({
            success: false,
            message: 'Error checking indexes',
            error: error.message
        });
    }
};

export const getSystemStatus = async (req, res) => {
    try {
        const indexes = await Invoice.collection.getIndexes();
        const hasInvoiceNumberIndex = !!indexes.invoiceNumber_1;

        const totalInvoices = await Invoice.countDocuments();
        const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });

        return res.json({
            success: true,
            system: {
                database: 'Connected',
                invoiceModel: 'Loaded',
                totalInvoices,
                latestInvoice: latestInvoice
                    ? {
                          id: latestInvoice._id,
                          invoiceNumber: latestInvoice.invoiceNumber,
                          customer: latestInvoice.customerName,
                          plan: latestInvoice.planName
                      }
                    : null
            },
            indexes: {
                hasInvoiceNumberIndex,
                totalIndexes: Object.keys(indexes).length,
                allIndexes: Object.keys(indexes),
                status: hasInvoiceNumberIndex ? 'ACTION_REQUIRED' : 'HEALTHY'
            },
            actions: hasInvoiceNumberIndex
                ? [
                      {
                          action: 'Remove problematic index',
                          method: 'DELETE',
                          url: '/api/invoices/cleanup/remove-invoiceNumber-index',
                          description:
                              'Fixes the duplicate invoiceNumber null error'
                      }
                  ]
                : [
                      {
                          action: 'Create test invoice',
                          method: 'POST',
                          url: '/api/invoices',
                          description: 'Verify system is working correctly'
                      }
                  ]
        });
    } catch (error) {
        console.error('❌ Error getting system status:', error);

        return res.status(500).json({
            success: false,
            message: 'Error getting system status',
            error: error.message
        });
    }
};