// backend/src/utils/emailService.js — FULLY UPDATED (With Receipt Support)
import nodemailer from 'nodemailer';

/**
 * Creates and returns a nodemailer transporter instance
 * using environment variables for authentication.
 */
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Validate transporter in development
  if (process.env.NODE_ENV === 'development') {
    transporter.verify((error, success) => {
      if (error) {
        console.warn('⚠️ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email transporter is ready');
      }
    });
  }

  return transporter;
};

/**
 * Generates a professional HTML email template for invoices
 */
export const generateEmailTemplate = (invoice) => {
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-KE');
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-KE');
  const companyName = process.env.COMPANY_NAME || 'Optimas Fiber';
  const companyEmail = process.env.COMPANY_EMAIL || 'support@optimasfiber.co.ke';
  const companyPhone = process.env.COMPANY_PHONE || '+254741874200';
  const companyAddress = process.env.COMPANY_ADDRESS || 'Nairobi, Kenya';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber} - ${companyName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: #333;
    }
    .container {
      max-width: 700px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #182b5c 0%, #0f1f45 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 32px;
    }
    .invoice-title {
      text-align: center;
      color: #182b5c;
      margin-bottom: 28px;
      font-size: 24px;
      font-weight: 700;
    }
    .invoice-details {
      background: #f8fafc;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 15px;
    }
    .detail-label {
      font-weight: 600;
      color: #182b5c;
    }
    .status-paid {
      color: #059669;
      font-weight: 600;
    }
    .bill-to {
      margin-bottom: 24px;
    }
    .bill-to h3 {
      color: #182b5c;
      margin-bottom: 12px;
      font-size: 18px;
    }
    .bill-to p {
      margin: 4px 0;
      line-height: 1.5;
    }
    .service-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    .service-table th {
      background: #182b5c;
      color: white;
      padding: 14px;
      text-align: left;
      font-weight: 600;
    }
    .service-table td {
      padding: 14px;
      border-bottom: 1px solid #edf2f7;
    }
    .service-table tr:last-child td {
      border-bottom: none;
    }
    .total-section {
      text-align: right;
      margin: 24px 0;
    }
    .total-amount {
      font-size: 26px;
      font-weight: 700;
      color: #182b5c;
    }
    .total-note {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
    }
    .payment-info {
      background: #f0f9ff;
      padding: 20px;
      border-radius: 10px;
      margin: 28px 0;
      border: 1px solid #bae6fd;
    }
    .payment-info h3 {
      color: #182b5c;
      margin-bottom: 14px;
      font-size: 18px;
    }
    .payment-info p {
      margin: 6px 0;
      line-height: 1.5;
    }
    .notes {
      background: #fffbeb;
      padding: 16px;
      border-radius: 10px;
      margin: 24px 0;
      border: 1px solid #fcd34d;
    }
    .notes h4 {
      color: #b45309;
      margin-bottom: 8px;
    }
    .notes p {
      color: #92400e;
      margin: 0;
      line-height: 1.5;
    }
    .footer {
      text-align: center;
      padding: 24px;
      background: #f8fafc;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${companyName}</h1>
      <p>High-Speed Internet Solutions</p>
    </div>
    <div class="content">
      <h2 class="invoice-title">INVOICE</h2>

      <div class="invoice-details">
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span>${invoice.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Invoice Date:</span>
          <span>${invoiceDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span>${dueDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="status-paid">${invoice.status.toUpperCase()}</span>
        </div>
      </div>

      <div class="bill-to">
        <h3>Bill To:</h3>
        <p><strong>${invoice.customerName}</strong></p>
        <p>${invoice.customerEmail}</p>
        <p>${invoice.customerPhone}</p>
        <p>${invoice.customerLocation}</p>
      </div>

      <table class="service-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Details</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${invoice.planName} Plan</strong><br>
              <small>${invoice.connectionType}</small>
            </td>
            <td>
              Speed: ${invoice.planSpeed}<br>
              <small>Monthly Subscription</small>
            </td>
            <td>
              <strong>Ksh ${parseInt(invoice.planPrice).toLocaleString()}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-amount">Total: Ksh ${parseInt(invoice.planPrice).toLocaleString()}</div>
        <div class="total-note">Per month</div>
      </div>

      <div class="payment-info">
        <h3>Payment Instructions:</h3>
        <p><strong>Bank:</strong> ${process.env.BANK_NAME || 'Equity Bank'}</p>
        <p><strong>Account Name:</strong> ${process.env.BANK_ACCOUNT_NAME || 'Optimas Fiber Ltd'}</p>
        <p><strong>Account Number:</strong> ${process.env.BANK_ACCOUNT_NUMBER || '1234567890'}</p>
        <p><strong>Branch:</strong> ${process.env.BANK_BRANCH || 'Nairobi Main'}</p>
        <p><strong>Mobile Paybill:</strong> ${process.env.MOBILE_PAYBILL || '123456'}</p>
        <p><strong>Account:</strong> ${invoice.invoiceNumber}</p>
      </div>

      ${invoice.notes ? `
      <div class="notes">
        <h4>Notes:</h4>
        <p>${invoice.notes}</p>
      </div>
      ` : ''}

    </div>

    <div class="footer">
      <p>Thank you for choosing ${companyName}!</p>
      <p>Contact: ${companyEmail} | ${companyPhone}</p>
      <p>${companyAddress}</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * ✅ NEW: Generates a clean, professional HTML template for RECEIPTS
 */
const generateReceiptEmailTemplate = (receipt) => {
  const paymentDate = new Date(receipt.paymentDate || receipt.createdAt).toLocaleDateString('en-KE');
  const companyName = process.env.COMPANY_NAME || 'Optimas Fiber';
  const companyEmail = process.env.COMPANY_EMAIL || 'support@optimasfiber.co.ke';
  const companyPhone = process.env.COMPANY_PHONE || '+254741874200';
  const companyAddress = process.env.COMPANY_ADDRESS || 'Nairobi, Kenya';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${receipt.receiptNumber} - ${companyName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: #333;
    }
    .container {
      max-width: 700px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 32px;
    }
    .receipt-title {
      text-align: center;
      color: #059669;
      margin-bottom: 28px;
      font-size: 24px;
      font-weight: 700;
    }
    .receipt-details {
      background: #f0fdf4;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 24px;
      border: 1px solid #bbf7d0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 15px;
    }
    .detail-label {
      font-weight: 600;
      color: #065f46;
    }
    .status-paid {
      color: #059669;
      font-weight: 600;
    }
    .bill-to {
      margin-bottom: 24px;
    }
    .bill-to h3 {
      color: #065f46;
      margin-bottom: 12px;
      font-size: 18px;
    }
    .bill-to p {
      margin: 4px 0;
      line-height: 1.5;
    }
    .service-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    .service-table th {
      background: #065f46;
      color: white;
      padding: 14px;
      text-align: left;
      font-weight: 600;
    }
    .service-table td {
      padding: 14px;
      border-bottom: 1px solid #dcfce7;
    }
    .service-table tr:last-child td {
      border-bottom: none;
    }
    .total-section {
      text-align: right;
      margin: 24px 0;
    }
    .total-amount {
      font-size: 26px;
      font-weight: 700;
      color: #065f46;
    }
    .footer {
      text-align: center;
      padding: 24px;
      background: #f0fdf4;
      color: #065f46;
      font-size: 14px;
      border-top: 1px solid #bbf7d0;
    }
    .footer p {
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${companyName}</h1>
      <p>Thank You for Your Payment!</p>
    </div>
    <div class="content">
      <h2 class="receipt-title">PAYMENT RECEIPT</h2>

      <div class="receipt-details">
        <div class="detail-row">
          <span class="detail-label">Receipt No:</span>
          <span>${receipt.receiptNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span>${paymentDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="status-paid">PAID</span>
        </div>
      </div>

      <div class="bill-to">
        <h3>Client:</h3>
        <p><strong>${receipt.clientName}</strong></p>
        <p>${receipt.clientEmail}</p>
        <p>${receipt.clientPhone}</p>
        <p>${receipt.clientLocation}</p>
      </div>

      <table class="service-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Details</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${receipt.packageName} Plan</strong>
            </td>
            <td>
              Speed: ${receipt.packageSpeed || 'N/A'}<br>
              <small>${receipt.packageType === 'mobile' ? 'Mobile Hotspot' : 'Fiber Internet'}</small>
            </td>
            <td>
              <strong>Ksh ${parseInt(receipt.paymentAmount).toLocaleString()}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-amount">Total Paid: Ksh ${parseInt(receipt.paymentAmount).toLocaleString()}</div>
      </div>

    </div>

    <div class="footer">
      <p>Thank you for your payment!</p>
      <p>Contact: ${companyEmail} | ${companyPhone}</p>
      <p>${companyAddress}</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Sends an invoice email to the customer
 */
export const sendInvoiceEmail = async (invoice) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Optimas Fiber'}" <${process.env.EMAIL_USER}>`,
      to: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${process.env.COMPANY_NAME || 'Optimas Fiber'}`,
      html: generateEmailTemplate(invoice),
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.html`,
          content: generateEmailTemplate(invoice),
          contentType: 'text/html'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent to:', invoice.customerEmail);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send invoice email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * ✅ NEW: Sends a payment receipt email to the customer
 */
export const sendReceiptEmail = async (receipt) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Optimas Fiber'}" <${process.env.EMAIL_USER}>`,
      to: receipt.clientEmail,
      subject: `Payment Receipt ${receipt.receiptNumber} - Optimas Fiber`,
      html: generateReceiptEmailTemplate(receipt),
      attachments: [
        {
          filename: `receipt-${receipt.receiptNumber}.html`,
          content: generateReceiptEmailTemplate(receipt),
          contentType: 'text/html'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Receipt email sent to:', receipt.clientEmail);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send receipt email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a password reset email
 */
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const companyName = process.env.COMPANY_NAME || 'Optimas Fiber';

    const mailOptions = {
      from: `"${companyName}" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${companyName} - Password Reset Request`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
          <h2 style="color: #182b5c;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You recently requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background: #182b5c; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Reset Your Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #182b5c;">${resetUrl}</a>
          </p>
          <p style="margin-top: 20px;">If you did not request this change, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 13px;">${companyName} • Secure Account Management</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', userEmail);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Tests the email configuration
 */
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid and ready to send');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return { success: false, error: error.message };
  }
};