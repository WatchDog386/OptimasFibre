// src/models/Receipt.js - COMPLETELY UPDATED (Full Feature Set)
import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  // 🔗 Enhanced: Link to original invoice (optional for standalone receipts)
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  invoiceNumber: {
    type: String,
    trim: true,
    index: true
  },

  // ✅ ENHANCED: Sequential receipt numbering (RCP-001, RCP-002...)
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
    default: 'RCP-001'
  },

  // 👤 Enhanced Client Details
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  // ✅ FIXED: Made customerLocation optional to match frontend
  customerLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
    default: '' // Made optional with default value
  },

  // ✅ NEW: Itemized receipt items for detailed billing
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

  // ✅ ENHANCED: Comprehensive financial fields
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
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
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  amountPaid: {
    type: Number,
    required: true,
    min: [0, 'Amount paid cannot be negative']
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },

  // ✅ ENHANCED: Payment Information
  paymentMethod: {
    type: String,
    required: true,
    // ✅ FIXED: Added proper enum values that match frontend
    enum: {
      values: ['cash', 'card', 'bank_transfer', 'mobile_money', 'cheque', 'other'],
      message: 'Payment method `{VALUE}` is not supported. Use: cash, card, bank_transfer, mobile_money, cheque, or other'
    },
    default: 'cash'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  receiptDate: {
    type: Date,
    default: Date.now
  },

  // ✅ ENHANCED: Status Management
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'cancelled', 'refunded'],
    default: 'issued'
  },

  // ✅ NEW: Service/Plan Information (for standalone receipts)
  serviceDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Service description too long']
  },
  planName: {
    type: String,
    trim: true
  },
  planPrice: {
    type: Number,
    default: 0
  },
  planSpeed: {
    type: String,
    trim: true
  },

  // ✅ ENHANCED: Notes & Terms
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  terms: {
    type: String,
    default: 'Thank you for your business!',
    maxlength: [500, 'Terms cannot exceed 500 characters']
  },

  // ✅ NEW: Payment Reference & Tracking
  paymentReference: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  bankReference: {
    type: String,
    trim: true
  },

  // ✅ ENHANCED: Delivery & Notification Status
  sentToCustomer: {
    type: Boolean,
    default: false
  },
  sentViaEmail: {
    type: Boolean,
    default: false
  },
  sentViaWhatsApp: {
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

  // ✅ NEW: PDF & Export Management
  pdfUrl: {
    type: String,
    trim: true
  },
  pdfGeneratedAt: {
    type: Date
  },
  pdfSize: {
    type: Number, // Size in bytes
    default: 0
  },

  // ✅ NEW: Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  issuedBy: {
    type: String,
    trim: true,
    default: 'System'
  },

  // ✅ NEW: Refund Information
  refunded: {
    type: Boolean,
    default: false
  },
  refundedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    trim: true
  }

}, {
  timestamps: true
});

// ✅ ENHANCED Pre-save hook with comprehensive receipt number generation
receiptSchema.pre('save', async function(next) {
  console.log('🔍 [RECEIPT MODEL] Pre-save hook started');
  
  try {
    // ✅ AUTO-GENERATE RECEIPT NUMBERS (RCP-001, RCP-002...)
    if (this.isNew && !this.receiptNumber) {
      console.log('🔢 Generating receipt number...');
      
      // Get the highest receipt number
      const lastReceipt = await this.constructor.findOne(
        {}, 
        {}, 
        { sort: { createdAt: -1 } }
      );
      
      let nextNumber = 1;
      if (lastReceipt && lastReceipt.receiptNumber) {
        const match = lastReceipt.receiptNumber.match(/RCP-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        } else {
          // Handle existing receipts without RCP- prefix
          const lastNumber = parseInt(lastReceipt.receiptNumber);
          nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
        }
      }
      
      // Format as RCP-001, RCP-002, etc.
      this.receiptNumber = `RCP-${nextNumber.toString().padStart(3, '0')}`;
      console.log(`✅ Generated receipt number: ${this.receiptNumber}`);
    }

    // ✅ Calculate financial fields
    this.calculateTotals();
    
    // ✅ Set payment date if not set and status is paid
    if (this.status === 'paid' && !this.paymentDate) {
      this.paymentDate = new Date();
    }
    
    // ✅ Update balance
    this.balance = Math.max(0, this.total - this.amountPaid);
    
    // ✅ Auto-set status based on payment
    if (this.amountPaid >= this.total) {
      this.status = 'paid';
      this.balance = 0;
    } else if (this.amountPaid > 0) {
      this.status = 'issued';
    }

    console.log('✅ [RECEIPT MODEL] Pre-save hook completed');
    next();
  } catch (error) {
    console.error('❌ [RECEIPT MODEL] Pre-save hook error:', error);
    // Fallback receipt number using timestamp
    if (this.isNew && !this.receiptNumber) {
      this.receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
      console.log(`🔄 Using fallback receipt number: ${this.receiptNumber}`);
    }
    next();
  }
});

