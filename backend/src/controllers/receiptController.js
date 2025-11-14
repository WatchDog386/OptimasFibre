import Receipt from '../models/Receipt.js';
import Invoice from '../models/Invoice.js';
import mongoose from 'mongoose';

/**
 * ===============================
 *      Basic CRUD Operations
 * ===============================
 */
export const createReceipt = async (req, res) => {
    try {
        const receiptData = { ...req.body, createdBy: req.user?._id, issuedBy: req.user?.name || 'System' };

        if (!receiptData.customerName || !receiptData.customerEmail || !receiptData.total) {
            return res.status(400).json({ success: false, message: 'Missing required fields: customerName, customerEmail, total' });
        }

        const receipt = new Receipt(receiptData);
        await receipt.save();

        res.status(201).json({ success: true, message: 'Receipt created successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReceipts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, customerEmail, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = {};
        if (status) query.status = status;
        if (customerEmail) query.customerEmail = customerEmail.toLowerCase();
        if (search) query.$or = [
            { receiptNumber: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { customerEmail: { $regex: search, $options: 'i' } },
            { customerPhone: { $regex: search, $options: 'i' } },
            { invoiceNumber: { $regex: search, $options: 'i' } }
        ];

        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        const receipts = await Receipt.find(query).sort(sortOptions).limit(limit * 1).skip((page - 1) * limit);
        const total = await Receipt.countDocuments(query);

        res.json({ success: true, receipts, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
        res.json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
        res.json({ success: true, message: 'Receipt updated successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndDelete(req.params.id);
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
        res.json({ success: true, message: 'Receipt deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ===============================
 *    Enhanced Operations
 * ===============================
 */
export const generateReceiptFromInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const receipt = await Receipt.generateFromInvoice(invoice);
        res.status(201).json({ success: true, message: 'Receipt generated from invoice successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const duplicateReceipt = async (req, res) => {
    try {
        const original = await Receipt.findById(req.params.id);
        if (!original) return res.status(404).json({ success: false, message: 'Receipt not found' });

        const receiptData = { ...original.toObject(), _id: undefined, receiptNumber: undefined, createdAt: undefined, updatedAt: undefined };
        const duplicate = new Receipt(receiptData);
        await duplicate.save();

        res.status(201).json({ success: true, message: 'Receipt duplicated successfully', receipt: duplicate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ===============================
 *    Status & Payment Management
 * ===============================
 */
export const updateReceiptStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

        const receipt = await Receipt.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

        res.json({ success: true, message: `Receipt status updated to ${status}`, receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markReceiptAsPaid = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            { status: 'paid', paymentDate: new Date(), amountPaid: req.body.amount || undefined },
            { new: true }
        );
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

        res.json({ success: true, message: 'Receipt marked as paid', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const processReceiptRefund = async (req, res) => {
    try {
        const { refundAmount, reason } = req.body;
        if (!refundAmount || refundAmount <= 0) return res.status(400).json({ success: false, message: 'Valid refund amount is required' });

        const receipt = await Receipt.findById(req.params.id);
        if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

        await receipt.processRefund(refundAmount, reason);

        res.json({ success: true, message: 'Refund processed successfully', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ===============================
 *    Bulk Operations
 * ===============================
 */
export const bulkUpdateReceipts = async (req, res) => {
    try {
        const { ids, updateData } = req.body;
        if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ success: false, message: 'Array of receipt IDs is required' });
        if (!updateData || !Object.keys(updateData).length) return res.status(400).json({ success: false, message: 'Update data is required' });

        const allowedFields = ['status', 'notes', 'tags', 'customFields'];
        const sanitizedUpdate = {};
        for (const key of allowedFields) if (updateData[key] !== undefined) sanitizedUpdate[key] = updateData[key];

        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        const result = await Receipt.updateMany({ _id: { $in: objectIds } }, { $set: sanitizedUpdate });

        res.json({ success: true, message: `${result.modifiedCount} receipt(s) updated`, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ===============================
 *    System & Placeholder Operations
 * ===============================
 */
export const checkReceiptSystemStatus = async (req, res) => res.json({ success: true, status: 'Receipt system operational' });
export const validateReceiptData = async (req, res) => res.json({ success: true, message: 'Receipt data validation executed (stub)' });
export const cleanupReceipts = async (req, res) => res.json({ success: true, message: 'Cleanup operation executed (stub)' });
export const getReceiptTemplates = async (req, res) => res.json({ success: true, templates: [] });
