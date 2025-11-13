// src/models/Invoice.js - COMPLETELY UPDATED (InvoiceNumber REMOVED)
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    // ✅ NO invoiceNumber field - completely removed from schema
    
    customerName: { 
        type: String, 
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    customerEmail: { 
        type: String, 
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    customerPhone: { 
        type: String, 
        required: [true, 'Customer phone is required'],
        trim: true,
        match: [/^(?:\+254|0)?[17]\d{8}$/, 'Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)']
    },
    customerLocation: { 
        type: String, 
        required: [true, 'Customer location is required'],
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    planName: { 
        type: String, 
        required: [true, 'Plan name is required'],
        trim: true,
        enum: {
            values: ['Jumbo', 'Buffalo', 'Ndovu', 'Gazzelle', 'Tiger', 'Chui'],
            message: 'Invalid plan name. Must be one of: Jumbo, Buffalo, Ndovu, Gazzelle, Tiger, Chui'
        }
    },
    planPrice: { 
        type: Number, 
        required: [true, 'Plan price is required'],
        min: [1, 'Plan price must be at least 1']
    },
    planSpeed: { 
        type: String, 
        required: [true, 'Plan speed is required'],
        trim: true,
        enum: {
            values: ['8Mbps', '15Mbps', '25Mbps', '30Mbps', '40Mbps', '60Mbps'],
            message: 'Invalid plan speed. Must match an existing plan.'
        }
    },
    features: [{ 
        type: String,
        trim: true
    }],
    connectionType: { 
        type: String, 
        required: [true, 'Connection type is required'],
        trim: true,
        default: 'Fiber Optic'
    },
    invoiceDate: { 
        type: Date, 
        default: Date.now
    },
    dueDate: { 
        type: Date, 
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    status: { 
        type: String, 
        default: 'pending',
        enum: {
            values: ['pending', 'paid', 'cancelled', 'overdue'],
            message: 'Status must be: pending, paid, cancelled, or overdue'
        }
    },
    paymentMethod: { 
        type: String, 
        default: 'Mobile Money',
        enum: {
            values: ['Bank Transfer', 'Mobile Money', 'Cash', 'Credit Card'],
            message: 'Invalid payment method'
        }
    },
    notes: {
        type: String,
        default: '',
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    paidAt: {
        type: Date
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total amount cannot be negative']
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    finalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Final amount cannot be negative']
    },
    paymentHistory: [{
        paymentDate: { type: Date, default: Date.now },
        amount: { type: Number, required: true, min: 0 },
        method: { type: String, enum: ['Bank Transfer', 'Mobile Money', 'Cash', 'Credit Card'] },
        transactionId: { type: String, trim: true },
        notes: { type: String, maxlength: [200, 'Payment notes too long'] }
    }],
    reminderSent: { type: Boolean, default: false },
    reminderDate: { type: Date },
    notifications: {
        emailSent: { type: Boolean, default: false },
        whatsappSent: { type: Boolean, default: false },
        lastNotificationDate: { type: Date }
    }
}, {
    timestamps: true
});

// ✅ SIMPLIFIED Pre-save: Only handle financial calculations
invoiceSchema.pre('save', function(next) {
    // 1. Sync financial fields
    if (this.isNew || this.isModified('planPrice') || this.isModified('taxAmount') || this.isModified('discount')) {
        this.totalAmount = this.planPrice || 0;
        this.finalAmount = (this.totalAmount || 0) + (this.taxAmount || 0) - (this.discount || 0);
    }

    // 2. Auto-mark as overdue
    if (this.status === 'pending' && this.dueDate < new Date()) {
        this.status = 'overdue';
    }

    // 3. Set paidAt timestamp when status changes to paid
    if (this.isModified('status') && this.status === 'paid' && !this.paidAt) {
        this.paidAt = new Date();
    }

    // 4. Clear paidAt if status changes from paid
    if (this.isModified('status') && this.status !== 'paid' && this.paidAt) {
        this.paidAt = undefined;
    }

    next();
});

// Instance method: update overdue status
invoiceSchema.methods.updateStatus = function() {
    if (this.status === 'pending' && this.dueDate < new Date()) {
        this.status = 'overdue';
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method: Add payment to history
invoiceSchema.methods.addPayment = function(paymentData) {
    this.paymentHistory.push(paymentData);
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    if (totalPaid >= this.finalAmount) {
        this.status = 'paid';
        this.paidAt = new Date();
    }
    
    return this.save();
};

// Instance method: Mark notifications as sent
invoiceSchema.methods.markNotificationsSent = function(types = ['email', 'whatsapp']) {
    const update = { 'notifications.lastNotificationDate': new Date() };
    
    if (types.includes('email')) {
        update['notifications.emailSent'] = true;
    }
    
    if (types.includes('whatsapp')) {
        update['notifications.whatsappSent'] = true;
    }
    
    return this.updateOne(update);
};

// Static methods
invoiceSchema.statics.getOverdueInvoices = function() {
    return this.find({ status: 'pending', dueDate: { $lt: new Date() } });
};

invoiceSchema.statics.getInvoicesByStatus = function(status) {
    if (!['pending', 'paid', 'cancelled', 'overdue'].includes(status)) {
        return Promise.reject(new Error('Invalid status'));
    }
    return this.find({ status });
};

invoiceSchema.statics.getInvoicesByCustomer = function(email) {
    return this.find({ customerEmail: email.toLowerCase().trim() }).sort({ createdAt: -1 });
};

invoiceSchema.statics.getRecentInvoices = function(limit = 10) {
    return this.find().sort({ createdAt: -1 }).limit(limit);
};

// Static method: Get invoice statistics
invoiceSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$finalAmount' }
            }
        }
    ]);
    
    const totalRevenue = await this.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    
    return {
        byStatus: stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalInvoices: await this.countDocuments()
    };
};

