// backend/src/routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  login, verifyToken, refreshToken, forgotPassword, resetPassword,
  changePassword, logout, getMe, updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Slows down password guessing and reset-email flooding (per IP address).
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' }
});

router.post('/login', credentialLimiter, login);
router.get('/verify', verifyToken);
router.post('/refresh', refreshToken);
router.post('/forgot-password', credentialLimiter, forgotPassword);
router.post('/reset-password', credentialLimiter, resetPassword);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, credentialLimiter, changePassword);

export default router;
