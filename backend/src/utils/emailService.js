// backend/src/services/emailService.js
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
    
    // First verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Send test email
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
const sendEmail = async (emailData) => {
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

// Export as default object
export default {
  sendEmail,
  testEmailSetup,
  createTransporter
};