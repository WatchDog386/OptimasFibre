import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  generateReceiptFromInvoice,
  duplicateReceipt,
  updateReceiptStatus,
  markReceiptAsPaid,
  processReceiptRefund,
  bulkUpdateReceipts,
  validateReceiptData,
  cleanupReceipts,
  getReceiptTemplates,
  checkReceiptSystemStatus
} from '../controllers/receiptController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

/** =======================
 * Basic CRUD
 * ======================= */
router.post('/', createReceipt);
router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.put('/:id', updateReceipt);
router.delete('/:id', deleteReceipt);

/** =======================
 * Enhanced Operations
 * ======================= */
router.post('/generate-from-invoice/:invoiceId', generateReceiptFromInvoice);
router.post('/:id/duplicate', duplicateReceipt);

/** =======================
 * Status & Payment
 * ======================= */
router.patch('/:id/status', updateReceiptStatus);
router.patch('/:id/mark-paid', markReceiptAsPaid);
router.patch('/:id/refund', processReceiptRefund);

/** =======================
 * Bulk Operations
 * ======================= */
router.patch('/bulk/update', bulkUpdateReceipts);

/** =======================
 * System & Validation
 * ======================= */
router.post('/validate', validateReceiptData);
router.post('/cleanup/old-receipts', cleanupReceipts);
router.get('/templates/available', getReceiptTemplates);
router.get('/health/status', checkReceiptSystemStatus);

/** =======================
 * Route Info
 * ======================= */
router.get('/routes/info', (req, res) => {
  res.json({
    message: 'Optimas Fibre Receipt Management API',
    version: '2.0.0',
    features: {
      itemized_billing: true,
      bulk_operations: true,
      advanced_search: true,
      analytics: true,
      refund_management: true
    }
  });
});

/** =======================
 * 404 Catch-All (FIXED - Express.js router.use())
 * ======================= */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '❌ Receipt API endpoint not found',
    requested: { method: req.method, path: req.originalUrl },
    documentation: 'Visit /api/receipts/routes/info for API documentation'
  });
});

export default router;