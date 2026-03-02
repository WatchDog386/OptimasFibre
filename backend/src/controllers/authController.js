// backend/src/controllers/authController.js

import dotenv from 'dotenv';
dotenv.config(); // Load env variables first

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import emailService from '../utils/emailService.js'; // ✅ Changed to default import

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
 * FORGOT PASSWORD - UPDATED with emailService
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
      // ✅ Use emailService.sendPasswordResetEmail instead of direct function
      const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken);
      
      if (emailResult.success) {
        res.status(200).json({
          success: true,
          message: 'Password reset instructions have been sent to your email'
        });
      } else {
        console.error('📧 Email sending failed:', emailResult.error);
        // Still return success to user for security
        res.status(200).json({
          success: true,
          message: 'If this email is registered, you will receive password reset instructions shortly.'
        });
      }
    } catch (emailError) {
      console.error('📧 Email service error:', emailError.message);
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

/**
 * REGISTER USER - NEW FUNCTION
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role
    });

    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('📧 Welcome email failed:', emailError.message);
      // Continue even if email fails
    }

    // Generate token for auto-login
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.publicEmail,
        role: user.role
      }
    });

  } catch (err) {
    console.error('🔐 Registration error:', err.message);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * CHANGE PASSWORD
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (err) {
    console.error('🔐 Change password error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.'
    });
  }
};

/**
 * LOGOUT
 */
export const logout = async (req, res) => {
  try {
    // In JWT, logout is handled client-side by removing tokens
    // For enhanced security, you could implement a token blacklist here
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (err) {
    console.error('🔐 Logout error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * CHECK EMAIL AVAILABILITY
 */
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    
    res.status(200).json({
      success: true,
      available: !user,
      message: user ? 'Email already registered' : 'Email available'
    });

  } catch (err) {
    console.error('🔐 Check email error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check email availability'
    });
  }
};

/**
 * GET ME - Fetch current user profile
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map email to display names
    const nameMap = {
      'fanteskorri36@gmail.com': 'Felix Ochieng',
      'info@optimas.co.ke': 'Boisley'
    };

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name || nameMap[user.email] || '',
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profileImage: user.profileImage || '',
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error('🔐 Get user error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

/**
 * UPDATE PROFILE - Update user profile information
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, profileImage } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!name && !email && !phone && !profileImage) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required for update'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account'
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (profileImage) updateData.profileImage = profileImage;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profileImage: user.profileImage || '',
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error('🔐 Update profile error:', err.message);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};