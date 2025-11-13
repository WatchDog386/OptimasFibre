// backend/src/routes/invoiceRoutes.js - COMPLETELY UPDATED (InvoiceNumber Removed)

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    resendInvoiceNotifications,
    deleteInvoice,
    getInvoiceStats,
} from '../controllers/invoiceController.js';

const router = express.Router();

// --- Public Routes ---

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice (customer submission)
 * @access  Public
 * @body    {string} customerName - Customer's full name (required)
 * @body    {string} customerEmail - Customer's email (required)
 * @body    {string} customerPhone - Customer's phone number (required)
 * @body    {string} customerLocation - Customer's location (required)
 * @body    {string} planName - Selected plan name (required)
 * @body    {number} planPrice - Plan price (required)
 * @body    {string} planSpeed - Plan speed (required)
 * @body    {array} features - Plan features array
 * @body    {string} connectionType - Connection type (default: 'Fiber Optic')
 * @body    {string} notes - Additional notes
 * @body    {boolean} sendNotifications - Whether to send notifications (default: true)
 * @body    {string} status - Invoice status (default: 'pending')
 * @body    {Date} invoiceDate - Invoice date (auto-generated if not provided)
 * @body    {Date} dueDate - Due date (auto-generated if not provided)
 * ❌ NO invoiceNumber field - completely removed from backend
 */
router.post('/', createInvoice);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get a single invoice by ID
 * @access  Public (for invoice viewing via shared link)
 * @param   {string} id - Invoice ID (MongoDB ObjectId)
 */
router.get('/:id', getInvoiceById);

// --- Stats Route ---

/**
 * @route   GET /api/invoices/stats/summary
 * @desc    Get invoice statistics and summary
 * @access  Protected (admin/staff)
 */
router.get('/stats/summary', protect, getInvoiceStats);

// --- Protected (Admin/Staff) Routes ---

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices (supports pagination and status filtering)
 * @access  Protected (admin/staff)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} status - Filter by status (pending, paid, cancelled, overdue)
 * @query   {string} search - Search in customer name, email, or planName
 */
router.get('/', protect, getInvoices);

/**
 * @route   PATCH /api/invoices/:id/status
 * @desc    Update invoice status (e.g., mark as paid)
 * @access  Protected (admin/staff)
 * @param   {string} id - Invoice ID
 * @body    {string} status - New status (pending, paid, cancelled, overdue)
 */
router.patch('/:id/status', protect, updateInvoiceStatus);

/**
 * @route   POST /api/invoices/:id/resend
 * @desc    Resend email and WhatsApp notifications for a specific invoice
 * @access  Protected (admin/staff)
 * @param   {string} id - Invoice ID
 */
router.post('/:id/resend', protect, resendInvoiceNotifications);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete an invoice
 * @access  Protected (admin/staff)
 * @param   {string} id - Invoice ID
 */
router.delete('/:id', protect, deleteInvoice);

export default router;