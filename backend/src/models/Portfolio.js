// backend/src/models/Portfolio.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const portfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
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

// Generate slug from title before saving
portfolioItemSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    if (!baseSlug) {
      baseSlug = `project-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (await mongoose.models.PortfolioItem.exists({ slug, _id: { $ne: this._id } })) {
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
portfolioItemSchema.index({ slug: 1 });
portfolioItemSchema.index({ uploadedAt: -1 });
portfolioItemSchema.index({ author: 1 });

export default mongoose.model('PortfolioItem', portfolioItemSchema);