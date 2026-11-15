// Registers every model and the relationships between them.
import User from './User.js';
import BlogPost from './BlogPost.js';
import Portfolio from './Portfolio.js';
import Invoice from './Invoice.js';
import Receipt from './Receipt.js';
import Setting from './Setting.js';

const authorLink = { foreignKey: { name: 'authorId', allowNull: true }, onDelete: 'SET NULL' };

BlogPost.belongsTo(User, { as: 'author', ...authorLink });
User.hasMany(BlogPost, { as: 'blogPosts', ...authorLink });

Portfolio.belongsTo(User, { as: 'author', ...authorLink });
User.hasMany(Portfolio, { as: 'portfolioItems', ...authorLink });

Receipt.belongsTo(Invoice, { as: 'invoice', foreignKey: 'invoiceId', onDelete: 'SET NULL' });
Invoice.hasMany(Receipt, { as: 'receipts', foreignKey: 'invoiceId', onDelete: 'SET NULL' });

export { User, BlogPost, Portfolio, Invoice, Receipt, Setting };
