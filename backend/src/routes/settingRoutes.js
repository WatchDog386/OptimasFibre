// backend/src/routes/settingRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.post('/', admin, updateSettings);
router.put('/', admin, updateSettings);

export default router;
