import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { isUuid } from '../models/helpers.js';

const tokenFrom = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) return req.headers.authorization.slice(7).trim();
  return req.cookies?.token || null;
};

/** Resolves the user for a JWT, or null when the token is missing, invalid, expired or orphaned. */
export const userFromToken = async (token) => {
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!isUuid(decoded.id)) return null;
  return User.findByPk(decoded.id);
};

/**
 * Protects a route: requires a valid JWT (Authorization: Bearer … or `token` cookie)
 * and attaches the user as req.user.
 */
export const protect = async (req, res, next) => {
  const token = tokenFrom(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  let user;
  try {
    user = await userFromToken(token);
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    if (!expired && error.name !== 'JsonWebTokenError' && error.name !== 'NotBeforeError') return next(error);
    return res.status(401).json({
      success: false,
      message: expired ? 'Not authorized, token expired' : 'Not authorized, invalid token'
    });
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
  }

  req.user = user;
  next();
};

/** Attaches req.user when a valid token is sent, but lets anonymous requests through. */
export const optionalAuth = async (req, res, next) => {
  try {
    req.user = (await userFromToken(tokenFrom(req))) || undefined;
  } catch {
    req.user = undefined;
  }
  next();
};

/** Restricts a route to admins. Use after `protect`. */
export const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Not authorized as admin' });
};

export { tokenFrom };
