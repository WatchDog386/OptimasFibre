// backend/src/controllers/settingController.js

import Setting from '../models/Setting.js';

/**
 * GET settings — returns global site configuration
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();

    // Remove internal fields from response
    const { __v, _id, createdAt, updatedAt, ...cleanSettings } = settings.toObject();

    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
       settings: cleanSettings
    });
  } catch (err) {
    console.error('⚙️ Error fetching settings:', err.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch settings. Please try again later.'
    });
  }
};

/**
 * UPDATE settings — restricted to admins only (protected by middleware)
 */
export const updateSettings = async (req, res) => {
  try {
    const { siteTitle, adminEmail, notifications, autoSave, language, logoUrl, maintenanceMode, companyInfo } = req.body;

    // Validate siteTitle
    if (siteTitle !== undefined) {
      if (typeof siteTitle !== 'string' || siteTitle.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Site title must be a non-empty string'
        });
      }
      if (siteTitle.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Site title cannot exceed 100 characters'
        });
      }
    }

    // Validate adminEmail
    if (adminEmail !== undefined) {
      if (typeof adminEmail !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(adminEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Validate language (aligned with your Setting model)
    if (language !== undefined) {
      const validLanguages = ['en', 'sw', 'es', 'fr']; // ✅ Added 'sw' for Swahili (Kenyan audience)
      if (!validLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid language code. Supported: en, sw, es, fr'
        });
      }
    }

    // Validate boolean fields
    const validateBoolean = (value, fieldName) => {
      if (value !== undefined && typeof value !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: `${fieldName} must be true or false`
        });
      }
      return null;
    };

    validateBoolean(notifications, 'Notifications');
    validateBoolean(autoSave, 'AutoSave');
    validateBoolean(maintenanceMode, 'MaintenanceMode');

    // Validate logoUrl (if provided) - allow relative paths
    if (logoUrl !== undefined) {
      if (typeof logoUrl !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Logo URL must be a string'
        });
      }
      if (logoUrl && !/^(\/|https?:\/\/).+/i.test(logoUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Logo URL must be a valid URL or relative path'
        });
      }
    }

    // Build update object
    const updates = {};
    if (siteTitle !== undefined) updates.siteTitle = siteTitle.trim();
    if (adminEmail !== undefined) updates.adminEmail = adminEmail.trim();
    if (notifications !== undefined) updates.notifications = notifications;
    if (autoSave !== undefined) updates.autoSave = autoSave;
    if (language !== undefined) updates.language = language;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (maintenanceMode !== undefined) updates.maintenanceMode = maintenanceMode;
    
    // ✅ NEW: Handle companyInfo updates (for paybill, bank details, etc.)
    if (companyInfo !== undefined && typeof companyInfo === 'object') {
      // Get current settings to merge with new companyInfo
      const currentSettings = await Setting.getSettings();
      const currentCompanyInfo = currentSettings.companyInfo?.toObject ? currentSettings.companyInfo.toObject() : (currentSettings.companyInfo || {});
      
      // Merge new companyInfo with existing
      updates.companyInfo = {
        ...currentCompanyInfo,
        ...companyInfo
      };
      
      // Validate key fields
      if (companyInfo.name !== undefined && typeof companyInfo.name !== 'string') {
        return res.status(400).json({ success: false, message: 'Company name must be a string' });
      }
      if (companyInfo.paybill !== undefined && typeof companyInfo.paybill !== 'string') {
        return res.status(400).json({ success: false, message: 'Paybill must be a string' });
      }
      if (companyInfo.email !== undefined) {
        if (typeof companyInfo.email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(companyInfo.email)) {
          return res.status(400).json({ success: false, message: 'Company email must be a valid email address' });
        }
      }
    }

    // Use model's built-in update method for consistency
    const updatedSettings = await Setting.updateSettings(updates);

    // Clean response
    const { __v, _id, createdAt, updatedAt, ...cleanSettings } = updatedSettings.toObject();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
       settings: cleanSettings
    });

  } catch (err) {
    console.error('⚙️ Error updating settings:', err.message);
    res.status(500).json({
      success: false,
      message: 'Unable to update settings. Please try again later.'
    });
  }
};