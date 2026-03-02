// backend/src/controllers/portfolioController.js
import Portfolio from '../models/Portfolio.js';
import mongoose from 'mongoose'; // ✅ needed for id/slug check

/**
 * Fetch all portfolio items
 * GET /api/portfolio
 * Public
 */
export const getAllPortfolioItems = async (req, res) => {
  try {
    console.log('🎨 Fetching all portfolio items...');
    const items = await Portfolio.find()
      .sort({ uploadedAt: -1 })
      .select('-__v')
      .populate('author', 'email publicEmail role');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    console.error('🎨 Error fetching portfolio items:', err.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch portfolio items'
    });
  }
};

/**
 * Fetch single portfolio item by ID or slug
 * GET /api/portfolio/:id
 * Public
 */
export const getPortfolioItemById = async (req, res) => {
  try {
    const { id } = req.params;
    // Allow lookup by ID or slug
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    const item = await Portfolio.findOne(query)
      .populate('author', 'email publicEmail role');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('🎨 Error fetching portfolio item:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create new portfolio item
 * POST /api/portfolio
 * Private/Admin
 */
export const createPortfolioItem = async (req, res) => {
  try {
    const { title, description, category, imageUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    let finalImageUrl = '';
    if (req.file) {
      finalImageUrl = `/uploads/portfolio/${req.file.filename}`;
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image file or image URL is required'
      });
    }

    const newItem = await Portfolio.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      imageUrl: finalImageUrl,
      author: req.user._id,
      uploadedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      data: newItem
    });
  } catch (err) {
    console.error('🎨 Error creating portfolio item:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update portfolio item
 * PUT /api/portfolio/:id
 * Private/Admin
 */
export const updatePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, imageUrl } = req.body;

    const item = await Portfolio.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    item.title = title?.trim() || item.title;
    item.description = description?.trim() || item.description;
    item.category = category || item.category;

    if (req.file) {
      item.imageUrl = `/uploads/portfolio/${req.file.filename}`;
    } else if (imageUrl) {
      item.imageUrl = imageUrl;
    }

    item.updatedAt = new Date();

    const updatedItem = await item.save();

    res.status(200).json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: updatedItem
    });
  } catch (err) {
    console.error('🎨 Error updating portfolio item:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete portfolio item
 * DELETE /api/portfolio/:id
 * Private/Admin
 */
export const deletePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Portfolio.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully',
      data: deletedItem
    });
  } catch (err) {
    console.error('🎨 Error deleting portfolio item:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
