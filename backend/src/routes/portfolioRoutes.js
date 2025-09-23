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

const router = express.Router();

/**
 * GET /api/portfolio
 * Public route to fetch all portfolio items
 */
router.get('/', getAllPortfolioItems);

/**
 * GET /api/portfolio/:id
 * Public route to fetch a single portfolio item by ID or slug
 */
router.get('/:id', getPortfolioItemById);

/**
 * POST /api/portfolio
 * Protected route for admin to create a new portfolio item
 */
router.post('/', protect, createPortfolioItem);

/**
 * PUT /api/portfolio/:id
 * Protected route for admin to update a portfolio item
 */
router.put('/:id', protect, updatePortfolioItem);

/**
 * DELETE /api/portfolio/:id
 * Protected route for admin to delete a portfolio item
 */
router.delete('/:id', protect, deletePortfolioItem);

export default router;