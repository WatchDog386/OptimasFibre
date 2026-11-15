// backend/src/routes/portfolioRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllPortfolioItems, getPortfolioItemById, createPortfolioItem, updatePortfolioItem, deletePortfolioItem
} from '../controllers/portfolioController.js';
import { UPLOADS_DIR } from '../config/paths.js';

const router = express.Router();

const PORTFOLIO_DIR = path.join(UPLOADS_DIR, 'portfolio');
fs.mkdirSync(PORTFOLIO_DIR, { recursive: true });

// The stored extension comes from the verified image type, never from the uploaded file name.
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, PORTFOLIO_DIR),
    filename: (req, file, cb) => cb(null, `portfolio-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONS[file.mimetype]}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(Object.assign(new Error('Only JPEG, PNG, WebP, GIF or AVIF images are allowed'), { statusCode: 400, expose: true }));
  }
});

// Public
router.get('/', getAllPortfolioItems);
router.get('/:id', getPortfolioItemById); // id or slug

// Admin — JSON with imageUrl, or multipart form data with an `image` file
router.post('/', protect, admin, upload.single('image'), createPortfolioItem);
router.put('/:id', protect, admin, upload.single('image'), updatePortfolioItem);
router.delete('/:id', protect, admin, deletePortfolioItem);

export default router;
