// backend/src/models/BlogPost.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  category: {
    type: String,
    default: 'General'
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
});

// Generate or update slug before saving, ensuring uniqueness
blogPostSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    if (!baseSlug) {
      baseSlug = `post-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // Check for existing slug and append a counter if necessary
    while (await mongoose.models.BlogPost.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  
  // Update the updatedAt field
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  
  next();
});

// Index for better performance
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ author: 1 });

export default mongoose.model('BlogPost', blogPostSchema);