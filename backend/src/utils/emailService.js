// backend/src/utils/emailService.js — RESEND INTEGRATION
import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Validate configuration
const validateEmailConfig = () => {
  const errors = [];
  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is missing in .env');
  }
  if (!process.env.EMAIL_FROM) {
    errors.push('EMAIL_FROM is missing in .env');
  }
  if (!process.env.EMAIL_TEST_RECIPIENT) {
    errors.push('EMAIL_TEST_RECIPIENT is missing in .env');
  }
  return {
    valid: errors.length === 0,
    errors
  };
};

// ✅ Send email via Resend
export const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      throw new Error(`Email config error: ${config.errors.join('; ')}`);
    }

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html } : { text }),
      ...(attachments.length > 0 ? { attachments } : {})
    };

    console.log('📤 Sending email via Resend to:', to);
    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Unknown Resend error',
        suggestion: 'Check Resend API key and domain verification'
      };
    }

    console.log('✅ Email sent successfully. Message ID:', result.data?.id);
    return {
      success: true,
      messageId: result.data?.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('💥 Email sending failed:', error.message);
    return {
      success: false,
      error: error.message,
      suggestion: error.message.includes('authentication')
        ? 'Verify RESEND_API_KEY and domain in Resend dashboard'
        : error.message.includes('rate')
        ? 'Rate limit reached. Wait and retry.'
        : 'Check email configuration and network'
    };
  }
};

// ✅ Test email setup (used by /api/invoices/test-email)
export const testEmailSetup = async () => {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      return {
        success: false,
        error: 'Missing email configuration',
        suggestion: config.errors.join('; ')
      };
    }

    // Send a minimal test email to yourself
    const testResult = await sendEmail({
      to: process.env.EMAIL_TEST_RECIPIENT,
      subject: '[TEST] Optimas Email System',
      text: `This is a test email from Optimas Fiber at ${new Date().toISOString()}.\n\nIf you received this, your RESEND email setup is working!`,
      html: `<p>This is a test email from <strong>Optimas Fiber</strong> at ${new Date().toISOString()}.</p><p style="color:green;font-weight:bold;">✅ If you received this, your RESEND email setup is working!</p>`
    });

    return testResult;
  } catch (error) {
    console.error('🔥 Email test failed:', error.message);
    return {
      success: false,
      error: error.message,
      suggestion: 'Ensure RESEND_API_KEY is valid and domain is verified in Resend'
    };
  }
};

// Optional: Export for health checks
export default {
  sendEmail,
  testEmailSetup
};