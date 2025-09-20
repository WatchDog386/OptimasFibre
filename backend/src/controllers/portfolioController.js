// backend/src/controllers/portfolioController.js
import Portfolio from '../models/Portfolio.js';

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
 * Fetch all portfolio items
 */
export const getAllPortfolioItems = async () => {
  try {
    const items = await Portfolio.find().sort({ uploadedAt: -1 });
    return items;
  } catch (err) {
    console.error('Error fetching portfolio items:', err);
    const error = new Error('Unable to fetch portfolio items');
    error.statusCode = 500;
    throw error;
  }
};

/**
 * Fetch single portfolio item by ID
 */
export const getPortfolioItemById = async (id) => {
  try {
    const item = await Portfolio.findById(id);
    if (!item) {
      const error = new Error('Portfolio item not found');
      error.statusCode = 404;
      throw error;
    }
    return item;
  } catch (err) {
    console.error('Error fetching portfolio item:', err);
    throw err;
  }
};

/**
 * Create new portfolio item
 */
export const createPortfolioItem = async (data = {}, user = {}) => {
  try {
    const { title, description, category, imageUrl } = data;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      const error = new Error('Title is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      const error = new Error('Description is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }

    // Generate unique slug
    let slug = generateSlug(title.trim());
    let counter = 1;
    let uniqueSlug = slug;
    while (await Portfolio.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create item
    const newItem = await Portfolio.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl || '',
      category: category || 'General',
      author: user?._id,
      slug: uniqueSlug,
    });

    return newItem;
  } catch (err) {
    console.error('Error creating portfolio item:', err);
    if (err.name === 'ValidationError') {
      const error = new Error(Object.values(err.errors).map(e => e.message).join(', '));
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

/**
 * Update portfolio item
 */
export const updatePortfolioItem = async (id, data = {}, user = {}) => {
  try {
    const { title, description, category, imageUrl } = data;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      const error = new Error('Title is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      const error = new Error('Description is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }

    let updateData = {
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      author: user?._id
    };

    // Update imageUrl if provided
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    // Generate new slug if title changed
    if (title) {
      let slug = generateSlug(title.trim());
      let counter = 1;
      let uniqueSlug = slug;
      while (await Portfolio.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      updateData.slug = uniqueSlug;
    }

    const updatedItem = await Portfolio.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      const error = new Error('Portfolio item not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedItem;
  } catch (err) {
    console.error('Error updating portfolio item:', err);
    if (err.name === 'ValidationError') {
      const error = new Error(Object.values(err.errors).map(e => e.message).join(', '));
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

/**
 * Delete portfolio item
 */
export const deletePortfolioItem = async (id) => {
  try {
    const deletedItem = await Portfolio.findByIdAndDelete(id);
    if (!deletedItem) {
      const error = new Error('Portfolio item not found');
      error.statusCode = 404;
      throw error;
    }
    return deletedItem;
  } catch (err) {
    console.error('Error deleting portfolio item:', err);
    throw err;
  }
};