// backend/src/routes/settingsRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
// ✅ Corrected import to match actual file name (settingController.js)
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = express.Router();

/**
 * Utility to wrap async route handlers and forward errors to next()
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/settings
 * Protected route to get current settings
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    res.status(200).json(settings);
  })
);

/**
 * POST /api/settings
 * Protected route to update settings
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const updatedSettings = await updateSettings(req.body);
    res.status(200).json(updatedSettings);
  })
);

/**
 * Error handler for this router
 */
router.use((err, req, res, next) => {
  console.error('Settings Route Error:', err.message, err.stack);
  res.status(err.statusCode || 500).json({
    message: 'An error occurred while processing your request.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default router;
