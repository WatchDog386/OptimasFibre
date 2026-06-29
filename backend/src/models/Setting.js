// backend/src/models/Setting.js

import mongoose from 'mongoose';

/**
 * Global Site Settings (Singleton Document)
 * @typedef {Object} Setting
 * @property {string} siteTitle - Website title (e.g., "Optimas Fibre")
 * @property {string} adminEmail - Primary admin contact email
 * @property {boolean} notifications - Enable/disable system notifications
 * @property {boolean} autoSave - Enable/disable auto-save features
 * @property {string} language - Default site language
 * @property {Object} companyInfo - Company details for invoices/receipts
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const settingSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    default: 'Optimas Fibre', // ✅ Updated default to match your brand
    trim: true,
    maxlength: [100, 'Site title cannot exceed 100 characters']
  },
  adminEmail: {
    type: String,
    default: 'info@optimafibre.com', // ✅ Updated to match your website's contact email
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  notifications: {
    type: Boolean,
    default: true
  },
  autoSave: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['en', 'sw', 'es', 'fr'], // ✅ Added 'sw' (Swahili) for Kenyan audience
    default: 'en'
  },
  // Optional: Add logo URL or theme settings
  logoUrl: {
    type: String,
    default: '/oppo.jpg',
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Allow relative paths and full URLs
        return /^(\/|https?:\/\/).+/i.test(v);
      },
      message: 'Logo URL must be a valid URL or relative path'
    }
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  
  // ✅ NEW: Company Information for Invoices & Receipts (Editable by Admin)
  companyInfo: {
    name: {
      type: String,
      default: 'OPTIMAS NETWORK',
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    tagline: {
      type: String,
      default: 'High-Speed Internet Solutions',
      trim: true,
      maxlength: [150, 'Tagline cannot exceed 150 characters']
    },
    address: {
      type: String,
      default: 'Nairobi, Kenya',
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    phone: {
      type: String,
      default: '+254 741 874 200',
      trim: true
    },
    email: {
      type: String,
      default: 'support@optimaswifi.co.ke',
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      default: 'www.optimaswifi.co.ke',
      trim: true
    },
    vatNumber: {
      type: String,
      default: 'VAT00123456',
      trim: true
    },
    // M-Pesa Paybill Details
    paybill: {
      type: String,
      default: '4092707',
      trim: true
    },
    paybillName: {
      type: String,
      default: 'OPTIMAS NETWORK',
      trim: true
    },
    // Bank Details
    bankName: {
      type: String,
      default: 'Equity Bank',
      trim: true
    },
    bankAccountName: {
      type: String,
      default: 'Optimas Network Ltd',
      trim: true
    },
    bankAccountNumber: {
      type: String,
      default: '1234567890',
      trim: true
    },
    bankBranch: {
      type: String,
      default: 'Nairobi Main',
      trim: true
    },
    bankSwiftCode: {
      type: String,
      default: 'EQBLKENA',
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🚀 Singleton Pattern — Ensures only one settings document exists globally
settingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();

  // If no settings exist, create default
  if (!settings) {
    settings = await this.create({
      siteTitle: 'Optimas Fibre',
      adminEmail: 'info@optimafibre.com',
      language: 'en'
    });
    console.log('✅ Default settings document created');
  }

  return settings;
};

// 🔄 Helper method to update settings safely
settingSchema.statics.updateSettings = async function(updates) {
  // Get current settings
  let settings = await this.getSettings();

  // Apply updates
  Object.assign(settings, updates);

  // Save and return
  return await settings.save();
};

// ✅ Add index for fast singleton lookup
settingSchema.index({ createdAt: 1 });

export default mongoose.model('Setting', settingSchema);