// backend/src/routes/invoiceRoutes.js - COMPLETELY UPDATED & FIXED
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    // Basic CRUD Operations
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,

    // Status Management
    updateInvoiceStatus,
    markInvoiceAsPaid, // This function handles marking as paid
    markInvoiceAsOverdue,

    // Customer Operations
    getCustomerInvoices,
    checkExistingActiveInvoices,

    // Notifications & Communication
    sendInvoiceToCustomer,
    resendInvoiceNotifications,
    sendConnectionRequestToOwner,

    // Export & Download
    exportInvoicePDF,
    exportInvoicesExcel,
    downloadInvoiceAttachment,

    // Statistics & Analytics
    getInvoiceStats,
    getInvoiceAnalytics,
    getRevenueReports,

    // Search & Filtering
    searchInvoices,
    getInvoicesByDateRange,
    getInvoicesByStatus,

    // Bulk Operations
    bulkUpdateInvoices,
    bulkDeleteInvoices,
    bulkSendInvoices,

    // System Operations
    getInvoiceTemplates,
    validateInvoiceData,
    cleanupInvoices,

    // Temporary Cleanup Routes
    removeInvoiceNumberIndex,
    checkIndexes,
    getSystemStatus
} from '../controllers/invoiceController.js';

const router = express.Router();

// =========================================================
// 📊 PUBLIC ROUTES (Customer Facing)
// =========================================================

// Create invoice
router.post('/', createInvoice);

// GET invoices for a specific customer
router.get('/customer/:email', getCustomerInvoices);

// Check active invoices
router.get('/check/existing', checkExistingActiveInvoices);

// Validate before creation
router.post('/validate', validateInvoiceData);

// Connection request
router.post('/:id/send-connection-request', sendConnectionRequestToOwner);

// =========================================================
// 🔐 PROTECTED ROUTES (Admin/Staff)
// =========================================================

// Search, filtering, pagination
router.get('/', protect, getInvoices);
router.get('/search/advanced', protect, searchInvoices);
router.get('/status/:status', protect, getInvoicesByStatus);
router.get('/date-range/:startDate/:endDate', protect, getInvoicesByDateRange);

// Update & Status
router.put('/:id', protect, updateInvoice);
router.patch('/:id/status', protect, updateInvoiceStatus);

// =========================================================
// 🔥 FIXED: ADD BOTH ENDPOINTS FOR MARKING PAID
// Your previous backend used /mark-paid
// Your frontend calls /paid
// Now BOTH work.
// =========================================================

// ✔ Existing backend route
router.patch('/:id/mark-paid', protect, markInvoiceAsPaid);

// ✔ Added for frontend compatibility (fixes your 404 error)
router.patch('/:id/paid', protect, markInvoiceAsPaid);

// Mark invoice as overdue
router.patch('/:id/mark-overdue', protect, markInvoiceAsOverdue);

// Send or resend notifications
router.post('/:id/send', protect, sendInvoiceToCustomer);
router.post('/:id/resend', protect, resendInvoiceNotifications);

// Export & Downloads
router.get('/export/excel', protect, exportInvoicesExcel);
router.get('/:id/export/pdf', protect, exportInvoicePDF);
router.get('/:id/download', protect, downloadInvoiceAttachment);

// Bulk operations
router.patch('/bulk/update', protect, bulkUpdateInvoices);
router.delete('/bulk/delete', protect, bulkDeleteInvoices);
router.post('/bulk/send', protect, bulkSendInvoices);

// Statistics & analytics
router.get('/stats/summary', protect, getInvoiceStats);
router.get('/analytics/advanced', protect, getInvoiceAnalytics);
router.get('/reports/revenue', protect, getRevenueReports);

// Templates & cleanup
router.get('/templates/available', protect, getInvoiceTemplates);
router.post('/cleanup/old-invoices', protect, cleanupInvoices);

// Debug + maintenance
router.delete('/cleanup/remove-invoiceNumber-index', removeInvoiceNumberIndex);
router.get('/cleanup/check-indexes', checkIndexes);
router.get('/cleanup/system-status', getSystemStatus);

// =========================================================
// ⚠️ PLACE /:id ROUTES AT THE END
// =========================================================

// MUST BE LAST among invoice routes
router.get('/:id', getInvoiceById);
router.delete('/:id', protect, deleteInvoice);

// =========================================================
// 🔍 DEBUG ROUTES
// =========================================================
router.get('/health/status', (req, res) => {
    res.json({
        success: true,
        message: 'Invoice system healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

router.get('/routes/info', (req, res) => {
    res.json({
        message: 'Optimas Fibre Invoice API',
        version: '2.0.0'
    });
});

// =========================================================
// 🎯 EXPRESS 5 CATCH-ALL
// =========================================================
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '❌ Invoice API endpoint not found',
        requested: { method: req.method, path: req.originalUrl },
        documentation: '/api/invoices/routes/info'
    });
});

export default router;