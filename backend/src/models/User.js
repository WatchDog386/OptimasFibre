// backend/src/models/User.js
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';
import { idColumn, serialize } from './helpers.js';

const SECRET_FIELDS = ['password', 'resetPasswordToken', 'resetPasswordExpires'];

class User extends Model {
  comparePassword(candidate) {
    const hash = this.getDataValue('password');
    if (!hash || typeof candidate !== 'string') return Promise.resolve(false);
    return bcrypt.compare(candidate, hash);
  }

  isAdmin() {
    return this.role === 'admin';
  }

  /** Name to show in the UI: display name, else username, else the part of the email before @. */
  get displayName() {
    return this.name || this.username || (this.email || '').split('@')[0] || 'Admin';
  }

  /** Masked email for display, e.g. "j***n@example.com". */
  get publicEmail() {
    const email = this.getDataValue('email');
    if (!email) return '';
    if (!email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const masked = local.length > 3
      ? local[0] + '*'.repeat(local.length - 2) + local.slice(-1)
      : `${local[0]}*`;
    return `${masked}@${domain}`;
  }

  toJSON() {
    return serialize(this, SECRET_FIELDS);
  }
}

User.init({
  ...idColumn,
  // Login name, stored in lower case so sign-in is case-insensitive. Optional for accounts that use email.
  username: {
    type: DataTypes.STRING(40),
    allowNull: true,
    unique: true,
    set(value) {
      const text = typeof value === 'string' ? value.trim().toLowerCase() : value;
      this.setDataValue('username', text || null);
    },
    validate: {
      is: { args: /^[a-z0-9._-]{3,40}$/, msg: 'Username must be 3-40 characters: letters, numbers, dots, dashes or underscores' }
    }
  },
  email: {
    type: DataTypes.STRING(254),
    allowNull: true,
    unique: true,
    set(value) {
      const text = typeof value === 'string' ? value.trim().toLowerCase() : value;
      this.setDataValue('email', text || null);
    },
    validate: {
      isEmail: { msg: 'Please enter a valid email address' }
    }
  },
  // Always a bcrypt hash once saved.
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Password is required' },
      len: { args: [8, 200], msg: 'Password must be at least 8 characters' }
    }
  },
  name: { type: DataTypes.STRING(120), allowNull: false, defaultValue: '' },
  phone: { type: DataTypes.STRING(40), allowNull: false, defaultValue: '' },
  profileImage: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
    validate: { isIn: { args: [['user', 'admin']], msg: 'Role must be user or admin' } }
  },
  // SHA-256 of the token that was emailed; the raw token is never stored.
  resetPasswordToken: { type: DataTypes.STRING(64) },
  resetPasswordExpires: { type: DataTypes.DATE }
}, {
  sequelize,
  modelName: 'User',
  validate: {
    hasLoginName() {
      if (!this.username && !this.email) throw new Error('A username or an email is required');
    }
  },
  tableName: 'users',
  defaultScope: { attributes: { exclude: SECRET_FIELDS } },
  scopes: { withSecrets: { attributes: { include: SECRET_FIELDS } } },
  hooks: {
    async beforeSave(user) {
      if (user.changed('password')) {
        user.setDataValue('password', await bcrypt.hash(user.getDataValue('password'), 12));
      }
    }
  }
});

export default User;
