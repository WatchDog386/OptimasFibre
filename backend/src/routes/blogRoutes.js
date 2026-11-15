// backend/src/routes/blogRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost, generateBlogPDF
} from '../controllers/blogController.js';

const router = express.Router();

// Public
router.get('/', getAllBlogPosts);
router.get('/:id/pdf', generateBlogPDF);
router.get('/:id', getBlogPostById); // id or slug

// Admin
router.post('/', protect, admin, createBlogPost);
router.put('/:id', protect, admin, updateBlogPost);
router.delete('/:id', protect, admin, deleteBlogPost);

export default router;
