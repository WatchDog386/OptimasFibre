// src/models/Invoice.js - COMPLETELY UPDATED (Full Feature Set)
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    // ✅ ENHANCED: Auto-increment invoice numbers (INV-0001, INV-0002...)
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: 'INV-0001'
    },
    
    // ✅ Customer Information (Enhanced)
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
        trim: true
    },
    customerLocation: { 
        type: String, 
        required: [true, 'Customer location is required'],
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    
    // ✅ Plan Information (Enhanced with more options)
    planName: { 
        type: String, 
        required: [true, 'Plan name is required'],
        trim: true,
        enum: ['Jumbo', 'Buffalo', 'Ndovu', 'Gazzelle', 'Tiger', 'Chui', 'Custom']
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
        enum: ['8Mbps', '15Mbps', '25Mbps', '30Mbps', '40Mbps', '60Mbps', '100Mbps', 'Custom']
    },
    
    // ✅ NEW: Itemized billing system for detailed invoices
    items: [{
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, 'Item description too long']
        },
        quantity: {
            type: Number,
            default: 1,
            min: [1, 'Quantity must be at least 1']
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, 'Unit price cannot be negative']
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative']
        }
    }],
    
    features: [{ 
        type: String,
        trim: true
    }],
    connectionType: { 
        type: String, 
        default: 'Fiber Optic',
        trim: true,
        enum: ['Fiber Optic', 'Wireless', 'Satellite', 'Copper']
    },
    
    // ✅ Enhanced Date Management
    invoiceDate: { 
        type: Date, 
        default: Date.now
    },
    dueDate: { 
        type: Date, 
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    
    // ✅ Enhanced Status Management
    status: { 
        type: String, 
        default: 'pending',
        enum: ['draft', 'pending', 'paid', 'cancelled', 'completed', 'overdue', 'partially_paid']
    },
    
    // ✅ Enhanced Payment Information
    paymentMethod: { 
        type: String, 
        default: 'Mobile Money',
        enum: ['cash', 'card', 'bank_transfer', 'mobile_money', 'cheque', 'other']
    },
    paymentTerms: {
        type: String,
        default: 'Due upon receipt',
        enum: ['Due upon receipt', 'Net 15', 'Net 30', 'Net 60', 'Custom']
    },
    
    // ✅ Enhanced Financial Fields
    subtotal: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0,
        min: [0, 'Tax rate cannot be negative'],
        max: [100, 'Tax rate cannot exceed 100%']
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'none'],
        default: 'none'
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    balanceDue: {
        type: Number,
        default: 0
    },
    
    // ✅ Enhanced Notes & Terms
    notes: {
        type: String,
        default: '',
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    terms: {
        type: String,
        default: 'Payment due within 30 days. Late payments subject to fees.',
        maxlength: [500, 'Terms cannot exceed 500 characters']
    },
    
    // ✅ Payment Tracking
    paidAt: {
        type: Date
    },
    paymentHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        amount: {
            type: Number,
            required: true
        },
        method: {
            type: String,
            required: true
        },
        reference: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    
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
    
    // ✅ NEW: Connection Management
    connectionRequestSent: {
        type: Boolean,
        default: false
    },
    connectionRequestSentAt: {
        type: Date
    },
    installationDate: {
        type: Date
    },
    
    // ✅ NEW: Billing Cycle
    billingCycle: {
        type: String,
        enum: ['monthly', 'quarterly', 'annually', 'one_time'],
        default: 'monthly'
    },
    nextBillingDate: {
        type: Date
    },
    
    // ✅ NEW: Email Tracking
    sentToCustomer: {
        type: Boolean,
        default: false
    },
    lastSentAt: {
        type: Date
    },
    sendCount: {
        type: Number,
        default: 0
    },
    
    // ✅ NEW: Audit Trail
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// ✅ ENHANCED Pre-save hook with comprehensive invoice number generation
invoiceSchema.pre('save', async function(next) {
    console.log('🔍 [INVOICE MODEL] Pre-save hook started');
    
    try {
        // ✅ AUTO-GENERATE INVOICE NUMBERS (INV-0001, INV-0002...)
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
                const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
                if (match) {
                    nextNumber = parseInt(match[1]) + 1;
                } else {
                    // Handle existing invoices without INV- prefix
                    const lastNumber = parseInt(lastInvoice.invoiceNumber);
                    nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
                }
            }
            
            // Format as INV-0001, INV-0002, etc.
            this.invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
            console.log(`✅ Generated invoice number: ${this.invoiceNumber}`);
        }

        // ✅ Calculate financial fields
        this.calculateTotals();
        
        // ✅ Auto-mark as overdue
        if (this.status === 'pending' && this.dueDate && this.dueDate < new Date()) {
            this.status = 'overdue';
        }

        // ✅ Set paidAt when fully paid
        if (this.isModified('status') && this.status === 'paid' && !this.paidAt) {
            this.paidAt = new Date();
        }

        // ✅ Update balance due
        this.balanceDue = Math.max(0, this.totalAmount - this.amountPaid);
        
        // ✅ Update status based on payments
        if (this.amountPaid > 0) {
            if (this.amountPaid >= this.totalAmount) {
                this.status = 'paid';
            } else if (this.amountPaid < this.totalAmount) {
                this.status = 'partially_paid';
            }
        }

        console.log('✅ [INVOICE MODEL] Pre-save hook completed');
        next();
    } catch (error) {
        console.error('❌ [INVOICE MODEL] Pre-save hook error:', error);
        // Fallback invoice number using timestamp
        if (this.isNew && !this.invoiceNumber) {
            this.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
            console.log(`🔄 Using fallback invoice number: ${this.invoiceNumber}`);
        }
        next();
    }
});

