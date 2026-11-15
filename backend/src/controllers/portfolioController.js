// backend/src/controllers/portfolioController.js
import fs from 'fs/promises';
import path from 'path';
import { Portfolio, User } from '../models/index.js';
import { isUuid } from '../models/helpers.js';
import { httpError } from '../middleware/errorHandler.js';
import { UPLOADS_DIR } from '../config/paths.js';

const withAuthor = { include: [{ model: User, as: 'author', attributes: ['id', 'name'] }] };
const UPLOAD_PREFIX = '/uploads/portfolio/';

const findItemById = async (id) => {
  const item = isUuid(id) ? await Portfolio.findByPk(id, withAuthor) : null;
  if (!item) throw httpError(404, 'Portfolio item not found');
  return item;
};

/** Removes an uploaded image from disk. External URLs are left alone. */
const removeUploadedImage = async (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith(UPLOAD_PREFIX)) return;
  const file = path.join(UPLOADS_DIR, 'portfolio', path.basename(imageUrl));
  await fs.unlink(file).catch(() => {});
};

/** GET /api/portfolio */
export const getAllPortfolioItems = async (req, res) => {
  const items = await Portfolio.findAll({ order: [['uploadedAt', 'DESC']], ...withAuthor });
  res.json({ success: true, count: items.length, data: items });
};

/** GET /api/portfolio/:id (id or slug) */
export const getPortfolioItemById = async (req, res) => {
  const { id } = req.params;
  const item = await Portfolio.findOne({
    where: isUuid(id) ? { id } : { slug: String(id).toLowerCase() },
    ...withAuthor
  });
  if (!item) throw httpError(404, 'Portfolio item not found');
  res.json({ success: true, data: item });
};

/** POST /api/portfolio — accepts JSON with imageUrl, or multipart form data with an `image` file. */
export const createPortfolioItem = async (req, res) => {
  const { title, category, imageUrl } = req.body || {};
  // The dashboard's shared editor sends the text as `content`.
  const description = req.body?.description ?? req.body?.content;

  try {
    if (typeof title !== 'string' || typeof description !== 'string' || !title.trim() || !description.trim()) {
      throw httpError(400, 'Title and description are required');
    }

    const finalImageUrl = req.file
      ? `${UPLOAD_PREFIX}${req.file.filename}`
      : (typeof imageUrl === 'string' ? imageUrl.trim() : '');
    if (!finalImageUrl) throw httpError(400, 'Image file or image URL is required');

    const item = await Portfolio.create({
      title: title.trim(),
      description: description.trim(),
      category: (typeof category === 'string' && category.trim()) || 'General',
      imageUrl: finalImageUrl,
      authorId: req.user.id,
      uploadedAt: new Date()
    });

    res.status(201).json({ success: true, message: 'Portfolio item created successfully', data: await findItemById(item.id) });
  } catch (error) {
    // Do not leave an orphaned upload behind when the request is rejected.
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
};

/** PUT /api/portfolio/:id */
export const updatePortfolioItem = async (req, res) => {
  const { title, category, imageUrl } = req.body || {};
  const description = req.body?.description ?? req.body?.content;

  try {
    const item = await findItemById(req.params.id);
    const previousImage = item.imageUrl;

    if (typeof title === 'string' && title.trim()) item.title = title.trim();
    if (typeof description === 'string' && description.trim()) item.description = description.trim();
    if (typeof category === 'string' && category.trim()) item.category = category.trim();
    if (req.file) item.imageUrl = `${UPLOAD_PREFIX}${req.file.filename}`;
    else if (typeof imageUrl === 'string' && imageUrl.trim()) item.imageUrl = imageUrl.trim();

    await item.save();
    if (item.imageUrl !== previousImage) await removeUploadedImage(previousImage);

    res.json({ success: true, message: 'Portfolio item updated successfully', data: item });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
};

/** DELETE /api/portfolio/:id */
export const deletePortfolioItem = async (req, res) => {
  const item = await findItemById(req.params.id);
  await item.destroy();
  await removeUploadedImage(item.imageUrl);
  res.json({ success: true, message: 'Portfolio item deleted successfully', data: item });
};
