// src/models/Invoice.js - COMPLETELY UPDATED (No invoiceNumber + Duplicate Prevention)
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
    },
    customerPhone: { 
        type: String, 
        required: [true, 'Customer phone is required'],
        trim: true
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
    },
    features: [{ 
        type: String,
        trim: true
    }],
    connectionType: { 
        type: String, 
        default: 'Fiber Optic',
        trim: true
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
        enum: ['pending', 'paid', 'cancelled', 'overdue']
    },
    paymentMethod: { 
        type: String, 
        default: 'Mobile Money'
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
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ✅ SIMPLIFIED Pre-save hook
invoiceSchema.pre('save', function(next) {
    console.log('🔍 [MODEL] Pre-save hook started');
    
    // Calculate financial fields
    this.totalAmount = this.planPrice || 0;
    this.finalAmount = (this.totalAmount || 0) + (this.taxAmount || 0) - (this.discount || 0);
    
    // Auto-mark as overdue
    if (this.status === 'pending' && this.dueDate && this.dueDate < new Date()) {
        this.status = 'overdue';
    }

    // Set paidAt when status changes to paid
    if (this.isModified('status') && this.status === 'paid' && !this.paidAt) {
        this.paidAt = new Date();
    }

    console.log('✅ [MODEL] Pre-save hook completed');
    next();
});

// ✅ NEW: Static method to check for duplicate invoices
invoiceSchema.statics.checkForDuplicate = async function(customerEmail, planName) {
    try {
        console.log('🔍 [MODEL] Checking for duplicate invoice:', { customerEmail, planName });
        
        const existingInvoice = await this.findOne({
            customerEmail: customerEmail.toLowerCase().trim(),
            planName: planName.trim(),
            status: { $in: ['pending', 'paid'] } // Only check active invoices
        });
        
        if (existingInvoice) {
            console.log('❌ [MODEL] Duplicate invoice found:', existingInvoice._id);
            return {
                isDuplicate: true,
                existingInvoice: existingInvoice
            };
        }
        
        console.log('✅ [MODEL] No duplicate invoice found');
        return { isDuplicate: false, existingInvoice: null };
    } catch (error) {
        console.error('❌ [MODEL] Error checking for duplicates:', error);
        throw error;
    }
};

// ✅ Instance methods
invoiceSchema.methods.updateStatus = function() {
    if (this.status === 'pending' && this.dueDate < new Date()) {
        this.status = 'overdue';
        return this.save();
    }
    return Promise.resolve(this);
};

invoiceSchema.methods.addPayment = function(paymentData) {
    this.paymentHistory.push(paymentData);
    
    const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    if (totalPaid >= this.finalAmount) {
        this.status = 'paid';
        this.paidAt = new Date();
    }
    
    return this.save();
};

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

// ✅ Static methods
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

// ✅ Virtual: Generate a display ID using MongoDB _id
invoiceSchema.virtual('displayId').get(function() {
    return this._id ? `INV-${this._id.toString().slice(-6).toUpperCase()}` : 'INV-NONE';
});

// ✅ Serialization
invoiceSchema.set('toJSON', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        ret.displayId = `INV-${ret._id.toString().slice(-6).toUpperCase()}`;
        return ret; 
    } 
});

invoiceSchema.set('toObject', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        ret.displayId = `INV-${ret._id.toString().slice(-6).toUpperCase()}`;
        return ret; 
    } 
});

// ✅ Indexes for duplicate prevention
invoiceSchema.index({ customerEmail: 1, planName: 1, status: 1 });
invoiceSchema.index({ customerEmail: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

console.log('✅ Invoice model compiled successfully - No invoiceNumber field');

export default mongoose.model('Invoice', invoiceSchema);