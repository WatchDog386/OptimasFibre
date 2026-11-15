// backend/src/models/Invoice.js
import { DataTypes, Model, fn, col } from 'sequelize';
import { sequelize } from '../config/db.js';
import {
  idColumn, money, serialize, toNumber, round2,
  normalizeItems, discountAmountFor, nextDocumentNumber
} from './helpers.js';

export const INVOICE_STATUSES = ['draft', 'pending', 'paid', 'cancelled', 'completed', 'overdue', 'partially_paid'];
export const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'mobile_money', 'cheque', 'other'];
export const DISCOUNT_TYPES = ['percentage', 'fixed', 'none'];
export const BILLING_CYCLES = ['monthly', 'quarterly', 'annually', 'one_time'];

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const trimmed = (name, max) => ({
  set(value) {
    const text = value === null || value === undefined ? '' : String(value).trim();
    this.setDataValue(name, max ? text.slice(0, max) : text);
  }
});

class Invoice extends Model {
  /** Recomputes subtotal, tax, total and balance from the line items (or the plan price). */
  calculateTotals() {
    const items = Array.isArray(this.items) ? this.items : [];
    const itemsSubtotal = items.reduce((sum, item) => sum + toNumber(item.amount), 0);

    this.subtotal = round2(itemsSubtotal > 0 ? itemsSubtotal : toNumber(this.planPrice));
    this.taxAmount = round2((this.subtotal * toNumber(this.taxRate)) / 100);

    const discountAmount = discountAmountFor(this.subtotal, this.discount, this.discountType);
    this.totalAmount = Math.max(0, round2(this.subtotal + this.taxAmount - discountAmount));
    this.balanceDue = Math.max(0, round2(this.totalAmount - toNumber(this.amountPaid)));
  }

  toJSON() {
    return serialize(this);
  }

  static getNextInvoiceNumber() {
    return nextDocumentNumber(Invoice, 'invoiceNumber', 'INV', 4);
  }

  static async getStatistics() {
    const [overview] = await Invoice.findAll({
      attributes: [
        [fn('COUNT', col('id')), 'totalInvoices'],
        [fn('COALESCE', fn('SUM', col('totalAmount')), 0), 'totalRevenue'],
        [fn('COALESCE', fn('SUM', col('amountPaid')), 0), 'totalPaid'],
        [fn('COALESCE', fn('SUM', col('balanceDue')), 0), 'totalBalance'],
        [fn('COALESCE', fn('AVG', col('totalAmount')), 0), 'avgInvoiceValue']
      ],
      raw: true
    });
    const byStatus = await Invoice.findAll({
      attributes: [['status', '_id'], [fn('COUNT', col('id')), 'count'], [fn('SUM', col('totalAmount')), 'totalAmount']],
      group: ['status'],
      raw: true
    });
    return {
      overview: Object.fromEntries(Object.entries(overview).map(([key, value]) => [key, Number(value)])),
      byStatus: byStatus.map((row) => ({ _id: row._id, count: Number(row.count), totalAmount: Number(row.totalAmount) }))
    };
  }
}

