// backend/src/controllers/settingController.js
import Setting from '../models/Setting.js';

// GET /api/settings - Fetch current settings
export const getSettings = async () => {
  try {
    const settings = await Setting.getSettings();
    return settings;
  } catch (err) {
    console.error('Error fetching settings:', err);
    throw new Error('Unable to fetch settings');
  }
};

// POST /api/settings - Update settings
export const updateSettings = async (data = {}) => {
  try {
    const { siteTitle, adminEmail, notifications, autoSave, language } = data;

    // Validate language if provided
    const validLanguages = ['en', 'es', 'fr', 'de'];
    if (language && !validLanguages.includes(language)) {
      const error = new Error('Invalid language code');
      error.statusCode = 400;
      throw error;
    }

    // Get current settings or create defaults
    let settings = await Setting.getSettings();

    // Update the settings document
    settings.siteTitle = siteTitle || settings.siteTitle;
    settings.adminEmail = adminEmail || settings.adminEmail;
    settings.notifications = notifications !== undefined ? notifications : settings.notifications;
    settings.autoSave = autoSave !== undefined ? autoSave : settings.autoSave;
    settings.language = language || settings.language;

    await settings.save();

    return settings;
  } catch (err) {
    console.error('Error updating settings:', err);
    throw err;
  }
};