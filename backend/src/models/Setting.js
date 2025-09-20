// backend/src/models/Setting.js
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    default: 'My Website'
  },
  adminEmail: {
    type: String,
    default: 'admin@example.com'
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

// Singleton pattern — only one settings document
settingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('Setting', settingSchema);