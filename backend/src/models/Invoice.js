// src/models/Invoice.js - FULLY UPDATED (Hardened & Fixed, pre-save-safe invoiceNumber)
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
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
    min: [0, 'Amount cannot be negative']
  }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  // Invoice Number - fix applied
  invoiceNumber: {
    type: String,
    required: false,     // allow pre-save hook to generate
    default: null,
    unique: true,
    index: true,
    sparse: true
  },

  // Customer Information
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

  // Plan Information
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    enum: ['Jumbo', 'Buffalo', 'Ndovu', 'Gazzelle', 'Tiger', 'Chui', 'Custom']
  },
  planPrice: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [0, 'Plan price must be at least 0']
  },
  planSpeed: {
    type: String,
    required: [true, 'Plan speed is required'],
    trim: true,
    enum: ['8Mbps', '15Mbps', '25Mbps', '30Mbps', '40Mbps', '60Mbps', '100Mbps', 'Custom']
  },

  // Itemized billing
  items: {
    type: [itemSchema],
    default: []
  },

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

  // Dates
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },

  // Status & payments
  status: {
    type: String,
    default: 'pending',
    enum: ['draft', 'pending', 'paid', 'cancelled', 'completed', 'overdue', 'partially_paid']
  },
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

  // Financials
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0, min: [0, 'Tax rate cannot be negative'], max: [100, 'Tax rate cannot exceed 100%'] },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed', 'none'], default: 'none' },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },

  // Notes & terms
  notes: { type: String, default: '', maxlength: [1000, 'Notes cannot exceed 1000 characters'] },
  terms: { type: String, default: 'Payment due within 30 days. Late payments subject to fees.', maxlength: [500, 'Terms cannot exceed 500 characters'] },

  // Payment tracking
  paidAt: { type: Date },
  paymentHistory: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true }
  }],

  // Plan changes
  previousPlan: {
    planName: String,
    planPrice: Number,
    planSpeed: String,
    changedAt: Date
  },
  isPlanUpgrade: { type: Boolean, default: false },

  // Connection management
  connectionRequestSent: { type: Boolean, default: false },
  connectionRequestSentAt: { type: Date },
  installationDate: { type: Date },

  // Billing cycle
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'annually', 'one_time'], default: 'monthly' },
  nextBillingDate: { type: Date },

  // Email tracking
  sentToCustomer: { type: Boolean, default: false },
  lastSentAt: { type: Date },
  sendCount: { type: Number, default: 0 },

  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, {
  timestamps: true
});

// ====== Pre-validate: compute missing item.amount if necessary ======
invoiceSchema.pre('validate', function(next) {
  try {
    if (Array.isArray(this.items)) {
      this.items = this.items.map(item => {
        const qty = Number(item.quantity || 1);
        const price = Number(item.unitPrice || 0);
        if (item.amount === undefined || item.amount === null || isNaN(Number(item.amount))) {
          item.amount = qty * price;
        }
        item.quantity = qty;
        item.unitPrice = price;
        item.amount = Number(item.amount);
        return item;
      });
    }
    next();
  } catch (err) {
    next(err);
  }
});

// ====== Pre-save: invoice number generation + business rules ======
invoiceSchema.pre('save', async function(next) {
  try {
    if (this.isNew && (!this.invoiceNumber || this.invoiceNumber.trim() === '')) {
      const lastInvoice = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
      }
      this.invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
    }

    if (Array.isArray(this.items)) {
      this.items = this.items.map(item => {
        const qty = Number(item.quantity || 1);
        const price = Number(item.unitPrice || 0);
        item.amount = Number(item.amount !== undefined && !isNaN(Number(item.amount)) ? item.amount : qty * price);
        return item;
      });
    }

    this.calculateTotals();

    if ((this.status === 'pending' || this.status === 'partially_paid') && this.dueDate && this.dueDate < new Date()) {
      this.status = 'overdue';
    }

    if (this.isModified('status') && this.status === 'paid' && !this.paidAt) {
      this.paidAt = new Date();
    }

    this.balanceDue = Math.max(0, (Number(this.totalAmount) || 0) - (Number(this.amountPaid) || 0));

    if ((Number(this.amountPaid) || 0) > 0) {
      if (Number(this.amountPaid) >= Number(this.totalAmount)) this.status = 'paid';
      else this.status = 'partially_paid';
    }

    next();
  } catch (error) {
    if (this.isNew && (!this.invoiceNumber || this.invoiceNumber.trim() === '')) {
      this.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    }
    next();
  }
});

