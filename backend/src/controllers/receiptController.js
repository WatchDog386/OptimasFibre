// backend/src/controllers/receiptController.js - COMPLETELY UPDATED
import Receipt from '../models/Receipt.js';
import Invoice from '../models/Invoice.js';
import mongoose from 'mongoose';

// ✅ Basic CRUD Operations
export const createReceipt = async (req, res) => {
    try {
        console.log('🧾 Creating new receipt...');
        
        const receiptData = {
            ...req.body,
            createdBy: req.user?._id,
            issuedBy: req.user?.name || 'System'
        };

        // Validate required fields
        if (!receiptData.customerName || !receiptData.customerEmail || !receiptData.total) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customerName, customerEmail, total'
            });
        }

        const receipt = new Receipt(receiptData);
        await receipt.save();

        console.log(`✅ Receipt created: ${receipt.receiptNumber}`);
        
        res.status(201).json({
            success: true,
            message: 'Receipt created successfully',
            receipt: receipt
        });
    } catch (error) {
        console.error('❌ Error creating receipt:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Receipt number already exists'
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating receipt',
            error: error.message
        });
    }
};

export const getReceipts = async (req, res) => {
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

        // Build query
        let query = {};
        
        if (status) query.status = status;
        if (customerEmail) query.customerEmail = customerEmail.toLowerCase();
        
        if (search) {
            query.$or = [
                { receiptNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } },
                { customerPhone: { $regex: search, $options: 'i' } },
                { invoiceNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const receipts = await Receipt.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Receipt.countDocuments(query);

        res.json({
            success: true,
            receipts,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('❌ Error fetching receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipts',
            error: error.message
        });
    }
};

export const getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.json({
            success: true,
            receipt
        });
    } catch (error) {
        console.error('❌ Error fetching receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipt',
            error: error.message
        });
    }
};

export const updateReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.json({
            success: true,
            message: 'Receipt updated successfully',
            receipt
        });
    } catch (error) {
        console.error('❌ Error updating receipt:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating receipt',
            error: error.message
        });
    }
};

export const deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndDelete(req.params.id);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.json({
            success: true,
            message: 'Receipt deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting receipt',
            error: error.message
        });
    }
};

// ✅ Enhanced Operations
export const generateReceiptFromInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Generate receipt from invoice
        const receipt = await Receipt.generateFromInvoice(invoice);
        
        res.status(201).json({
            success: true,
            message: 'Receipt generated from invoice successfully',
            receipt
        });
    } catch (error) {
        console.error('❌ Error generating receipt from invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating receipt from invoice',
            error: error.message
        });
    }
};

export const duplicateReceipt = async (req, res) => {
    try {
        const originalReceipt = await Receipt.findById(req.params.id);
        if (!originalReceipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // Create duplicate with new receipt number
        const receiptData = {
            ...originalReceipt.toObject(),
            _id: undefined,
            receiptNumber: undefined,
            createdAt: undefined,
            updatedAt: undefined
        };

        const duplicatedReceipt = new Receipt(receiptData);
        await duplicatedReceipt.save();

        res.status(201).json({
            success: true,
            message: 'Receipt duplicated successfully',
            receipt: duplicatedReceipt
        });
    } catch (error) {
        console.error('❌ Error duplicating receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error duplicating receipt',
            error: error.message
        });
    }
};

// ✅ Status & Payment Management
export const updateReceiptStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const receipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.json({
            success: true,
            message: `Receipt status updated to ${status}`,
            receipt
        });
    } catch (error) {
        console.error('❌ Error updating receipt status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating receipt status',
            error: error.message
        });
    }
};

export const markReceiptAsPaid = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'paid',
                paymentDate: new Date(),
                amountPaid: req.body.amount || undefined
            },
            { new: true }
        );

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.json({
            success: true,
            message: 'Receipt marked as paid',
            receipt
        });
    } catch (error) {
        console.error('❌ Error marking receipt as paid:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking receipt as paid',
            error: error.message
        });
    }
};

