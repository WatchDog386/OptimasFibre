// HTML templates for invoice and receipt PDFs.
// Every value that comes from the database is escaped before it is placed in the page.
import { escapeHtml as e, formatPrice, formatDate } from './format.js';
import { Setting } from '../models/index.js';

/** Company details as edited in the dashboard (Settings), with the logo as an absolute URL. */
export const getCompanyInfo = async () => {
  const settings = (await Setting.getSettings()).toJSON();
  const siteUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const logo = settings.logoUrl || '';
  return {
    ...settings.companyInfo,
    logoUrl: logo.startsWith('/') ? `${siteUrl}${logo}` : logo
  };
};

const page = (body) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>* { box-sizing: border-box; } body { margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #222; }</style>
</head>
<body>${body}</body>
</html>`;

const header = (company, title, titleColor, number) => `
  <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #003366; padding-bottom:10px; margin-bottom:15px;">
    <div style="flex-grow:1;">
      <h1 style="font-size:24px; font-weight:900; color:#003366; margin:0;">${e(company.name)}</h1>
      <p style="font-size:12px; color:#666; margin:5px 0 0 0;">${e(company.tagline)}</p>
      <div style="font-size:11px; color:#666; margin-top:8px;">
        <p style="margin:0;">Email: ${e(company.email)}</p>
        <p style="margin:0;">Phone: ${e(company.phone)}</p>
      </div>
    </div>
    <div style="text-align:right; min-width:130px;">
      ${company.logoUrl ? `<img src="${e(company.logoUrl)}" alt="" onerror="this.style.display='none'" style="max-height:50px; max-width:90px; object-fit:contain; margin-bottom:5px;" />` : ''}
      <h2 style="font-size:28px; font-weight:700; color:${titleColor}; margin:0;">${title}</h2>
      <p style="font-size:14px; font-weight:bold; color:#003366; margin:5px 0 0 0;"># ${e(number)}</p>
    </div>
  </div>`;

const itemRows = (items) => items.map((item) => `
  <tr style="border-bottom:1px solid #f0f0f0;">
    <td style="padding:8px 12px; text-align:left; font-size:13px; width:45%; word-wrap:break-word;">${e(item.description || 'N/A')}</td>
    <td style="padding:8px 12px; text-align:right; font-size:13px; width:10%;">${e(item.quantity || 1)}</td>
    <td style="padding:8px 12px; text-align:right; font-size:13px; width:20%;">Ksh ${formatPrice(item.unitPrice)}</td>
    <td style="padding:8px 12px; text-align:right; font-size:13px; width:25%; font-weight:bold;">Ksh ${formatPrice(item.amount)}</td>
  </tr>`).join('');

const itemsTable = (items) => `
  <div style="margin-bottom:20px; border:1px solid #ddd; border-radius:5px; overflow:hidden;">
    <table style="width:100%; border-collapse:collapse; font-size:12px;">
      <thead style="background-color:#f5f5f5; color:#003366;">
        <tr>
          <th style="padding:8px 12px; text-align:left; width:45%;">Description</th>
          <th style="padding:8px 12px; text-align:right; width:10%;">Qty</th>
          <th style="padding:8px 12px; text-align:right; width:20%;">Unit Price</th>
          <th style="padding:8px 12px; text-align:right; width:25%;">Amount (Ksh)</th>
        </tr>
      </thead>
      <tbody>${itemRows(items)}</tbody>
    </table>
  </div>`;

const totalRow = (label, value, style = '') => `
  <tr style="border-bottom:1px solid #eee;">
    <td style="padding:5px 0; text-align:right; ${style}">${label}</td>
    <td style="padding:5px 0; text-align:right; font-weight:bold; ${style}">Ksh ${formatPrice(value)}</td>
  </tr>`;

export const invoiceHtml = (invoice, company) => {
  const fallbackItem = {
    description: invoice.planName ? `${invoice.planName}${invoice.planSpeed ? ` - ${invoice.planSpeed}` : ''}` : 'Internet Service',
    quantity: 1,
    unitPrice: invoice.planPrice || invoice.totalAmount || 0,
    amount: invoice.planPrice || invoice.totalAmount || 0
  };
  const items = invoice.items?.length ? invoice.items : [fallbackItem];
  const statusColor = invoice.status === 'paid' ? '#28a745' : invoice.status === 'pending' ? '#b8860b' : '#dc3545';
  const balanceColor = invoice.balanceDue > 0 ? '#dc3545' : '#28a745';
  const hasDiscount = invoice.discountType !== 'none' && Number(invoice.discount) > 0;

  return page(`
  <div style="margin:0 auto; padding:15px; width:100%; box-sizing:border-box;">
    ${header(company, 'INVOICE', '#FFCC00', invoice.invoiceNumber || 'DRAFT')}
    <div style="display:flex; justify-content:space-between; margin-bottom:20px; border:1px solid #eee; padding:12px; border-radius:5px;">
      <div style="flex:1;">
        <h3 style="font-size:13px; font-weight:bold; color:#003366; margin:0 0 5px 0;">Bill To:</h3>
        <p style="margin:2px 0; font-weight:bold;">${e(invoice.customerName || 'N/A')}</p>
        <p style="margin:2px 0;">${e(invoice.customerEmail || 'N/A')}</p>
        <p style="margin:2px 0;">${e(invoice.customerPhone || 'N/A')}</p>
        <p style="margin:2px 0;">${e(invoice.customerLocation || 'N/A')}</p>
      </div>
      <div style="flex:1; text-align:right;">
        <p style="margin:2px 0;"><strong>Invoice Date:</strong> ${formatDate(invoice.invoiceDate)}</p>
        <p style="margin:2px 0;"><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
        <p style="margin:2px 0;"><strong>Status:</strong>
          <span style="font-weight:bold; color:${statusColor}; text-transform:uppercase;">${e(String(invoice.status || 'draft').replace(/_/g, ' '))}</span>
        </p>
      </div>
    </div>
    ${itemsTable(items)}
    <div style="display:flex; justify-content:space-between;">
      <div style="flex:1; padding-right:20px;">
        <h3 style="font-size:13px; font-weight:bold; color:#003366; margin:0 0 5px 0;">Notes:</h3>
        <p style="margin:0; white-space:pre-wrap; line-height:1.4;">${e(invoice.notes || 'N/A')}</p>
      </div>
      <div style="width:230px;">
        <table style="width:100%; border-collapse:collapse;">
          ${totalRow('Subtotal:', invoice.subtotal)}
          ${totalRow(`Tax (${e(invoice.taxRate || 0)}%):`, invoice.taxAmount)}
          ${hasDiscount ? totalRow('Discount:', invoice.discountType === 'percentage' ? (invoice.subtotal * invoice.discount) / 100 : invoice.discount) : ''}
          ${totalRow('TOTAL DUE:', invoice.totalAmount, 'font-size:14px; font-weight:bold; color:#003366;')}
          ${totalRow('Amount Paid:', invoice.amountPaid, 'color:#28a745;')}
          ${totalRow('BALANCE:', invoice.balanceDue, `font-size:14px; font-weight:bold; color:${balanceColor};`)}
        </table>
      </div>
    </div>
    <div style="margin-top:30px; border-top:1px dashed #ddd; padding-top:15px;">
      <h3 style="font-size:13px; font-weight:bold; color:#003366; margin:0 0 8px 0;">Payment Options:</h3>
      <div style="display:flex; gap:20px; font-size:11px;">
        <div style="flex:1; border-right:1px solid #eee; padding-right:10px;">
          <p style="font-weight:bold; margin:0 0 3px 0;">Bank Transfer:</p>
          <p style="margin:0;">Bank: ${e(company.bankName)}${company.bankBranch ? ` (${e(company.bankBranch)})` : ''}</p>
          <p style="margin:0;">Account Name: ${e(company.bankAccountName)}</p>
          <p style="margin:0;">Account No: ${e(company.bankAccountNumber || 'N/A')}</p>
        </div>
        <div style="flex:1;">
          <p style="font-weight:bold; margin:0 0 3px 0;">Mobile Money (M-Pesa):</p>
          <p style="margin:0;">Paybill: ${e(company.paybill)}</p>
          <p style="margin:0; color:#ff6b35; font-weight:600;">Account No: ${e(invoice.clientAccountNumber || invoice.invoiceNumber || 'N/A')}</p>
        </div>
      </div>
      <p style="text-align:center; margin-top:20px; font-size:10px; color:#999;">${e(invoice.terms || '')}</p>
      <p style="text-align:center; margin-top:8px; font-size:11px; font-weight:bold; color:#003366;">THANK YOU FOR YOUR BUSINESS!</p>
    </div>
  </div>`);
};

export const receiptHtml = (receipt, company) => {
  const fallbackItem = {
    description: receipt.serviceDescription
      || (receipt.planName ? `${receipt.planName}${receipt.planSpeed ? ` - ${receipt.planSpeed}` : ''}` : 'Internet Service'),
    quantity: 1,
    unitPrice: receipt.total,
    amount: receipt.total
  };
  const items = receipt.items?.length ? receipt.items : [fallbackItem];
  const statusColor = receipt.status === 'paid' ? '#28a745' : receipt.status === 'refunded' || receipt.status === 'cancelled' ? '#dc3545' : '#b8860b';
  const settled = Number(receipt.balance) <= 0 && receipt.status === 'paid';

  return page(`
  <div style="margin:0 auto; padding:15px; width:100%; box-sizing:border-box;">
    ${header(company, 'RECEIPT', '#28a745', receipt.receiptNumber || 'N/A')}
    <div style="display:flex; justify-content:space-between; margin-bottom:20px; border:1px solid #eee; padding:12px; border-radius:5px;">
      <div style="flex:1;">
        <h3 style="font-size:13px; font-weight:bold; color:#003366; margin:0 0 5px 0;">Received From:</h3>
        <p style="margin:2px 0; font-weight:bold;">${e(receipt.customerName || 'N/A')}</p>
        <p style="margin:2px 0;">${e(receipt.customerEmail || 'N/A')}</p>
        <p style="margin:2px 0;">${e(receipt.customerPhone || 'N/A')}</p>
      </div>
      <div style="flex:1; text-align:right;">
        <p style="margin:2px 0;"><strong>Receipt Date:</strong> ${formatDate(receipt.receiptDate)}</p>
        <p style="margin:2px 0;"><strong>Invoice #:</strong> ${e(receipt.invoiceNumber || 'N/A')}</p>
        <p style="margin:2px 0;"><strong>Status:</strong>
          <span style="font-weight:bold; color:${statusColor}; text-transform:uppercase;">${e(receipt.status || 'issued')}</span>
        </p>
      </div>
    </div>
    ${itemsTable(items)}
    <div style="width:230px; margin-left:auto;">
      <table style="width:100%; border-collapse:collapse;">
        ${totalRow('Subtotal:', receipt.subtotal)}
        ${totalRow(`Tax (${e(receipt.taxRate || 0)}%):`, receipt.taxAmount)}
        ${totalRow('Total:', receipt.total, 'font-weight:bold; color:#003366;')}
        ${totalRow('AMOUNT PAID:', receipt.amountPaid, 'font-size:14px; font-weight:bold; color:#28a745;')}
        ${Number(receipt.balance) > 0 ? totalRow('Balance:', receipt.balance, 'font-weight:bold; color:#dc3545;') : ''}
      </table>
    </div>
    <div style="margin-top:30px; border-top:1px dashed #ddd; padding-top:15px; font-size:11px; color:#666;">
      <p><strong>Payment Method:</strong> ${e(String(receipt.paymentMethod || 'N/A').replace(/_/g, ' '))}</p>
      <p><strong>Account Number:</strong> <span style="font-weight:600; color:#ff6b35;">${e(receipt.clientAccountNumber || 'N/A')}</span></p>
      <p><strong>Reference:</strong> ${e(receipt.paymentReference || receipt.transactionId || 'N/A')}</p>
      <p style="margin-top:10px; text-align:center;">${e(receipt.notes || 'Thank you for your payment!')}</p>
      ${settled ? '<p style="text-align:center; margin-top:15px; font-weight:bold; color:#003366;">OFFICIAL RECEIPT — NO FURTHER PAYMENT REQUIRED</p>' : ''}
    </div>
  </div>`);
};

/** Short HTML email that accompanies an attached invoice or receipt PDF. */
export const attachmentEmailHtml = ({ companyName, customerName, documentLabel, documentNumber }) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; line-height:1.6; color:#1a1a1a; background:#f5f5f5; margin:0; padding:0;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff;">
    <div style="background:#00356B; color:#ffffff; padding:30px; text-align:center;">
      <h1 style="margin:0; font-size:26px; letter-spacing:1px;">${e(companyName)}</h1>
    </div>
    <div style="padding:40px; text-align:center; border-bottom:1px solid #e0e0e0;">
      <p style="font-size:15px;">Dear <strong>${e(customerName || 'Customer')}</strong>,</p>
      <p style="font-size:15px;">Your ${e(documentLabel)} <strong>#${e(documentNumber || 'N/A')}</strong> is attached to this email as a PDF.</p>
    </div>
    <div style="padding:20px; text-align:center; font-size:12px; color:#666;">${e(companyName)}</div>
  </div>
</body>
</html>`;