Invoice.init({
  ...idColumn,
  invoiceNumber: { type: DataTypes.STRING(40), unique: true },

  // Customer
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    ...trimmed('customerName'),
    validate: {
      notEmpty: { msg: 'Customer name is required' },
      len: { args: [1, 100], msg: 'Customer name cannot exceed 100 characters' }
    }
  },
  customerEmail: {
    type: DataTypes.STRING(254),
    allowNull: false,
    set(value) {
      this.setDataValue('customerEmail', String(value ?? '').trim().toLowerCase());
    },
    validate: { isEmail: { msg: 'Please enter a valid customer email' } }
  },
  customerPhone: { type: DataTypes.STRING(40), allowNull: false, defaultValue: '', ...trimmed('customerPhone', 40) },
  customerLocation: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '', ...trimmed('customerLocation', 200) },

  // Plan
  planName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    ...trimmed('planName', 100),
    validate: { notEmpty: { msg: 'Plan name is required' } }
  },
  planPrice: money('planPrice', { validate: { min: { args: [0], msg: 'Plan price must be at least 0' } } }),
  planSpeed: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '', ...trimmed('planSpeed', 50) },

  items: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  features: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  connectionType: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Fiber Optic' },

  // Dates
  invoiceDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  dueDate: { type: DataTypes.DATE, allowNull: false, defaultValue: () => new Date(Date.now() + THIRTY_DAYS) },

  // Status & payment
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: { isIn: { args: [INVOICE_STATUSES], msg: `Status must be one of: ${INVOICE_STATUSES.join(', ')}` } }
  },
  paymentMethod: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'mobile_money',
    validate: { isIn: { args: [PAYMENT_METHODS], msg: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` } }
  },
  paymentTerms: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Due upon receipt' },

  // Financials
  subtotal: money('subtotal'),
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    get() { return Number(this.getDataValue('taxRate')); },
    validate: {
      min: { args: [0], msg: 'Tax rate cannot be negative' },
      max: { args: [100], msg: 'Tax rate cannot exceed 100%' }
    }
  },
  taxAmount: money('taxAmount'),
  discount: money('discount', { validate: { min: { args: [0], msg: 'Discount cannot be negative' } } }),
  discountType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'none',
    validate: { isIn: { args: [DISCOUNT_TYPES], msg: 'Invalid discount type' } }
  },
  totalAmount: money('totalAmount'),
  amountPaid: money('amountPaid', { validate: { min: { args: [0], msg: 'Amount paid cannot be negative' } } }),
  balanceDue: money('balanceDue'),

  notes: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '',
    validate: { len: { args: [0, 1000], msg: 'Notes cannot exceed 1000 characters' } }
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'Payment due within 30 days. Late payments subject to fees.',
    validate: { len: { args: [0, 500], msg: 'Terms cannot exceed 500 characters' } }
  },

  // Payment tracking
  paidAt: { type: DataTypes.DATE },
  paymentHistory: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },

  // Plan changes
  previousPlan: { type: DataTypes.JSONB },
  isPlanUpgrade: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  // Client account number (FBI-XXXXXXXXX), used as the M-Pesa account reference
  clientAccountNumber: {
    type: DataTypes.STRING(40),
    allowNull: false,
    defaultValue: '',
    set(value) {
      this.setDataValue('clientAccountNumber', String(value ?? '').trim().toUpperCase().slice(0, 40));
    }
  },

  // Connection management
  connectionRequestSent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  connectionRequestSentAt: { type: DataTypes.DATE },
  installationDate: { type: DataTypes.DATE },

  // Billing cycle
  billingCycle: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'monthly',
    validate: { isIn: { args: [BILLING_CYCLES], msg: 'Invalid billing cycle' } }
  },
  nextBillingDate: { type: DataTypes.DATE },

  // Email tracking
  sentToCustomer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  lastSentAt: { type: DataTypes.DATE },
  sendCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  // Audit
  createdBy: { type: DataTypes.UUID },
  updatedBy: { type: DataTypes.UUID }
}, {
  sequelize,
  modelName: 'Invoice',
  tableName: 'invoices',
  indexes: [
    { fields: ['customerEmail'] },
    { fields: ['status'] },
    { fields: ['invoiceDate'] },
    { fields: ['createdAt'] },
    { fields: ['clientAccountNumber'] }
  ],
  hooks: {
    beforeValidate(invoice) {
      invoice.items = normalizeItems(invoice.items);
      if (!Array.isArray(invoice.features)) invoice.features = [];
      if (typeof invoice.invoiceNumber === 'string') {
        invoice.invoiceNumber = invoice.invoiceNumber.trim() || null;
      }
    },

    async beforeSave(invoice) {
      if (invoice.isNewRecord && !invoice.invoiceNumber) {
        invoice.invoiceNumber = await Invoice.getNextInvoiceNumber();
      }

      // An invoice explicitly marked as paid is settled in full.
      if (invoice.changed('status') && invoice.status === 'paid') {
        invoice.calculateTotals();
        if (toNumber(invoice.amountPaid) < invoice.totalAmount) invoice.amountPaid = invoice.totalAmount;
      }

      invoice.calculateTotals();

      // Draft and cancelled invoices keep the status they were given.
      const locked = ['draft', 'cancelled'].includes(invoice.status);
      if (!locked) {
        const paid = toNumber(invoice.amountPaid);
        if (paid > 0) {
          invoice.status = paid >= invoice.totalAmount ? 'paid' : 'partially_paid';
        }
        if (['pending', 'partially_paid'].includes(invoice.status) && invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
          invoice.status = 'overdue';
        }
      }

      if (invoice.status === 'paid' && !invoice.paidAt) invoice.paidAt = new Date();
    }
  }
});

export default Invoice;