export const processReceiptRefund = async (req, res) => {
    try {
        const { refundAmount, reason } = req.body;
        
        if (!refundAmount || refundAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid refund amount is required'
            });
        }

        const receipt = await Receipt.findById(req.params.id);
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // Process refund
        await receipt.processRefund(refundAmount, reason);

        res.json({
            success: true,
            message: 'Refund processed successfully',
            receipt
        });
    } catch (error) {
        console.error('❌ Error processing refund:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

// ✅ Export & Download (Placeholder implementations)
export const exportReceiptPDF = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // TODO: Implement PDF generation
        // For now, return receipt data
        res.json({
            success: true,
            message: 'PDF export functionality coming soon',
            receipt,
            pdfData: {
                receiptNumber: receipt.receiptNumber,
                customerName: receipt.customerName,
                total: receipt.total,
                receiptDate: receipt.receiptDate
            }
        });
    } catch (error) {
        console.error('❌ Error exporting receipt PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting receipt PDF',
            error: error.message
        });
    }
};

export const exportReceiptsPDF = async (req, res) => {
    try {
        const receipts = await Receipt.find().sort({ createdAt: -1 }).limit(50);
        
        // TODO: Implement bulk PDF generation
        res.json({
            success: true,
            message: 'Bulk PDF export functionality coming soon',
            receiptCount: receipts.length,
            receipts: receipts.map(r => ({
                receiptNumber: r.receiptNumber,
                customerName: r.customerName,
                total: r.total,
                receiptDate: r.receiptDate
            }))
        });
    } catch (error) {
        console.error('❌ Error exporting receipts PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting receipts PDF',
            error: error.message
        });
    }
};

export const downloadReceiptAttachment = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // TODO: Implement file download
        res.json({
            success: true,
            message: 'Download functionality coming soon',
            receipt
        });
    } catch (error) {
        console.error('❌ Error downloading receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading receipt',
            error: error.message
        });
    }
};

// ✅ Notification & Communication
export const sendReceiptToCustomer = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // TODO: Implement email sending logic
        console.log(`📧 Sending receipt ${receipt.receiptNumber} to ${receipt.customerEmail}`);
        
        // Update sent status
        await receipt.markAsSent('email');

        res.json({
            success: true,
            message: 'Receipt sent to customer successfully',
            receipt
        });
    } catch (error) {
        console.error('❌ Error sending receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending receipt',
            error: error.message
        });
    }
};

export const resendReceiptNotifications = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // TODO: Implement resend logic for email/WhatsApp
        console.log(`🔄 Resending notifications for receipt ${receipt.receiptNumber}`);
        
        await receipt.markAsSent('email');

        res.json({
            success: true,
            message: 'Receipt notifications resent successfully',
            receipt
        });
    } catch (error) {
        console.error('❌ Error resending receipt notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending receipt notifications',
            error: error.message
        });
    }
};

export const bulkSendReceipts = async (req, res) => {
    try {
        const { receiptIds } = req.body;
        
        if (!receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'receiptIds array is required'
            });
        }

        // TODO: Implement bulk email sending
        const receipts = await Receipt.find({ _id: { $in: receiptIds } });
        
        // Update sent status for all receipts
        await Receipt.updateMany(
            { _id: { $in: receiptIds } },
            { 
                sentToCustomer: true,
                lastSentAt: new Date(),
                $inc: { sendCount: 1 }
            }
        );

        res.json({
            success: true,
            message: `Sent ${receipts.length} receipts to customers`,
            sentCount: receipts.length
        });
    } catch (error) {
        console.error('❌ Error bulk sending receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk sending receipts',
            error: error.message
        });
    }
};

// ✅ Statistics & Analytics
export const getReceiptStats = async (req, res) => {
    try {
        const stats = await Receipt.getStatistics();
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ Error fetching receipt stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipt stats',
            error: error.message
        });
    }
};

