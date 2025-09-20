// backend/src/routes/blogRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getAllBlogPosts, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost,
  getBlogPostById 
} from '../controllers/blogController.js';

const router = express.Router();

/**
 * Utility to wrap async route handlers and forward errors to next()
 * → Now properly handles 400 errors from controller
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/blog
 * Public route to fetch all blog posts
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const posts = await getAllBlogPosts();
    res.status(200).json(posts);
  })
);

/**
 * GET /api/blog/:id
 * Public route to fetch a single blog post by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await getBlogPostById(req.params.id);
    res.status(200).json(post);
  })
);

/**
 * POST /api/blog
 * Protected route to create a new blog post
 * → Removed redundant body check — controller handles validation
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    console.log('📥 [BLOG CREATE] Received body:', req.body); // Debug log

    // Delegate validation to controller — it knows what's required
    const newPost = await createBlogPost(req.body, req.user);
    res.status(201).json(newPost);
  })
);

/**
 * PUT /api/blog/:id
 * Protected route to update a blog post
 */
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    console.log('📥 [BLOG UPDATE] Received body:', req.body); // Debug log

    const updatedPost = await updateBlogPost(req.params.id, req.body, req.user);
    res.status(200).json(updatedPost);
  })
);

/**
 * DELETE /api/blog/:id
 * Protected route to delete a blog post
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    await deleteBlogPost(req.params.id);
    res.status(200).json({ message: 'Blog post deleted successfully' });
  })
);

/**
 * Centralized error handler for blog routes
 * → Now properly returns 400 for validation errors
 */
router.use((err, req, res, next) => {
  console.error('❌ Blog Route Error:', err);

  // If controller set statusCode (like 400 or 404), use it
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'An error occurred while processing your request.',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  });
});

export default router;