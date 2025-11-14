import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  // 🔗 Link to original invoice (enables auto-fill from invoice)
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
    index: true
  },

  // 👤 Client Details (copied from invoice at creation time)
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true
  },
  clientLocation: {
    type: String,
    required: true,
    trim: true
  },

  // 📦 Package / Plan Details
  packageName: {
    type: String,
    required: true,
    trim: true
  },
  packagePrice: {
    type: Number,
    required: true,
    min: 1
  },
  packageSpeed: {
    type: String,
    trim: true
  },
  packageType: {
    type: String,
    enum: ['home', 'mobile'],
    default: 'home'
  },

  // 💰 Payment Info
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'mpesa', 'bank', 'card', 'invoice_based'],
    default: 'invoice_based'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },

  // 📄 Receipt Metadata
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  status: {
    type: String,
    enum: ['draft', 'sent', 'paid'],
    default: 'sent'
  },

  // 📅 System & Audit Fields (managed by `timestamps`)
  // createdAt & updatedAt are auto-handled

  // 📤 Notification & Delivery Status
  sentViaWhatsApp: {
    type: Boolean,
    default: false
  },
  sentViaEmail: {
    type: Boolean,
    default: false
  },
  pdfUrl: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// 🔢 Auto-generate receiptNumber if not provided (e.g., REC-0001)
receiptSchema.pre('save', async function (next) {
  if (this.isNew && !this.receiptNumber) {
    try {
      const lastReceipt = await mongoose.model('Receipt')
        .findOne()
        .sort({ createdAt: -1 })
        .select('receiptNumber');

      let nextNumber = 1;
      if (lastReceipt && lastReceipt.receiptNumber) {
        const match = lastReceipt.receiptNumber.match(/^REC-(\d{4})$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      this.receiptNumber = `REC-${String(nextNumber).padStart(4, '0')}`;
      console.log(`✅ Generated receipt number: ${this.receiptNumber}`);
    } catch (err) {
      return next(new Error('Failed to generate unique receipt number'));
    }
  }
  next();
});

// 📌 Indexes for performance
receiptSchema.index({ clientEmail: 1 });
receiptSchema.index({ clientPhone: 1 });
receiptSchema.index({ createdAt: -1 });
receiptSchema.index({ status: 1 });
receiptSchema.index({ receiptNumber: 1 }); // important for uniqueness & lookup

// 💡 Virtual: Display ID
receiptSchema.virtual('displayId').get(function () {
  return this.receiptNumber;
});

// 🚫 Clean JSON output
receiptSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;