// backend/src/routes/invoiceRoutes.js - COMPLETELY UPDATED (Full Feature Set)
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    // ✅ Basic CRUD Operations
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    
    // ✅ Enhanced Status Management
    updateInvoiceStatus,
    markInvoiceAsPaid,
    markInvoiceAsOverdue,
    
    // ✅ Customer Operations
    getCustomerInvoices,
    checkExistingActiveInvoices,
    
    // ✅ Notification & Communication
    sendInvoiceToCustomer,
    resendInvoiceNotifications,
    sendConnectionRequestToOwner,
    
    // ✅ Export & Download
    exportInvoicePDF,
    exportInvoicesExcel,
    downloadInvoiceAttachment,
    
    // ✅ Statistics & Analytics
    getInvoiceStats,
    getInvoiceAnalytics,
    getRevenueReports,
    
    // ✅ Search & Filtering
    searchInvoices,
    getInvoicesByDateRange,
    getInvoicesByStatus,
    
    // ✅ Bulk Operations
    bulkUpdateInvoices,
    bulkDeleteInvoices,
    bulkSendInvoices,
    
    // ✅ System Operations
    getInvoiceTemplates,
    validateInvoiceData,
    cleanupInvoices,
    
    // ✅ Temporary Cleanup Routes
    removeInvoiceNumberIndex,
    checkIndexes,
    getSystemStatus
} from '../controllers/invoiceController.js';

const router = express.Router();

// =============================================
// 📊 PUBLIC ROUTES (Customer Facing)
// =============================================

// ✅ Create or update invoice
router.post('/', createInvoice);

// ✅ Get a single invoice by ID
router.get('/:id', getInvoiceById);

// ✅ Get all invoices for a specific customer
router.get('/customer/:email', getCustomerInvoices);

// ✅ Check for existing active invoices
router.get('/check/existing', checkExistingActiveInvoices);

// ✅ Send connection request to owner (marks invoice as completed)
router.post('/:id/send-connection-request', sendConnectionRequestToOwner);

// ✅ Validate invoice data before creation
router.post('/validate', validateInvoiceData);

// =============================================
// 🔐 PROTECTED ROUTES (Admin/Staff Only)
// =============================================

// ✅ Get all invoices (with advanced filtering, pagination & search)
router.get('/', protect, getInvoices);

// ✅ Search invoices with multiple criteria
router.get('/search/advanced', protect, searchInvoices);

// ✅ Get invoices by status
router.get('/status/:status', protect, getInvoicesByStatus);

// ✅ Get invoices by date range
router.get('/date-range/:startDate/:endDate', protect, getInvoicesByDateRange);

// ✅ Update invoice (full update)
router.put('/:id', protect, updateInvoice);

// ✅ Update invoice status
router.patch('/:id/status', protect, updateInvoiceStatus);

// ✅ Mark invoice as paid
router.patch('/:id/mark-paid', protect, markInvoiceAsPaid);

// ✅ Mark invoice as overdue
router.patch('/:id/mark-overdue', protect, markInvoiceAsOverdue);

// ✅ Send invoice to customer via email
router.post('/:id/send', protect, sendInvoiceToCustomer);

// ✅ Resend email & WhatsApp notifications
router.post('/:id/resend', protect, resendInvoiceNotifications);

// ✅ Delete an invoice
router.delete('/:id', protect, deleteInvoice);

// =============================================
// 📈 STATISTICS & ANALYTICS
// =============================================

// ✅ Get invoice statistics and summary
router.get('/stats/summary', protect, getInvoiceStats);

// ✅ Get advanced analytics
router.get('/analytics/advanced', protect, getInvoiceAnalytics);

// ✅ Get revenue reports
router.get('/reports/revenue', protect, getRevenueReports);

// =============================================
// 📤 EXPORT & DOWNLOAD
// =============================================

// ✅ Export single invoice as PDF
router.get('/:id/export/pdf', protect, exportInvoicePDF);

// ✅ Export all invoices as Excel
router.get('/export/excel', protect, exportInvoicesExcel);

