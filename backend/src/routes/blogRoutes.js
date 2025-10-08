// backend/src/routes/blogRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getAllBlogPosts, 
  getBlogPostById,
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost,
  generateBlogPDF
} from '../controllers/blogController.js';

const router = express.Router();

/**
 * GET /api/blog
 * Public route to fetch all blog posts
 */
router.get('/', getAllBlogPosts);

/**
 * GET /api/blog/:id
 * Public route to fetch a single blog post by ID or slug
 */
router.get('/:id', getBlogPostById);

/**
 * GET /api/blog/:id/pdf
 * Public route to generate and download PDF of a blog post
 */
router.get('/:id/pdf', generateBlogPDF);

/**
 * POST /api/blog
 * Protected route to create a new blog post
 */
router.post('/', protect, createBlogPost);

/**
 * PUT /api/blog/:id
 * Protected route to update a blog post
 */
router.put('/:id', protect, updateBlogPost);

/**
 * DELETE /api/blog/:id
 * Protected route to delete a blog post
 */
router.delete('/:id', protect, deleteBlogPost);

export default router;