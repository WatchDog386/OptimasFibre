// backend/src/routes/invoiceRoutes.js - COMPLETELY UPDATED (With Index Cleanup)
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
import Invoice from '../models/Invoice.js'; // Import Invoice model for cleanup

const router = express.Router();

// --- TEMPORARY CLEANUP ROUTE (Remove after fixing the issue) ---

/**
 * @route   DELETE /api/invoices/cleanup/remove-invoiceNumber-index
 * @desc    Remove the problematic invoiceNumber index (TEMPORARY FIX)
 * @access  Public (remove this route after the issue is fixed)
 */
router.delete('/cleanup/remove-invoiceNumber-index', async (req, res) => {
  try {
    console.log('🔧 [CLEANUP] Starting invoiceNumber index removal...');
    
    // Get all current indexes
    const indexes = await Invoice.collection.getIndexes();
    console.log('📋 [CLEANUP] Current indexes:', Object.keys(indexes));
    
    // Check if invoiceNumber index exists
    if (indexes.invoiceNumber_1) {
      console.log('🗑️ [CLEANUP] Removing invoiceNumber_1 index...');
      await Invoice.collection.dropIndex('invoiceNumber_1');
      console.log('✅ [CLEANUP] invoiceNumber_1 index removed successfully');
      
      // Verify removal by getting updated indexes
      const updatedIndexes = await Invoice.collection.getIndexes();
      console.log('📋 [CLEANUP] Updated indexes:', Object.keys(updatedIndexes));
      
      return res.json({
        success: true,
        message: 'invoiceNumber index removed successfully',
        details: {
          indexesBefore: Object.keys(indexes),
          indexesAfter: Object.keys(updatedIndexes),
          removedIndex: 'invoiceNumber_1'
        }
      });
    } else {
      console.log('ℹ️ [CLEANUP] invoiceNumber index already removed or never existed');
      return res.json({
        success: true,
        message: 'invoiceNumber index already removed or never existed',
        currentIndexes: Object.keys(indexes)
      });
    }
  } catch (error) {
    console.error('❌ [CLEANUP] Error removing index:', error);
    
    // Handle specific error cases
    if (error.code === 27) { // Index not found error code
      console.log('ℹ️ [CLEANUP] Index already removed (not found)');
      return res.json({
        success: true,
        message: 'invoiceNumber index already removed or never existed'
      });
    }
    
    if (error.codeName === 'IndexNotFound') {
      console.log('ℹ️ [CLEANUP] Index not found');
      return res.json({
        success: true,
        message: 'invoiceNumber index not found (already removed)'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error removing invoiceNumber index',
      error: error.message,
      code: error.code,
      codeName: error.codeName
    });
  }
});

/**
 * @route   GET /api/invoices/cleanup/check-indexes
 * @desc    Check current indexes (for debugging)
 * @access  Public (remove after fix)
 */
router.get('/cleanup/check-indexes', async (req, res) => {
  try {
    const indexes = await Invoice.collection.getIndexes();
    
    return res.json({
      success: true,
      indexes: Object.keys(indexes),
      details: indexes
    });
  } catch (error) {
    console.error('❌ Error checking indexes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking indexes',
      error: error.message
    });
  }
});

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