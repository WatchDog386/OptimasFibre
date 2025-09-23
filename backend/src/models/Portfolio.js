// backend/src/models/Portfolio.js

import mongoose from 'mongoose';

/**
 * Portfolio Schema
 * @typedef {Object} Portfolio
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} imageUrl - URL to project image
 * @property {string} category - Project category (e.g., 'Web Design', 'General')
 * @property {string} slug - URL-friendly unique identifier (auto-generated)
 * @property {ObjectId} author - Reference to User model
 * @property {Date} uploadedAt - When project was uploaded
 * @property {Date} createdAt - Auto-generated
 * @property {Date} updatedAt - Auto-generated
 */
const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  imageUrl: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg|avif))$/i.test(v);
      },
      message: props => `${props.value} is not a valid image URL! Supported formats: png, jpg, jpeg, gif, webp, svg, avif.`
    }
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
    maxlength: [50, 'Category name too long']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    // ✅ REMOVED: required: true — because we generate it in pre-save hook
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔁 Simple slug generator (no external dependency)
const generateSlug = (title) => {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// 🔄 Generate slug from title before saving
portfolioSchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = generateSlug(this.title);
    
    if (!baseSlug) {
      baseSlug = `item-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    const PortfolioModel = this.constructor;
    while (await PortfolioModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// 📈 Add indexes for performance
portfolioSchema.index({ uploadedAt: -1 });
portfolioSchema.index({ author: 1 });
portfolioSchema.index({ category: 1 });
portfolioSchema.index({ createdAt: -1 });

// 🚀 Optional: Instance method to check if item belongs to user
portfolioSchema.methods.isAuthor = function(userId) {
  return this.author && this.author.toString() === userId.toString();
};

export default mongoose.model('Portfolio', portfolioSchema);