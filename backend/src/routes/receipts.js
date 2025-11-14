// backend/src/routes/invoiceRoutes.js - COMPLETELY UPDATED (Full Feature Set)
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    // Basic CRUD Operations
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    
    // Enhanced Status Management
    updateInvoiceStatus,
    markInvoiceAsPaid,
    markInvoiceAsOverdue,
    
    // Customer Operations
    getCustomerInvoices,
    checkExistingActiveInvoices,
    
    // Notification & Communication
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

// PUBLIC ROUTES (Customer Facing)
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.get('/customer/:email', getCustomerInvoices);
router.get('/check/existing', checkExistingActiveInvoices);
router.post('/:id/send-connection-request', sendConnectionRequestToOwner);
router.post('/validate', validateInvoiceData);

// PROTECTED ROUTES (Admin/Staff Only)
router.get('/', protect, getInvoices);
router.get('/search/advanced', protect, searchInvoices);
router.get('/status/:status', protect, getInvoicesByStatus);
router.get('/date-range/:startDate/:endDate', protect, getInvoicesByDateRange);
router.put('/:id', protect, updateInvoice);
router.patch('/:id/status', protect, updateInvoiceStatus);
router.patch('/:id/mark-paid', protect, markInvoiceAsPaid);
router.patch('/:id/mark-overdue', protect, markInvoiceAsOverdue);
router.post('/:id/send', protect, sendInvoiceToCustomer);
router.post('/:id/resend', protect, resendInvoiceNotifications);
router.delete('/:id', protect, deleteInvoice);

// STATISTICS & ANALYTICS
router.get('/stats/summary', protect, getInvoiceStats);
router.get('/analytics/advanced', protect, getInvoiceAnalytics);
router.get('/reports/revenue', protect, getRevenueReports);

// EXPORT & DOWNLOAD
router.get('/:id/export/pdf', protect, exportInvoicePDF);
router.get('/export/excel', protect, exportInvoicesExcel);
router.get('/:id/download', protect, downloadInvoiceAttachment);

// BULK OPERATIONS
router.patch('/bulk/update', protect, bulkUpdateInvoices);
router.delete('/bulk/delete', protect, bulkDeleteInvoices);
router.post('/bulk/send', protect, bulkSendInvoices);

// SYSTEM & TEMPLATES
router.get('/templates/available', protect, getInvoiceTemplates);
router.post('/cleanup/old-invoices', protect, cleanupInvoices);

// TEMPORARY CLEANUP ROUTES (Debugging)
router.delete('/cleanup/remove-invoiceNumber-index', removeInvoiceNumberIndex);
router.get('/cleanup/check-indexes', checkIndexes);
router.get('/cleanup/system-status', getSystemStatus);

// HEALTH CHECK
router.get('/health/status', (req, res) => {
    res.json({
        success: true,
        message: 'Invoice system is healthy and running',
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

// ROUTE INFORMATION
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

// EXPRESS 5 COMPATIBLE CATCH-ALL (NO WILDCARDS)
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Invoice API endpoint not found',
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
        ]
    });
});

export default router;
