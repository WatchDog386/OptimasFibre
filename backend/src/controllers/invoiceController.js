// backend/src/controllers/invoiceController.js
import { Op, fn, col, literal } from 'sequelize';
import { Invoice } from '../models/index.js';
import { INVOICE_STATUSES } from '../models/Invoice.js';
import { isUuid, toNumber } from '../models/helpers.js';
import { isDatabaseUp } from '../config/db.js';
import { httpError } from '../middleware/errorHandler.js';
import emailService from '../utils/emailService.js';
import { renderPdf } from '../utils/pdf.js';
import { invoiceHtml, attachmentEmailHtml, getCompanyInfo } from '../utils/documentTemplates.js';
import { escapeHtml as e, formatPrice, formatDate, toCsv, pdfBufferFromBase64 } from '../utils/format.js';
import {
  parsePagination, parseSort, searchWhere, paginationMeta, parseDate, pickFields, normalizeEnum
} from '../utils/query.js';

const SEARCH_COLUMNS = ['invoiceNumber', 'customerName', 'customerEmail', 'customerPhone', 'customerLocation'];
const SORTABLE = ['createdAt', 'updatedAt', 'invoiceDate', 'dueDate', 'invoiceNumber', 'customerName', 'totalAmount', 'status'];

// Everything a client may set. Totals are always recalculated by the model; ids, audit and
// email-tracking fields are never taken from the request.
const WRITABLE = {
  text: [
    'invoiceNumber', 'customerName', 'customerEmail', 'customerPhone', 'customerLocation',
    'planName', 'planSpeed', 'connectionType', 'status', 'paymentMethod', 'paymentTerms',
    'discountType', 'notes', 'terms', 'clientAccountNumber', 'billingCycle'
  ],
  numbers: ['planPrice', 'taxRate', 'discount', 'amountPaid'],
  dates: ['invoiceDate', 'dueDate', 'paidAt', 'installationDate', 'nextBillingDate'],
  json: ['items', 'features', 'paymentHistory', 'previousPlan'],
  booleans: ['isPlanUpgrade']
};

const invoiceFields = (body) => {
  const fields = pickFields(body, WRITABLE);
  for (const key of ['status', 'paymentMethod', 'discountType', 'billingCycle']) {
    if (fields[key] !== undefined) fields[key] = normalizeEnum(fields[key]);
  }
  for (const key of ['items', 'features', 'paymentHistory']) {
    if (fields[key] !== undefined && !Array.isArray(fields[key])) delete fields[key];
  }
  return fields;
};

const findInvoice = async (id) => {
  const invoice = isUuid(id) ? await Invoice.findByPk(id) : null;
  if (!invoice) throw httpError(404, 'Invoice not found');
  return invoice;
};

const validIds = (ids) => (Array.isArray(ids) ? ids.filter(isUuid) : []);

const invoicePdf = async (invoice) => renderPdf(invoiceHtml(invoice, await getCompanyInfo()));

const sendPdf = (res, buffer, filename) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/[^\w.-]/g, '_')}"`);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Cache-Control', 'no-store');
  res.send(buffer);
};

// ============================================================================
// CRUD
// ============================================================================

/** POST /api/invoices */
export const createInvoice = async (req, res) => {
  const fields = invoiceFields(req.body);
  if (!fields.customerName?.trim() || !fields.customerEmail?.trim() || !fields.planName?.trim()) {
    throw httpError(400, 'Missing required fields: customerName, customerEmail, planName');
  }

  const autoNumbered = !fields.invoiceNumber?.trim();
  let invoice;
  for (let attempt = 1; ; attempt += 1) {
    try {
      invoice = await Invoice.create({ ...fields, createdBy: req.user?.id || null });
      break;
    } catch (error) {
      // Two invoices created at the same moment can be given the same number — take the next one.
      const numberClash = error.name === 'SequelizeUniqueConstraintError' && autoNumbered && attempt < 5;
      if (!numberClash) throw error;
    }
  }

  res.status(201).json({ success: true, message: 'Invoice created successfully', invoice });
};

