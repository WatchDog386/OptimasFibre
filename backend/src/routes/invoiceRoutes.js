import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    // CRUD
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,

    // Status
    updateInvoiceStatus,
    markInvoiceAsPaid,
    markInvoiceAsOverdue,

    // Customer
    getCustomerInvoices,
    checkExistingActiveInvoices,

    // Email
    sendInvoiceToCustomer,
    sendInvoiceWithPdf,
    resendInvoiceNotifications,
    testEmailSetup,

    // PDF / Export
    exportInvoicePDF,
    exportInvoicesExcel,
    downloadInvoiceAttachment,

    // Analytics
    getInvoiceStats,
    getInvoiceAnalytics,
    getRevenueReports,

    // Search
    searchInvoices,
    getInvoicesByDateRange,
    getInvoicesByStatus,

    // Bulk
    bulkUpdateInvoices,
    bulkDeleteInvoices,
    bulkSendInvoices,

    // System
    getInvoiceTemplates,
    validateInvoiceData,
    cleanupInvoices,

    // Debug
    removeInvoiceNumberIndex,
    checkIndexes,
    getSystemStatus
} from '../controllers/invoiceController.js';

const router = express.Router();

/* =========================================================
   🧪 HARD DEBUG – MUST RESPOND OR ROUTER IS NOT LOADED
========================================================= */
router.get('/__router_alive', (req, res) => {
    res.json({
        success: true,
        message: '✅ invoiceRoutes.js is ACTIVE',
        time: new Date().toISOString()
    });
});

/* =========================================================
   🌍 PUBLIC ROUTES (NO AUTH)
========================================================= */
router.post('/', createInvoice);
router.get('/customer/:email', getCustomerInvoices);
router.get('/check/existing', checkExistingActiveInvoices);
router.post('/validate', validateInvoiceData);

/* =========================================================
   🔐 PROTECTED ROUTES
========================================================= */
router.use(protect);

/* =========================================================
   📄 PDF & EXPORT (ABSOLUTE PRIORITY)
   MUST COME BEFORE ANY :id ROUTES
========================================================= */
router.get('/export/excel', exportInvoicesExcel);

/**
 * 🔥 THIS IS THE ROUTE YOUR FRONTEND CALLS
 * GET /api/invoices/:id/pdf
 */
router.get('/:id/pdf', exportInvoicePDF);

/**
 * Legacy / fallback support
 */
router.get('/:id/export/pdf', exportInvoicePDF);
router.get('/:id/download', downloadInvoiceAttachment);

/* =========================================================
   🔍 SEARCH & FILTER
========================================================= */
router.get('/', getInvoices);
router.get('/search/advanced', searchInvoices);
router.get('/status/:status', getInvoicesByStatus);
router.get('/date-range/:startDate/:endDate', getInvoicesByDateRange);

/* =========================================================
   📧 EMAIL
========================================================= */
router.post('/test-email', testEmailSetup);
router.post('/:id/send', sendInvoiceToCustomer);
router.post('/:id/send-with-pdf', sendInvoiceWithPdf);
router.post('/:id/resend', resendInvoiceNotifications);

/* =========================================================
   🧾 STATUS
========================================================= */
router.patch('/:id/status', updateInvoiceStatus);
router.patch('/:id/paid', markInvoiceAsPaid);
router.patch('/:id/mark-paid', markInvoiceAsPaid);
router.patch('/:id/mark-overdue', markInvoiceAsOverdue);

/* =========================================================
   📦 BULK
========================================================= */
router.patch('/bulk/update', bulkUpdateInvoices);
router.delete('/bulk/delete', bulkDeleteInvoices);
router.post('/bulk/send', bulkSendInvoices);

/* =========================================================
   📊 ANALYTICS
========================================================= */
router.get('/stats/summary', getInvoiceStats);
router.get('/analytics/advanced', getInvoiceAnalytics);
router.get('/reports/revenue', getRevenueReports);

/* =========================================================
   ⚙️ SYSTEM
========================================================= */
router.get('/templates/available', getInvoiceTemplates);
router.post('/cleanup/old-invoices', cleanupInvoices);

/* =========================================================
   🧪 DEBUG / MAINTENANCE
========================================================= */
router.delete('/cleanup/remove-invoiceNumber-index', removeInvoiceNumberIndex);
router.get('/cleanup/check-indexes', checkIndexes);
router.get('/cleanup/system-status', getSystemStatus);

/* =========================================================
   🧾 SINGLE INVOICE (ALWAYS LAST)
========================================================= */
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

/* =========================================================
   ❤️ HEALTH
========================================================= */
router.get('/health/status', (req, res) => {
    res.json({
        success: true,
        message: 'Invoice API healthy',
        emailProvider: 'Resend',
        pdf: {
            primary: '/api/invoices/:id/pdf',
            legacy: '/api/invoices/:id/export/pdf'
        },
        timestamp: new Date().toISOString()
    });
});

/* =========================================================
   ❌ 404 (LAST – DO NOT MOVE)
========================================================= */
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '❌ Invoice API endpoint not found',
        requested: {
            method: req.method,
            path: req.originalUrl
        },
        hint: 'If /__router_alive fails, this router is not mounted'
    });
});

export default router;
