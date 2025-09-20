// backend/src/routes/portfolioRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  getAllPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioItemById
} from '../controllers/portfolioController.js';

const router = express.Router();

/**
 * Utility to wrap async route handlers and forward errors to next()
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/portfolio
 * Public route to fetch all portfolio items
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await getAllPortfolioItems();
    res.status(200).json(items);
  })
);

/**
 * GET /api/portfolio/:id
 * Public route to fetch a single portfolio item by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await getPortfolioItemById(req.params.id);
    res.status(200).json(item);
  })
);

/**
 * POST /api/portfolio
 * Protected route for admin to create a new portfolio item
 */
router.post(
  '/',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const newItem = await createPortfolioItem(req.body, req.file, req.user);
    res.status(201).json(newItem);
  })
);

/**
 * PUT /api/portfolio/:id
 * Protected route for admin to update a portfolio item
 */
router.put(
  '/:id',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const updatedItem = await updatePortfolioItem(req.params.id, req.body, req.file, req.user);
    res.status(200).json(updatedItem);
  })
);

/**
 * DELETE /api/portfolio/:id
 * Protected route for admin to delete a portfolio item
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    await deletePortfolioItem(req.params.id);
    res.status(200).json({ message: 'Portfolio item deleted successfully' });
  })
);

/**
 * Error handler for this router
 * Logs the real error to the server console and always responds with JSON
 */
router.use((err, req, res, next) => {
  console.error('Portfolio Route Error:', err.message, err.stack);
  res.status(err.statusCode || 500).json({
    message: 'An error occurred while processing your request.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default router;