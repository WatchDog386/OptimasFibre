 // src/models/Invoice.js
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
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
        // Standard email regex check
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    customerPhone: { 
        type: String, 
        required: [true, 'Customer phone is required'],
        trim: true,
        // Updated to match Kenyan numbers (e.g., 07xx, +2547xx). Allows 9-12 digits starting with 0, 1, 7, or +254.
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
    // ✅ This field is critical and must be a Number.
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
        default: Date.now,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Invoice date cannot be in the future'
        }
    },
    dueDate: { 
        type: Date, 
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        validate: {
            validator: function(date) {
                return date > this.invoiceDate;
            },
            message: 'Due date must be after invoice date'
        }
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
    // Calculated fields based on planPrice
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

// Pre-save: Generate unique invoice number & sync amounts
invoiceSchema.pre('save', async function(next) {
    // 1. Generate Invoice Number if new
    if (this.isNew && !this.invoiceNumber) {
        const timestamp = Date.now();
        // Use a 4-digit random number for better uniqueness probability
        const random = Math.floor(1000 + Math.random() * 9000); 
        this.invoiceNumber = `OPT-${timestamp}-${random}`;
    }

    // 2. Sync financial fields
    const isFinancialModified = this.isModified('planPrice') || this.isModified('taxAmount') || this.isModified('discount') || this.isNew;

    if (isFinancialModified) {
        // totalAmount = planPrice (assuming planPrice is the base cost of service)
        this.totalAmount = this.planPrice || 0; 
        
        // Calculate Final Amount
        this.finalAmount = (this.totalAmount || 0) + (this.taxAmount || 0) - (this.discount || 0);
    }

    // 3. Auto-mark as overdue
    if (this.status === 'pending' && this.dueDate < new Date()) {
        this.status = 'overdue';
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

// Serialization: Remove __v, include virtuals
invoiceSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } });
invoiceSchema.set('toObject', { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } });

// Indexes for performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customerEmail: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ customerEmail: 1, createdAt: -1 });
invoiceSchema.index({ reminderSent: 1, dueDate: 1 });

export default mongoose.model('Invoice', invoiceSchema);