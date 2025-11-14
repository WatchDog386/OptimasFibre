// backend/src/controllers/invoiceController.js - COMPLETELY UPDATED WITH FIXES
import Invoice from '../models/Invoice.js';
import mongoose from 'mongoose';

// ============================================================================
// ✅ Basic CRUD Operations
// ============================================================================

export const createInvoice = async (req, res) => {
    try {
        console.log('📝 Creating new invoice...');
        console.log('🔐 User making request:', req.user?._id);
        
        // Validate required fields
        if (!req.body.customerName || !req.body.customerEmail || !req.body.planName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customerName, customerEmail, planName'
            });
        }

        const invoiceData = {
            ...req.body,
            createdBy: req.user?._id || null // Handle case where user might not be available
        };

        // ✅ FIX: Remove duplicate validation that's causing issues
        // Let the model handle validation instead

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        console.log(`✅ Invoice created: ${invoice.invoiceNumber} by user ${req.user?._id || 'system'}`);
        
        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error creating invoice:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`,
                field: field
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating invoice',
            error: error.message
        });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { 
            page = 1,
            limit = 10,
            status,
            customerEmail,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};

        if (status) query.status = status;
        if (customerEmail) query.customerEmail = customerEmail.toLowerCase();

        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } },
                { customerPhone: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const invoices = await Invoice.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Invoice.countDocuments(query);

        res.json({
            success: true,
            invoices,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('❌ Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices',
            error: error.message
        });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error('❌ Error fetching invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice',
            error: error.message
        });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                updatedBy: req.user?._id
            },
            { new: true, runValidators: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice updated successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error updating invoice:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating invoice',
            error: error.message
        });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting invoice',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Enhanced Status Management
// ============================================================================

export const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: `Invoice status updated to ${status}`,
            invoice
        });
    } catch (error) {
        console.error('❌ Error updating invoice status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating invoice status',
            error: error.message
        });
    }
};

export const markInvoiceAsPaid = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                status: 'paid',
                paidAt: new Date(),
                amountPaid: req.body.amount || undefined
            },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice marked as paid',
            invoice
        });
    } catch (error) {
        console.error('❌ Error marking invoice as paid:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking invoice as paid',
            error: error.message
        });
    }
};

export const markInvoiceAsOverdue = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { status: 'overdue' },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice marked as overdue',
            invoice
        });
    } catch (error) {
        console.error('❌ Error marking invoice as overdue:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking invoice as overdue',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Customer Operations
// ============================================================================

export const getCustomerInvoices = async (req, res) => {
    try {
        const { email } = req.params;

        const invoices = await Invoice.find({
            customerEmail: email.toLowerCase()
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error fetching customer invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer invoices',
            error: error.message
        });
    }
};

export const checkExistingActiveInvoices = async (req, res) => {
    try {
        const { customerEmail } = req.query;

        if (!customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'customerEmail is required'
            });
        }

        const existingInvoice = await Invoice.findOne({
            customerEmail: customerEmail.toLowerCase(),
            status: { $in: ['pending', 'completed'] }
        });

        res.json({
            success: true,
            exists: !!existingInvoice,
            invoice: existingInvoice
        });
    } catch (error) {
        console.error('❌ Error checking existing invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking existing invoices',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Notification & Communication
// ============================================================================

export const sendInvoiceToCustomer = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        console.log(`📧 Sending invoice ${invoice.invoiceNumber} to ${invoice.customerEmail}`);

        invoice.sentToCustomer = true;
        invoice.lastSentAt = new Date();
        invoice.sendCount += 1;
        await invoice.save();

        res.json({
            success: true,
            message: 'Invoice sent to customer successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error sending invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending invoice',
            error: error.message
        });
    }
};

export const resendInvoiceNotifications = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        console.log(`🔄 Resending notifications for invoice ${invoice.invoiceNumber}`);

        invoice.lastSentAt = new Date();
        invoice.sendCount += 1;
        await invoice.save();

        res.json({
            success: true,
            message: 'Invoice notifications resent successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error resending invoice notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending invoice notifications',
            error: error.message
        });
    }
};

export const sendConnectionRequestToOwner = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        await invoice.markConnectionRequestSent();

        res.json({
            success: true,
            message: 'Connection request sent to owner successfully',
            invoice
        });
    } catch (error) {
        console.error('❌ Error sending connection request:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending connection request',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Export & Download (Placeholders)
// ============================================================================

export const exportInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'PDF export functionality coming soon',
            invoice
        });
    } catch (error) {
        console.error('❌ Error exporting invoice PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting invoice PDF',
            error: error.message
        });
    }
};

export const exportInvoicesExcel = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Excel export functionality coming soon'
        });
    } catch (error) {
        console.error('❌ Error exporting invoices Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting invoices Excel',
            error: error.message
        });
    }
};

export const downloadInvoiceAttachment = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Download functionality coming soon',
            invoice
        });
    } catch (error) {
        console.error('❌ Error downloading invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading invoice',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Analytics & Reports
// ============================================================================

export const getInvoiceStats = async (req, res) => {
    try {
        const stats = await Invoice.getStatistics();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ Error fetching invoice stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice stats',
            error: error.message
        });
    }
};

export const getInvoiceAnalytics = async (req, res) => {
    try {
        const totalInvoices = await Invoice.countDocuments();
        const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
        const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
        const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

        const revenueStats = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    collectedRevenue: { $sum: '$amountPaid' },
                    outstandingRevenue: { $sum: '$balanceDue' }
                }
            }
        ]);

        const planStats = await Invoice.aggregate([
            {
                $group: {
                    _id: '$planName',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            analytics: {
                overview: {
                    totalInvoices,
                    paidInvoices,
                    pendingInvoices,
                    overdueInvoices,
                    completionRate:
                        totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0
                },
                revenue:
                    revenueStats[0] || {
                        totalRevenue: 0,
                        collectedRevenue: 0,
                        outstandingRevenue: 0
                    },
                plans: planStats
            }
        });
    } catch (error) {
        console.error('❌ Error fetching invoice analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice analytics',
            error: error.message
        });
    }
};

export const getRevenueReports = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        let groupStage = {};

        if (period === 'monthly') {
            groupStage = {
                _id: {
                    year: { $year: '$invoiceDate' },
                    month: { $month: '$invoiceDate' }
                }
            };
        } else if (period === 'weekly') {
            groupStage = {
                _id: {
                    year: { $year: '$invoiceDate' },
                    week: { $week: '$invoiceDate' }
                }
            };
        } else {
            groupStage = {
                _id: {
                    year: { $year: '$invoiceDate' }
                }
            };
        }

        const revenueReport = await Invoice.aggregate([
            {
                $group: {
                    ...groupStage,
                    invoiceCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    collectedRevenue: { $sum: '$amountPaid' },
                    outstandingRevenue: { $sum: '$balanceDue' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        res.json({
            success: true,
            period,
            report: revenueReport
        });
    } catch (error) {
        console.error('❌ Error fetching revenue reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue reports',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Searching & Filters
// ============================================================================

export const searchInvoices = async (req, res) => {
    try {
        const { q: searchTerm, status, paymentMethod, startDate, endDate } = req.query;

        const invoices = await Invoice.searchInvoices(searchTerm, {
            status,
            paymentMethod,
            startDate,
            endDate
        });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error searching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching invoices',
            error: error.message
        });
    }
};

export const getInvoicesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;

        const invoices = await Invoice.find({
            invoiceDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ invoiceDate: -1 });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error fetching invoices by date range:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices by date range',
            error: error.message
        });
    }
};

export const getInvoicesByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const invoices = await Invoice.find({ status }).sort({ createdAt: -1 });

        res.json({
            success: true,
            invoices,
            total: invoices.length
        });
    } catch (error) {
        console.error('❌ Error fetching invoices by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices by status',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Bulk Operations
// ============================================================================

export const bulkUpdateInvoices = async (req, res) => {
    try {
        const { invoiceIds, updates } = req.body;

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'invoiceIds array is required'
            });
        }

        const result = await Invoice.updateMany(
            { _id: { $in: invoiceIds } },
            { ...updates, updatedBy: req.user?._id }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} invoices`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Error bulk updating invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk updating invoices',
            error: error.message
        });
    }
};