// ✅ NEW: Calculate totals method
receiptSchema.methods.calculateTotals = function() {
  // Calculate subtotal from items if items exist, otherwise use planPrice or total
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  } else {
    this.subtotal = this.planPrice || this.total || 0;
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
  this.total = this.subtotal + this.taxAmount - discountAmount;
  this.balance = Math.max(0, this.total - (this.amountPaid || 0));
};

// ✅ NEW: Static method to get the next receipt number
receiptSchema.statics.getNextReceiptNumber = async function() {
  try {
    const lastReceipt = await this.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNumber = 1;
    
    if (lastReceipt && lastReceipt.receiptNumber) {
      const match = lastReceipt.receiptNumber.match(/RCP-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      } else {
        const lastNumber = parseInt(lastReceipt.receiptNumber);
        nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }
    }
    
    return `RCP-${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error getting next receipt number:', error);
    return 'RCP-001';
  }
};

// ✅ NEW: Search receipts with multiple criteria
receiptSchema.statics.searchReceipts = function(searchTerm, filters = {}) {
  const searchQuery = {};
  
  if (searchTerm) {
    searchQuery.$or = [
      { receiptNumber: { $regex: searchTerm, $options: 'i' } },
      { customerName: { $regex: searchTerm, $options: 'i' } },
      { customerEmail: { $regex: searchTerm, $options: 'i' } },
      { customerPhone: { $regex: searchTerm, $options: 'i' } },
      { invoiceNumber: { $regex: searchTerm, $options: 'i' } },
      { paymentReference: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Apply filters
  if (filters.status) searchQuery.status = filters.status;
  if (filters.paymentMethod) searchQuery.paymentMethod = filters.paymentMethod;
  if (filters.customerEmail) searchQuery.customerEmail = filters.customerEmail;
  
  // Date range filters
  if (filters.startDate || filters.endDate) {
    searchQuery.receiptDate = {};
    if (filters.startDate) searchQuery.receiptDate.$gte = new Date(filters.startDate);
    if (filters.endDate) searchQuery.receiptDate.$lte = new Date(filters.endDate);
  }
  
  return this.find(searchQuery).sort({ createdAt: -1 });
};

// ✅ NEW: Get receipt statistics
receiptSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalReceipts: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalCollected: { $sum: '$amountPaid' },
        avgReceiptValue: { $avg: '$total' },
        highestReceipt: { $max: '$total' },
        lowestReceipt: { $min: '$total' }
      }
    },
    {
      $project: {
        _id: 0,
        totalReceipts: 1,
        totalAmount: 1,
        totalCollected: 1,
        avgReceiptValue: 1,
        highestReceipt: 1,
        lowestReceipt: 1
      }
    }
  ]);
  
  const statusStats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);
  
  const paymentMethodStats = await this.aggregate([
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);
  
  const monthlyStats = await this.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$receiptDate' },
          month: { $month: '$receiptDate' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  return {
    overview: stats[0] || {
      totalReceipts: 0,
      totalAmount: 0,
      totalCollected: 0,
      avgReceiptValue: 0,
      highestReceipt: 0,
      lowestReceipt: 0
    },
    byStatus: statusStats,
    byPaymentMethod: paymentMethodStats,
    monthly: monthlyStats
  };
};

// ✅ NEW: Generate receipt from invoice
receiptSchema.statics.generateFromInvoice = async function(invoiceData) {
  try {
    const nextReceiptNumber = await this.getNextReceiptNumber();
    
    const receiptData = {
      invoiceId: invoiceData._id,
      invoiceNumber: invoiceData.invoiceNumber,
      receiptNumber: nextReceiptNumber,
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerPhone: invoiceData.customerPhone,
      customerLocation: invoiceData.customerLocation || '', // ✅ FIXED: Handle missing location
      items: invoiceData.items || [],
      subtotal: invoiceData.subtotal || invoiceData.planPrice,
      taxRate: invoiceData.taxRate || 0,
      taxAmount: invoiceData.taxAmount || 0,
      discount: invoiceData.discount || 0,
      discountType: invoiceData.discountType || 'none',
      total: invoiceData.totalAmount || invoiceData.finalAmount,
      amountPaid: invoiceData.amountPaid || invoiceData.totalAmount,
      paymentMethod: invoiceData.paymentMethod || 'cash',
      paymentDate: new Date(),
      receiptDate: new Date(),
      status: 'paid',
      planName: invoiceData.planName,
      planPrice: invoiceData.planPrice,
      planSpeed: invoiceData.planSpeed,
      notes: `Payment received for invoice ${invoiceData.invoiceNumber}`,
      serviceDescription: `Internet Service - ${invoiceData.planName} (${invoiceData.planSpeed})`
    };
    
    // Calculate balance
    receiptData.balance = Math.max(0, receiptData.total - receiptData.amountPaid);
    
    const receipt = new this(receiptData);
    return await receipt.save();
  } catch (error) {
    console.error('Error generating receipt from invoice:', error);
    throw error;
  }
};

// ✅ NEW: Mark as sent to customer
receiptSchema.methods.markAsSent = function(method = 'email') {
  this.sentToCustomer = true;
  this.lastSentAt = new Date();
  this.sendCount += 1;
  
  if (method === 'email') {
    this.sentViaEmail = true;
  } else if (method === 'whatsapp') {
    this.sentViaWhatsApp = true;
  }
  
  return this.save();
};

// ✅ NEW: Update PDF information
receiptSchema.methods.updatePDFInfo = function(pdfUrl, pdfSize = 0) {
  this.pdfUrl = pdfUrl;
  this.pdfGeneratedAt = new Date();
  this.pdfSize = pdfSize;
  return this.save();
};

// ✅ NEW: Process refund
receiptSchema.methods.processRefund = function(refundAmount, reason = '') {
  this.refunded = true;
  this.refundedAt = new Date();
  this.refundAmount = refundAmount;
  this.refundReason = reason;
  this.status = 'refunded';
  
  return this.save();
};

// ✅ VIRTUAL FIELDS

receiptSchema.virtual('displayId').get(function() {
  return this.receiptNumber;
});

receiptSchema.virtual('formattedSubtotal').get(function() {
  return `Ksh ${(this.subtotal || 0).toLocaleString()}`;
});

receiptSchema.virtual('formattedTaxAmount').get(function() {
  return `Ksh ${(this.taxAmount || 0).toLocaleString()}`;
});

receiptSchema.virtual('formattedTotal').get(function() {
  return `Ksh ${(this.total || 0).toLocaleString()}`;
});

receiptSchema.virtual('formattedAmountPaid').get(function() {
  return `Ksh ${(this.amountPaid || 0).toLocaleString()}`;
});

receiptSchema.virtual('formattedBalance').get(function() {
  return `Ksh ${(this.balance || 0).toLocaleString()}`;
});

receiptSchema.virtual('paymentStatus').get(function() {
  if (this.status === 'paid') return 'Paid';
  if (this.status === 'refunded') return 'Refunded';
  if (this.balance > 0) return 'Partially Paid';
  return 'Issued';
});

receiptSchema.virtual('isFullyPaid').get(function() {
  return this.amountPaid >= this.total;
});

// ✅ Serialization
receiptSchema.set('toJSON', { 
  virtuals: true, 
  transform: (doc, ret) => { 
    delete ret.__v; 
    ret.displayId = ret.receiptNumber;
    ret.paymentStatus = doc.paymentStatus;
    ret.isFullyPaid = doc.isFullyPaid;
    return ret; 
  } 
});

receiptSchema.set('toObject', { 
  virtuals: true, 
  transform: (doc, ret) => { 
    delete ret.__v; 
    ret.displayId = ret.receiptNumber;
    ret.paymentStatus = doc.paymentStatus;
    ret.isFullyPaid = doc.isFullyPaid;
    return ret; 
  } 
});

// ✅ INDEXES for performance
receiptSchema.index({ receiptNumber: 1 }); // For fast receipt number lookups
receiptSchema.index({ customerEmail: 1 }); // For customer receipt history
receiptSchema.index({ customerPhone: 1 }); // For phone-based lookups
receiptSchema.index({ invoiceId: 1 }); // For invoice-receipt relationships
receiptSchema.index({ invoiceNumber: 1 }); // For invoice number searches
receiptSchema.index({ status: 1 }); // For status filtering
receiptSchema.index({ receiptDate: -1 }); // For recent receipts
receiptSchema.index({ paymentDate: -1 }); // For payment date filtering
receiptSchema.index({ paymentMethod: 1 }); // For payment method analysis
receiptSchema.index({ createdAt: -1 }); // For creation date sorting
receiptSchema.index({ 'items.description': 'text' }); // For item text search

console.log('✅ Receipt model compiled successfully - Full feature set with itemized billing');

export default mongoose.model('Receipt', receiptSchema);