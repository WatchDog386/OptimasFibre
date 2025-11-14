// backend/src/utils/receiptPdf.js
import puppeteer from 'puppeteer';

export const generateReceiptPdf = async (receiptData) => {
  // Safety check
  if (!receiptData || !receiptData.receiptNumber) {
    console.warn('⚠️ Invalid receipt data provided to PDF generator');
    return null;
  }

  try {
    // Try to launch Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null // Allows custom path (e.g., on Render)
    });

    const page = await browser.newPage();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt ${receiptData.receiptNumber}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #fff; 
            color: #333;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #003366;
            padding-bottom: 10px;
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #003366; 
          }
          .receipt-title { 
            color: #059669; 
            font-size: 28px; 
            font-weight: bold;
          }
          .section { 
            margin-bottom: 20px; 
          }
          .row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            font-size: 14px;
          }
          .label { 
            font-weight: bold; 
            color: #003366;
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
          }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: left; 
            font-size: 14px;
          }
          .table th {
            background-color: #f8fafc;
            color: #003366;
          }
          .total { 
            font-size: 18px; 
            font-weight: bold; 
            text-align: right; 
            margin-top: 15px; 
            color: #059669;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #eee; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">OPTIMAS FIBER</div>
          <div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
            <div style="text-align: right; margin-top: 4px; font-size: 14px;">#${receiptData.receiptNumber}</div>
          </div>
        </div>

        <div class="section">
          <div class="row"><span class="label">Client:</span> <span>${receiptData.clientName || 'N/A'}</span></div>
          <div class="row"><span class="label">Email:</span> <span>${receiptData.clientEmail || 'N/A'}</span></div>
          <div class="row"><span class="label">Phone:</span> <span>${receiptData.clientPhone || 'N/A'}</span></div>
          <div class="row"><span class="label">Location:</span> <span>${receiptData.clientLocation || 'N/A'}</span></div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Details</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${receiptData.packageName || 'Internet Plan'} Plan</td>
              <td>Speed: ${receiptData.packageSpeed || 'N/A'}</td>
              <td>Ksh ${(receiptData.paymentAmount || 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">Total Paid: Ksh ${(receiptData.paymentAmount || 0).toLocaleString()}</div>

        <div class="footer">
          Thank you for your payment! For support: +254 741 874 200 | support@optimasfiber.co.ke
        </div>
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 10000 });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    console.log(`✅ PDF generated successfully for receipt ${receiptData.receiptNumber}`);
    return pdfBuffer;

  } catch (error) {
    // 🔥 CRITICAL: Log full error but DO NOT crash the app
    console.error('❌ PDF generation failed (non-fatal):', {
      message: error.message,
      stack: error.stack,
      receiptNumber: receiptData.receiptNumber
    });

    // Optional: You can send this error to monitoring (Sentry, etc.)

    // Return null so email service can proceed without PDF
    return null;
  }
};