// ✅ Download invoice attachment
router.get('/:id/download', protect, downloadInvoiceAttachment);

// =============================================
// 🔄 BULK OPERATIONS
// =============================================

// ✅ Bulk update invoices (status, due dates, etc.)
router.patch('/bulk/update', protect, bulkUpdateInvoices);

// ✅ Bulk delete invoices
router.delete('/bulk/delete', protect, bulkDeleteInvoices);

// ✅ Bulk send invoices to customers
router.post('/bulk/send', protect, bulkSendInvoices);

// =============================================
// ⚙️ SYSTEM & TEMPLATES
// =============================================

// ✅ Get invoice templates
router.get('/templates/available', protect, getInvoiceTemplates);

// ✅ Cleanup old or invalid invoices
router.post('/cleanup/old-invoices', protect, cleanupInvoices);

// =============================================
// 🛠️ TEMPORARY CLEANUP ROUTES (Debugging)
// =============================================

// ✅ Remove problematic invoiceNumber index
router.delete('/cleanup/remove-invoiceNumber-index', removeInvoiceNumberIndex);

// ✅ Check current indexes
router.get('/cleanup/check-indexes', checkIndexes);

// ✅ Get system status
router.get('/cleanup/system-status', getSystemStatus);

// =============================================
// 🔍 DEBUG & MONITORING ROUTES
// =============================================

// ✅ Health check for invoice system
router.get('/health/status', (req, res) => {
    res.json({
        success: true,
        message: '✅ Invoice system is healthy and running',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: {
            crud: true,
            search: true,
            export: true,
            analytics: true,
            bulk_operations: true,
            email_integration: true
        }
    });
});

// ✅ Route information endpoint
router.get('/routes/info', (req, res) => {
    res.json({
        message: 'Optimas Fibre Invoice Management API',
        version: '2.0.0',
        endpoints: {
            public: {
                'POST /': 'Create invoice',
                'GET /:id': 'Get invoice by ID',
                'GET /customer/:email': 'Get customer invoices',
                'GET /check/existing': 'Check existing invoices',
                'POST /:id/send-connection-request': 'Send connection request',
                'POST /validate': 'Validate invoice data'
            },
            protected: {
                'GET /': 'Get all invoices (with filters)',
                'GET /search/advanced': 'Advanced search',
                'GET /status/:status': 'Get by status',
                'GET /date-range/:start/:end': 'Get by date range',
                'PUT /:id': 'Update invoice',
                'PATCH /:id/status': 'Update status',
                'PATCH /:id/mark-paid': 'Mark as paid',
                'POST /:id/send': 'Send to customer',
                'DELETE /:id': 'Delete invoice'
            },
            analytics: {
                'GET /stats/summary': 'Basic statistics',
                'GET /analytics/advanced': 'Advanced analytics',
                'GET /reports/revenue': 'Revenue reports'
            },
            export: {
                'GET /:id/export/pdf': 'Export PDF',
                'GET /export/excel': 'Export Excel',
                'GET /:id/download': 'Download attachment'
            },
            bulk: {
                'PATCH /bulk/update': 'Bulk update',
                'DELETE /bulk/delete': 'Bulk delete',
                'POST /bulk/send': 'Bulk send'
            }
        }
    });
});

// =============================================
// 🎯 CATCH-ALL ROUTE FOR UNDEFINED ENDPOINTS (Express 5 Compatible)
// =============================================

router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '❌ Invoice API endpoint not found',
        requested: {
            method: req.method,
            path: req.originalUrl
        },
        available_endpoints: [
            'GET    /api/invoices',
            'POST   /api/invoices',
            'GET    /api/invoices/:id',
            'PUT    /api/invoices/:id',
            'DELETE /api/invoices/:id',
            'GET    /api/invoices/stats/summary',
            'GET    /api/invoices/search/advanced',
            'GET    /api/invoices/export/excel',
            'GET    /api/invoices/:id/export/pdf',
            'POST   /api/invoices/:id/send',
            'GET    /api/invoices/routes/info'
        ],
        documentation: 'Visit /api/invoices/routes/info for complete API documentation'
    });
});

export default router;