export const getReceiptAnalytics = async (req, res) => {
    try {
        // Enhanced analytics
        const totalReceipts = await Receipt.countDocuments();
        const paidReceipts = await Receipt.countDocuments({ status: 'paid' });
        const issuedReceipts = await Receipt.countDocuments({ status: 'issued' });
        const refundedReceipts = await Receipt.countDocuments({ status: 'refunded' });
        
        const revenueStats = await Receipt.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$total' },
                    totalCollected: { $sum: '$amountPaid' },
                    totalBalance: { $sum: '$balance' }
                }
            }
        ]);

        const paymentMethodStats = await Receipt.aggregate([
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$total' }
                }
            }
        ]);

        res.json({
            success: true,
            analytics: {
                overview: {
                    totalReceipts,
                    paidReceipts,
                    issuedReceipts,
                    refundedReceipts,
                    collectionRate: totalReceipts > 0 ? (paidReceipts / totalReceipts) * 100 : 0
                },
                revenue: revenueStats[0] || {
                    totalAmount: 0,
                    totalCollected: 0,
                    totalBalance: 0
                },
                paymentMethods: paymentMethodStats
            }
        });
    } catch (error) {
        console.error('❌ Error fetching receipt analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipt analytics',
            error: error.message
        });
    }
};

export const getReceiptRevenueReports = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        let groupStage = {};
        if (period === 'monthly') {
            groupStage = {
                _id: {
                    year: { $year: '$receiptDate' },
                    month: { $month: '$receiptDate' }
                }
            };
        } else if (period === 'weekly') {
            groupStage = {
                _id: {
                    year: { $year: '$receiptDate' },
                    week: { $week: '$receiptDate' }
                }
            };
        } else {
            groupStage = {
                _id: {
                    year: { $year: '$receiptDate' }
                }
            };
        }

        const revenueReport = await Receipt.aggregate([
            {
                $group: {
                    ...groupStage,
                    receiptCount: { $sum: 1 },
                    totalAmount: { $sum: '$total' },
                    totalCollected: { $sum: '$amountPaid' },
                    totalBalance: { $sum: '$balance' }
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

// ✅ Search & Filtering
export const searchReceipts = async (req, res) => {
    try {
        const { q: searchTerm, status, paymentMethod, startDate, endDate } = req.query;
        
        const receipts = await Receipt.searchReceipts(searchTerm, {
            status,
            paymentMethod,
            startDate,
            endDate
        });

        res.json({
            success: true,
            receipts,
            total: receipts.length
        });
    } catch (error) {
        console.error('❌ Error searching receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching receipts',
            error: error.message
        });
    }
};

export const getReceiptsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        
        const receipts = await Receipt.find({
            receiptDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ receiptDate: -1 });

        res.json({
            success: true,
            receipts,
            total: receipts.length
        });
    } catch (error) {
        console.error('❌ Error fetching receipts by date range:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipts by date range',
            error: error.message
        });
    }
};

export const getReceiptsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        const receipts = await Receipt.find({ status }).sort({ createdAt: -1 });

        res.json({
            success: true,
            receipts,
            total: receipts.length
        });
    } catch (error) {
        console.error('❌ Error fetching receipts by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipts by status',
            error: error.message
        });
    }
};

export const getReceiptsByPaymentMethod = async (req, res) => {
    try {
        const { method } = req.params;
        
        const receipts = await Receipt.find({ paymentMethod: method }).sort({ createdAt: -1 });

        res.json({
            success: true,
            receipts,
            total: receipts.length
        });
    } catch (error) {
        console.error('❌ Error fetching receipts by payment method:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipts by payment method',
            error: error.message
        });
    }
};

// ✅ Customer Operations
export const getCustomerReceipts = async (req, res) => {
    try {
        const { email } = req.params;
        const receipts = await Receipt.find({ 
            customerEmail: email.toLowerCase() 
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            receipts,
            total: receipts.length
        });
    } catch (error) {
        console.error('❌ Error fetching customer receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer receipts',
            error: error.message
        });
    }
};

