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
    const { siteTitle, adminEmail, notifications, autoSave, language, logoUrl, maintenanceMode } = req.body;

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

    // Validate logoUrl (if provided)
    if (logoUrl !== undefined) {
      if (typeof logoUrl !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Logo URL must be a string'
        });
      }
      if (logoUrl && !/^https?:\/\/.+\.(png|jpg|jpeg|svg|webp)$/i.test(logoUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Logo URL must be a valid image URL (png, jpg, jpeg, svg, webp)'
        });
      }
    }

    // Use model's built-in update method for consistency
    const updatedSettings = await Setting.updateSettings({
      siteTitle: siteTitle?.trim(),
      adminEmail: adminEmail?.trim(),
      notifications,
      autoSave,
      language,
      logoUrl,
      maintenanceMode
    });

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