// ✅ NEW: Calculate totals method
invoiceSchema.methods.calculateTotals = function() {
    // Calculate subtotal from items if items exist, otherwise use planPrice
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    } else {
        this.subtotal = this.planPrice || 0;
    }
    
    // Calculate tax
    this.taxAmount = (this.subtotal * (this.taxRate || 0)) / 100;
    
    // Apply discount
    let discountAmount = 0;
    if (this.discountType === 'percentage') {
        discountAmount = (this.subtotal * (this.discount || 0)) / 100;
    } else if (this.discountType === 'fixed') {
        discountAmount = this.discount || 0;
    }
    
    // Calculate final totals
    this.totalAmount = this.subtotal + this.taxAmount - discountAmount;
    this.balanceDue = Math.max(0, this.totalAmount - (this.amountPaid || 0));
};

// ✅ ENHANCED: Static method to find existing invoice for customer and plan
invoiceSchema.statics.findByCustomerAndPlan = function(customerEmail, planName) {
    return this.findOne({
        customerEmail: customerEmail.toLowerCase().trim(),
        planName: planName.trim(),
        status: { $in: ['pending', 'completed', 'partially_paid'] } // Active invoices
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
            const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            } else {
                const lastNumber = parseInt(lastInvoice.invoiceNumber);
                nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
            }
        }
        
        return `INV-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Error getting next invoice number:', error);
        return 'INV-0001';
    }
};

// ✅ NEW: Search invoices with multiple criteria
invoiceSchema.statics.searchInvoices = function(searchTerm, filters = {}) {
    const searchQuery = {};
    
    if (searchTerm) {
        searchQuery.$or = [
            { invoiceNumber: { $regex: searchTerm, $options: 'i' } },
            { customerName: { $regex: searchTerm, $options: 'i' } },
            { customerEmail: { $regex: searchTerm, $options: 'i' } },
            { customerPhone: { $regex: searchTerm, $options: 'i' } },
            { customerLocation: { $regex: searchTerm, $options: 'i' } }
        ];
    }
    
    // Apply filters
    if (filters.status) searchQuery.status = filters.status;
    if (filters.paymentMethod) searchQuery.paymentMethod = filters.paymentMethod;
    if (filters.planName) searchQuery.planName = filters.planName;
    
    // Date range filters
    if (filters.startDate || filters.endDate) {
        searchQuery.invoiceDate = {};
        if (filters.startDate) searchQuery.invoiceDate.$gte = new Date(filters.startDate);
        if (filters.endDate) searchQuery.invoiceDate.$lte = new Date(filters.endDate);
    }
    
    return this.find(searchQuery).sort({ createdAt: -1 });
};

// ✅ NEW: Get invoice statistics
invoiceSchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalInvoices: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                totalPaid: { $sum: '$amountPaid' },
                totalBalance: { $sum: '$balanceDue' },
                avgInvoiceValue: { $avg: '$totalAmount' }
            }
        },
        {
            $project: {
                _id: 0,
                totalInvoices: 1,
                totalRevenue: 1,
                totalPaid: 1,
                totalBalance: 1,
                avgInvoiceValue: 1
            }
        }
    ]);
    
    const statusStats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
            }
        }
    ]);
    
    const monthlyStats = await this.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$invoiceDate' },
                    month: { $month: '$invoiceDate' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
    ]);
    
    return {
        overview: stats[0] || {
            totalInvoices: 0,
            totalRevenue: 0,
            totalPaid: 0,
            totalBalance: 0,
            avgInvoiceValue: 0
        },
        byStatus: statusStats,
        monthly: monthlyStats
    };
};

// ✅ ENHANCED: Instance method to update plan (for upgrades/downgrades)
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
    
    // Recalculate totals
    this.calculateTotals();
    
    return this.save();
};

// ✅ NEW: Add payment to invoice
invoiceSchema.methods.addPayment = function(paymentData) {
    const payment = {
        date: new Date(),
        amount: paymentData.amount,
        method: paymentData.method || this.paymentMethod,
        reference: paymentData.reference || '',
        notes: paymentData.notes || ''
    };
    
    this.paymentHistory.push(payment);
    this.amountPaid += paymentData.amount;
    
    // Update status based on payment
    if (this.amountPaid >= this.totalAmount) {
        this.status = 'paid';
        this.paidAt = new Date();
        this.balanceDue = 0;
    } else if (this.amountPaid > 0) {
        this.status = 'partially_paid';
        this.balanceDue = this.totalAmount - this.amountPaid;
    }
    
    return this.save();
};

// ✅ NEW: Mark connection request as sent
invoiceSchema.methods.markConnectionRequestSent = function() {
    this.connectionRequestSent = true;
    this.connectionRequestSentAt = new Date();
    if (this.status === 'pending') {
        this.status = 'completed';
    }
    return this.save();
};

// ✅ NEW: Mark as sent to customer
invoiceSchema.methods.markAsSent = function() {
    this.sentToCustomer = true;
    this.lastSentAt = new Date();
    this.sendCount += 1;
    return this.save();
};

// ✅ Instance method to update status
invoiceSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    
    if (newStatus === 'paid' && !this.paidAt) {
        this.paidAt = new Date();
        this.amountPaid = this.totalAmount;
        this.balanceDue = 0;
    }
    
    return this.save();
};

// ✅ VIRTUAL FIELDS

invoiceSchema.virtual('formattedPlanPrice').get(function() {
    return `Ksh ${(this.planPrice || 0).toLocaleString()}`;
});

invoiceSchema.virtual('daysUntilDue').get(function() {
    if (!this.dueDate) return null;
    const diffTime = new Date(this.dueDate) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

invoiceSchema.virtual('isOverdue').get(function() {
    return this.dueDate && this.dueDate < new Date() && this.status === 'pending';
});

invoiceSchema.virtual('formattedSubtotal').get(function() {
    return `Ksh ${(this.subtotal || 0).toLocaleString()}`;
});

invoiceSchema.virtual('formattedTaxAmount').get(function() {
    return `Ksh ${(this.taxAmount || 0).toLocaleString()}`;
});

invoiceSchema.virtual('formattedTotalAmount').get(function() {
    return `Ksh ${(this.totalAmount || 0).toLocaleString()}`;
});

invoiceSchema.virtual('formattedAmountPaid').get(function() {
    return `Ksh ${(this.amountPaid || 0).toLocaleString()}`;
});

invoiceSchema.virtual('formattedBalanceDue').get(function() {
    return `Ksh ${(this.balanceDue || 0).toLocaleString()}`;
});

// ✅ ENHANCED Virtual: Generate display ID using invoice number
invoiceSchema.virtual('displayId').get(function() {
    return this.invoiceNumber;
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

// ✅ NEW Virtual: Payment status
invoiceSchema.virtual('paymentStatus').get(function() {
    if (this.status === 'paid') return 'Paid';
    if (this.status === 'partially_paid') return 'Partially Paid';
    if (this.isOverdue) return 'Overdue';
    if (this.status === 'pending') return 'Pending';
    return this.status;
});

// ✅ Serialization
invoiceSchema.set('toJSON', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        ret.displayId = ret.invoiceNumber;
        ret.paymentStatus = doc.paymentStatus;
        return ret; 
    } 
});

invoiceSchema.set('toObject', { 
    virtuals: true, 
    transform: (doc, ret) => { 
        delete ret.__v; 
        ret.displayId = ret.invoiceNumber;
        ret.paymentStatus = doc.paymentStatus;
        return ret; 
    } 
});

// ✅ INDEXES for performance
invoiceSchema.index({ invoiceNumber: 1 }); // For fast invoice number lookups
invoiceSchema.index({ customerEmail: 1, planName: 1, status: 1 }); // For duplicate prevention
invoiceSchema.index({ customerEmail: 1 }); // For customer invoice history
invoiceSchema.index({ status: 1 }); // For status filtering
invoiceSchema.index({ invoiceDate: -1 }); // For recent invoices
invoiceSchema.index({ dueDate: 1 }); // For due date filtering
invoiceSchema.index({ totalAmount: 1 }); // For amount-based queries
invoiceSchema.index({ 'paymentHistory.date': -1 }); // For payment history queries
invoiceSchema.index({ createdAt: -1 }); // For creation date sorting

console.log('✅ Invoice model compiled successfully - Full feature set with itemized billing');

export default mongoose.model('Invoice', invoiceSchema);