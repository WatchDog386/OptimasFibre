// backend/src/routes/invoiceRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    resendInvoiceNotifications,
    deleteInvoice,
} from '../controllers/invoiceController.js';

const router = express.Router();

// --- Public Routes ---

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice (customer submission)
 * @access  Public
 */
router.post('/', createInvoice);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get a single invoice by ID
 * @access  Public (for invoice viewing via shared link)
 */
router.get('/:id', getInvoiceById);

// --- Protected (Admin/Staff) Routes ---

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices (supports pagination and status filtering)
 * @access  Protected (admin/staff)
 */
router.get('/', protect, getInvoices);

/**
 * @route   PUT /api/invoices/:id/status
 * @desc    Update invoice status (e.g., mark as paid)
 * @access  Protected (admin/staff)
 */
router.put('/:id/status', protect, updateInvoiceStatus);

/**
 * @route   POST /api/invoices/:id/resend-notifications
 * @desc    Resend email and WhatsApp notifications for a specific invoice
 * @access  Protected (admin/staff)
 */
router.post('/:id/resend-notifications', protect, resendInvoiceNotifications);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete an invoice
 * @access  Protected (admin/staff)
 */
router.delete('/:id', protect, deleteInvoice);

export default router;