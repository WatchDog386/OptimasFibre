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
 * @property {string} slug - URL-friendly unique identifier
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
        if (!v) return true; // Allow empty
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(v);
      },
      message: 'Image URL must be a valid URL ending in a common image extension'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true // ✅ Explicit index (recommended for foreign keys)
  },
  slug: {
    type: String,
    unique: true,      // ✅ This creates the index — no need for schema.index({ slug: 1 })
    lowercase: true,
    trim: true,
    required: [true, 'Slug is required']
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We handle createdAt/updatedAt manually for control
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔁 Generate or update slug before saving, ensuring uniqueness
blogPostSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true, trim: true });
    
    // Fallback if slugify returns empty
    if (!baseSlug) {
      baseSlug = `post-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness by checking for existing slugs (excluding current document)
    while (await mongoose.models.BlogPost.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Always update updatedAt on save
  this.updatedAt = new Date();

  next();
});

// 🚀 Add compound index for common queries: recent posts by author
blogPostSchema.index({ author: 1, createdAt: -1 });

// 📈 Add index for sorting by published date
blogPostSchema.index({ publishedAt: -1 });

// ✅ REMOVED: Duplicate slug index — handled by { unique: true } in schema definition
// blogPostSchema.index({ slug: 1 }); ←— DELETE THIS LINE

export default mongoose.model('BlogPost', blogPostSchema);