// Static method: Get overdue invoices that need reminders
invoiceSchema.statics.getInvoicesNeedingReminder = function(daysBeforeDue = 3) {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysBeforeDue);
    
    return this.find({
        status: 'pending',
        dueDate: { $lte: reminderDate },
        reminderSent: false
    });
};

// Virtuals
invoiceSchema.virtual('formattedPlanPrice').get(function() {
    return `Ksh ${(this.planPrice || 0).toLocaleString()}`;
});

invoiceSchema.virtual('daysUntilDue').get(function() {
    const diffDays = Math.ceil((new Date(this.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays;
});

invoiceSchema.virtual('isOverdue').get(function() {
    return this.dueDate < new Date() && this.status === 'pending';
});

invoiceSchema.virtual('formattedTotalAmount').get(function() {
    return `Ksh ${(this.totalAmount || 0).toLocaleString()}`;
});

invoiceSchema.virtual('formattedFinalAmount').get(function() {
    return `Ksh ${(this.finalAmount || 0).toLocaleString()}`;
});

// Virtual: Check if invoice is fully paid
invoiceSchema.virtual('isFullyPaid').get(function() {
    if (this.status === 'paid') return true;
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    return totalPaid >= this.finalAmount;
});

// Virtual: Get amount due
invoiceSchema.virtual('amountDue').get(function() {
    if (this.status === 'paid') return 0;
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, this.finalAmount - totalPaid);
});

// Virtual: Get payment progress percentage
invoiceSchema.virtual('paymentProgress').get(function() {
    if (this.finalAmount <= 0) return 0;
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.min(100, Math.round((totalPaid / this.finalAmount) * 100));
});

// ✅ Virtual: Generate a display ID using MongoDB _id
invoiceSchema.virtual('displayId').get(function() {
    return this._id ? `INV-${this._id.toString().slice(-6).toUpperCase()}` : 'INV-NONE';
});

// Serialization
invoiceSchema.set('toJSON', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        return ret; 
    } 
});

invoiceSchema.set('toObject', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        return ret; 
    } 
});

// Indexes for performance
invoiceSchema.index({ customerEmail: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ customerEmail: 1, createdAt: -1 });
invoiceSchema.index({ reminderSent: 1, dueDate: 1 });
invoiceSchema.index({ customerName: 'text', customerEmail: 'text' });
invoiceSchema.index({ paidAt: 1 });
invoiceSchema.index({ 'notifications.lastNotificationDate': 1 });

export default mongoose.model('Invoice', invoiceSchema);