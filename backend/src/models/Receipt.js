// backend/src/models/Receipt.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import {
  idColumn, money, serialize, toNumber, round2,
  normalizeItems, discountAmountFor, nextDocumentNumber
} from './helpers.js';
import { PAYMENT_METHODS, DISCOUNT_TYPES } from './Invoice.js';

export const RECEIPT_STATUSES = ['draft', 'issued', 'paid', 'cancelled', 'refunded'];

const text = (name, max) => ({
  type: DataTypes.STRING(max),
  allowNull: false,
  defaultValue: '',
  set(value) {
    this.setDataValue(name, String(value ?? '').trim().slice(0, max));
  }
});

class Receipt extends Model {
  /**
   * Totals are derived from the line items when there are any. Without items the
   * amounts that were entered are kept as they are, so saving a receipt again
   * (for example after emailing it) can never change its total.
   */
  calculateTotals() {
    const items = Array.isArray(this.items) ? this.items : [];

    if (items.length > 0) {
      this.subtotal = round2(items.reduce((sum, item) => sum + toNumber(item.amount), 0));
      this.taxAmount = round2((this.subtotal * toNumber(this.taxRate)) / 100);
      const discountAmount = discountAmountFor(this.subtotal, this.discount, this.discountType);
      this.total = Math.max(0, round2(this.subtotal + this.taxAmount - discountAmount));
    } else if (!toNumber(this.subtotal)) {
      this.subtotal = round2(toNumber(this.planPrice) || toNumber(this.total));
    }

    this.balance = Math.max(0, round2(toNumber(this.total) - toNumber(this.amountPaid)));
  }

  markAsSent(method = 'email') {
    this.sentToCustomer = true;
    this.lastSentAt = new Date();
    this.sendCount = (this.sendCount || 0) + 1;
    if (method === 'email') this.sentViaEmail = true;
    if (method === 'whatsapp') this.sentViaWhatsApp = true;
    return this.save();
  }

  processRefund(refundAmount, reason = '') {
    this.refunded = true;
    this.refundedAt = new Date();
    this.refundAmount = refundAmount;
    this.refundReason = reason;
    this.status = 'refunded';
    return this.save();
  }

  get paymentStatus() {
    if (this.status === 'paid') return 'Paid';
    if (this.status === 'refunded') return 'Refunded';
    if (toNumber(this.balance) > 0) return 'Partially Paid';
    return 'Issued';
  }

  toJSON() {
    const values = serialize(this);
    values.displayId = values.receiptNumber;
    values.paymentStatus = this.paymentStatus;
    values.isFullyPaid = toNumber(values.amountPaid) >= toNumber(values.total);
    return values;
  }

  static getNextReceiptNumber() {
    return nextDocumentNumber(Receipt, 'receiptNumber', 'RCP', 3);
  }

  /** Field values for a receipt that settles the given invoice. */
  static dataFromInvoice(invoice) {
    const total = toNumber(invoice.totalAmount);
    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      customerLocation: invoice.customerLocation || '',
      clientAccountNumber: invoice.clientAccountNumber || '',
      items: invoice.items || [],
      subtotal: toNumber(invoice.subtotal) || toNumber(invoice.planPrice),
      taxRate: invoice.taxRate || 0,
      taxAmount: invoice.taxAmount || 0,
      discount: invoice.discount || 0,
      discountType: invoice.discountType || 'none',
      total,
      amountPaid: toNumber(invoice.amountPaid) || total,
      paymentMethod: invoice.paymentMethod || 'cash',
      paymentDate: new Date(),
      receiptDate: new Date(),
      status: 'paid',
      planName: invoice.planName,
      planPrice: invoice.planPrice,
      planSpeed: invoice.planSpeed,
      notes: `Payment received for invoice ${invoice.invoiceNumber}`,
      serviceDescription: `Internet Service - ${invoice.planName}${invoice.planSpeed ? ` (${invoice.planSpeed})` : ''}`
    };
  }
}

