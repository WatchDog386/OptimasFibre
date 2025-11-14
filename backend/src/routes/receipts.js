// backend/src/routes/receipts.js
import express from 'express';
import { 
  getReceipts, 
  getReceiptById, 
  resendReceiptNotifications 
} from '../controllers/receiptController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔒 Protect all receipt routes — admin access only
router.use(protect);

// GET /api/receipts — List all receipts (paginated, auto-generates from paid invoices)
router.get('/', getReceipts);

// GET /api/receipts/:id — Get a single receipt
router.get('/:id', getReceiptById);

// POST /api/receipts/:id/resend — Resend receipt via Email/WhatsApp
router.post('/:id/resend', resendReceiptNotifications);

export default router;
