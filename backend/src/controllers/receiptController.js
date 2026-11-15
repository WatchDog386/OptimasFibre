// backend/src/controllers/receiptController.js
import { Op, fn, col } from 'sequelize';
import { Receipt, Invoice } from '../models/index.js';
import { RECEIPT_STATUSES } from '../models/Receipt.js';
import { isUuid, toNumber } from '../models/helpers.js';
import { httpError } from '../middleware/errorHandler.js';
import emailService from '../utils/emailService.js';
import { renderPdf } from '../utils/pdf.js';
import { receiptHtml, attachmentEmailHtml, getCompanyInfo } from '../utils/documentTemplates.js';
import { formatDate, toCsv, pdfBufferFromBase64 } from '../utils/format.js';
import {
  parsePagination, parseSort, searchWhere, paginationMeta, pickFields, normalizeEnum
} from '../utils/query.js';

const SEARCH_COLUMNS = ['receiptNumber', 'customerName', 'customerEmail', 'customerPhone', 'invoiceNumber', 'paymentReference'];
const SORTABLE = ['createdAt', 'updatedAt', 'receiptDate', 'paymentDate', 'receiptNumber', 'customerName', 'total', 'status'];

const WRITABLE = {
  text: [
    'receiptNumber', 'invoiceNumber', 'customerName', 'customerEmail', 'customerPhone', 'customerLocation',
    'discountType', 'paymentMethod', 'status', 'serviceDescription', 'planName', 'planSpeed', 'notes', 'terms',
    'paymentReference', 'transactionId', 'bankReference', 'clientAccountNumber'
  ],
  numbers: ['subtotal', 'taxRate', 'taxAmount', 'discount', 'total', 'amountPaid', 'planPrice'],
  dates: ['paymentDate', 'receiptDate'],
  json: ['items']
};

const receiptFields = (body) => {
  const fields = pickFields(body, WRITABLE);
  for (const key of ['status', 'paymentMethod', 'discountType']) {
    if (fields[key] !== undefined) fields[key] = normalizeEnum(fields[key]);
  }
  if (fields.items !== undefined && !Array.isArray(fields.items)) delete fields.items;
  if (isUuid(body?.invoiceId)) fields.invoiceId = body.invoiceId;
  return fields;
};

const findReceipt = async (id) => {
  const receipt = isUuid(id) ? await Receipt.findByPk(id) : null;
  if (!receipt) throw httpError(404, 'Receipt not found');
  return receipt;
};

/** Creates a receipt, taking the next free number if two are created at the same moment. */
const createNumbered = async (data) => {
  const autoNumbered = !data.receiptNumber?.trim();
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await Receipt.create(data);
    } catch (error) {
      const numberClash = error.name === 'SequelizeUniqueConstraintError' && autoNumbered && attempt < 5;
      if (!numberClash) throw error;
    }
  }
};

const receiptPdf = async (receipt) => renderPdf(receiptHtml(receipt, await getCompanyInfo()));

// ============================================================================
// CRUD
// ============================================================================

/** POST /api/receipts */
export const createReceipt = async (req, res) => {
  const fields = receiptFields(req.body);
  const hasAmount = toNumber(fields.total) > 0 || (Array.isArray(fields.items) && fields.items.length > 0);
  if (!fields.customerName?.trim() || !fields.customerEmail?.trim() || !hasAmount) {
    throw httpError(400, 'Missing required fields: customerName, customerEmail, total');
  }

  const receipt = await createNumbered({
    ...fields,
    createdBy: req.user?.id || null,
    issuedBy: req.user?.name || req.user?.email || 'System'
  });
  res.status(201).json({ success: true, message: 'Receipt created successfully', receipt });
};

/** GET /api/receipts */
export const getReceipts = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { ...searchWhere(req.query.search, SEARCH_COLUMNS) };
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.customerEmail) where.customerEmail = String(req.query.customerEmail).trim().toLowerCase();

  const { rows, count } = await Receipt.findAndCountAll({
    where, order: parseSort(req.query, SORTABLE), limit, offset
  });
  res.json({ success: true, receipts: rows, pagination: paginationMeta(page, limit, count) });
};

/** GET /api/receipts/:id */
export const getReceiptById = async (req, res) => {
  res.json({ success: true, receipt: await findReceipt(req.params.id) });
};

/** PUT /api/receipts/:id */
export const updateReceipt = async (req, res) => {
  const receipt = await findReceipt(req.params.id);
  const fields = receiptFields(req.body);
  if (!fields.receiptNumber?.trim()) delete fields.receiptNumber;

  receipt.set(fields);
  await receipt.save();
  res.json({ success: true, message: 'Receipt updated successfully', receipt });
};

/** DELETE /api/receipts/:id */
export const deleteReceipt = async (req, res) => {
  const receipt = await findReceipt(req.params.id);
  await receipt.destroy();
  res.json({ success: true, message: 'Receipt deleted successfully' });
};

// ============================================================================
// Enhanced operations
// ============================================================================

