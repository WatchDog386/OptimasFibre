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

  /** Masked email for display, e.g. "j***n@example.com". */
  get publicEmail() {
    const email = this.getDataValue('email');
    if (!email) return '';
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
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('email', typeof value === 'string' ? value.trim().toLowerCase() : value);
    },
    validate: {
      notNull: { msg: 'Email is required' },
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
