// backend/src/utils/emailService.js — FULLY UPDATED FOR CPLANEL SMTP + PDF ATTACHMENTS
import nodemailer from 'nodemailer';

/**
 * Creates and returns a nodemailer transporter instance
 * using direct SMTP configuration from environment variables (for cPanel/Truehost).
 */
const createTransporter = () => {
  // Use direct SMTP (not 'service') to support cPanel
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'pld109.truehost.cloud', // ✅ Critical: use your cPanel host
    port: parseInt(process.env.EMAIL_PORT, 10) || 465,      // ✅ Port 465
    secure: process.env.EMAIL_SECURE === 'true' || true,    // ✅ SSL/TLS
    auth: {
      user: process.env.EMAIL_USER || 'support@optimaswifi.co.ke',
      pass: process.env.EMAIL_PASS || '@Optimas$12'
    },
    tls: {
      // Required for cPanel with self-signed certs
      rejectUnauthorized: false
    }
  });

  // Optional: verify in development
  if (process.env.NODE_ENV === 'development') {
    transporter.verify((error, success) => {
      if (error) {
        console.warn('⚠️ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email transporter is ready (SMTP verified)');
      }
    });
  }

  return transporter;
};

/**
 * Generates a professional HTML email template for invoices (same as before)
 */
export const generateEmailTemplate = (invoice) => {
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-KE');
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-KE');
  const companyName = process.env.COMPANY_NAME || 'Optimas Fiber';
  const companyEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@optimaswifi.co.ke';
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
 * ✅ FIXED: Sends invoice email with PDF attachment (not HTML file)
 */
export const sendInvoiceEmail = async (invoice, pdfBuffer = null) => {
  try {
    const transporter = createTransporter();

    const companyName = process.env.COMPANY_NAME || 'Optimas Fiber';
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@optimaswifi.co.ke';

    const mailOptions = {
      from: `"${companyName}" <${fromAddress}>`,
      to: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${companyName}`,
      html: generateEmailTemplate(invoice),
      attachments: []
    };

    // ✅ Attach PDF if provided
    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent to:', invoice.customerEmail);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send invoice email:', error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

// Keep other functions (sendReceiptEmail, sendPasswordResetEmail, testEmailConfig) unchanged
// ... (rest of your code for receipts, password reset, etc.)

export const sendReceiptEmail = async (receipt) => {
  // ... (keep your existing implementation)
};

export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  // ... (keep your existing implementation)
};

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