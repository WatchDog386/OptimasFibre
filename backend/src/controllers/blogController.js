// backend/src/controllers/blogController.js
import BlogPost from '../models/BlogPost.js';

/**
 * Helper function to generate a URL-friendly slug from a title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Fetch all blog posts
 */
export const getAllBlogPosts = async () => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    return posts;
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    const error = new Error('Unable to fetch blog posts');
    error.statusCode = 500;
    throw error;
  }
};

/**
 * Fetch single blog post by ID
 */
export const getBlogPostById = async (id) => {
  try {
    const post = await BlogPost.findById(id);
    if (!post) {
      const error = new Error('Blog post not found');
      error.statusCode = 404;
      throw error;
    }
    return post;
  } catch (err) {
    console.error('Error fetching blog post:', err);
    throw err;
  }
};

/**
 * Create new blog post
 */
export const createBlogPost = async (data = {}, user = {}) => {
  try {
    const { title, content, imageUrl, category } = data;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      const error = new Error('Title is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      const error = new Error('Content is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }

    // Generate unique slug
    let slug = generateSlug(title.trim());
    let counter = 1;
    let uniqueSlug = slug;
    while (await BlogPost.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create post
    const newPost = await BlogPost.create({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || '',
      category: category || 'General',
      author: user?._id || 'Admin',
      slug: uniqueSlug,
    });

    return newPost;
  } catch (err) {
    console.error('Error creating blog post:', err);
    if (err.name === 'ValidationError') {
      const error = new Error(Object.values(err.errors).map(e => e.message).join(', '));
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

/**
 * Update blog post
 */
export const updateBlogPost = async (id, data = {}, user = {}) => {
  try {
    const { title, content, imageUrl, category } = data;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      const error = new Error('Title is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      const error = new Error('Content is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }

    let updateData = {
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || '',
      category: category || 'General',
      author: user?._id || 'Admin'
    };

    // Generate new slug if title changed
    if (title) {
      let slug = generateSlug(title.trim());
      let counter = 1;
      let uniqueSlug = slug;
      while (await BlogPost.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      updateData.slug = uniqueSlug;
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      const error = new Error('Blog post not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedPost;
  } catch (err) {
    console.error('Error updating blog post:', err);
    if (err.name === 'ValidationError') {
      const error = new Error(Object.values(err.errors).map(e => e.message).join(', '));
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

/**
 * Delete blog post
 */
export const deleteBlogPost = async (id) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    if (!deletedPost) {
      const error = new Error('Blog post not found');
      error.statusCode = 404;
      throw error;
    }
    return deletedPost;
  } catch (err) {
    console.error('Error deleting blog post:', err);
    throw err;
  }
};