// backend/src/routes/portfolioRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAllPortfolioItems,
  getPortfolioItemById,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem
} from '../controllers/portfolioController.js';

import multer from 'multer';
import path from 'path';

const router = express.Router();

/**
 * Multer config for file uploads
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/portfolio/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

/**
 * Routes — now matches blogRoutes layout but supports image upload
 */

// @desc    Get all portfolio items
// @route   GET /api/portfolio
// @access  Public
router.get('/', getAllPortfolioItems);

// @desc    Get single portfolio item by ID or slug
// @route   GET /api/portfolio/:id
// @access  Public
router.get('/:id', getPortfolioItemById);

// @desc    Create new portfolio item
// @route   POST /api/portfolio
// @access  Private/Admin
router.post('/', protect, upload.single('image'), createPortfolioItem);

// @desc    Update portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private/Admin
router.put('/:id', protect, upload.single('image'), updatePortfolioItem);

// @desc    Delete portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private/Admin
router.delete('/:id', protect, deletePortfolioItem);

export default router;
