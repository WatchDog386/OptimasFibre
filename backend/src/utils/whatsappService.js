import twilio from 'twilio';

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials not configured');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Generate WhatsApp message for invoice
export const generateWhatsAppMessage = (invoice) => {
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString();
  const dueDate = new Date(invoice.dueDate).toLocaleDateString();
  
  return `
*OPTIMAS FIBER - INVOICE*

*Invoice Number:* ${invoice.invoiceNumber}
*Invoice Date:* ${invoiceDate}
*Due Date:* ${dueDate}
*Status:* ${invoice.status.toUpperCase()}

*CUSTOMER DETAILS:*
Name: ${invoice.customerName}
Email: ${invoice.customerEmail}
Phone: ${invoice.customerPhone}
Location: ${invoice.customerLocation}

*SERVICE PLAN:*
Plan: ${invoice.planName}
Speed: ${invoice.planSpeed}
Connection Type: ${invoice.connectionType}
Price: Ksh ${parseInt(invoice.planPrice).toLocaleString()}/month

*FEATURES INCLUDED:*
${invoice.features.map(feature => `• ${feature}`).join('\n')}

*TOTAL AMOUNT:*
Ksh ${parseInt(invoice.planPrice).toLocaleString()} per month

*PAYMENT INSTRUCTIONS:*

*Bank Transfer:*
Bank: ${process.env.BANK_NAME || 'Equity Bank'}
Account Name: ${process.env.BANK_ACCOUNT_NAME || 'Optimas Fiber Ltd'}
Account Number: ${process.env.BANK_ACCOUNT_NUMBER || '1234567890'}
Branch: ${process.env.BANK_BRANCH || 'Nairobi Main'}

*Mobile Money:*
Paybill: ${process.env.MOBILE_PAYBILL || '123456'}
Account: ${invoice.invoiceNumber}

*NOTES:*
Please include your invoice number (${invoice.invoiceNumber}) as the reference when making payment.

Thank you for choosing Optimas Fiber!
For support: ${process.env.COMPANY_PHONE || '+254741874200'}
  `.trim();
};

// Send invoice via WhatsApp
export const sendWhatsAppInvoice = async (invoice) => {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      console.warn('⚠️ WhatsApp service not configured - skipping WhatsApp message');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    // Format phone number (remove any non-digit characters and add country code if missing)
    let phoneNumber = invoice.customerPhone.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume it's Kenya (+254)
    if (!phoneNumber.startsWith('254') && phoneNumber.length === 9) {
      phoneNumber = '254' + phoneNumber;
    } else if (phoneNumber.startsWith('0') && phoneNumber.length === 10) {
      phoneNumber = '254' + phoneNumber.substring(1);
    }
    
    // Ensure it starts with +
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    const message = generateWhatsAppMessage(invoice);
    
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`
    });

    console.log('✅ WhatsApp invoice sent successfully to:', phoneNumber);
    console.log('📱 WhatsApp Message SID:', result.sid);
    
    return { 
      success: true, 
      messageId: result.sid,
      to: phoneNumber 
    };
    
  } catch (error) {
    console.error('❌ Error sending WhatsApp invoice:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      return { success: false, error: 'Invalid phone number format' };
    } else if (error.code === 21408) {
      return { success: false, error: 'WhatsApp not enabled for this number' };
    } else if (error.code === 21610) {
      return { success: false, error: 'Phone number not on WhatsApp' };
    }
    
    return { success: false, error: error.message };
  }
};

// Test WhatsApp configuration
export const testWhatsAppConfig = async () => {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      return { success: false, error: 'Twilio credentials not configured' };
    }
    
    // Try to fetch account details to verify credentials
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Twilio configuration is valid');
    return { success: true, accountSid: account.sid };
    
  } catch (error) {
    console.error('❌ Twilio configuration error:', error);
    return { success: false, error: error.message };
  }
};