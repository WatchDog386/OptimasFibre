// backend/src/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'pld109.truehost.cloud',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'support@optimaswifi.co.ke',
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email server connection failed:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

/**
 * Send email with attachments
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {Array} options.attachments - Array of attachment objects
 * @returns {Promise} - Promise resolving to email info
 */
export const sendEmail = async (options) => {
  const { to, subject, text, html, attachments = [] } = options;
  
  if (!to || !subject) {
    throw new Error('Missing required email fields: to, subject');
  }

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || 'Optimas Fiber'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@optimaswifi.co.ke'}>`,
    to: to,
    subject: subject,
    text: text || '',
    html: html || '',
    attachments: attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
};

// Optional: Batch email sending
export const sendBatchEmails = async (emails) => {
  const results = [];
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, to: email.to, messageId: result.messageId });
    } catch (error) {
      results.push({ success: false, to: email.to, error: error.message });
    }
  }
  return results;
};

export default { sendEmail, sendBatchEmails };