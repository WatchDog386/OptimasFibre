import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes — verifies JWT token
 * Supports:
 * - Bearer token in Authorization header
 * - Token in cookies (optional)
 */
export const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Try to get token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2️⃣ Fallback: get from cookies (if using cookie-based auth)
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 3️⃣ No token? Reject.
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    // 4️⃣ Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Find user and attach to req.user (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    // ✅ Attach user to request — available in all downstream routes/controllers
    req.user = user;

    // 🟢 Log successful auth (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Authenticated user: ${user.email} (${user.role || 'user'})`);
    }

    next();
  } catch (error) {
    console.error('🔐 Token verification failed:', error.message);

    // Specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token'
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Middleware to restrict access to admins only
 * → Must be used AFTER `protect` middleware
 */
export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Please login first.'
    });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

/**
 * Middleware to refresh access token using refresh token
 * Expects: { refreshToken } in req.body
 */
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Validate refresh token secret exists
    if (!process.env.JWT_REFRESH_SECRET) {
      console.error('❌ JWT_REFRESH_SECRET is not defined');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Optional: Generate new refresh token (rotation)
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Attach tokens to request for route handler
    req.newAccessToken = newAccessToken;
    req.newRefreshToken = newRefreshToken;

    next();
  } catch (error) {
    console.error('🔁 Refresh token error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};
