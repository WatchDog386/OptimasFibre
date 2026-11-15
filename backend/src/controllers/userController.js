// backend/src/controllers/userController.js — admin management of dashboard accounts
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { isUuid } from '../models/helpers.js';
import { httpError } from '../middleware/errorHandler.js';
import { profile } from './authController.js';

const ROLES = ['admin', 'user'];

const findUser = async (id) => {
  const user = isUuid(id) ? await User.findByPk(id) : null;
  if (!user) throw httpError(404, 'User not found');
  return user;
};

const otherAdmins = (id) => User.count({ where: { role: 'admin', id: { [Op.ne]: id } } });

/** GET /api/users */
export const listUsers = async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'ASC']] });
  res.json({ success: true, users: users.map(profile) });
};

/** POST /api/users — { username?, email?, name?, phone?, password, role? } */
export const createUser = async (req, res) => {
  const { username, email, name, phone, password, role = 'admin' } = req.body || {};
  if (!username && !email) throw httpError(400, 'A username or an email is required');
  if (typeof password !== 'string' || password.length < 8) throw httpError(400, 'Password must be at least 8 characters');
  if (!ROLES.includes(role)) throw httpError(400, 'Role must be admin or user');

  const user = await User.create({
    username: typeof username === 'string' ? username : null,
    email: typeof email === 'string' ? email : null,
    name: typeof name === 'string' ? name.trim().slice(0, 120) : '',
    phone: typeof phone === 'string' ? phone.trim().slice(0, 40) : '',
    password,
    role
  });
  res.status(201).json({ success: true, message: 'User created', user: profile(user) });
};

/** PUT /api/users/:id — change details, role, or set a new password. */
export const updateUser = async (req, res) => {
  const user = await findUser(req.params.id);
  const { username, email, name, phone, password, role } = req.body || {};

  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (typeof name === 'string') user.name = name.trim().slice(0, 120);
  if (typeof phone === 'string') user.phone = phone.trim().slice(0, 40);

  if (role !== undefined && role !== user.role) {
    if (!ROLES.includes(role)) throw httpError(400, 'Role must be admin or user');
    if (user.id === req.user.id) throw httpError(400, 'You cannot change your own role');
    user.role = role;
  }

  if (password !== undefined && password !== '') {
    if (typeof password !== 'string' || password.length < 8) throw httpError(400, 'Password must be at least 8 characters');
    user.password = password;
  }

  await user.save();
  res.json({ success: true, message: 'User updated', user: profile(user) });
};

/** DELETE /api/users/:id */
export const deleteUser = async (req, res) => {
  const user = await findUser(req.params.id);
  if (user.id === req.user.id) throw httpError(400, 'You cannot delete your own account');
  if (user.role === 'admin' && !(await otherAdmins(user.id))) throw httpError(400, 'At least one admin must remain');
  await user.destroy();
  res.json({ success: true, message: 'User deleted' });
};