/** GET /api/invoices */
export const getInvoices = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { ...searchWhere(req.query.search, SEARCH_COLUMNS) };
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.customerEmail) where.customerEmail = String(req.query.customerEmail).trim().toLowerCase();

  const { rows, count } = await Invoice.findAndCountAll({
    where, order: parseSort(req.query, SORTABLE), limit, offset
  });
  res.json({ success: true, invoices: rows, pagination: paginationMeta(page, limit, count) });
};

/** GET /api/invoices/:id */
export const getInvoiceById = async (req, res) => {
  res.json({ success: true, invoice: await findInvoice(req.params.id) });
};

/** PUT /api/invoices/:id */
export const updateInvoice = async (req, res) => {
  const invoice = await findInvoice(req.params.id);
  const fields = invoiceFields(req.body);
  // An empty number on an edit means "keep the current one".
  if (!fields.invoiceNumber?.trim()) delete fields.invoiceNumber;

  invoice.set({ ...fields, updatedBy: req.user?.id || null });
  await invoice.save();
  res.json({ success: true, message: 'Invoice updated successfully', invoice });
};

/** DELETE /api/invoices/:id */
export const deleteInvoice = async (req, res) => {
  const invoice = await findInvoice(req.params.id);
  await invoice.destroy();
  res.json({ success: true, message: 'Invoice deleted successfully' });
};

// ============================================================================
// Status
// ============================================================================

/** PATCH /api/invoices/:id/status */
export const updateInvoiceStatus = async (req, res) => {
  const status = normalizeEnum(req.body?.status);
  if (!status) throw httpError(400, 'Status is required');
  if (!INVOICE_STATUSES.includes(status)) {
    throw httpError(400, `Status must be one of: ${INVOICE_STATUSES.join(', ')}`);
  }

  const invoice = await findInvoice(req.params.id);
  invoice.status = status;
  invoice.updatedBy = req.user?.id || null;
  await invoice.save();
  res.json({ success: true, message: `Invoice status updated to ${invoice.status}`, invoice });
};

/** PATCH /api/invoices/:id/paid — settles the invoice in full and records the payment. */
export const markInvoiceAsPaid = async (req, res) => {
  const invoice = await findInvoice(req.params.id);
  const outstanding = Math.max(0, toNumber(invoice.totalAmount) - toNumber(invoice.amountPaid));

  if (invoice.status !== 'paid' || outstanding > 0) {
    invoice.paymentHistory = [
      ...(Array.isArray(invoice.paymentHistory) ? invoice.paymentHistory : []),
      {
        date: new Date().toISOString(),
        amount: outstanding,
        method: normalizeEnum(req.body?.method) || invoice.paymentMethod,
        reference: String(req.body?.reference ?? '').trim().slice(0, 100),
        notes: String(req.body?.notes ?? '').trim().slice(0, 300)
      }
    ];
  }

  invoice.amountPaid = invoice.totalAmount;
  invoice.status = 'paid';
  invoice.paidAt = invoice.paidAt || new Date();
  invoice.updatedBy = req.user?.id || null;
  await invoice.save();

  res.json({ success: true, message: 'Invoice marked as paid', invoice });
};

/** PATCH /api/invoices/:id/mark-overdue */
export const markInvoiceAsOverdue = async (req, res) => {
  const invoice = await findInvoice(req.params.id);
  if (invoice.status === 'paid') throw httpError(400, 'A paid invoice cannot be marked as overdue');
  invoice.status = 'overdue';
  await invoice.save();
  res.json({ success: true, message: 'Invoice marked as overdue', invoice });
};

// ============================================================================
// Customer lookups
// ============================================================================

/** GET /api/invoices/customer/:email */
export const getCustomerInvoices = async (req, res) => {
  const invoices = await Invoice.findAll({
    where: { customerEmail: String(req.params.email).trim().toLowerCase() },
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, invoices, total: invoices.length });
};

/** GET /api/invoices/check/existing?customerEmail= */
export const checkExistingActiveInvoices = async (req, res) => {
  const { customerEmail } = req.query;
  if (!customerEmail) throw httpError(400, 'customerEmail is required');
  const invoice = await Invoice.findOne({
    where: {
      customerEmail: String(customerEmail).trim().toLowerCase(),
      status: { [Op.in]: ['pending', 'partially_paid', 'overdue', 'completed'] }
    },
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, exists: Boolean(invoice), invoice });
};

