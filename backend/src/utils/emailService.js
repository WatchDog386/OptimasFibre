import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate invoice email template
export const generateEmailTemplate = (invoice) => {
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString();
  const dueDate = new Date(invoice.dueDate).toLocaleDateString();

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${invoice.invoiceNumber} - ${process.env.COMPANY_NAME}</title>
<style>
  body { font-family: Arial, sans-serif; margin:0; padding:0; background:#f9f9f9; color:#333; }
  .container { max-width:600px; margin:0 auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); }
  .header { background:#182b5c; color:#fff; padding:30px; text-align:center; }
  .header h1 { margin:0; font-size:28px; }
  .content { padding:30px; }
  .invoice-details { background:#f8f9fa; padding:20px; border-radius:8px; margin-bottom:20px; }
  .detail-row { display:flex; justify-content:space-between; margin-bottom:10px; }
  .detail-label { font-weight:bold; color:#182b5c; }
  .service-table { width:100%; border-collapse:collapse; margin:20px 0; }
  .service-table th { background:#182b5c; color:#fff; padding:12px; text-align:left; }
  .service-table td { padding:12px; border-bottom:1px solid #ddd; }
  .total-section { text-align:right; margin:20px 0; }
  .total-amount { font-size:24px; font-weight:bold; color:#182b5c; }
  .payment-info { background:#e8f4fd; padding:20px; border-radius:8px; margin:20px 0; }
  .footer { text-align:center; padding:20px; background:#f8f9fa; color:#666; font-size:14px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${process.env.COMPANY_NAME}</h1>
    <p>High-Speed Internet Solutions</p>
  </div>
  <div class="content">
    <h2 style="color:#182b5c;text-align:center;margin-bottom:30px;">INVOICE</h2>
    <div class="invoice-details">
      <div class="detail-row"><span class="detail-label">Invoice Number:</span><span>${invoice.invoiceNumber}</span></div>
      <div class="detail-row"><span class="detail-label">Invoice Date:</span><span>${invoiceDate}</span></div>
      <div class="detail-row"><span class="detail-label">Due Date:</span><span>${dueDate}</span></div>
      <div class="detail-row"><span class="detail-label">Status:</span><span style="color:#059669;font-weight:bold;">${invoice.status.toUpperCase()}</span></div>
    </div>

    <div style="margin-bottom:20px;">
      <h3 style="color:#182b5c;margin-bottom:10px;">Bill To:</h3>
      <p><strong>${invoice.customerName}</strong></p>
      <p>${invoice.customerEmail}</p>
      <p>${invoice.customerPhone}</p>
      <p>${invoice.customerLocation}</p>
    </div>

    <table class="service-table">
      <thead>
        <tr><th>Description</th><th>Details</th><th>Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${invoice.planName} Plan</strong><br><small>${invoice.connectionType}</small></td>
          <td>Speed: ${invoice.planSpeed}<br><small>Monthly Subscription</small></td>
          <td><strong>Ksh ${parseInt(invoice.planPrice).toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-amount">Total: Ksh ${parseInt(invoice.planPrice).toLocaleString()}</div>
      <small>Per month</small>
    </div>

    <div class="payment-info">
      <h3 style="color:#182b5c;margin-bottom:15px;">Payment Instructions:</h3>
      <p><strong>Bank:</strong> ${process.env.BANK_NAME || 'Equity Bank'}</p>
      <p><strong>Account Name:</strong> ${process.env.BANK_ACCOUNT_NAME || 'Optimas Fiber Ltd'}</p>
      <p><strong>Account Number:</strong> ${process.env.BANK_ACCOUNT_NUMBER || '1234567890'}</p>
      <p><strong>Paybill:</strong> ${process.env.MOBILE_PAYBILL || '123456'}</p>
    </div>

    ${invoice.notes ? `<div style="background:#fff3cd;padding:15px;border-radius:8px;margin:20px 0;">
      <h4 style="color:#856404;margin-bottom:10px;">Notes:</h4>
      <p style="color:#856404;margin:0;">${invoice.notes}</p>
    </div>` : ''}

  </div>

  <div class="footer">
    <p>Thank you for choosing ${process.env.COMPANY_NAME}!</p>
    <p>Contact: ${process.env.COMPANY_EMAIL} | ${process.env.COMPANY_PHONE}</p>
    <p>${process.env.COMPANY_ADDRESS}</p>
  </div>
</div>
</body>
</html>
`;
};

// Send invoice email
export const sendInvoiceEmail = async (invoice) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: invoice.customerEmail,
      subject: `${process.env.COMPANY_NAME} - Invoice ${invoice.invoiceNumber}`,
      html: generateEmailTemplate(invoice),
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.html`,
          content: generateEmailTemplate(invoice)
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent to:', invoice.customerEmail);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Password Reset Request',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', userEmail);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
};
