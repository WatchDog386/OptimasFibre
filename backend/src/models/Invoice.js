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
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  customerPhone: { 
    type: String, 
    required: [true, 'Customer phone is required'],
    trim: true,
    // ✅ IMPROVED: More flexible phone number validation for Kenyan numbers
    match: [/^[\+]?[1-9][\d\s\-\(\)]{8,}$/, 'Please enter a valid phone number']
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
      message: 'Invalid plan name'
    }
  },
  planPrice: { 
    type: String, 
    required: [true, 'Plan price is required'],
    trim: true,
    // ✅ IMPROVED: Better price validation for Kenyan currency format
    validate: {
      validator: function(v) {
        return /^[0-9,]+$/.test(v) && v.length > 0;
      },
      message: 'Plan price must contain only numbers and commas'
    }
  },
  planSpeed: { 
    type: String, 
    required: [true, 'Plan speed is required'],
    trim: true,
    enum: {
      values: ['8Mbps', '15Mbps', '25Mbps', '30Mbps', '40Mbps', '60Mbps'],
      message: 'Invalid plan speed'
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
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
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
      message: 'Invalid status'
    }
  },
  paymentMethod: { 
    type: String, 
    default: 'Bank Transfer',
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
  totalAmount: {
    type: Number,
    default: function() {
      // Convert planPrice string to number (remove commas)
      if (this.planPrice) {
        return parseInt(this.planPrice.replace(/,/g, '')) || 0;
      }
      return 0;
    }
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
    default: function() {
      return (this.totalAmount || 0) + (this.taxAmount || 0) - (this.discount || 0);
    }
  },
  paymentHistory: [{
    paymentDate: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    method: {
      type: String,
      enum: ['Bank Transfer', 'Mobile Money', 'Cash', 'Credit Card']
    },
    transactionId: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      maxlength: [200, 'Payment notes cannot exceed 200 characters']
    }
  }],
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  },
  // ✅ NEW: Track notification status
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    whatsappSent: {
      type: Boolean,
      default: false
    },
    lastNotificationDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Generate unique invoice number
invoiceSchema.pre('save', async function(next) {
  try {
    if (!this.invoiceNumber) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      this.invoiceNumber = `OPT-${timestamp}-${random}`;
    }
    
    // ✅ IMPROVED: Better number parsing with error handling
    if (this.planPrice && (!this.totalAmount || this.isModified('planPrice'))) {
      const cleanPrice = this.planPrice.replace(/,/g, '');
      this.totalAmount = parseInt(cleanPrice) || 0;
    }
    
    // ✅ IMPROVED: Safer calculation with null checks
    if (this.isModified('totalAmount') || this.isModified('taxAmount') || this.isModified('discount')) {
      this.finalAmount = (this.totalAmount || 0) + (this.taxAmount || 0) - (this.discount || 0);
    }
    
    // ✅ NEW: Auto-update status to overdue if due date passed
    if (this.status === 'pending' && this.dueDate < new Date()) {
      this.status = 'overdue';
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Update status to overdue if due date has passed
invoiceSchema.methods.updateStatus = function() {
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get overdue invoices
invoiceSchema.statics.getOverdueInvoices = function() {
  return this.find({
    status: 'pending',
    dueDate: { $lt: new Date() }
  });
};

// Static method to get invoices by status
invoiceSchema.statics.getInvoicesByStatus = function(status) {
  if (!['pending', 'paid', 'cancelled', 'overdue'].includes(status)) {
    return Promise.reject(new Error('Invalid status'));
  }
  return this.find({ status });
};

// ✅ NEW: Static method to find invoices by customer email
invoiceSchema.statics.getInvoicesByCustomer = function(email) {
  return this.find({ 
    customerEmail: email.toLowerCase().trim() 
  }).sort({ createdAt: -1 });
};

// ✅ NEW: Static method to get recent invoices
invoiceSchema.statics.getRecentInvoices = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Virtual for formatted plan price
invoiceSchema.virtual('formattedPlanPrice').get(function() {
  return `Ksh ${this.planPrice}`;
});

// Virtual for days until due
invoiceSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for isOverdue
invoiceSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status === 'pending';
});

// ✅ NEW: Virtual for formatted total amount
invoiceSchema.virtual('formattedTotalAmount').get(function() {
  return `Ksh ${(this.totalAmount || 0).toLocaleString()}`;
});

// ✅ NEW: Virtual for formatted final amount
invoiceSchema.virtual('formattedFinalAmount').get(function() {
  return `Ksh ${(this.finalAmount || 0).toLocaleString()}`;
});

// Ensure virtual fields are serialized
invoiceSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Remove internal fields when serializing to JSON
    delete ret.__v;
    return ret;
  }
});

invoiceSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Index for better query performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customerEmail: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });

// Compound index for common queries
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ customerEmail: 1, createdAt: -1 });
// ✅ NEW: Index for notification queries
invoiceSchema.index({ reminderSent: 1, dueDate: 1 });

export default mongoose.model('Invoice', invoiceSchema);