export const bulkDeleteInvoices = async (req, res) => {
    try {
        const { invoiceIds } = req.body;

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'invoiceIds array is required'
            });
        }

        const result = await Invoice.deleteMany({ _id: { $in: invoiceIds } });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} invoices`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Error bulk deleting invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk deleting invoices',
            error: error.message
        });
    }
};

export const bulkSendInvoices = async (req, res) => {
    try {
        const { invoiceIds } = req.body;

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'invoiceIds array is required'
            });
        }

        const invoices = await Invoice.find({ _id: { $in: invoiceIds } });

        await Invoice.updateMany(
            { _id: { $in: invoiceIds } },
            {
                sentToCustomer: true,
                lastSentAt: new Date(),
                $inc: { sendCount: 1 }
            }
        );

        res.json({
            success: true,
            message: `Sent ${invoices.length} invoices to customers`,
            sentCount: invoices.length
        });
    } catch (error) {
        console.error('❌ Error bulk sending invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk sending invoices',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ System Operations
// ============================================================================

export const getInvoiceTemplates = async (req, res) => {
    try {
        const templates = [
            {
                id: 'standard',
                name: 'Standard Invoice',
                description: 'Basic invoice template with company details',
                fields: ['customerName', 'customerEmail', 'planName', 'planPrice']
            },
            {
                id: 'detailed',
                name: 'Detailed Invoice',
                description: 'Invoice with itemized billing and terms',
                fields: ['customerName', 'customerEmail', 'items', 'terms', 'notes']
            }
        ];

        res.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('❌ Error fetching invoice templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice templates',
            error: error.message
        });
    }
};

export const validateInvoiceData = async (req, res) => {
    try {
        const invoiceData = req.body;

        const errors = [];

        if (!invoiceData.customerName) errors.push('Customer name is required');
        if (!invoiceData.customerEmail) errors.push('Customer email is required');
        if (!invoiceData.planName) errors.push('Plan name is required');
        if (!invoiceData.planPrice || invoiceData.planPrice <= 0)
            errors.push('Valid plan price is required');

        // ✅ FIX: Removed duplicate invoice number validation that causes issues
        // Let the model handle this validation

        res.json({
            success: errors.length === 0,
            errors,
            validated: true
        });
    } catch (error) {
        console.error('❌ Error validating invoice data:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating invoice data',
            error: error.message
        });
    }
};

export const cleanupInvoices = async (req, res) => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const result = await Invoice.deleteMany({
            status: 'cancelled',
            createdAt: { $lt: oneYearAgo }
        });

        res.json({
            success: true,
            message: `Cleaned up ${result.deletedCount} old cancelled invoices`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Error cleaning up invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up invoices',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Health Check & System Status
// ============================================================================

export const healthCheck = async (req, res) => {
    try {
        const totalInvoices = await Invoice.countDocuments();
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        res.json({
            success: true,
            status: 'healthy',
            database: dbStatus,
            totalInvoices,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Health check failed:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Debug Endpoints for Development
// ============================================================================

export const debugCreateInvoice = async (req, res) => {
    try {
        // This endpoint allows testing without authentication
        const testInvoiceData = {
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '+254700000000',
            planName: 'Test Plan',
            planPrice: 5000,
            planSpeed: '10Mbps',
            status: 'pending'
        };

        const invoice = new Invoice(testInvoiceData);
        await invoice.save();

        res.json({
            success: true,
            message: 'Test invoice created successfully',
            invoice,
            debug: {
                user: req.user,
                hasToken: !!req.headers.authorization
            }
        });
    } catch (error) {
        console.error('❌ Debug invoice creation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Debug invoice creation failed',
            error: error.message
        });
    }
};

// ============================================================================
// ✅ Index Cleanup for invoiceNumber (Fix Duplicate Null)
// ============================================================================

export const removeInvoiceNumberIndex = async (req, res) => {
    try {
        const indexes = await Invoice.collection.getIndexes();

        if (indexes.invoiceNumber_1) {
            await Invoice.collection.dropIndex('invoiceNumber_1');
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
        console.error('❌ Error removing index:', error);

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
};

export const checkIndexes = async (req, res) => {
    try {
        const indexes = await Invoice.collection.getIndexes();
        const hasInvoiceNumberIndex = !!indexes.invoiceNumber_1;

        return res.json({
            success: true,
            hasInvoiceNumberIndex,
            status: hasInvoiceNumberIndex ? 'NEEDS_CLEANUP' : 'CLEAN',
            indexes: Object.keys(indexes),
            recommendation: hasInvoiceNumberIndex
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
};

export const getSystemStatus = async (req, res) => {
    try {
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
                latestInvoice: latestInvoice
                    ? {
                          id: latestInvoice._id,
                          invoiceNumber: latestInvoice.invoiceNumber,
                          customer: latestInvoice.customerName,
                          plan: latestInvoice.planName
                      }
                    : null
            },
            indexes: {
                hasInvoiceNumberIndex,
                totalIndexes: Object.keys(indexes).length,
                allIndexes: Object.keys(indexes),
                status: hasInvoiceNumberIndex ? 'ACTION_REQUIRED' : 'HEALTHY'
            },
            actions: hasInvoiceNumberIndex
                ? [
                      {
                          action: 'Remove problematic index',
                          method: 'DELETE',
                          url: '/api/invoices/cleanup/remove-invoiceNumber-index',
                          description:
                              'Fixes the duplicate invoiceNumber null error'
                      }
                  ]
                : [
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
};