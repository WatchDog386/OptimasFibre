// backend/src/models/Setting.js
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    default: 'Optimas Home Fiber'
  },
  adminEmail: {
    type: String,
    default: 'admin@optimas.com'
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
    enum: ['en', 'es', 'fr', 'de'],
    default: 'en'
  }
}, {
  timestamps: true
});

// Use findOneAndUpdate to ensure only one settings document exists
settingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('Setting', settingSchema);