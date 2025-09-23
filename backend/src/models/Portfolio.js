// backend/src/models/Portfolio.js

import mongoose from 'mongoose';

/**
 * Portfolio Schema
 * @typedef {Object} Portfolio
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} imageUrl - URL to project image
 * @property {string} category - Project category (e.g., 'Web Design', 'General')
 * @property {string} slug - URL-friendly unique identifier
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
        if (!v) return true; // allow empty
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
    unique: true,      // ✅ Creates index automatically — no need for schema.index({ slug: 1 })
    lowercase: true,
    trim: true,
    required: [true, 'Slug is required']
    // ⚠️ REMOVED: index: true — redundant with unique: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true // ✅ Explicit index recommended for foreign keys
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // ✅ Automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔁 Simple slug generator (no external dependency)
const generateSlug = (title) => {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word chars
    .replace(/[\s_-]+/g, '-')     // Replace spaces/underscores/hyphens with single hyphen
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
};

// 🔄 Generate slug from title before saving
portfolioSchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = generateSlug(this.title);
    
    // Fallback if title is empty or only special chars
    if (!baseSlug) {
      baseSlug = `item-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // ✅ Use this.constructor to reference the current model (safe during model compilation)
    const PortfolioModel = this.constructor;
    while (await PortfolioModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// 📈 Add indexes for performance (excluding slug — handled by unique: true)
portfolioSchema.index({ uploadedAt: -1 }); // Recent items first
portfolioSchema.index({ author: 1 });       // Items by author
portfolioSchema.index({ category: 1 });     // Items by category
portfolioSchema.index({ createdAt: -1 });   // Recently created

// 🚀 Optional: Instance method to check if item belongs to user
portfolioSchema.methods.isAuthor = function(userId) {
  return this.author && this.author.toString() === userId.toString();
};

export default mongoose.model('Portfolio', portfolioSchema);