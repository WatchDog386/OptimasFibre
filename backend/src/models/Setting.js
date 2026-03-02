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
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\.(png|jpg|jpeg|svg|webp)$/i.test(v);
      },
      message: 'Logo URL must be a valid image URL'
    }
  },
  maintenanceMode: {
    type: Boolean,
    default: false
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