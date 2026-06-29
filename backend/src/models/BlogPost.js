// backend/src/models/BlogPost.js

import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * BlogPost Schema
 * @typedef {Object} BlogPost
 * @property {string} title - Title of the blog post
 * @property {string} content - Main content (HTML or Markdown)
 * @property {string} imageUrl - URL to featured image
 * @property {ObjectId} author - Reference to User model
 * @property {string} slug - URL-friendly unique identifier (auto-generated)
 * @property {string} category - Post category (e.g., 'Technology', 'General')
 * @property {Date} publishedAt - When post was published
 * @property {Date} createdAt - Auto-generated on creation
 * @property {Date} updatedAt - Auto-updated on modification
 */
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters']
  },
  imageUrl: {
    type: String,
    default: '',
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(v);
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
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
    maxlength: [50, 'Category name too long']
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔁 Generate or update slug before saving, ensuring uniqueness
blogPostSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true, trim: true });
    
    if (!baseSlug) {
      baseSlug = `post-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    const BlogPostModel = this.constructor;
    while (await BlogPostModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  this.updatedAt = new Date();
  next();
});

// 🚀 Add compound index for common queries
blogPostSchema.index({ author: 1, createdAt: -1 });
blogPostSchema.index({ publishedAt: -1 });

export default mongoose.model('BlogPost', blogPostSchema);