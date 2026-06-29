// backend/src/models/Portfolio.js
import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * Portfolio Schema
 * @typedef {Object} Portfolio
 * @property {string} title - Title of the portfolio item
 * @property {string} description - Description or case study content
 * @property {string} imageUrl - URL to featured image (or relative upload path)
 * @property {ObjectId} author - Reference to User model
 * @property {string} slug - URL-friendly unique identifier (auto-generated)
 * @property {string} category - Portfolio category (e.g., 'Web', 'Design')
 * @property {Date} uploadedAt - When item was uploaded
 * @property {Date} createdAt - Auto-generated on creation
 * @property {Date} updatedAt - Auto-updated on modification
 */
const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  imageUrl: {
    type: String,
    default: '',
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|ico)$/i.test(v);
      },
      message: 'Image URL must be a valid URL ending in a common image extension'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
    maxlength: [50, 'Category name too long']
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

// 🔁 Generate or update slug before saving, ensuring uniqueness
portfolioSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true, trim: true });

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

  this.updatedAt = new Date();
  next();
});

// 🚀 Add compound index for common queries
portfolioSchema.index({ author: 1, createdAt: -1 });
portfolioSchema.index({ uploadedAt: -1 });
portfolioSchema.index({ category: 1 });
portfolioSchema.index({ slug: 1 });

export default mongoose.model('Portfolio', portfolioSchema);