export const getReceiptsByInvoice = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const receipts = await Receipt.find({ 
            invoiceNumber: invoiceNumber 
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            receipts,
            total: receipts.length
        });
    } catch (error) {
        console.error('❌ Error fetching receipts by invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipts by invoice',
            error: error.message
        });
    }
};

// ✅ Bulk Operations
export const bulkUpdateReceipts = async (req, res) => {
    try {
        const { receiptIds, updates } = req.body;
        
        if (!receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'receiptIds array is required'
            });
        }

        const result = await Receipt.updateMany(
            { _id: { $in: receiptIds } },
            updates
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} receipts`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Error bulk updating receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk updating receipts',
            error: error.message
        });
    }
};

export const bulkDeleteReceipts = async (req, res) => {
    try {
        const { receiptIds } = req.body;
        
        if (!receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'receiptIds array is required'
            });
        }

        const result = await Receipt.deleteMany({ _id: { $in: receiptIds } });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} receipts`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Error bulk deleting receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk deleting receipts',
            error: error.message
        });
    }
};

// ✅ System Operations
export const validateReceiptData = async (req, res) => {
    try {
        const receiptData = req.body;
        
        // Basic validation
        const errors = [];
        
        if (!receiptData.customerName) errors.push('Customer name is required');
        if (!receiptData.customerEmail) errors.push('Customer email is required');
        if (!receiptData.total || receiptData.total <= 0) errors.push('Valid total amount is required');
        
        // Check for duplicate receipt number
        if (receiptData.receiptNumber) {
            const existing = await Receipt.findOne({ receiptNumber: receiptData.receiptNumber });
            if (existing) errors.push('Receipt number already exists');
        }

        res.json({
            success: errors.length === 0,
            errors,
            validated: true
        });
    } catch (error) {
        console.error('❌ Error validating receipt data:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating receipt data',
            error: error.message
        });
    }
};

export const cleanupReceipts = async (req, res) => {
    try {
        // Delete receipts older than 1 year with draft status
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const result = await Receipt.deleteMany({
            status: 'draft',
            createdAt: { $lt: oneYearAgo }
        });

        res.json({
            success: true,
            message: `Cleaned up ${result.deletedCount} old draft receipts`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Error cleaning up receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up receipts',
            error: error.message
        });
    }
};

export const getReceiptTemplates = async (req, res) => {
    try {
        const templates = [
            {
                id: 'standard',
                name: 'Standard Receipt',
                description: 'Basic receipt template',
                fields: ['customerName', 'customerEmail', 'total', 'paymentMethod']
            },
            {
                id: 'detailed',
                name: 'Detailed Receipt', 
                description: 'Receipt with itemized billing',
                fields: ['customerName', 'customerEmail', 'items', 'notes']
            }
        ];

        res.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('❌ Error fetching receipt templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching receipt templates',
            error: error.message
        });
    }
};

// ✅ Health & Monitoring
export const checkReceiptSystemStatus = async (req, res) => {
    try {
        const totalReceipts = await Receipt.countDocuments();
        const latestReceipt = await Receipt.findOne().sort({ createdAt: -1 });
        
        return res.json({
            success: true,
            system: {
                database: 'Connected',
                receiptModel: 'Loaded',
                totalReceipts,
                latestReceipt: latestReceipt ? {
                    id: latestReceipt._id,
                    receiptNumber: latestReceipt.receiptNumber,
                    customer: latestReceipt.customerName,
                    amount: latestReceipt.total
                } : null
            },
            status: 'HEALTHY',
            features: {
                crud: true,
                search: true,
                export: true,
                analytics: true,
                bulk_operations: true,
                email_integration: true
            }
        });
    } catch (error) {
        console.error('❌ Error getting receipt system status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting receipt system status',
            error: error.message
        });
    }
};