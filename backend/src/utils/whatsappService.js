// backend/src/utils/whatsappService.js

import twilio from 'twilio';

/**
 * Creates and returns a Twilio client instance
 * Returns null if credentials are missing
 */
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) not configured in .env');
    return null;
  }

  return twilio(accountSid, authToken);
};

/**
 * Formats a phone number to E.164 standard for WhatsApp
 * Handles common Kenyan number formats
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  // Remove all non-digit characters
  let cleanNumber = phone.replace(/\D/g, '');

  // Handle common Kenyan formats
  if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
    // 07XX XXX XXX → 2547XX XXX XXX
    cleanNumber = '254' + cleanNumber.substring(1);
  } else if (cleanNumber.length === 9 && cleanNumber.startsWith('7')) {
    // 7XX XXX XXX → 2547XX XXX XXX
    cleanNumber = '254' + cleanNumber;
  } else if (cleanNumber.length === 12 && cleanNumber.startsWith('2547')) {
    // Already correct format
  } else if (cleanNumber.length === 13 && cleanNumber.startsWith('+2547')) {
    // Remove leading + for internal processing
    cleanNumber = cleanNumber.substring(1);
  } else {
    // Unsupported format
    throw new Error(`Unsupported phone number format: ${phone}`);
  }

  // Ensure it's exactly 12 digits (2547XXXXXXXX)
  if (cleanNumber.length !== 12 || !cleanNumber.startsWith('2547')) {
    throw new Error(`Invalid Kenyan phone number: ${phone}`);
  }

  return `+${cleanNumber}`;
};

/**
 * Generates a well-formatted WhatsApp message for invoices
 */
export const generateWhatsAppMessage = (invoice) => {
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-KE');
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-KE');

  const companyName = process.env.COMPANY_NAME || 'Optimas Fiber';
  const bankName = process.env.BANK_NAME || 'Equity Bank';
  const bankAccountName = process.env.BANK_ACCOUNT_NAME || 'Optimas Fiber Ltd';
  const bankAccountNumber = process.env.BANK_ACCOUNT_NUMBER || '1234567890';
  const bankBranch = process.env.BANK_BRANCH || 'Nairobi Main';
  const mobilePaybill = process.env.MOBILE_PAYBILL || '123456';
  const companyPhone = process.env.COMPANY_PHONE || '+254741874200';

  return `
*${companyName.toUpperCase()} - INVOICE*

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
Bank: ${bankName}
Account Name: ${bankAccountName}
Account Number: ${bankAccountNumber}
Branch: ${bankBranch}

*Mobile Money:*
Paybill: ${mobilePaybill}
Account: ${invoice.invoiceNumber}

*NOTES:*
Please include your invoice number (${invoice.invoiceNumber}) as the reference when making payment.

Thank you for choosing ${companyName}!
For support: ${companyPhone}
`.trim();
};

/**
 * Sends an invoice to the customer via WhatsApp
 */
export const sendWhatsAppInvoice = async (invoice) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️ WhatsApp service not configured - skipping message');
      return { success: false, error: 'Twilio credentials missing' };
    }

    // Validate and format phone number
    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(invoice.customerPhone);
    } catch (formatError) {
      console.error('❌ Invalid phone number:', formatError.message);
      return { success: false, error: formatError.message };
    }

    const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    const to = `whatsapp:${formattedPhone}`;
    const messageBody = generateWhatsAppMessage(invoice);

    console.log('📤 Sending WhatsApp to:', formattedPhone);

    const result = await client.messages.create({
      body: messageBody,
      from: from,
      to: to
    });

    console.log('✅ WhatsApp sent successfully | SID:', result.sid);
    return {
      success: true,
      messageId: result.sid,
      to: formattedPhone
    };

  } catch (error) {
    console.error('❌ WhatsApp sending error:', {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo || 'N/A'
    });

    // Handle specific Twilio error codes
    switch (error.code) {
      case 21211:
        return { success: false, error: 'Invalid phone number format' };
      case 21408:
        return { success: false, error: 'WhatsApp not enabled on Twilio number' };
      case 21610:
        return { success: false, error: 'Recipient not on WhatsApp' };
      case 63003:
        return { success: false, error: 'Message delivery failed' };
      case 63018:
        return { success: false, error: 'WhatsApp template rejected' };
      default:
        return { success: false, error: error.message || 'Unknown WhatsApp error' };
    }
  }
};

/**
 * Tests Twilio WhatsApp configuration
 */
export const testWhatsAppConfig = async () => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    // Test by fetching account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Twilio account verified:', account.friendlyName);

    // Verify WhatsApp number is configured
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
      return { success: false, error: 'TWILIO_WHATSAPP_NUMBER not set in .env' };
    }

    return {
      success: true,
      accountSid: account.sid,
      accountName: account.friendlyName,
      whatsappNumber: fromNumber
    };

  } catch (error) {
    console.error('❌ Twilio test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};