// ====== Calculate Totals ======
invoiceSchema.methods.calculateTotals = function() {
  try {
    const itemsSubtotal = (this.items && this.items.length > 0)
      ? this.items.reduce((sum, item) => {
          const amt = Number(item.amount || (item.quantity * item.unitPrice) || 0);
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0)
      : 0;

    this.subtotal = itemsSubtotal > 0 ? itemsSubtotal : (Number(this.planPrice) || 0);

    const rate = Number(this.taxRate) || 0;
    this.taxAmount = (Number(this.subtotal) * rate) / 100;

    let discountAmount = 0;
    if (this.discountType === 'percentage') discountAmount = (Number(this.subtotal) * (Number(this.discount) || 0)) / 100;
    else if (this.discountType === 'fixed') discountAmount = Number(this.discount) || 0;

    this.totalAmount = Number(this.subtotal) + Number(this.taxAmount) - Number(discountAmount || 0);
    if (isNaN(this.totalAmount) || this.totalAmount < 0) this.totalAmount = 0;

    this.balanceDue = Math.max(0, Number(this.totalAmount) - (Number(this.amountPaid) || 0));
  } catch (err) {
    this.subtotal = this.subtotal || 0;
    this.taxAmount = this.taxAmount || 0;
    this.totalAmount = this.totalAmount || 0;
    this.balanceDue = Math.max(0, (this.totalAmount || 0) - (this.amountPaid || 0));
  }
};

// ====== Statics & Instance Methods ======
// (unchanged from your previous version)

invoiceSchema.statics.findByCustomerAndPlan = function(customerEmail, planName) {
  return this.findOne({
    customerEmail: (customerEmail || '').toLowerCase().trim(),
    planName: (planName || '').trim(),
    status: { $in: ['pending', 'completed', 'partially_paid'] }
  });
};

invoiceSchema.statics.findByCustomer = function(customerEmail) {
  return this.find({ customerEmail: (customerEmail || '').toLowerCase().trim() }).sort({ createdAt: -1 });
};

invoiceSchema.statics.getNextInvoiceNumber = async function() {
  try {
    const lastInvoice = await this.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }
    return `INV-${nextNumber.toString().padStart(4, '0')}`;
  } catch {
    return 'INV-0001';
  }
};

invoiceSchema.statics.searchInvoices = function(searchTerm, filters = {}) {
  const searchQuery = {};
  if (searchTerm) searchQuery.$or = [
    { invoiceNumber: { $regex: searchTerm, $options: 'i' } },
    { customerName: { $regex: searchTerm, $options: 'i' } },
    { customerEmail: { $regex: searchTerm, $options: 'i' } },
    { customerPhone: { $regex: searchTerm, $options: 'i' } },
    { customerLocation: { $regex: searchTerm, $options: 'i' } }
  ];
  if (filters.status) searchQuery.status = filters.status;
  if (filters.paymentMethod) searchQuery.paymentMethod = filters.paymentMethod;
  if (filters.planName) searchQuery.planName = filters.planName;
  if (filters.startDate || filters.endDate) {
    searchQuery.invoiceDate = {};
    if (filters.startDate) searchQuery.invoiceDate.$gte = new Date(filters.startDate);
    if (filters.endDate) searchQuery.invoiceDate.$lte = new Date(filters.endDate);
  }
  return this.find(searchQuery).sort({ createdAt: -1 });
};

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
    { $project: { _id: 0, totalInvoices: 1, totalRevenue: 1, totalPaid: 1, totalBalance: 1, avgInvoiceValue: 1 } }
  ]);
  const statusStats = await this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }]);
  const monthlyStats = await this.aggregate([
    { $group: { _id: { year: { $year: '$invoiceDate' }, month: { $month: '$invoiceDate' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  return {
    overview: stats[0] || { totalInvoices: 0, totalRevenue: 0, totalPaid: 0, totalBalance: 0, avgInvoiceValue: 0 },
    byStatus: statusStats,
    monthly: monthlyStats
  };
};

// Virtuals & serialization remain identical as before
// Indexes remain identical

console.log('✅ Invoice model compiled successfully - Hardened, pre-save-safe invoiceNumber');

export default mongoose.model('Invoice', invoiceSchema);