/** POST /api/receipts/generate-from-invoice/:invoiceId */
export const generateReceiptFromInvoice = async (req, res) => {
  const invoice = isUuid(req.params.invoiceId) ? await Invoice.findByPk(req.params.invoiceId) : null;
  if (!invoice) throw httpError(404, 'Invoice not found');

  const receipt = await createNumbered({
    ...Receipt.dataFromInvoice(invoice),
    createdBy: req.user?.id || null,
    issuedBy: req.user?.name || req.user?.email || 'System'
  });
  res.status(201).json({ success: true, message: 'Receipt generated from invoice successfully', receipt });
};

/** POST /api/receipts/:id/duplicate */
export const duplicateReceipt = async (req, res) => {
  const original = await findReceipt(req.params.id);
  const {
    id, _id, receiptNumber, createdAt, updatedAt, displayId, paymentStatus, isFullyPaid,
    sentToCustomer, sentViaEmail, sentViaWhatsApp, lastSentAt, sendCount,
    refunded, refundedAt, refundAmount, refundReason,
    ...copy
  } = original.toJSON();

  const duplicate = await createNumbered({
    ...copy,
    status: ['refunded', 'cancelled'].includes(copy.status) ? 'issued' : copy.status,
    receiptDate: new Date(),
    createdBy: req.user?.id || null
  });
  res.status(201).json({ success: true, message: 'Receipt duplicated successfully', receipt: duplicate });
};

// ============================================================================
// Status & payment
// ============================================================================

/** PATCH /api/receipts/:id/status */
export const updateReceiptStatus = async (req, res) => {
  const status = normalizeEnum(req.body?.status);
  if (!status) throw httpError(400, 'Status is required');
  if (!RECEIPT_STATUSES.includes(status)) {
    throw httpError(400, `Status must be one of: ${RECEIPT_STATUSES.join(', ')}`);
  }

  const receipt = await findReceipt(req.params.id);
  if (status === 'paid' && toNumber(receipt.amountPaid) < toNumber(receipt.total)) receipt.amountPaid = receipt.total;
  receipt.status = status;
  await receipt.save();
  res.json({ success: true, message: `Receipt status updated to ${receipt.status}`, receipt });
};

/** PATCH /api/receipts/:id/mark-paid */
export const markReceiptAsPaid = async (req, res) => {
  const receipt = await findReceipt(req.params.id);
  receipt.amountPaid = receipt.total;
  receipt.status = 'paid';
  receipt.paymentDate = new Date();
  await receipt.save();
  res.json({ success: true, message: 'Receipt marked as paid', receipt });
};

/** PATCH /api/receipts/:id/refund */
export const processReceiptRefund = async (req, res) => {
  const refundAmount = toNumber(req.body?.refundAmount, 0);
  if (refundAmount <= 0) throw httpError(400, 'Valid refund amount is required');

  const receipt = await findReceipt(req.params.id);
  if (receipt.refunded) throw httpError(400, 'This receipt has already been refunded');
  if (refundAmount > toNumber(receipt.amountPaid)) {
    throw httpError(400, 'Refund amount cannot be more than the amount paid');
  }

  await receipt.processRefund(refundAmount, String(req.body?.reason ?? ''));
  res.json({ success: true, message: 'Refund processed successfully', receipt });
};

/** PATCH /api/receipts/bulk/update — only status and notes can be bulk-edited. */
export const bulkUpdateReceipts = async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(isUuid) : [];
  if (!ids.length) throw httpError(400, 'Array of receipt IDs is required');

  const updates = receiptFields(pickFields(req.body?.updateData, { text: ['status', 'notes'] }));
  if (!Object.keys(updates).length) throw httpError(400, 'Update data is required');

  const receipts = await Receipt.findAll({ where: { id: { [Op.in]: ids } } });
  for (const receipt of receipts) {
    receipt.set(updates);
    await receipt.save();
  }
  res.json({ success: true, message: `${receipts.length} receipt(s) updated`, modifiedCount: receipts.length });
};

// ============================================================================
// PDF, export & email
// ============================================================================

/** GET /api/receipts/:id/pdf */
export const exportReceiptPDF = async (req, res) => {
  const receipt = await findReceipt(req.params.id);
  const buffer = await receiptPdf(receipt);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${String(receipt.receiptNumber).replace(/[^\w.-]/g, '_')}.pdf"`);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Cache-Control', 'no-store');
  res.send(buffer);
};

