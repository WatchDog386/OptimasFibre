// backend/src/controllers/authController.js

import dotenv from 'dotenv';
dotenv.config(); // Load env variables first

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/emailService.js';

/**
 * LOGIN
 * Authenticates user and returns JWT tokens
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 2. Find user including password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Compare passwords
    const isMatch = await user.comparePassword(password); // ✅ Use instance method
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Validate secrets
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: Please contact support'
      });
    }

    // 5. Sign tokens
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    let refreshToken;
    if (process.env.JWT_REFRESH_SECRET) {
      refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );
    }

    // 6. Respond with success structure
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.publicEmail, // ✅ Use masked email for security
        role: user.role
      }
    });

  } catch (err) {
    console.error('🔐 Login error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again later.'
    });
  }
};

/**
 * VERIFY TOKEN
 * Validates JWT and returns user info
 */
export const verifyToken = async (req, res) => {
  try {
    // If protect middleware ran, req.user is already attached
    if (req.user) {
      return res.status(200).json({
        success: true,
        valid: true,
        user: {
          id: req.user._id,
          email: req.user.publicEmail,
          role: req.user.role
        }
      });
    }

    // Fallback: manual token verification
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        email: user.publicEmail,
        role: user.role
      }
    });

  } catch (err) {
    console.error('🔐 Token verification error:', err.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * REFRESH TOKEN — with rotation
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      console.error('❌ JWT_REFRESH_SECRET not defined');
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

    // Generate new ACCESS token
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Generate NEW refresh token (rotation for enhanced security)
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    console.error('🔁 Token refresh error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, you will receive password reset instructions shortly.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      res.status(200).json({
        success: true,
        message: 'Password reset instructions have been sent to your email'
      });
    } catch (emailError) {
      console.error('📧 Email sending error:', emailError.message);
      // Still return success to user — log error internally
      res.status(200).json({
        success: true,
        message: 'If this email is registered, you will receive password reset instructions shortly.'
      });
    }

  } catch (err) {
    console.error('🔐 Forgot password error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request. Please try again later.'
    });
  }
};

/**
 * RESET PASSWORD — WITH HASHING
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength (min 8 chars as per User model)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // ✅ HASH THE PASSWORD BEFORE SAVING (using model's pre-save hook)
    user.password = password; // Will be hashed automatically by pre-save middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (err) {
    console.error('🔐 Reset password error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again or request a new reset link.'
    });
  }
};