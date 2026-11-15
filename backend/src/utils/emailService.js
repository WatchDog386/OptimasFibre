// backend/src/utils/emailService.js — transactional email via Resend
import '../config/env.js';
import { Resend } from 'resend';
import { escapeHtml } from './format.js';

let resendClient;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

const missingConfig = () => {
  const errors = [];
  if (!process.env.RESEND_API_KEY) errors.push('RESEND_API_KEY is missing in .env');
  if (!process.env.EMAIL_FROM) errors.push('EMAIL_FROM is missing in .env');
  return errors;
};

export const isEmailConfigured = () => missingConfig().length === 0;

/**
 * Sends an email. Never throws: resolves to { success, messageId } or { success: false, error }.
 */
export const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    const errors = missingConfig();
    if (errors.length) throw new Error(`Email config error: ${errors.join('; ')}`);

    const result = await getResendClient().emails.send({
      from: process.env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
      ...(attachments.length > 0
        ? { attachments: attachments.map(({ filename, content }) => ({ filename, content })) }
        : {})
    });

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Unknown Resend error',
        suggestion: 'Check the Resend API key and that the sending domain is verified'
      };
    }

    return { success: true, messageId: result.data?.id, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('💥 Email sending failed:', error.message);
    return {
      success: false,
      error: error.message,
      suggestion: 'Check the email configuration (RESEND_API_KEY, EMAIL_FROM) and network access'
    };
  }
};

export const sendPasswordResetEmail = (email, token) => {
  const siteUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const link = `${siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`;
  const company = process.env.COMPANY_NAME || 'Optimas Fiber';
  return sendEmail({
    to: email,
    subject: `Reset your ${company} dashboard password`,
    text: `We received a request to reset your password.\n\nOpen this link to choose a new one (valid for 1 hour):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    html: `<p>We received a request to reset your <strong>${escapeHtml(company)}</strong> dashboard password.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 18px;background:#00356B;color:#ffffff;text-decoration:none;border-radius:4px;">Choose a new password</a></p>
<p>This link is valid for 1 hour. If you did not ask for this, you can ignore this email.</p>`
  });
};

/** Sends a test message to EMAIL_TEST_RECIPIENT (used by POST /api/invoices/test-email). */
export const testEmailSetup = async () => {
  const errors = missingConfig();
  if (!process.env.EMAIL_TEST_RECIPIENT) errors.push('EMAIL_TEST_RECIPIENT is missing in .env');
  if (errors.length) {
    return { success: false, error: 'Missing email configuration', suggestion: errors.join('; ') };
  }
  const stamp = new Date().toISOString();
  return sendEmail({
    to: process.env.EMAIL_TEST_RECIPIENT,
    subject: '[TEST] Optimas Email System',
    text: `This is a test email from Optimas Fiber at ${stamp}. If you received this, email sending works.`,
    html: `<p>This is a test email from <strong>Optimas Fiber</strong> at ${stamp}.</p><p>If you received this, email sending works.</p>`
  });
};

export default { sendEmail, sendPasswordResetEmail, testEmailSetup, isEmailConfigured };
