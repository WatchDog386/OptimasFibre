// backend/src/controllers/portfolioController.js
import Portfolio from '../models/Portfolio.js';

/**
 * Helper function to generate a URL-friendly slug from a title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()                    // Convert to lowercase
    .trim()                           // Remove whitespace from start and end
    .replace(/[^\w\s-]/g, '')         // Remove all non-word chars except spaces and hyphens
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-');             // Replace multiple hyphens with a single hyphen
};

/**
 * Fetch all portfolio items from the DB
 */
export const getAllPortfolioItems = async () => {
  try {
    const items = await Portfolio.find().sort({ uploadedAt: -1 });
    return items;
  } catch (err) {
    console.error('Error in getAllPortfolioItems:', err);
    throw new Error('Unable to fetch portfolio items');
  }
};

/**
 * Fetch a single portfolio item by ID
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
    console.error('Error in getPortfolioItemById:', err);
    throw err;
  }
};

/**
 * Create a new portfolio item in the DB
 */
export const createPortfolioItem = async (data = {}, file = null, user = {}) => {
  try {
    const { title, description, category, imageUrl: formImageUrl } = data;

    // Basic validation
    if (!title || !description) {
      const error = new Error('Title and description are required');
      error.statusCode = 400;
      throw error;
    }

    // Handle file upload or URL
    let finalImageUrl = formImageUrl || '';
    if (file && file.path) {
      finalImageUrl = `/uploads/${file.filename}`;
    }

    // Generate a slug from the title
    let slug = generateSlug(title);
    let counter = 1;
    let uniqueSlug = slug;

    // Ensure the slug is unique
    while (await Portfolio.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create the portfolio item
    const newItem = await Portfolio.create({
      title,
      description,
      imageUrl: finalImageUrl,
      category: category || 'General',
      author: user?._id,
      slug: uniqueSlug,
    });

    return newItem;

  } catch (err) {
    console.error('Error in createPortfolioItem:', err);

    // If it's a Mongoose validation error, send a 400
    if (err.name === 'ValidationError') {
      const error = new Error(Object.values(err.errors).map(e => e.message).join(', '));
      error.statusCode = 400;
      throw error;
    }

    // Re-throw the error for the router to handle
    throw err;
  }
};

/**
 * Update a portfolio item in the DB
 */
export const updatePortfolioItem = async (id, data = {}, file = null, user = {}) => {
  try {
    const { title, description, category, imageUrl: formImageUrl } = data;

    // Basic validation
    if (!title || !description) {
      const error = new Error('Title and description are required');
      error.statusCode = 400;
      throw error;
    }

    // Handle file upload or URL
    let updateData = {
      title,
      description,
      category: category || 'General',
      author: user?._id
    };

    // Only update imageUrl if a new file is uploaded or a new URL is provided
    if (file && file.path) {
      updateData.imageUrl = `/uploads/${file.filename}`;
    } else if (formImageUrl !== undefined) {
      updateData.imageUrl = formImageUrl;
    }

    // Generate a new slug if the title has changed
    if (title) {
      let slug = generateSlug(title);
      let counter = 1;
      let uniqueSlug = slug;

      // Ensure the slug is unique (excluding the current item)
      while (await Portfolio.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      updateData.slug = uniqueSlug;
    }

    // Find and update the portfolio item
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
    console.error('Error in updatePortfolioItem:', err);

    if (err.name === 'ValidationError') {
      const error = new Error(Object.values(err.errors).map(e => e.message).join(', '));
      error.statusCode = 400;
      throw error;
    }

    throw err;
  }
};

/**
 * Delete a portfolio item from the DB
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
    console.error('Error in deletePortfolioItem:', err);
    throw err;
  }
};