Receipt.init({
  ...idColumn,

  // Link to the original invoice (optional — receipts can stand alone)
  invoiceId: { type: DataTypes.UUID },
  invoiceNumber: text('invoiceNumber', 40),

  receiptNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true },

  // Customer
  customerName: {
    ...text('customerName', 100),
    validate: { notEmpty: { msg: 'Customer name is required' } }
  },
  customerEmail: {
    type: DataTypes.STRING(254),
    allowNull: false,
    set(value) {
      this.setDataValue('customerEmail', String(value ?? '').trim().toLowerCase());
    },
    validate: { isEmail: { msg: 'Please enter a valid customer email' } }
  },
  customerPhone: text('customerPhone', 40),
  customerLocation: text('customerLocation', 200),

  items: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },

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
  total: money('total', { validate: { min: { args: [0], msg: 'Total cannot be negative' } } }),
  amountPaid: money('amountPaid', { validate: { min: { args: [0], msg: 'Amount paid cannot be negative' } } }),
  balance: money('balance'),

  // Payment
  paymentMethod: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'cash',
    validate: { isIn: { args: [PAYMENT_METHODS], msg: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` } }
  },
  paymentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  receiptDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'issued',
    validate: { isIn: { args: [RECEIPT_STATUSES], msg: `Status must be one of: ${RECEIPT_STATUSES.join(', ')}` } }
  },

  // Service / plan (for standalone receipts)
  serviceDescription: text('serviceDescription', 500),
  planName: text('planName', 100),
  planPrice: money('planPrice'),
  planSpeed: text('planSpeed', 50),

  notes: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '',
    validate: { len: { args: [0, 1000], msg: 'Notes cannot exceed 1000 characters' } }
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'Thank you for your business!',
    validate: { len: { args: [0, 500], msg: 'Terms cannot exceed 500 characters' } }
  },

  // Payment references
  paymentReference: text('paymentReference', 100),
  transactionId: text('transactionId', 100),
  bankReference: text('bankReference', 100),

  // Delivery tracking
  sentToCustomer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sentViaEmail: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sentViaWhatsApp: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  lastSentAt: { type: DataTypes.DATE },
  sendCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  clientAccountNumber: {
    type: DataTypes.STRING(40),
    allowNull: false,
    defaultValue: '',
    set(value) {
      this.setDataValue('clientAccountNumber', String(value ?? '').trim().toUpperCase().slice(0, 40));
    }
  },

  // Audit
  createdBy: { type: DataTypes.UUID },
  issuedBy: { ...text('issuedBy', 120), defaultValue: 'System' },

  // Refunds
  refunded: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  refundedAt: { type: DataTypes.DATE },
  refundAmount: money('refundAmount'),
  refundReason: text('refundReason', 500)
}, {
  sequelize,
  modelName: 'Receipt',
  tableName: 'receipts',
  indexes: [
    { fields: ['customerEmail'] },
    { fields: ['invoiceId'] },
    { fields: ['invoiceNumber'] },
    { fields: ['status'] },
    { fields: ['receiptDate'] },
    { fields: ['createdAt'] }
  ],
  hooks: {
    async beforeValidate(receipt) {
      receipt.items = normalizeItems(receipt.items);
      if (typeof receipt.receiptNumber === 'string') receipt.receiptNumber = receipt.receiptNumber.trim();
      if (receipt.isNewRecord && !receipt.receiptNumber) {
        receipt.receiptNumber = await Receipt.getNextReceiptNumber();
      }
    },

    beforeSave(receipt) {
      receipt.calculateTotals();

      // Refunded, cancelled and draft receipts keep the status they were given.
      if (!['refunded', 'cancelled', 'draft'].includes(receipt.status)) {
        const paid = toNumber(receipt.amountPaid);
        if (paid > 0 && paid >= toNumber(receipt.total)) {
          receipt.status = 'paid';
          receipt.balance = 0;
        } else if (receipt.status === 'paid') {
          receipt.status = 'issued';
        }
      }
    }
  }
});

export default Receipt;
