// backend/src/utils/whatsappService.js — FULLY UPDATED (With Receipt Support)
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
    cleanNumber = '254' + cleanNumber.substring(1);
  } else if (cleanNumber.length === 9 && cleanNumber.startsWith('7')) {
    cleanNumber = '254' + cleanNumber;
  } else if (cleanNumber.length === 12 && cleanNumber.startsWith('2547')) {
    // Already correct format
  } else if (cleanNumber.length === 13 && cleanNumber.startsWith('+2547')) {
    cleanNumber = cleanNumber.substring(1);
  } else {
    throw new Error(`Unsupported phone number format: ${phone}`);
  }

  if (cleanNumber.length !== 12 || !cleanNumber.startsWith('2547')) {
    throw new Error(`Invalid Kenyan phone number: ${phone}`);
  }

  return `+${cleanNumber}`;
};

/**
 * Generates a well-formatted WhatsApp message for invoices (to customers)
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
 * ✅ NEW: Generates a clean, confirmation-style WhatsApp message for RECEIPTS
 */
export const generateWhatsAppReceiptMessage = (receipt) => {
  const paymentDate = new Date(receipt.paymentDate || receipt.createdAt).toLocaleDateString('en-KE');
  const companyName = process.env.COMPANY_NAME || 'Optimas Fiber';
  const companyPhone = process.env.COMPANY_PHONE || '+254741874200';

  return `
✅ *${companyName.toUpperCase()} - PAYMENT RECEIPT CONFIRMED*

Hello ${receipt.clientName},

Thank you for your payment! 🎉

📄 *Receipt No:* ${receipt.receiptNumber}
📦 *Package:* ${receipt.packageName}
💰 *Amount Paid:* Ksh ${parseInt(receipt.paymentAmount).toLocaleString()}
📅 *Date:* ${paymentDate}
📍 *Location:* ${receipt.clientLocation}

Your service is now active and ready to use!

📥 *View & Download Receipt:*  
https://optimaswifi.co.ke/receipts/${receipt._id}

Need help? Call us at *${companyPhone}*  
We're happy to serve you!

— *Optimas Fiber Team*
`.trim();
};

/**
 * Generates connection request message for owner (to +254 741 874 200)
 */
