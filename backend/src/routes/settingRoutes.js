// backend/src/routes/settingRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = express.Router();

/**
 * GET /api/settings
 * Protected route to get current settings
 */
router.get('/', protect, getSettings);

/**
 * POST /api/settings
 * Protected route to update settings (admin only)
 */
router.post('/', protect, updateSettings);

export default router;