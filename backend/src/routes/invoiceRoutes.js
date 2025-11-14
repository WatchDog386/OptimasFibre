// backend/src/routes/invoiceRoutes.js - COMPLETELY UPDATED (With Connection Requests - FIXED)
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
    sendConnectionRequestToOwner, // ✅ FIXED: Updated function name
    getCustomerInvoices
} from '../controllers/invoiceController.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

/**
 * @route   POST /api/invoices
 * @desc    Create or update invoice for customer
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
 * ✅ Auto-generates invoice numbers (0001, 0002, 0003...)
 * ✅ Updates existing invoices for same customer + plan
 * ✅ Prevents multiple active invoices per customer
 */
router.post('/', createInvoice);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get a single invoice by ID
 * @access  Public (for invoice viewing via shared link)
 * @param   {string} id - Invoice ID (MongoDB ObjectId)
 */
router.get('/:id', getInvoiceById);

/**
 * @route   GET /api/invoices/customer/:email
 * @desc    Get all invoices for a specific customer
 * @access  Public
 * @param   {string} email - Customer email address
 * @returns {object} Customer invoice history with active invoices
 */
router.get('/customer/:email', getCustomerInvoices);

/**
 * @route   POST /api/invoices/:id/send-connection-request
 * @desc    Send connection request to owner's WhatsApp (+254 741 874 200)
 * @access  Public
 * @param   {string} id - Invoice ID
 * @returns {object} Success message and WhatsApp result
 * ✅ Sends professional message to owner
 * ✅ Marks invoice as connection request sent
 * ✅ Updates invoice status to 'completed'
 */
router.post('/:id/send-connection-request', sendConnectionRequestToOwner); // ✅ FIXED: Updated function name

// --- PROTECTED ROUTES (Admin/Staff) ---

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices (supports pagination and status filtering)
 * @access  Protected (admin/staff)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} status - Filter by status (pending, paid, cancelled, completed, overdue)
 * @query   {string} search - Search in customer name, email, planName, or invoiceNumber
 */
router.get('/', protect, getInvoices);

/**
 * @route   GET /api/invoices/stats/summary
 * @desc    Get invoice statistics and summary
 * @access  Protected (admin/staff)
 * @returns {object} Invoice statistics by status and total revenue
 */
router.get('/stats/summary', protect, getInvoiceStats);

/**
 * @route   PATCH /api/invoices/:id/status
 * @desc    Update invoice status
 * @access  Protected (admin/staff)
 * @param   {string} id - Invoice ID
 * @body    {string} status - New status (pending, paid, cancelled, completed, overdue)
 * @returns {object} Updated invoice
 */
router.patch('/:id/status', protect, updateInvoiceStatus);

/**
 * @route   POST /api/invoices/:id/resend
 * @desc    Resend email and WhatsApp notifications for a specific invoice
 * @access  Protected (admin/staff)
 * @param   {string} id - Invoice ID
 * @returns {object} Notification results
 */
router.post('/:id/resend', protect, resendInvoiceNotifications);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete an invoice
 * @access  Protected (admin/staff)
 * @param   {string} id - Invoice ID
 * @returns {object} Success message
 */
router.delete('/:id', protect, deleteInvoice);

// --- TEMPORARY CLEANUP ROUTES (Remove after invoiceNumber index is fixed) ---

/**
 * @route   DELETE /api/invoices/cleanup/remove-invoiceNumber-index
 * @desc    Remove the problematic invoiceNumber index (TEMPORARY FIX)
 * @access  Public (remove this route after the issue is fixed)
 */
router.delete('/cleanup/remove-invoiceNumber-index', async (req, res) => {
  try {
    const Invoice = await import('../models/Invoice.js');
    console.log('🔧 [CLEANUP] Starting invoiceNumber index removal...');
    
    const indexes = await Invoice.default.collection.getIndexes();
    console.log('📋 [CLEANUP] Current indexes:', Object.keys(indexes));
    
    if (indexes.invoiceNumber_1) {
      console.log('🗑️ [CLEANUP] Removing invoiceNumber_1 index...');
      await Invoice.default.collection.dropIndex('invoiceNumber_1');
      console.log('✅ [CLEANUP] invoiceNumber_1 index removed successfully');
      
      const updatedIndexes = await Invoice.default.collection.getIndexes();
      return res.json({
        success: true,
        message: 'invoiceNumber index removed successfully! You can now create invoices.',
        details: {
          indexesBefore: Object.keys(indexes),
          indexesAfter: Object.keys(updatedIndexes),
          status: 'FIXED'
        }
      });
    } else {
      return res.json({
        success: true,
        message: 'invoiceNumber index already removed. System is ready.',
        currentIndexes: Object.keys(indexes),
        status: 'READY'
      });
    }
  } catch (error) {
    console.error('❌ [CLEANUP] Error:', error);
    if (error.code === 27 || error.codeName === 'IndexNotFound') {
      return res.json({
        success: true,
        message: 'invoiceNumber index already removed or never existed',
        status: 'ALREADY_FIXED'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error removing index',
      error: error.message
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
    const Invoice = await import('../models/Invoice.js');
    const indexes = await Invoice.default.collection.getIndexes();
    
    return res.json({
      success: true,
      hasInvoiceNumberIndex: !!indexes.invoiceNumber_1,
      status: indexes.invoiceNumber_1 ? 'NEEDS_CLEANUP' : 'CLEAN',
      indexes: Object.keys(indexes),
      recommendation: indexes.invoiceNumber_1 
        ? 'Run DELETE /api/invoices/cleanup/remove-invoiceNumber-index' 
        : 'System ready for invoice creation'
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

/**
 * @route   GET /api/invoices/cleanup/system-status
 * @desc    Get complete system status and recommendations
 * @access  Public (remove after fix)
 */
router.get('/cleanup/system-status', async (req, res) => {
  try {
    const Invoice = await import('../models/Invoice.js');
    const indexes = await Invoice.default.collection.getIndexes();
    const hasInvoiceNumberIndex = !!indexes.invoiceNumber_1;
    
    const totalInvoices = await Invoice.default.countDocuments();
    const sampleInvoice = await Invoice.default.findOne().sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      system: {
        database: 'Connected',
        invoiceModel: 'Loaded',
        totalInvoices,
        latestInvoice: sampleInvoice ? {
          id: sampleInvoice._id,
          invoiceNumber: sampleInvoice.invoiceNumber,
          customer: sampleInvoice.customerName,
          plan: sampleInvoice.planName
        } : null
      },
      indexes: {
        hasInvoiceNumberIndex,
        totalIndexes: Object.keys(indexes).length,
        allIndexes: Object.keys(indexes),
        status: hasInvoiceNumberIndex ? 'ACTION_REQUIRED' : 'HEALTHY'
      },
      actions: hasInvoiceNumberIndex ? [
        {
          action: 'Remove problematic index',
          method: 'DELETE',
          url: '/api/invoices/cleanup/remove-invoiceNumber-index',
          description: 'Fixes the duplicate invoiceNumber null error'
        }
      ] : [
        {
          action: 'Create test invoice',
          method: 'POST', 
          url: '/api/invoices',
          description: 'Verify system is working correctly'
        }
      ]
    });
  } catch (error) {
    console.error('❌ Error getting system status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting system status',
      error: error.message
    });
  }
});

export default router;