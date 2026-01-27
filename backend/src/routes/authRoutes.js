// backend/src/routes/authRoutes.js

import express from 'express';
import { 
  login, 
  verifyToken, 
  refreshToken, 
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token — returns user info if valid
 * @access  Private (requires valid JWT)
 */
router.get('/verify', verifyToken);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT access token using refresh token
 * @access  Public (requires valid refresh token in body)
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email to user
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password using token from email
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires valid JWT)
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update current user profile (name, email, phone, profileImage)
 * @access  Private (requires valid JWT)
 */
router.put('/update-profile', protect, updateProfile);

export default router;