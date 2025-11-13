// src/models/Invoice.js - COMPLETELY UPDATED WITH DEBUGGING
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
        lowercase: true
        // ✅ REMOVED: Complex email validation temporarily
    },
    customerPhone: { 
        type: String, 
        required: [true, 'Customer phone is required'],
        trim: true
        // ✅ REMOVED: Complex phone validation temporarily
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
        trim: true
        // ✅ REMOVED: Enum validation temporarily
    },
    planPrice: { 
        type: Number, 
        required: [true, 'Plan price is required'],
        min: [1, 'Plan price must be at least 1']
    },
    planSpeed: { 
        type: String, 
        required: [true, 'Plan speed is required'],
        trim: true
        // ✅ REMOVED: Enum validation temporarily
    },
    features: [{ 
        type: String,
        trim: true
    }],
    connectionType: { 
        type: String, 
        default: 'Fiber Optic',
        trim: true
        // ✅ REMOVED: Required validation temporarily
    },
    invoiceDate: { 
        type: Date, 
        default: Date.now
        // ✅ REMOVED: Complex date validation
    },
    dueDate: { 
        type: Date, 
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        // ✅ REMOVED: Complex date validation
    },
    status: { 
        type: String, 
        default: 'pending'
        // ✅ REMOVED: Enum validation temporarily
    },
    paymentMethod: { 
        type: String, 
        default: 'Mobile Money'
        // ✅ REMOVED: Enum validation temporarily
    },
    notes: {
        type: String,
        default: '',
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    paidAt: {
        type: Date
        // ✅ REMOVED: Complex validation
    },
    totalAmount: {
        type: Number,
        default: 0
        // ✅ REMOVED: Min validation
    },
    taxAmount: {
        type: Number,
        default: 0
        // ✅ REMOVED: Min validation
    },
    discount: {
        type: Number,
        default: 0
        // ✅ REMOVED: Min validation
    },
    finalAmount: {
        type: Number,
        default: 0
        // ✅ REMOVED: Min validation
    },
    paymentHistory: [{
        paymentDate: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        method: { type: String },
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

// ✅ ENHANCED Pre-save with debugging
invoiceSchema.pre('save', function(next) {
    console.log('🔍 [MODEL DEBUG] Pre-save hook started for invoice');
    
    try {
        // 1. Sync financial fields
        if (this.isNew || this.isModified('planPrice') || this.isModified('taxAmount') || this.isModified('discount')) {
            console.log('🔍 [MODEL DEBUG] Calculating financial fields...');
            this.totalAmount = this.planPrice || 0;
            this.finalAmount = (this.totalAmount || 0) + (this.taxAmount || 0) - (this.discount || 0);
            console.log('🔍 [MODEL DEBUG] Financial calculated - total:', this.totalAmount, 'final:', this.finalAmount);
        }

        // 2. Auto-mark as overdue (only if dates exist)
        if (this.status === 'pending' && this.dueDate && this.dueDate < new Date()) {
            console.log('🔍 [MODEL DEBUG] Marking invoice as overdue');
            this.status = 'overdue';
        }

        // 3. Set paidAt timestamp when status changes to paid
        if (this.isModified('status') && this.status === 'paid' && !this.paidAt) {
            console.log('🔍 [MODEL DEBUG] Setting paidAt timestamp');
            this.paidAt = new Date();
        }

        // 4. Clear paidAt if status changes from paid
        if (this.isModified('status') && this.status !== 'paid' && this.paidAt) {
            console.log('🔍 [MODEL DEBUG] Clearing paidAt timestamp');
            this.paidAt = undefined;
        }

        console.log('🔍 [MODEL DEBUG] Pre-save hook completed successfully');
        next();
    } catch (error) {
        console.error('❌ [MODEL DEBUG] Pre-save hook error:', error);
        next(error);
    }
});

// ✅ ENHANCED Instance methods with debugging
invoiceSchema.methods.updateStatus = function() {
    console.log('🔍 [MODEL DEBUG] updateStatus method called');
    if (this.status === 'pending' && this.dueDate < new Date()) {
        console.log('🔍 [MODEL DEBUG] Auto-updating status to overdue');
        this.status = 'overdue';
        return this.save();
    }
    return Promise.resolve(this);
};

invoiceSchema.methods.addPayment = function(paymentData) {
    console.log('🔍 [MODEL DEBUG] addPayment method called');
    this.paymentHistory.push(paymentData);
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    console.log('🔍 [MODEL DEBUG] Total paid:', totalPaid, 'Final amount:', this.finalAmount);
    
    if (totalPaid >= this.finalAmount) {
        console.log('🔍 [MODEL DEBUG] Payment complete, marking as paid');
        this.status = 'paid';
        this.paidAt = new Date();
    }
    
    return this.save();
};

invoiceSchema.methods.markNotificationsSent = function(types = ['email', 'whatsapp']) {
    console.log('🔍 [MODEL DEBUG] markNotificationsSent called for types:', types);
    const update = { 'notifications.lastNotificationDate': new Date() };
    
    if (types.includes('email')) {
        update['notifications.emailSent'] = true;
    }
    
    if (types.includes('whatsapp')) {
        update['notifications.whatsappSent'] = true;
    }
    
    return this.updateOne(update);
};

// ✅ ENHANCED Static methods with debugging
invoiceSchema.statics.getOverdueInvoices = function() {
    console.log('🔍 [MODEL DEBUG] getOverdueInvoices called');
    return this.find({ status: 'pending', dueDate: { $lt: new Date() } });
};

invoiceSchema.statics.getInvoicesByStatus = function(status) {
    console.log('🔍 [MODEL DEBUG] getInvoicesByStatus called for:', status);
    if (!['pending', 'paid', 'cancelled', 'overdue'].includes(status)) {
        return Promise.reject(new Error('Invalid status'));
    }
    return this.find({ status });
};

invoiceSchema.statics.getInvoicesByCustomer = function(email) {
    console.log('🔍 [MODEL DEBUG] getInvoicesByCustomer called for:', email);
    return this.find({ customerEmail: email.toLowerCase().trim() }).sort({ createdAt: -1 });
};

invoiceSchema.statics.getRecentInvoices = function(limit = 10) {
    console.log('🔍 [MODEL DEBUG] getRecentInvoices called, limit:', limit);
    return this.find().sort({ createdAt: -1 }).limit(limit);
};

invoiceSchema.statics.getStats = async function() {
    console.log('🔍 [MODEL DEBUG] getStats called');
    try {
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
        
        const totalInvoices = await this.countDocuments();
        
        console.log('🔍 [MODEL DEBUG] Stats calculated successfully');
        return {
            byStatus: stats,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalInvoices
        };
    } catch (error) {
        console.error('❌ [MODEL DEBUG] Error in getStats:', error);
        throw error;
    }
};

invoiceSchema.statics.getInvoicesNeedingReminder = function(daysBeforeDue = 3) {
    console.log('🔍 [MODEL DEBUG] getInvoicesNeedingReminder called, days:', daysBeforeDue);
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysBeforeDue);
    
    return this.find({
        status: 'pending',
        dueDate: { $lte: reminderDate },
        reminderSent: false
    });
};

// ✅ Virtuals
invoiceSchema.virtual('formattedPlanPrice').get(function() {
    return `Ksh ${(this.planPrice || 0).toLocaleString()}`;
});

invoiceSchema.virtual('daysUntilDue').get(function() {
    if (!this.dueDate) return null;
    const diffDays = Math.ceil((new Date(this.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays;
});

invoiceSchema.virtual('isOverdue').get(function() {
    return this.dueDate && this.dueDate < new Date() && this.status === 'pending';
});

invoiceSchema.virtual('formattedTotalAmount').get(function() {
    return `Ksh ${(this.totalAmount || 0).toLocaleString()}`;
});

invoiceSchema.virtual('formattedFinalAmount').get(function() {
    return `Ksh ${(this.finalAmount || 0).toLocaleString()}`;
});

invoiceSchema.virtual('isFullyPaid').get(function() {
    if (this.status === 'paid') return true;
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    return totalPaid >= this.finalAmount;
});

invoiceSchema.virtual('amountDue').get(function() {
    if (this.status === 'paid') return 0;
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, this.finalAmount - totalPaid);
});

invoiceSchema.virtual('paymentProgress').get(function() {
    if (this.finalAmount <= 0) return 0;
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.min(100, Math.round((totalPaid / this.finalAmount) * 100));
});

// ✅ Virtual: Generate a display ID using MongoDB _id
invoiceSchema.virtual('displayId').get(function() {
    const displayId = this._id ? `INV-${this._id.toString().slice(-6).toUpperCase()}` : 'INV-NONE';
    console.log('🔍 [MODEL DEBUG] Generated displayId:', displayId);
    return displayId;
});

// ✅ Enhanced Serialization with debugging
invoiceSchema.set('toJSON', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        console.log('🔍 [MODEL DEBUG] Serializing to JSON');
        delete ret.__v; 
        // Ensure displayId is included
        ret.displayId = `INV-${ret._id.toString().slice(-6).toUpperCase()}`;
        return ret; 
    } 
});

invoiceSchema.set('toObject', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        console.log('🔍 [MODEL DEBUG] Serializing to Object');
        delete ret.__v; 
        // Ensure displayId is included
        ret.displayId = `INV-${ret._id.toString().slice(-6).toUpperCase()}`;
        return ret; 
    } 
});

// ✅ Indexes for performance (simplified)
invoiceSchema.index({ customerEmail: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });

console.log('✅ [MODEL DEBUG] Invoice schema compiled successfully');

export default mongoose.model('Invoice', invoiceSchema);