// ============================================================================
// Email & PDF
// ============================================================================

const markSent = async (invoice) => {
  invoice.sentToCustomer = true;
  invoice.lastSentAt = new Date();
  invoice.sendCount = (invoice.sendCount || 0) + 1;
  await invoice.save();
};

const invoiceEmail = (invoice, company, hasPdf) => {
  const number = invoice.invoiceNumber || 'N/A';
  const statusColor = invoice.status === 'paid' ? '#28a745' : invoice.status === 'pending' ? '#b8860b' : '#dc3545';
  const row = (label, value) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>${label}</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${value}</td></tr>`;

  const text = [
    `INVOICE FROM ${company.name}`,
    `Dear ${invoice.customerName || 'Customer'},`,
    `Invoice: ${number}`,
    `Date: ${formatDate(invoice.invoiceDate)}`,
    `Due: ${formatDate(invoice.dueDate)}`,
    `Amount: Ksh ${formatPrice(invoice.totalAmount)}`,
    `Balance: Ksh ${formatPrice(invoice.balanceDue)}`,
    `Status: ${invoice.status}`,
    hasPdf ? 'Your invoice is attached as a PDF.' : '',
    `Payment: M-Pesa Paybill ${company.paybill}, account ${invoice.clientAccountNumber || number}, or bank transfer.`,
    `Contact: ${company.email} | ${company.phone}`
  ].filter(Boolean).join('\n');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#003366;color:#ffffff;padding:20px;text-align:center;border-radius:5px 5px 0 0;">
    <h1 style="margin:0;">${e(company.name)}</h1>
    <p style="margin:5px 0 0 0;opacity:0.9;">${e(company.tagline)}</p>
  </div>
  <div style="padding:20px;background:#f9f9f9;">
    <h2 style="color:#003366;">Invoice #${e(number)}</h2>
    <p>Dear <strong>${e(invoice.customerName || 'Customer')}</strong>,</p>
    <div style="background:#ffffff;padding:15px;border-radius:5px;margin:15px 0;border:1px solid #ddd;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Invoice Number:', e(number))}
        ${row('Date:', formatDate(invoice.invoiceDate))}
        ${row('Due Date:', formatDate(invoice.dueDate))}
        ${row('Total Amount:', `<strong style="color:#003366;">Ksh ${formatPrice(invoice.totalAmount)}</strong>`)}
        ${row('Balance Due:', `Ksh ${formatPrice(invoice.balanceDue)}`)}
        ${row('Status:', `<span style="padding:3px 10px;background:${statusColor};color:#ffffff;border-radius:3px;font-size:12px;">${e(String(invoice.status).replace(/_/g, ' '))}</span>`)}
      </table>
    </div>
    ${hasPdf ? '<p style="color:#28a745;font-weight:bold;">Your invoice PDF is attached.</p>' : ''}
    <h3 style="color:#003366;margin-top:25px;">Payment Methods</h3>
    <ul style="background:#f8f9fa;padding:15px 15px 15px 35px;border-radius:5px;">
      <li style="margin-bottom:8px;"><strong>M-Pesa:</strong> Paybill <strong>${e(company.paybill)}</strong>, Account <strong>${e(invoice.clientAccountNumber || number)}</strong></li>
      <li><strong>Bank:</strong> ${e(company.bankName)}, Account <strong>${e(company.bankAccountNumber || 'N/A')}</strong> (${e(company.bankAccountName)})</li>
    </ul>
    <p>Questions? Contact us at ${e(company.email)} or ${e(company.phone)}.</p>
    <p>Thank you for choosing ${e(company.name)}!</p>
  </div>
  <div style="margin-top:20px;padding-top:15px;border-top:1px solid #eee;font-size:12px;color:#666;">
    <p><strong>${e(company.name)}</strong> · ${e(company.address)}</p>
    <p style="font-size:11px;color:#999;">This is an automated email.</p>
  </div>
</div>
</body>
</html>`;

  return { subject: `Invoice #${number} - ${company.name}`, text, html };
};

