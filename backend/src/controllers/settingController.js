// backend/src/controllers/settingController.js
import Setting from '../models/Setting.js';

/**
 * GET settings
 */
export const getSettings = async () => {
  try {
    const settings = await Setting.getSettings();
    return settings;
  } catch (err) {
    console.error('❌ Error fetching settings:', err);
    const error = new Error('Unable to fetch settings');
    error.statusCode = 500;
    throw error;
  }
};

/**
 * UPDATE settings
 */
export const updateSettings = async (data = {}) => {
  try {
    const { siteTitle, adminEmail, notifications, autoSave, language } = data;

    // Validate siteTitle
    if (siteTitle !== undefined) {
      if (typeof siteTitle !== 'string' || siteTitle.trim().length < 1) {
        const error = new Error('Site title must be a non-empty string');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate adminEmail
    if (adminEmail !== undefined) {
      if (typeof adminEmail !== 'string' || !adminEmail.includes('@')) {
        const error = new Error('Invalid email format');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate language
    if (language !== undefined) {
      const validLanguages = ['en', 'es', 'fr', 'de'];
      if (!validLanguages.includes(language)) {
        const error = new Error('Invalid language code. Supported: en, es, fr, de');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate boolean fields
    if (notifications !== undefined && typeof notifications !== 'boolean') {
      const error = new Error('Notifications must be true or false');
      error.statusCode = 400;
      throw error;
    }

    if (autoSave !== undefined && typeof autoSave !== 'boolean') {
      const error = new Error('AutoSave must be true or false');
      error.statusCode = 400;
      throw error;
    }

    // Get current settings
    let settings = await Setting.getSettings();

    // Update only provided fields
    if (siteTitle !== undefined) settings.siteTitle = siteTitle.trim();
    if (adminEmail !== undefined) settings.adminEmail = adminEmail.trim();
    if (notifications !== undefined) settings.notifications = notifications;
    if (autoSave !== undefined) settings.autoSave = autoSave;
    if (language !== undefined) settings.language = language;

    // Save
    await settings.save();

    console.log('✅ Settings updated successfully');
    return settings;
  } catch (err) {
    console.error('❌ Error updating settings:', err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};