// backend/src/models/BlogPost.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import { idColumn, serialize, isImageReference, uniqueSlug } from './helpers.js';

class BlogPost extends Model {
  toJSON() {
    const values = serialize(this);
    // Only a display name is public — never the author's login email.
    values.author = values.author
      ? { _id: values.author.id, name: values.author.name || '' }
      : values.authorId;
    return values;
  }
}

BlogPost.init({
  ...idColumn,
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notNull: { msg: 'Title is required' },
      len: { args: [1, 200], msg: 'Title must be between 1 and 200 characters' }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Content is required' },
      len: { args: [50, 2000000], msg: 'Content must be at least 50 characters' }
    }
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '',
    validate: {
      isImage(value) {
        if (!isImageReference(value)) throw new Error('Image URL must be a valid http(s) URL or site path');
      }
    }
  },
  slug: { type: DataTypes.STRING(240), unique: true },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'General',
    validate: { len: { args: [0, 50], msg: 'Category name too long' } }
  },
  publishedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'BlogPost',
  tableName: 'blog_posts',
  indexes: [{ fields: ['publishedAt'] }, { fields: ['authorId'] }],
  hooks: {
    // The slug is the public article URL, so it is set once and kept stable on edits.
    async beforeValidate(post) {
      if (!post.slug && post.title) {
        post.slug = await uniqueSlug(BlogPost, post.title, 'post', post.id);
      }
    }
  }
});

export default BlogPost;
