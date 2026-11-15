// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { isUuid } from '../models/helpers.js';
import { userFromToken, tokenFrom } from '../middleware/authMiddleware.js';
import { httpError } from '../middleware/errorHandler.js';
import emailService from '../utils/emailService.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const RESET_SENT_MESSAGE = 'If this email is registered, you will receive password reset instructions shortly.';

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

/** Finds an account by username or email (both case-insensitive). */
export const findByLogin = (identifier, scope = User.unscoped()) => {
  const value = normalizeEmail(identifier);
  if (!value) return null;
  return scope.findOne({ where: value.includes('@') ? { email: value } : { username: value } });
};
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

const signAccessToken = (user) => jwt.sign(
  { id: user.id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
);

const signRefreshToken = (user) => (process.env.JWT_REFRESH_SECRET
  ? jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' })
  : undefined);

const sessionUser = (user) => ({
  id: user.id,
  username: user.username || '',
  name: user.displayName,
  email: user.publicEmail,
  role: user.role
});

export const profile = (user) => ({
  id: user.id,
  username: user.username || '',
  name: user.name || '',
  displayName: user.displayName,
  email: user.email || '',
  phone: user.phone || '',
  role: user.role,
  profileImage: user.profileImage || '',
  createdAt: user.createdAt
});

/** POST /api/auth/login — `identifier` (or the older `email` / `username` fields) can be a username or an email. */
export const login = async (req, res) => {
  const identifier = req.body?.identifier ?? req.body?.username ?? req.body?.email;
  const { password } = req.body || {};

  if (!normalizeEmail(identifier) || typeof password !== 'string' || !password) {
    throw httpError(400, 'Username (or email) and password are required');
  }

  const user = await findByLogin(identifier);
  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, 'Invalid username or password');
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: sessionUser(user)
  });
};

/** GET /api/auth/verify — always answers 200 with { valid } so the client can check a stored token. */
export const verifyToken = async (req, res) => {
  let user = null;
  try {
    user = await userFromToken(tokenFrom(req));
  } catch {
    user = null;
  }

  if (!user) {
    return res.json({ success: true, valid: false, message: 'Invalid or expired token' });
  }
  res.json({ success: true, valid: true, user: sessionUser(user) });
};

/** POST /api/auth/refresh — exchanges a refresh token for a new access + refresh token pair. */
export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body || {};
  if (!token) throw httpError(400, 'Refresh token is required');
  if (!process.env.JWT_REFRESH_SECRET) throw httpError(500, 'Refresh tokens are not enabled on this server');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw httpError(401, error.name === 'TokenExpiredError'
      ? 'Refresh token expired. Please login again.'
      : 'Invalid refresh token');
  }

  const user = isUuid(decoded.id) ? await User.findByPk(decoded.id) : null;
  if (!user) throw httpError(401, 'Invalid refresh token');

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    token: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  });
};

/** POST /api/auth/forgot-password — the answer is the same whether or not the email exists. */
export const forgotPassword = async (req, res) => {
  const identifier = req.body?.identifier ?? req.body?.email ?? req.body?.username;
  if (!normalizeEmail(identifier)) throw httpError(400, 'Email or username is required');

  const user = await findByLogin(identifier, User);
  // Accounts without an email address cannot receive a link; another admin can reset them.
  if (user?.email) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const result = await emailService.sendPasswordResetEmail(user.email, resetToken);
    if (!result.success) console.error('📧 Password reset email failed:', result.error);
  }

  res.json({ success: true, message: RESET_SENT_MESSAGE });
};

/** POST /api/auth/reset-password */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || typeof password !== 'string' || !password) {
    throw httpError(400, 'Token and new password are required');
  }
  if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters');

  const user = await User.unscoped().findOne({
    where: {
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { [Op.gt]: new Date() }
    }
  });
  if (!user) throw httpError(400, 'Invalid or expired reset token');

  user.password = password; // hashed by the model before it is stored
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully. You can now login with your new password.' });
};

/** PUT /api/auth/change-password */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
    throw httpError(400, 'Current password and new password are required');
  }
  if (newPassword.length < 8) throw httpError(400, 'New password must be at least 8 characters');

  const user = await User.unscoped().findByPk(req.user.id);
  if (!user) throw httpError(404, 'User not found');
  if (!(await user.comparePassword(currentPassword))) throw httpError(400, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
};

/** POST /api/auth/logout — tokens are stateless, so the client simply discards them. */
export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

/** GET /api/auth/me */
export const getMe = (req, res) => {
  res.json({ success: true, user: profile(req.user) });
};

/** PUT /api/auth/update-profile */
export const updateProfile = async (req, res) => {
  const { name, phone, profileImage } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  const username = normalizeEmail(req.body?.username);

  if (!name && !email && !phone && !profileImage && !username) {
    throw httpError(400, 'At least one field is required for update');
  }

  const user = req.user;

  if (username && username !== user.username) {
    const taken = await User.count({ where: { username, id: { [Op.ne]: user.id } } });
    if (taken) throw httpError(400, 'Username already in use by another account');
    user.username = username;
  }

  if (email && email !== user.email) {
    const taken = await User.count({ where: { email, id: { [Op.ne]: user.id } } });
    if (taken) throw httpError(400, 'Email already in use by another account');
    user.email = email;
  }
  if (typeof name === 'string' && name) user.name = name.trim().slice(0, 120);
  if (typeof phone === 'string' && phone) user.phone = phone.trim().slice(0, 40);
  if (typeof profileImage === 'string' && profileImage) {
    if (!/^(https?:\/\/|\/|data:image\/)/i.test(profileImage)) throw httpError(400, 'Profile image must be an image');
    user.profileImage = profileImage;
  }

  await user.save();

  res.json({ success: true, message: 'Profile updated successfully', user: profile(user) });
};
