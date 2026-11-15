// Image uploads stored on disk under backend/uploads/<folder>/ and served at /uploads/<folder>/.
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { UPLOADS_DIR } from '../config/paths.js';

// The stored extension comes from the verified image type, never from the uploaded file name.
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif'
};

export const imageUpload = (folder) => {
  const dir = path.join(UPLOADS_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) => cb(null, `${folder}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONS[file.mimetype]}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
      if (EXTENSIONS[file.mimetype]) return cb(null, true);
      cb(Object.assign(new Error('Only JPEG, PNG, WebP, GIF or AVIF images are allowed'), { statusCode: 400, expose: true }));
    }
  }).single('image');
};

export const publicPath = (folder, filename) => `/uploads/${folder}/${filename}`;
