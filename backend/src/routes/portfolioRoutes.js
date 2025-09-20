// backend/src/routes/portfolioRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
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
 * → Now accepts JSON body: { title, description, category, imageUrl }
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    console.log('📥 [PORTFOLIO CREATE] Received body:', req.body); // Debug log

    // Validate required fields at route level (optional, controller also validates)
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }

    const newItem = await createPortfolioItem(req.body, req.user);
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
  asyncHandler(async (req, res) => {
    console.log('📥 [PORTFOLIO UPDATE] Received body:', req.body); // Debug log

    if (!req.body.title || !req.body.description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }

    const updatedItem = await updatePortfolioItem(req.params.id, req.body, req.user);
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
 * Centralized error handler for portfolio routes
 */
router.use((err, req, res, next) => {
  console.error('❌ Portfolio Route Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
});

export default router;