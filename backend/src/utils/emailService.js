// backend/src/utils/emailService.js
// Uses Resend API for reliable email delivery on Render.com

import { Resend } from 'resend';

let resendClient = null;
let emailEnabled = true;

/**
 * Lazily initialize Resend client
 * This prevents app crash if env vars are temporarily unavailable
 */
const initResend = () => {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    emailEnabled = false;
    console.warn('⚠️ Email service disabled: RESEND_API_KEY not found');
    return null;
  }

  resendClient = new Resend(apiKey);
  console.log('📧 Resend email service initialized successfully');
  return resendClient;
};

/**
 * Sends an email using Resend API
 */
export const sendEmail = async (emailData) => {
  try {
    const resend = initResend();

    if (!emailEnabled || !resend) {
      return {
        success: false,
        message: 'Email service disabled',
        error: 'RESEND_API_KEY not configured',
        suggestion: 'Set RESEND_API_KEY in backend/.env',
        timestamp: new Date().toISOString()
      };
    }

    // Validation
    if (!emailData?.to) throw new Error('Recipient email (to) is required');
    if (!emailData?.subject) throw new Error('Email subject is required');
    if (!emailData?.html && !emailData?.text) {
      throw new Error('Email must have HTML or text content');
    }

    const payload = {
      from: process.env.EMAIL_FROM || '"Optimas Fibre" <support@optimaswifi.co.ke>',
      to: emailData.to,
      subject: emailData.subject,
      ...(emailData.html && { html: emailData.html }),
      ...(emailData.text && { text: emailData.text }),
      ...(emailData.attachments && { attachments: emailData.attachments }),
    };

    console.log(`📤 Sending email → ${emailData.to}`);

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      throw new Error(error.message || 'Resend API error');
    }

    console.log(`✅ Email sent (Resend ID: ${data?.id})`);

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: data?.id,
      provider: 'Resend',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);

    return {
      success: false,
      message: 'Failed to send email',
      error: error.message,
      suggestion: 'Check Resend dashboard, API key, and domain verification',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Test email configuration
 */
export const testEmailSetup = async () => {
  const recipient =
    process.env.EMAIL_TEST_RECIPIENT || 'support@optimaswifi.co.ke';

  return sendEmail({
    to: recipient,
    subject: '✅ Optimas Fibre – Email Configuration Test',
    text: `Email system test successful.

Time: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV || 'development'}
Provider: Resend API`,
    html: `
      <h2>✅ Email Configuration Successful</h2>
      <p>Your Optimas Fibre email system is working correctly.</p>
      <ul>
        <li><strong>Provider:</strong> Resend API</li>
        <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
        <li><strong>Time:</strong> ${new Date().toISOString()}</li>
      </ul>
    `
  });
};

/**
 * Password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'Password Reset – Optimas Fibre',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <p>
        <a href="${resetUrl}"
           style="background:#003366;color:#fff;padding:12px 20px;
                  text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
      </p>
      <p>This link expires in 1 hour.</p>
    `
  });
};

/**
 * Welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to Optimas Fibre!',
    html: `
      <h2>Welcome, ${name} 👋</h2>
      <p>Your Optimas Fibre account has been created successfully.</p>
      <p>You can now:</p>
      <ul>
        <li>View invoices</li>
        <li>Receive receipts</li>
        <li>Contact support</li>
      </ul>
      <p>Thank you for choosing Optimas Fibre.</p>
    `
  });
};

/**
 * Export service state (optional diagnostics)
 */
export const emailStatus = () => ({
  enabled: emailEnabled,
  provider: 'Resend',
  from: process.env.EMAIL_FROM || 'support@optimaswifi.co.ke'
});

export default {
  sendEmail,
  testEmailSetup,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  emailStatus
};