export const generateConnectionRequestMessage = (invoice) => {
  const requestTime = new Date().toLocaleString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const planChangeInfo = invoice.isPlanUpgrade ? 
    `🔄 *PLAN UPGRADE* - Previously: ${invoice.previousPlan.planName} (Ksh ${invoice.previousPlan.planPrice.toLocaleString()})` : 
    '🆕 *NEW CUSTOMER*';

  return `
🚀 *NEW CONNECTION REQUEST - ACTION REQUIRED*

${planChangeInfo}

*INVOICE DETAILS:*
Invoice #: ${invoice.invoiceNumber}
Plan: ${invoice.planName} (${invoice.planSpeed})
Amount: Ksh ${parseInt(invoice.planPrice).toLocaleString()}/month
Status: ${invoice.status.toUpperCase()}

*CUSTOMER INFORMATION:*
Name: ${invoice.customerName}
Phone: ${invoice.customerPhone}
Email: ${invoice.customerEmail}
Location: ${invoice.customerLocation}

*SERVICE DETAILS:*
Connection Type: ${invoice.connectionType}
Features: ${invoice.features.join(', ')}

*TIMING:*
Requested: ${requestTime}
${invoice.isPlanUpgrade ? `Plan Changed: ${new Date(invoice.previousPlan.changedAt).toLocaleString()}` : ''}

*ACTION REQUIRED:*
📍 Visit customer for installation
📞 Contact: ${invoice.customerPhone}
💰 Collect payment: Ksh ${parseInt(invoice.planPrice).toLocaleString()}

_This is an automated connection request from the Optima Fibre system_
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

    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(invoice.customerPhone);
    } catch (formatError) {
      console.error('❌ Invalid customer phone number:', formatError.message);
      return { success: false, error: formatError.message };
    }

    const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    const to = `whatsapp:${formattedPhone}`;
    const messageBody = generateWhatsAppMessage(invoice);

    console.log('📤 Sending WhatsApp invoice to customer:', formattedPhone);

    const result = await client.messages.create({
      body: messageBody,
      from: from,
      to: to
    });

    console.log('✅ WhatsApp invoice sent successfully | SID:', result.sid);
    return {
      success: true,
      messageId: result.sid,
      to: formattedPhone,
      type: 'customer_invoice'
    };

  } catch (error) {
    console.error('❌ WhatsApp invoice sending error:', {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo || 'N/A'
    });

    switch (error.code) {
      case 21211:
        return { success: false, error: 'Invalid customer phone number format' };
      case 21408:
        return { success: false, error: 'WhatsApp not enabled on Twilio number' };
      case 21610:
        return { success: false, error: 'Customer not on WhatsApp' };
      case 63003:
        return { success: false, error: 'Message delivery failed to customer' };
      case 63018:
        return { success: false, error: 'WhatsApp template rejected' };
      default:
        return { success: false, error: error.message || 'Unknown WhatsApp error' };
    }
  }
};

/**
 * ✅ NEW: Sends a payment receipt to the customer via WhatsApp
 */
export const sendWhatsAppReceipt = async (receipt) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️ WhatsApp service not configured - skipping receipt message');
      return { success: false, error: 'Twilio credentials missing' };
    }

    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(receipt.clientPhone);
    } catch (formatError) {
      console.error('❌ Invalid receipt phone number:', formatError.message);
      return { success: false, error: formatError.message };
    }

    const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    const to = `whatsapp:${formattedPhone}`;
    const messageBody = generateWhatsAppReceiptMessage(receipt);

    console.log('📤 Sending WhatsApp receipt to customer:', formattedPhone);

    const result = await client.messages.create({
      body: messageBody,
      from: from,
      to: to
    });

    console.log('✅ WhatsApp receipt sent successfully | SID:', result.sid);
    return {
      success: true,
      messageId: result.sid,
      to: formattedPhone,
      type: 'customer_receipt'
    };

  } catch (error) {
    console.error('❌ WhatsApp receipt sending error:', {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo || 'N/A'
    });

    switch (error.code) {
      case 21211:
        return { success: false, error: 'Invalid phone number format for receipt' };
      case 21610:
        return { success: false, error: 'Customer not on WhatsApp' };
      case 63003:
        return { success: false, error: 'Receipt message delivery failed' };
      default:
        return { success: false, error: error.message || 'Unknown WhatsApp receipt error' };
    }
  }
};

/**
 * Sends connection request to owner's WhatsApp (+254 741 874 200)
 */
export const sendConnectionRequest = async (invoice) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️ WhatsApp service not configured - skipping connection request');
      return { success: false, error: 'Twilio credentials missing' };
    }

    // Fixed owner number - +254 741 874 200
    const ownerNumber = '+254741874200';
    let formattedOwnerPhone;
    
    try {
      formattedOwnerPhone = formatPhoneNumber(ownerNumber);
    } catch (formatError) {
      console.error('❌ Invalid owner phone number:', formatError.message);
      return { success: false, error: formatError.message };
    }

    const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    const to = `whatsapp:${formattedOwnerPhone}`;
    const messageBody = generateConnectionRequestMessage(invoice);

    console.log('📤 Sending connection request to owner:', formattedOwnerPhone);
    console.log('📋 Invoice details:', {
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customerName,
      plan: invoice.planName,
      isUpgrade: invoice.isPlanUpgrade
    });

    const result = await client.messages.create({
      body: messageBody,
      from: from,
      to: to
    });

    console.log('✅ Connection request sent successfully to owner | SID:', result.sid);
    return {
      success: true,
      messageId: result.sid,
      to: formattedOwnerPhone,
      type: 'owner_connection_request',
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Connection request sending error:', {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo || 'N/A'
    });

    let userFriendlyError = 'Failed to send connection request to our team. ';
    
    switch (error.code) {
      case 21211:
        userFriendlyError += 'Invalid owner phone number configuration.';
        break;
      case 21408:
        userFriendlyError += 'WhatsApp not configured for business number.';
        break;
      case 21610:
        userFriendlyError += 'Owner not available on WhatsApp.';
        break;
      case 63003:
        userFriendlyError += 'Message delivery failed. Please try again.';
        break;
      default:
        userFriendlyError += 'Please contact us directly at +254 741 874 200.';
    }

    return { 
      success: false, 
      error: error.message,
      userFriendlyError: userFriendlyError,
      code: error.code 
    };
  }
};

/**
 * Sends both invoice to customer and connection request to owner
 */
export const sendCompleteWhatsAppNotifications = async (invoice) => {
  try {
    console.log('📱 Sending complete WhatsApp notifications...');
    
    const results = await Promise.allSettled([
      sendWhatsAppInvoice(invoice),
      sendConnectionRequest(invoice)
    ]);

    const invoiceResult = results[0].status === 'fulfilled' ? results[0].value : { success: false, error: results[0].reason };
    const connectionResult = results[1].status === 'fulfilled' ? results[1].value : { success: false, error: results[1].reason };

    console.log('📊 WhatsApp notification results:', {
      customerInvoice: invoiceResult.success ? '✅ Sent' : '❌ Failed',
      ownerConnection: connectionResult.success ? '✅ Sent' : '❌ Failed'
    });

    return {
      success: invoiceResult.success || connectionResult.success,
      customerInvoice: invoiceResult,
      ownerConnection: connectionResult,
      summary: {
        customerNotified: invoiceResult.success,
        ownerNotified: connectionResult.success,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Complete WhatsApp notifications failed:', error);
    return {
      success: false,
      error: error.message,
      customerInvoice: { success: false, error: 'Unknown error' },
      ownerConnection: { success: false, error: 'Unknown error' }
    };
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

    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Twilio account verified:', account.friendlyName);

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
      return { success: false, error: 'TWILIO_WHATSAPP_NUMBER not set in .env' };
    }

    // Test owner number formatting
    const ownerNumber = '+254741874200';
    let formattedOwnerPhone;
    try {
      formattedOwnerPhone = formatPhoneNumber(ownerNumber);
      console.log('✅ Owner number formatted correctly:', formattedOwnerPhone);
    } catch (formatError) {
      console.error('❌ Owner number formatting failed:', formatError.message);
      return { success: false, error: `Owner number formatting failed: ${formatError.message}` };
    }

    return {
      success: true,
      accountSid: account.sid,
      accountName: account.friendlyName,
      whatsappNumber: fromNumber,
      ownerNumber: formattedOwnerPhone,
      ownerNumberStatus: 'Valid'
    };

  } catch (error) {
    console.error('❌ Twilio test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Quick test to verify owner number can receive messages
 */
export const testOwnerWhatsApp = async () => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return { success: false, error: 'Twilio credentials missing' };
    }

    const ownerNumber = '+254741874200';
    const formattedOwnerPhone = formatPhoneNumber(ownerNumber);
    
    const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    const to = `whatsapp:${formattedOwnerPhone}`;
    
    const testMessage = `
🔧 *SYSTEM TEST MESSAGE*

This is a test message from the Optima Fibre invoice system.

✅ System is working correctly
📅 ${new Date().toLocaleString('en-KE')}

If you receive this message, the WhatsApp integration is properly configured.
    `.trim();

    console.log('🧪 Testing owner WhatsApp:', formattedOwnerPhone);
    
    const result = await client.messages.create({
      body: testMessage,
      from: from,
      to: to
    });

    console.log('✅ Owner WhatsApp test successful | SID:', result.sid);
    
    return {
      success: true,
      message: 'Test message sent successfully to owner',
      messageId: result.sid,
      ownerNumber: formattedOwnerPhone,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Owner WhatsApp test failed:', error.message);
    return {
      success: false,
      error: error.message,
      code: error.code,
      suggestion: 'Check if +254741874200 is a valid WhatsApp number'
    };
  }
};