/** Builds the PDF (best effort), emails the invoice and records that it was sent. */
const deliverInvoice = async (invoice) => {
  if (!invoice.customerEmail) throw httpError(400, 'Customer email is missing');
  const company = await getCompanyInfo();

  let pdfBuffer = null;
  try {
    pdfBuffer = await renderPdf(invoiceHtml(invoice, company));
  } catch {
    console.warn(`⚠️ PDF failed for invoice ${invoice.invoiceNumber}; sending the email without an attachment`);
  }

  const result = await emailService.sendEmail({
    to: invoice.customerEmail,
    ...invoiceEmail(invoice, company, Boolean(pdfBuffer)),
    attachments: pdfBuffer ? [{ filename: `${invoice.invoiceNumber || 'invoice'}.pdf`, content: pdfBuffer }] : []
  });
  if (!result.success) throw httpError(502, `Failed to send invoice email: ${result.error}`);

  await markSent(invoice);
  return result;
};

/** POST /api/invoices/:id/send  (also /:id/resend) */
export const sendInvoiceToCustomer = async (req, res) => {
  const invoice = await findInvoice(req.params.id);
  const result = await deliverInvoice(invoice);
  res.json({
    success: true,
    message: `Invoice sent successfully to ${invoice.customerEmail}`,
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerEmail: invoice.customerEmail,
      sentAt: invoice.lastSentAt
    },
    emailInfo: { messageId: result.messageId, timestamp: result.timestamp }
  });
};

export const resendInvoiceNotifications = sendInvoiceToCustomer;

/** POST /api/invoices/:id/send-with-pdf — emails a PDF that was generated in the browser. */
export const sendInvoiceWithPdf = async (req, res) => {
  const { customerEmail, customerName, invoiceNumber, pdfData } = req.body || {};
  if (!customerEmail || !pdfData) throw httpError(400, 'Customer email and PDF data are required');

  const pdfBuffer = pdfBufferFromBase64(pdfData);
  if (!pdfBuffer) throw httpError(400, 'Invalid PDF data');

  const company = await getCompanyInfo();
  const result = await emailService.sendEmail({
    to: String(customerEmail).trim(),
    subject: `Invoice #${invoiceNumber || 'N/A'} - ${company.name}`,
    text: `Dear ${customerName || 'Customer'},\n\nYour Invoice #${invoiceNumber || 'N/A'} is attached.\n\n${company.name}`,
    html: attachmentEmailHtml({ companyName: company.name, customerName, documentLabel: 'Invoice', documentNumber: invoiceNumber }),
    attachments: [{ filename: `${String(invoiceNumber || 'invoice').replace(/[^\w.-]/g, '_')}.pdf`, content: pdfBuffer }]
  });
  if (!result.success) throw httpError(502, `Failed to send invoice email: ${result.error}`);

  // The invoice may only exist in the browser (offline draft), so the record is optional.
  const invoice = isUuid(req.params.draftId) ? await Invoice.findByPk(req.params.draftId) : null;
  if (invoice) await markSent(invoice);

  res.json({
    success: true,
    message: `Invoice sent successfully to ${customerEmail}`,
    emailInfo: { messageId: result.messageId, timestamp: result.timestamp }
  });
};

/** GET /api/invoices/:id/pdf  (also /:id/export/pdf and /:id/download) */
export const exportInvoicePDF = async (req, res) => {
  const invoice = await findInvoice(req.params.id);
  sendPdf(res, await invoicePdf(invoice), `invoice-${invoice.invoiceNumber || invoice.id}.pdf`);
};

export const downloadInvoiceAttachment = exportInvoicePDF;

/** POST /api/invoices/test-email */
export const testEmailSetup = async (req, res) => {
  const result = await emailService.testEmailSetup();
  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: result.error,
      suggestion: result.suggestion
    });
  }
  res.json({ success: true, message: 'Email configuration test successful', details: result });
};