/** GET /api/receipts/export/excel — a CSV file, which Excel opens directly. */
export const exportReceiptsExcel = async (req, res) => {
  const receipts = await Receipt.findAll({ order: [['createdAt', 'DESC']] });
  const csv = toCsv(
    ['Receipt Number', 'Invoice Number', 'Customer Name', 'Customer Email', 'Customer Phone', 'Account Number',
      'Total', 'Amount Paid', 'Balance', 'Payment Method', 'Payment Reference', 'Status', 'Receipt Date'],
    receipts.map((rec) => [
      rec.receiptNumber, rec.invoiceNumber, rec.customerName, rec.customerEmail, rec.customerPhone, rec.clientAccountNumber,
      rec.total, rec.amountPaid, rec.balance, rec.paymentMethod, rec.paymentReference, rec.status, formatDate(rec.receiptDate)
    ])
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="receipts-export.csv"');
  res.send(`﻿${csv}`);
};

/** POST /api/receipts/:id/send — generates the PDF on the server and emails it. */
export const sendReceiptToCustomer = async (req, res) => {
  const receipt = await findReceipt(req.params.id);
  if (!receipt.customerEmail) throw httpError(400, 'Customer email is missing');

  const company = await getCompanyInfo();
  const pdfBuffer = await renderPdf(receiptHtml(receipt, company));

  const result = await emailService.sendEmail({
    to: receipt.customerEmail,
    subject: `Receipt ${receipt.receiptNumber} from ${company.name}`,
    text: `Dear ${receipt.customerName || 'Customer'},\n\nThank you for your payment. Your official receipt is attached.\n\n${company.name}`,
    html: attachmentEmailHtml({
      companyName: company.name, customerName: receipt.customerName, documentLabel: 'Receipt', documentNumber: receipt.receiptNumber
    }),
    attachments: [{ filename: `${receipt.receiptNumber}.pdf`, content: pdfBuffer }]
  });
  if (!result.success) throw httpError(502, `Failed to send receipt email: ${result.error}`);

  await receipt.markAsSent('email');
  res.json({ success: true, message: 'Receipt sent to customer successfully', receipt });
};

/** POST /api/receipts/:id/send-with-pdf — emails a PDF that was generated in the browser. */
export const sendReceiptWithPdf = async (req, res) => {
  const { customerEmail, customerName, receiptNumber, pdfData } = req.body || {};
  if (!customerEmail || !pdfData) throw httpError(400, 'Customer email and PDF data are required');

  const pdfBuffer = pdfBufferFromBase64(pdfData);
  if (!pdfBuffer) throw httpError(400, 'Invalid PDF data');

  const company = await getCompanyInfo();
  const result = await emailService.sendEmail({
    to: String(customerEmail).trim(),
    subject: `Receipt ${receiptNumber || 'N/A'} from ${company.name}`,
    text: `Dear ${customerName || 'Customer'},\n\nYour receipt is attached.\n\n${company.name}`,
    html: attachmentEmailHtml({ companyName: company.name, customerName, documentLabel: 'Receipt', documentNumber: receiptNumber }),
    attachments: [{ filename: `${String(receiptNumber || 'receipt').replace(/[^\w.-]/g, '_')}.pdf`, content: pdfBuffer }]
  });
  if (!result.success) throw httpError(502, `Failed to send receipt email: ${result.error}`);

  const receipt = isUuid(req.params.draftId) ? await Receipt.findByPk(req.params.draftId) : null;
  if (receipt) await receipt.markAsSent('email');

  res.json({
    success: true,
    message: `Receipt sent successfully to ${customerEmail}`,
    emailInfo: { messageId: result.messageId, timestamp: result.timestamp }
  });
};

// ============================================================================
// System
// ============================================================================

/** GET /api/receipts/stats/summary */
export const getReceiptStats = async (req, res) => {
  const [overview] = await Receipt.findAll({
    attributes: [
      [fn('COUNT', col('id')), 'totalReceipts'],
      [fn('COALESCE', fn('SUM', col('total')), 0), 'totalAmount'],
      [fn('COALESCE', fn('SUM', col('amountPaid')), 0), 'totalCollected']
    ],
    raw: true
  });
  res.json({
    success: true,
    stats: {
      totalReceipts: Number(overview.totalReceipts),
      totalAmount: Number(overview.totalAmount),
      totalCollected: Number(overview.totalCollected)
    }
  });
};

/** POST /api/receipts/validate */
export const validateReceiptData = async (req, res) => {
  const fields = receiptFields(req.body);
  const errors = [];
  if (!fields.customerName?.trim()) errors.push('Customer name is required');
  if (!fields.customerEmail?.trim()) errors.push('Customer email is required');

  if (!errors.length) {
    try {
      await Receipt.build({ ...fields, receiptNumber: 'VALIDATION' }).validate({ hooks: false });
    } catch (error) {
      if (error.name !== 'SequelizeValidationError') throw error;
      errors.push(...error.errors.map((item) => item.message));
    }
  }

  if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });
  res.json({ success: true, message: 'Receipt data is valid' });
};

export const getReceiptTemplates = (req, res) => {
  res.json({
    success: true,
    templates: [{ id: 'standard', name: 'Standard Receipt', description: 'Default receipt template' }]
  });
};

export const checkReceiptSystemStatus = async (req, res) => {
  res.json({
    success: true,
    status: 'Receipt system operational',
    totalReceipts: await Receipt.count(),
    emailConfigured: emailService.isEmailConfigured()
  });
};
