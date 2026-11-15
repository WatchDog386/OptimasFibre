// backend/src/routes/receipts.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { requireUuidParam } from '../middleware/errorHandler.js';
import {
  createReceipt, getReceipts, getReceiptById, updateReceipt, deleteReceipt,
  generateReceiptFromInvoice, duplicateReceipt,
  updateReceiptStatus, markReceiptAsPaid, processReceiptRefund, bulkUpdateReceipts,
  exportReceiptPDF, exportReceiptsExcel, sendReceiptToCustomer, sendReceiptWithPdf,
  getReceiptStats, validateReceiptData, getReceiptTemplates, checkReceiptSystemStatus
} from '../controllers/receiptController.js';

const router = express.Router();

router.use(protect, admin);

// Fixed paths first, so they can never be mistaken for a receipt id.
router.get('/', getReceipts);
router.post('/', createReceipt);
router.post('/validate', validateReceiptData);
router.get('/export/excel', exportReceiptsExcel);
router.get('/stats/summary', getReceiptStats);
router.get('/templates/available', getReceiptTemplates);
router.get('/health/status', checkReceiptSystemStatus);
router.patch('/bulk/update', bulkUpdateReceipts);
router.post('/generate-from-invoice/:invoiceId', generateReceiptFromInvoice);

router.post('/:draftId/send-with-pdf', sendReceiptWithPdf);

router.param('id', requireUuidParam('Receipt'));

router.get('/:id/pdf', exportReceiptPDF);
router.post('/:id/send', sendReceiptToCustomer);
router.post('/:id/duplicate', duplicateReceipt);
router.patch('/:id/status', updateReceiptStatus);
router.patch('/:id/mark-paid', markReceiptAsPaid);
router.patch('/:id/refund', processReceiptRefund);
router.get('/:id', getReceiptById);
router.put('/:id', updateReceipt);
router.delete('/:id', deleteReceipt);

export default router;
