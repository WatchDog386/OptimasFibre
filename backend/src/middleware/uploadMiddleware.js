// backend/src/middleware/uploadMiddleware.js

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Upload directory created:', uploadDir);
}

// ✅ Enhanced storage configuration with crypto-random filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate cryptographically secure unique filename
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const cleanFileName = file.originalname
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[^\w.-]/g, '')        // Remove unsafe characters
      .substring(0, 50);              // Limit filename length
    
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${timestamp}-${randomBytes}-${cleanFileName}${extension}`;
    
    cb(null, uniqueFilename);
  }
});

// ✅ Enhanced file filter with detailed error messages
const fileFilter = (req, file, cb) => {
  // Allowed MIME types and extensions
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype);
  const isAllowedExtension = allowedExtensions.includes(fileExtension);

  if (isAllowedMimeType && isAllowedExtension) {
    return cb(null, true);
  } else {
    // Provide specific error message
    const errorMessage = !isAllowedMimeType 
      ? `Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, GIF, WEBP, SVG) are allowed.`
      : `Invalid file extension: ${fileExtension}. Only .jpg, .jpeg, .png, .gif, .webp, .svg files are allowed.`;
    
    cb(new Error(errorMessage), false);
  }
};

// ✅ Configure multer with enhanced security
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (suitable for blog/portfolio images)
    files: 10,                 // Max 10 files per request
    fieldNameSize: 100,        // Max field name size
    fieldSize: 1024 * 1024     // Max field value size (1MB)
  },
  fileFilter: fileFilter
});

// ✅ Enhanced error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.error('📁 Upload error:', err.message);

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB per file.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded. Maximum is 10 files per request.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field in form data.'
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({
          success: false,
          message: 'Form field name too long.'
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          success: false,
          message: 'Form field value too large.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Upload error: ' + err.message
        });
    }
  }

  // Handle custom file type errors
  if (err.message.includes('Invalid file type') || err.message.includes('Invalid file extension')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Generic error
  next(err);
};

// ✅ Single file upload middleware
export const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  };
};

// ✅ Multiple files upload middleware
export const uploadArray = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  };
};

// ✅ Fields upload middleware
export const uploadFields = (fields = [{ name: 'image', maxCount: 1 }]) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  };
};

export default upload;