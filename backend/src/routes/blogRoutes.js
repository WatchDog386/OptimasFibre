// backend/src/routes/blogRoutes.js
import express from 'express';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';
import {
  getAllBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost, generateBlogPDF
} from '../controllers/blogController.js';

const router = express.Router();

// Public (admins signed in also see drafts)
router.get('/', optionalAuth, getAllBlogPosts);
router.get('/:id/pdf', optionalAuth, generateBlogPDF);
router.get('/:id', optionalAuth, getBlogPostById); // id or slug

// Admin
router.post('/', protect, admin, createBlogPost);
router.put('/:id', protect, admin, updateBlogPost);
router.delete('/:id', protect, admin, deleteBlogPost);

export default router;
