// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema — Represents a registered user in the Optimas Fibre system
 * @typedef {Object} User
 * @property {string} email - Unique, validated email address (e.g., customer@optimafibre.com)
 * @property {string} password - Hashed password (never returned by default)
 * @property {string} role - User role: 'user' or 'admin'
 * @property {string} [resetPasswordToken] - Token for password reset
 * @property {Date} [resetPasswordExpires] - Expiry for password reset token
 * @property {Date} createdAt - Auto-generated
 * @property {Date} updatedAt - Auto-generated
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address (e.g., user@optimafibre.com)'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never return by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: {
    type: String,
    select: false // Never expose reset token in API responses
  },
  resetPasswordExpires: {
    type: Date,
    select: false // Never expose expiry in API responses
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔐 Hash password before saving (only if modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); // Industry-standard cost factor
  next();
});

// 🔍 Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🚀 Helper method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// ✅ Virtual field: Masked email for public display (e.g., "j***n@optimafibre.com")
userSchema.virtual('publicEmail').get(function () {
  if (!this.email) return '';
  const [local, domain] = this.email.split('@');
  const maskedLocal = local.length > 3 
    ? local[0] + '*'.repeat(local.length - 2) + local.slice(-1)
    : local[0] + '*';
  return `${maskedLocal}@${domain}`;
});

// ✅ Prevent accidental password leaks in console logs or API responses
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    return ret;
  }
});

export default mongoose.model('User', userSchema);