/** GET /api/invoices/export/excel — a CSV file, which Excel opens directly. */
export const exportInvoicesExcel = async (req, res) => {
  const invoices = await Invoice.findAll({ order: [['createdAt', 'DESC']] });
  const csv = toCsv(
    ['Invoice Number', 'Customer Name', 'Customer Email', 'Customer Phone', 'Account Number', 'Plan',
      'Total Amount', 'Amount Paid', 'Balance Due', 'Status', 'Invoice Date', 'Due Date'],
    invoices.map((inv) => [
      inv.invoiceNumber, inv.customerName, inv.customerEmail, inv.customerPhone, inv.clientAccountNumber, inv.planName,
      inv.totalAmount, inv.amountPaid, inv.balanceDue, inv.status, formatDate(inv.invoiceDate), formatDate(inv.dueDate)
    ])
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="invoices-export.csv"');
  res.send(`﻿${csv}`);
};

// ============================================================================
// Analytics
// ============================================================================

/** GET /api/invoices/stats/summary */
export const getInvoiceStats = async (req, res) => {
  const { overview, byStatus } = await Invoice.getStatistics();
  const countFor = (status) => byStatus.find((row) => row._id === status)?.count || 0;
  const paidRevenue = byStatus.find((row) => row._id === 'paid')?.totalAmount || 0;

  res.json({
    success: true,
    stats: {
      totalInvoices: overview.totalInvoices,
      totalPaid: countFor('paid'),
      totalPending: countFor('pending'),
      totalOverdue: countFor('overdue'),
      totalRevenue: paidRevenue,
      totalBilled: overview.totalRevenue,
      totalCollected: overview.totalPaid,
      totalOutstanding: overview.totalBalance
    }
  });
};

/** GET /api/invoices/analytics/advanced */
export const getInvoiceAnalytics = async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const invoices = await Invoice.findAll({ where: { createdAt: { [Op.gte]: since } }, order: [['createdAt', 'DESC']] });
  res.json({ success: true, analytics: { period: '30 days', totalInvoices: invoices.length, invoices } });
};

/** GET /api/invoices/reports/revenue?period=daily|monthly|yearly */
export const getRevenueReports = async (req, res) => {
  const period = ['daily', 'monthly', 'yearly'].includes(req.query.period) ? req.query.period : 'monthly';
  const format = { daily: 'YYYY-MM-DD', monthly: 'YYYY-MM', yearly: 'YYYY' }[period];
  const bucket = fn('to_char', col('paidAt'), format);

  const rows = await Invoice.findAll({
    attributes: [[bucket, 'bucket'], [fn('SUM', col('totalAmount')), 'total'], [fn('COUNT', col('id')), 'count']],
    where: { status: 'paid', paidAt: { [Op.ne]: null } },
    group: [literal('1')],
    order: [literal('1')],
    raw: true
  });

  res.json({
    success: true,
    period,
    revenueData: rows.map((row) => ({ _id: row.bucket, total: Number(row.total), count: Number(row.count) }))
  });
};

// ============================================================================
// Search & filters
// ============================================================================

/** GET /api/invoices/search/advanced?query= */
export const searchInvoices = async (req, res) => {
  const where = searchWhere(req.query.query, SEARCH_COLUMNS);
  if (!Object.getOwnPropertySymbols(where).length) throw httpError(400, 'Search query required');
  const invoices = await Invoice.findAll({ where, order: [['createdAt', 'DESC']], limit: 50 });
  res.json({ success: true, invoices, total: invoices.length });
};

/** GET /api/invoices/date-range/:startDate/:endDate */
export const getInvoicesByDateRange = async (req, res) => {
  const start = parseDate(req.params.startDate);
  const end = parseDate(req.params.endDate);
  if (!start || !end) throw httpError(400, 'Invalid date range');
  // A bare end date (YYYY-MM-DD) means "through the end of that day".
  if (/^\d{4}-\d{2}-\d{2}$/.test(req.params.endDate)) end.setUTCHours(23, 59, 59, 999);

  const invoices = await Invoice.findAll({
    where: { createdAt: { [Op.between]: [start, end] } },
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, invoices, total: invoices.length });
};

/** GET /api/invoices/status/:status */
export const getInvoicesByStatus = async (req, res) => {
  const invoices = await Invoice.findAll({ where: { status: req.params.status }, order: [['createdAt', 'DESC']] });
  res.json({ success: true, invoices, total: invoices.length });
};

// ============================================================================
// Bulk
// ============================================================================

