// backend/src/models/Portfolio.js
import mongoose from 'mongoose';

// Simple slug generator (no external dependency)
const generateSlug = (title) => {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word chars
    .replace(/[\s_-]+/g, '-')     // Replace spaces/underscores/hyphens with single hyphen
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
};

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  imageUrl: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // allow empty
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // ✅ Automatically manages createdAt and updatedAt
});

// Generate slug from title before saving
portfolioSchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = generateSlug(this.title);
    
    // Fallback if title is empty or only special chars
    if (!baseSlug) {
      baseSlug = `item-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    const PortfolioModel = mongoose.model('Portfolio'); // ✅ Use correct model name
    while (await PortfolioModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Add indexes for performance
portfolioSchema.index({ slug: 1 }, { unique: true });
portfolioSchema.index({ uploadedAt: -1 });
portfolioSchema.index({ author: 1 });
portfolioSchema.index({ category: 1 });

// Optional: Instance method to check if item belongs to user
portfolioSchema.methods.isAuthor = function(userId) {
  return this.author.toString() === userId.toString();
};

export default mongoose.model('Portfolio', portfolioSchema); // ✅ Export as 'Portfolio'

