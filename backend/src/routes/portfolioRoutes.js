// backend/src/routes/portfolioRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllPortfolioItems, getPortfolioItemById, createPortfolioItem, updatePortfolioItem, deletePortfolioItem
} from '../controllers/portfolioController.js';
import { imageUpload } from '../middleware/upload.js';

const router = express.Router();
const upload = imageUpload('portfolio');

// Public
router.get('/', getAllPortfolioItems);
router.get('/:id', getPortfolioItemById); // id or slug

// Admin — JSON with imageUrl, or multipart form data with an `image` file
router.post('/', protect, admin, upload, createPortfolioItem);
router.put('/:id', protect, admin, upload, updatePortfolioItem);
router.delete('/:id', protect, admin, deletePortfolioItem);

export default router;
