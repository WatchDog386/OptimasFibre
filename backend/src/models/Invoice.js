// src/models/Invoice.js - COMPLETELY UPDATED (With InvoiceNumber & Upgrade Features)
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    // ✅ ADDED BACK: Auto-increment invoice numbers (0001, 0002, 0003...)
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: '0001' // Will be auto-generated in pre-save
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
        trim: true,
        enum: ['Jumbo', 'Buffalo', 'Ndovu', 'Gazzelle', 'Tiger', 'Chui']
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
        enum: ['8Mbps', '15Mbps', '25Mbps', '30Mbps', '40Mbps', '60Mbps']
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
        enum: ['pending', 'paid', 'cancelled', 'completed', 'overdue']
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
    },
    
    // ✅ NEW: Track plan changes for upgrades/downgrades
    previousPlan: {
        planName: String,
        planPrice: Number,
        planSpeed: String,
        changedAt: Date
    },
    isPlanUpgrade: {
        type: Boolean,
        default: false
    },
    connectionRequestSent: {
        type: Boolean,
        default: false
    },
    connectionRequestSentAt: {
        type: Date
    }
}, {
    timestamps: true
});

// ✅ ENHANCED Pre-save hook with invoice number generation
invoiceSchema.pre('save', async function(next) {
    console.log('🔍 [MODEL] Pre-save hook started');
    
    try {
        // ✅ AUTO-GENERATE INVOICE NUMBERS (0001, 0002, 0003...)
        if (this.isNew && !this.invoiceNumber) {
            console.log('🔢 Generating invoice number...');
            
            // Get the highest invoice number
            const lastInvoice = await this.constructor.findOne(
                {}, 
                {}, 
                { sort: { createdAt: -1 } }
            );
            
            let nextNumber = 1;
            if (lastInvoice && lastInvoice.invoiceNumber) {
                const lastNumber = parseInt(lastInvoice.invoiceNumber);
                nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
            }
            
            // Format as 0001, 0002, etc.
            this.invoiceNumber = nextNumber.toString().padStart(4, '0');
            console.log(`✅ Generated invoice number: ${this.invoiceNumber}`);
        }

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
    } catch (error) {
        console.error('❌ [MODEL] Pre-save hook error:', error);
        // Fallback invoice number using timestamp
        if (this.isNew && !this.invoiceNumber) {
            this.invoiceNumber = Date.now().toString().slice(-4);
            console.log(`🔄 Using fallback invoice number: ${this.invoiceNumber}`);
        }
        next();
    }
});

// ✅ ENHANCED: Static method to find existing invoice for customer and plan
invoiceSchema.statics.findByCustomerAndPlan = function(customerEmail, planName) {
    return this.findOne({
        customerEmail: customerEmail.toLowerCase().trim(),
        planName: planName.trim(),
        status: { $in: ['pending', 'completed'] } // Active invoices
    });
};

// ✅ Static method to find all invoices for customer
invoiceSchema.statics.findByCustomer = function(customerEmail) {
    return this.find({
        customerEmail: customerEmail.toLowerCase().trim()
    }).sort({ createdAt: -1 });
};

// ✅ Static method to get the next invoice number
invoiceSchema.statics.getNextInvoiceNumber = async function() {
    try {
        const lastInvoice = await this.findOne({}, {}, { sort: { createdAt: -1 } });
        let nextNumber = 1;
        
        if (lastInvoice && lastInvoice.invoiceNumber) {
            const lastNumber = parseInt(lastInvoice.invoiceNumber);
            nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
        }
        
        return nextNumber.toString().padStart(4, '0');
    } catch (error) {
        console.error('Error getting next invoice number:', error);
        return '0001';
    }
};

// ✅ NEW: Instance method to update plan (for upgrades/downgrades)
invoiceSchema.methods.updatePlan = function(newPlanData) {
    console.log(`🔄 Updating plan from ${this.planName} to ${newPlanData.planName}`);
    
    // Save previous plan info before updating
    this.previousPlan = {
        planName: this.planName,
        planPrice: this.planPrice,
        planSpeed: this.planSpeed,
        changedAt: new Date()
    };
    
    // Update to new plan
    this.planName = newPlanData.planName;
    this.planPrice = newPlanData.planPrice;
    this.planSpeed = newPlanData.planSpeed;
    this.features = newPlanData.features || this.features;
    this.isPlanUpgrade = true;
    this.invoiceDate = new Date(); // Reset invoice date for the update
    this.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset due date
    
    return this.save();
};

// ✅ NEW: Mark connection request as sent
invoiceSchema.methods.markConnectionRequestSent = function() {
    this.connectionRequestSent = true;
    this.connectionRequestSentAt = new Date();
    this.status = 'completed'; // Mark as completed when connection request is sent
    return this.save();
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

// ✅ ENHANCED Virtual: Generate display ID using invoice number
invoiceSchema.virtual('displayId').get(function() {
    return `INV-${this.invoiceNumber}`;
});

// ✅ NEW Virtual: Check if this is an upgrade
invoiceSchema.virtual('isUpgrade').get(function() {
    return !!this.previousPlan;
});

// ✅ NEW Virtual: Get plan change description
invoiceSchema.virtual('planChangeDescription').get(function() {
    if (!this.previousPlan) return 'New Connection';
    return `Upgrade from ${this.previousPlan.planName} (${this.previousPlan.planSpeed})`;
});

// ✅ Serialization
invoiceSchema.set('toJSON', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        ret.displayId = `INV-${ret.invoiceNumber}`;
        return ret; 
    } 
});

invoiceSchema.set('toObject', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        ret.displayId = `INV-${ret.invoiceNumber}`;
        return ret; 
    } 
});

// ✅ Indexes for performance and duplicate prevention
invoiceSchema.index({ invoiceNumber: 1 }); // For fast invoice number lookups
invoiceSchema.index({ customerEmail: 1, planName: 1, status: 1 }); // For duplicate prevention
invoiceSchema.index({ customerEmail: 1 }); // For customer invoice history
invoiceSchema.index({ status: 1 }); // For status filtering
invoiceSchema.index({ createdAt: -1 }); // For recent invoices

console.log('✅ Invoice model compiled successfully - With invoiceNumber & upgrade features');

export default mongoose.model('Invoice', invoiceSchema);