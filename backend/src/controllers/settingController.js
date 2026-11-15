// backend/src/controllers/settingController.js
import { Setting } from '../models/index.js';
import { LANGUAGES, defaultCompanyInfo } from '../models/Setting.js';
import { httpError } from '../middleware/errorHandler.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMPANY_FIELDS = Object.keys(defaultCompanyInfo());

const clean = (settings) => {
  const { id, _id, createdAt, updatedAt, ...rest } = settings.toJSON();
  return rest;
};

/** GET /api/settings */
export const getSettings = async (req, res) => {
  const settings = await Setting.getSettings();
  res.json({ success: true, message: 'Settings retrieved successfully', settings: clean(settings) });
};

/** POST /api/settings (admin only) */
export const updateSettings = async (req, res) => {
  const { siteTitle, adminEmail, notifications, autoSave, language, logoUrl, maintenanceMode, companyInfo } = req.body || {};
  const updates = {};

  if (siteTitle !== undefined) {
    if (typeof siteTitle !== 'string' || !siteTitle.trim()) throw httpError(400, 'Site title must be a non-empty string');
    if (siteTitle.trim().length > 100) throw httpError(400, 'Site title cannot exceed 100 characters');
    updates.siteTitle = siteTitle.trim();
  }

  if (adminEmail !== undefined) {
    if (typeof adminEmail !== 'string' || !EMAIL_RE.test(adminEmail.trim())) throw httpError(400, 'Invalid email format');
    updates.adminEmail = adminEmail.trim().toLowerCase();
  }

  if (language !== undefined) {
    if (!LANGUAGES.includes(language)) throw httpError(400, `Invalid language code. Supported: ${LANGUAGES.join(', ')}`);
    updates.language = language;
  }

  for (const [field, value] of Object.entries({ notifications, autoSave, maintenanceMode })) {
    if (value === undefined) continue;
    if (typeof value !== 'boolean') throw httpError(400, `${field} must be true or false`);
    updates[field] = value;
  }

  if (logoUrl !== undefined) {
    if (typeof logoUrl !== 'string') throw httpError(400, 'Logo URL must be a string');
    if (logoUrl && !/^(\/|https?:\/\/|data:image\/).+/i.test(logoUrl)) {
      throw httpError(400, 'Logo URL must be a valid URL or relative path');
    }
    updates.logoUrl = logoUrl;
  }

  if (companyInfo !== undefined && companyInfo !== null) {
    if (typeof companyInfo !== 'object' || Array.isArray(companyInfo)) throw httpError(400, 'companyInfo must be an object');

    const incoming = {};
    for (const field of COMPANY_FIELDS) {
      if (companyInfo[field] === undefined || companyInfo[field] === null) continue;
      if (typeof companyInfo[field] !== 'string') throw httpError(400, `Company ${field} must be text`);
      incoming[field] = companyInfo[field].trim().slice(0, 200);
    }
    if (incoming.email && !EMAIL_RE.test(incoming.email)) {
      throw httpError(400, 'Company email must be a valid email address');
    }

    const current = (await Setting.getSettings()).toJSON().companyInfo;
    updates.companyInfo = { ...current, ...incoming };
  }

  const settings = await Setting.updateSettings(updates);
  res.json({ success: true, message: 'Settings updated successfully', settings: clean(settings) });
};
