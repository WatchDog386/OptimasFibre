// backend/src/models/Setting.js — global site settings (a single row)
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import { idColumn, serialize, isImageReference } from './helpers.js';

export const LANGUAGES = ['en', 'sw', 'es', 'fr'];

/** Company details printed on invoices and receipts. Seeded from .env on first run, then edited in the dashboard. */
export const defaultCompanyInfo = () => ({
  name: process.env.COMPANY_NAME || 'OPTIMAS NETWORK',
  tagline: 'High-Speed Internet Solutions',
  address: process.env.COMPANY_ADDRESS || 'Nairobi, Kenya',
  phone: process.env.COMPANY_PHONE || '+254 741 874 200',
  email: 'support@optimaswifi.co.ke',
  website: 'www.optimaswifi.co.ke',
  vatNumber: '',
  paybill: process.env.MPESA_PAYBILL || process.env.MOBILE_PAYBILL || '4092707',
  paybillName: process.env.COMPANY_NAME || 'OPTIMAS NETWORK',
  bankName: process.env.BANK_NAME || 'Equity Bank',
  bankAccountName: process.env.BANK_ACCOUNT_NAME || 'Optimas Network Ltd',
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
  bankBranch: process.env.BANK_BRANCH || '',
  bankSwiftCode: 'EQBLKENA'
});

class Setting extends Model {
  toJSON() {
    const values = serialize(this);
    values.companyInfo = { ...defaultCompanyInfo(), ...(values.companyInfo || {}) };
    return values;
  }

  /** Returns the settings row, creating it with defaults the first time. */
  static async getSettings() {
    const existing = await Setting.findOne({ order: [['createdAt', 'ASC']] });
    if (existing) return existing;
    return Setting.create({ companyInfo: defaultCompanyInfo() });
  }

  static async updateSettings(updates) {
    const settings = await Setting.getSettings();
    settings.set(updates);
    return settings.save();
  }
}

Setting.init({
  ...idColumn,
  siteTitle: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Optimas Fibre',
    validate: { len: { args: [1, 100], msg: 'Site title must be between 1 and 100 characters' } }
  },
  adminEmail: {
    type: DataTypes.STRING(254),
    allowNull: false,
    defaultValue: 'info@optimaswifi.co.ke',
    validate: { isEmail: { msg: 'Please enter a valid email address' } }
  },
  notifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  autoSave: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  language: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: 'en',
    validate: { isIn: { args: [LANGUAGES], msg: `Language must be one of: ${LANGUAGES.join(', ')}` } }
  },
  logoUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '/logo.png',
    validate: {
      isImage(value) {
        if (!isImageReference(value)) throw new Error('Logo URL must be a valid URL or relative path');
      }
    }
  },
  maintenanceMode: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  companyInfo: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
}, {
  sequelize,
  modelName: 'Setting',
  tableName: 'settings'
});

export default Setting;
