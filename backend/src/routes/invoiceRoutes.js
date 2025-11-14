// backend/src/routes/invoiceRoutes.js - FULL UPDATED
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
    sendConnectionRequestToOwner,
    getCustomerInvoices,
    checkExistingActiveInvoices
} from '../controllers/invoiceController.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

// Create or update invoice
router.post('/', createInvoice);

// Get a single invoice by ID
router.get('/:id', getInvoiceById);

// Get all invoices for a specific customer
router.get('/customer/:email', getCustomerInvoices);

// Check for existing active invoices
router.get('/check/existing', checkExistingActiveInvoices);

// Send connection request to owner (marks invoice as completed)
router.post('/:id/send-connection-request', sendConnectionRequestToOwner);

// --- PROTECTED ROUTES (Admin/Staff) ---

// Get all invoices (with optional pagination & status filtering)
router.get('/', protect, getInvoices);

// Get invoice statistics and summary
router.get('/stats/summary', protect, getInvoiceStats);

// Update invoice status (e.g., mark as paid, completed, cancelled)
router.patch('/:id/status', protect, updateInvoiceStatus);

// Resend email & WhatsApp notifications for an invoice
router.post('/:id/resend', protect, resendInvoiceNotifications);

// Delete an invoice
router.delete('/:id', protect, deleteInvoice);

// --- TEMPORARY CLEANUP ROUTES ---

// Remove problematic invoiceNumber index (TEMP FIX)
router.delete('/cleanup/remove-invoiceNumber-index', async (req, res) => {
    try {
        const Invoice = (await import('../models/Invoice.js')).default;
        console.log('🔧 [CLEANUP] Starting invoiceNumber index removal...');
        
        const indexes = await Invoice.collection.getIndexes();
        console.log('📋 [CLEANUP] Current indexes:', Object.keys(indexes));
        
        if (indexes.invoiceNumber_1) {
            console.log('🗑️ [CLEANUP] Removing invoiceNumber_1 index...');
            await Invoice.collection.dropIndex('invoiceNumber_1');
            console.log('✅ [CLEANUP] invoiceNumber_1 index removed successfully');
            
            const updatedIndexes = await Invoice.collection.getIndexes();
            return res.json({
                success: true,
                message: 'invoiceNumber index removed successfully!',
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

// Check current indexes (debugging)
router.get('/cleanup/check-indexes', async (req, res) => {
    try {
        const Invoice = (await import('../models/Invoice.js')).default;
        const indexes = await Invoice.collection.getIndexes();
        
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

// System status check (debugging)
router.get('/cleanup/system-status', async (req, res) => {
    try {
        const Invoice = (await import('../models/Invoice.js')).default;
        const indexes = await Invoice.collection.getIndexes();
        const hasInvoiceNumberIndex = !!indexes.invoiceNumber_1;
        
        const totalInvoices = await Invoice.countDocuments();
        const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        
        return res.json({
            success: true,
            system: {
                database: 'Connected',
                invoiceModel: 'Loaded',
                totalInvoices,
                latestInvoice: latestInvoice ? {
                    id: latestInvoice._id,
                    invoiceNumber: latestInvoice.invoiceNumber,
                    customer: latestInvoice.customerName,
                    plan: latestInvoice.planName
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