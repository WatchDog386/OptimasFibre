// backend/src/routes/invoiceRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { requireUuidParam } from '../middleware/errorHandler.js';
import {
  createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice,
  updateInvoiceStatus, markInvoiceAsPaid, markInvoiceAsOverdue,
  getCustomerInvoices, checkExistingActiveInvoices,
  sendInvoiceToCustomer, sendInvoiceWithPdf, resendInvoiceNotifications, testEmailSetup,
  exportInvoicePDF, exportInvoicesExcel, downloadInvoiceAttachment,
  getInvoiceStats, getInvoiceAnalytics, getRevenueReports,
  searchInvoices, getInvoicesByDateRange, getInvoicesByStatus,
  bulkUpdateInvoices, bulkDeleteInvoices, bulkSendInvoices,
  getInvoiceTemplates, validateInvoiceData, cleanupInvoices, getSystemStatus
} from '../controllers/invoiceController.js';

const router = express.Router();

// Invoices hold customer names, contacts and balances, so every route needs an admin login.
router.use(protect, admin);

// Fixed paths first, so they can never be mistaken for an invoice id.
router.get('/', getInvoices);
router.post('/', createInvoice);
router.post('/validate', validateInvoiceData);
router.post('/test-email', testEmailSetup);

router.get('/export/excel', exportInvoicesExcel);
router.get('/search/advanced', searchInvoices);
router.get('/stats/summary', getInvoiceStats);
router.get('/analytics/advanced', getInvoiceAnalytics);
router.get('/reports/revenue', getRevenueReports);
router.get('/templates/available', getInvoiceTemplates);
router.get('/check/existing', checkExistingActiveInvoices);
router.get('/cleanup/system-status', getSystemStatus);
router.get('/health/status', getSystemStatus);
router.get('/customer/:email', getCustomerInvoices);
router.get('/status/:status', getInvoicesByStatus);
router.get('/date-range/:startDate/:endDate', getInvoicesByDateRange);

router.patch('/bulk/update', bulkUpdateInvoices);
router.delete('/bulk/delete', bulkDeleteInvoices);
router.post('/bulk/send', bulkSendInvoices);
router.post('/cleanup/old-invoices', cleanupInvoices);

// Single invoice. Sending a browser-made PDF is registered before the id check because
// the dashboard can do it for an offline draft that has no saved record yet.
router.post('/:draftId/send-with-pdf', sendInvoiceWithPdf);

router.param('id', requireUuidParam('Invoice'));

router.get('/:id/pdf', exportInvoicePDF);
router.get('/:id/export/pdf', exportInvoicePDF);
router.get('/:id/download', downloadInvoiceAttachment);
router.post('/:id/send', sendInvoiceToCustomer);
router.post('/:id/resend', resendInvoiceNotifications);
router.patch('/:id/status', updateInvoiceStatus);
router.patch('/:id/paid', markInvoiceAsPaid);
router.patch('/:id/mark-paid', markInvoiceAsPaid);
router.patch('/:id/mark-overdue', markInvoiceAsOverdue);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
