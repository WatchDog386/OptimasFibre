// backend/src/models/Portfolio.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import { idColumn, serialize, isImageReference, uniqueSlug } from './helpers.js';

class Portfolio extends Model {
  toJSON() {
    const values = serialize(this);
    values.author = values.author
      ? { _id: values.author.id, name: values.author.name || values.author.username || '' }
      : values.authorId;
    return values;
  }
}

Portfolio.init({
  ...idColumn,
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notNull: { msg: 'Title is required' },
      len: { args: [1, 150], msg: 'Title must be between 1 and 150 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Description is required' },
      len: { args: [10, 2000000], msg: 'Description must be at least 10 characters' }
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
  slug: { type: DataTypes.STRING(200), unique: true },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'General',
    validate: { len: { args: [0, 50], msg: 'Category name too long' } }
  },
  uploadedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Portfolio',
  tableName: 'portfolio_items',
  indexes: [{ fields: ['uploadedAt'] }, { fields: ['category'] }, { fields: ['authorId'] }],
  hooks: {
    async beforeValidate(item) {
      if (!item.slug && item.title) {
        item.slug = await uniqueSlug(Portfolio, item.title, 'item', item.id);
      }
    }
  }
});

export default Portfolio;
