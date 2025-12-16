// backend/src/utils/emailService.js
import nodemailer from 'nodemailer';

// Create and configure email transporter
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'mail.optimaswifi.co.ke',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true' || true,
    auth: {
      user: process.env.EMAIL_USER || 'support@optimaswifi.co.ke',
      pass: process.env.EMAIL_PASS || '@Optimas$12'
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    debug: process.env.NODE_ENV !== 'production'
  };

  console.log('📧 Creating email transporter with config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user,
    secure: config.secure
  });

  const transporter = nodemailer.createTransport(config);

  if (process.env.NODE_ENV !== 'production') {
    transporter.verify((error) => {
      if (error) {
        console.error('❌ SMTP verification failed:', error.message);
      } else {
        console.log('✅ SMTP connection verified and ready');
      }
    });
  }

  return transporter;
};

// Test email setup
export const testEmailSetup = async () => {
  try {
    console.log('🧪 Testing email configuration...');
    
    const transporter = createTransporter();
    
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    const testMailOptions = {
      from: process.env.EMAIL_FROM || '"Optimas Fibre" <support@optimaswifi.co.ke>',
      to: process.env.EMAIL_USER || 'support@optimaswifi.co.ke',
      subject: '✅ Optimas Fibre - Email Configuration Test',
      text: `This is a test email from Optimas Fibre Invoice System.
      
System Status:
• Time: ${new Date().toISOString()}
• Host: ${process.env.EMAIL_HOST}
• Port: ${process.env.EMAIL_PORT}
• User: ${process.env.EMAIL_USER}
• Environment: ${process.env.NODE_ENV || 'development'}
      
If you received this, your email configuration is working correctly!`,
      
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #ddd; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Optimas Fibre</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Email Configuration Test</p>
    </div>
    
    <div class="content">
      <div class="success">
        <h2 style="margin: 0;">SUCCESS!</h2>
        <p style="margin: 10px 0 0 0;">Your email configuration is working correctly.</p>
      </div>
      
      <div class="info-box">
        <h3 style="color: #003366; margin-top: 0;">System Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Test Time:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>SMTP Host:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${process.env.EMAIL_HOST || 'Not set'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>SMTP Port:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${process.env.EMAIL_PORT || 'Not set'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email User:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${process.env.EMAIL_USER || 'Not set'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Environment:</strong></td>
            <td style="padding: 8px 0;">${process.env.NODE_ENV || 'development'}</td>
          </tr>
        </table>
      </div>
      
      <p>You can now send invoices to customers from the Optimas Fibre system.</p>
    </div>
    
    <div class="footer">
      <p><strong>Optimas Fibre Invoice System</strong></p>
      <p>📧 ${process.env.EMAIL_FROM || 'support@optimaswifi.co.ke'} | 📞 ${process.env.COMPANY_PHONE || '+254 741 874 200'}</p>
      <p style="font-size: 11px; color: #999; margin-top: 10px;">This is an automated test email.</p>
    </div>
  </div>
</body>
</html>
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log(`✅ Test email sent: ${info.messageId}`);
    
    return {
      success: true,
      message: 'Email configuration test successful',
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM
      }
    };
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    
    let userMessage = 'Email configuration test failed';
    let suggestion = 'Check your email credentials and SMTP settings';
    
    if (error.code === 'EAUTH') {
      userMessage = 'Authentication failed';
      suggestion = 'Check your email username and password';
    } else if (error.code === 'ECONNECTION') {
      userMessage = 'Connection failed';
      suggestion = 'Check SMTP host and port, or firewall settings';
    } else if (error.code === 'ETIMEDOUT') {
      userMessage = 'Connection timeout';
      suggestion = 'SMTP server is not responding. Check if port 465 is open';
    }
    
    return {
      success: false,
      message: userMessage,
      error: error.message,
      suggestion: suggestion,
      timestamp: new Date().toISOString()
    };
  }
};

// Send email function
export const sendEmail = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Optimas Fibre" <support@optimaswifi.co.ke>',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      attachments: emailData.attachments || []
    };

    console.log(`📤 Sending email to: ${emailData.to}`);
    console.log(`📝 Subject: ${emailData.subject}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      response: info.response
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    let userMessage = 'Failed to send email';
    let suggestion = 'Please try again later';
    
    if (error.code === 'EAUTH') {
      userMessage = 'Email authentication failed';
      suggestion = 'Check your email username and password in environment variables';
    } else if (error.code === 'ECONNECTION') {
      userMessage = 'Cannot connect to email server';
      suggestion = 'Check SMTP host/port and internet connection';
    } else if (error.code === 'ENOTFOUND') {
      userMessage = 'Email server not found';
      suggestion = 'Check SMTP hostname (mail.optimaswifi.co.ke)';
    } else if (error.code === 'ETIMEDOUT') {
      userMessage = 'Email server timeout';
      suggestion = 'Server is not responding. Try again or contact hosting support';
    }
    
    return {
      success: false,
      message: userMessage,
      error: error.message,
      suggestion: suggestion,
      timestamp: new Date().toISOString()
    };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const emailData = {
      to: email,
      subject: 'Password Reset Request - Optimas Fibre',
      text: `You requested a password reset for your Optimas Fibre account.
      
Reset your password by clicking the link below:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.`,
      
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; background: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Optimas Fibre</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Password Reset Request</p>
    </div>
    
    <div class="content">
      <h2 style="color: #003366;">Hello,</h2>
      <p>You requested to reset your password for your Optimas Fibre account.</p>
      <p>Click the button below to reset your password:</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      
      <p>Or copy and paste this link in your browser:</p>
      <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
        ${resetUrl}
      </p>
      
      <p><strong>Note:</strong> This link will expire in 1 hour.</p>
      
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    
    <div class="footer">
      <p><strong>Optimas Fibre Support Team</strong></p>
      <p>📧 ${process.env.EMAIL_FROM || 'support@optimaswifi.co.ke'} | 📞 ${process.env.COMPANY_PHONE || '+254 741 874 200'}</p>
      <p style="font-size: 11px; color: #999; margin-top: 10px;">This is an automated email.</p>
    </div>
  </div>
</body>
</html>
      `
    };

    return await sendEmail(emailData);
    
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    return {
      success: false,
      message: 'Failed to send password reset email',
      error: error.message
    };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  try {
    const emailData = {
      to: email,
      subject: 'Welcome to Optimas Fibre!',
      text: `Welcome to Optimas Fibre, ${name}!
      
Your account has been successfully created. You can now:
• Log in to your account
• View and pay invoices
• Manage your internet services
• Contact support for assistance

Thank you for choosing Optimas Fibre for your internet needs!

Best regards,
Optimas Fibre Team`,
      
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Welcome to Optimas Fibre!</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">High-Speed Internet Solutions</p>
    </div>
    
    <div class="content">
      <h2 style="color: #003366;">Hello ${name},</h2>
      <p>Welcome to Optimas Fibre! Your account has been successfully created.</p>
      
      <p>With your account, you can now:</p>
      <ul>
        <li>Log in to your dashboard</li>
        <li>View and pay your invoices online</li>
        <li>Track your internet service status</li>
        <li>Contact our support team for assistance</li>
        <li>Manage your account settings</li>
      </ul>
      
      <p>If you have any questions or need assistance, don't hesitate to contact our support team.</p>
      
      <p>Thank you for choosing Optimas Fibre for your internet needs!</p>
    </div>
    
    <div class="footer">
      <p><strong>Optimas Fibre Team</strong></p>
      <p>📧 ${process.env.EMAIL_FROM || 'support@optimaswifi.co.ke'} | 📞 ${process.env.COMPANY_PHONE || '+254 741 874 200'}</p>
      <p style="font-size: 11px; color: #999; margin-top: 10px;">This is an automated welcome email.</p>
    </div>
  </div>
</body>
</html>
      `
    };

    return await sendEmail(emailData);
    
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return {
      success: false,
      message: 'Failed to send welcome email',
      error: error.message
    };
  }
};

// Export default object for invoiceController
export default {
  sendEmail,
  testEmailSetup,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  createTransporter
};