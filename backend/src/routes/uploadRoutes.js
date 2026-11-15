// POST /api/uploads/image — multipart form with an `image` field; returns { url } for blog/portfolio/logo use.
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { imageUpload, publicPath } from '../middleware/upload.js';
import { httpError } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/image', protect, admin, imageUpload('images'), (req, res) => {
  if (!req.file) throw httpError(400, 'Choose an image file to upload');
  res.status(201).json({ success: true, url: publicPath('images', req.file.filename) });
});

export default router;