/** PATCH /api/invoices/bulk/update — only status, notes, payment method and due date can be bulk-edited. */
export const bulkUpdateInvoices = async (req, res) => {
  const ids = validIds(req.body?.invoiceIds);
  if (!ids.length) throw httpError(400, 'Invalid invoice IDs');

  const updates = invoiceFields(pickFields(req.body?.updates, {
    text: ['status', 'notes', 'paymentMethod'], dates: ['dueDate']
  }));
  if (!Object.keys(updates).length) throw httpError(400, 'No valid fields to update');

  const invoices = await Invoice.findAll({ where: { id: { [Op.in]: ids } } });
  for (const invoice of invoices) {
    invoice.set(updates);
    await invoice.save(); // one by one so totals and status rules are applied
  }

  res.json({ success: true, message: `Updated ${invoices.length} invoices`, modifiedCount: invoices.length });
};

/** DELETE /api/invoices/bulk/delete */
export const bulkDeleteInvoices = async (req, res) => {
  const ids = validIds(req.body?.invoiceIds);
  if (!ids.length) throw httpError(400, 'Invalid invoice IDs');
  const deletedCount = await Invoice.destroy({ where: { id: { [Op.in]: ids } } });
  res.json({ success: true, message: `Deleted ${deletedCount} invoices`, deletedCount });
};

/** POST /api/invoices/bulk/send */
export const bulkSendInvoices = async (req, res) => {
  const ids = validIds(req.body?.invoiceIds).slice(0, 50);
  if (!ids.length) throw httpError(400, 'Invalid invoice IDs');

  const invoices = await Invoice.findAll({ where: { id: { [Op.in]: ids } } });
  const results = [];
  for (const invoice of invoices) {
    try {
      await deliverInvoice(invoice);
      results.push({ id: invoice.id, invoiceNumber: invoice.invoiceNumber, success: true });
    } catch (error) {
      results.push({ id: invoice.id, invoiceNumber: invoice.invoiceNumber, success: false, error: error.message });
    }
  }

  const sent = results.filter((result) => result.success).length;
  res.json({ success: true, message: `Sent ${sent} of ${ids.length} invoices`, results });
};

// ============================================================================
// System
// ============================================================================

export const getInvoiceTemplates = (req, res) => {
  res.json({
    success: true,
    templates: [{ id: 'standard', name: 'Standard Invoice', description: 'Default invoice template' }]
  });
};

/** POST /api/invoices/validate */
export const validateInvoiceData = async (req, res) => {
  const fields = invoiceFields(req.body);
  const errors = [];
  if (!fields.customerName?.trim()) errors.push('Customer name is required');
  if (!fields.customerEmail?.trim()) errors.push('Customer email is required');
  if (!fields.planName?.trim()) errors.push('Plan name is required');

  if (!errors.length) {
    try {
      await Invoice.build({ ...fields, invoiceNumber: 'VALIDATION' }).validate();
    } catch (error) {
      if (error.name !== 'SequelizeValidationError') throw error;
      errors.push(...error.errors.map((item) => item.message));
    }
  }

  if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });
  res.json({ success: true, message: 'Invoice data is valid' });
};

/**
 * POST /api/invoices/cleanup/old-invoices (admin only)
 * Permanently deletes paid invoices older than `olderThanDays` (default and minimum: 365).
 */
export const cleanupInvoices = async (req, res) => {
  const days = Math.max(365, Math.floor(toNumber(req.body?.olderThanDays, 365)));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const deletedCount = await Invoice.destroy({ where: { status: 'paid', paidAt: { [Op.lt]: cutoff } } });
  res.json({ success: true, message: `Cleaned up ${deletedCount} paid invoices older than ${days} days`, deletedCount });
};

/** GET /api/invoices/cleanup/system-status */
export const getSystemStatus = async (req, res) => {
  const [database, totalInvoices, pendingInvoices] = await Promise.all([
    isDatabaseUp(),
    Invoice.count(),
    Invoice.count({ where: { status: 'pending' } })
  ]);
  res.json({
    success: true,
    system: {
      database: database ? 'connected' : 'disconnected',
      totalInvoices,
      pendingInvoices,
      emailConfigured: emailService.isEmailConfigured(),
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    }
  });
};
