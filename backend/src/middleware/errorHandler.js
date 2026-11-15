// Central error handling. Express 5 forwards errors thrown in async handlers here.
import multer from 'multer';
import { isProduction } from '../config/env.js';
import { isUuid } from '../models/helpers.js';

/** Builds an error that is safe to show to the client. */
export const httpError = (statusCode, message, extra = {}) =>
  Object.assign(new Error(message), { statusCode, expose: true, ...extra });

/** Route-param guard: an id that is not a UUID can never match a row, so answer 404 early. */
export const requireUuidParam = (label) => (req, res, next, value) => {
  if (isUuid(value)) return next();
  return res.status(404).json({ success: false, message: `${label} not found` });
};

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found', path: req.originalUrl });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return;

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'value';
    return res.status(400).json({ success: false, message: `${field} already exists`, field });
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((item) => item.message);
    return res.status(400).json({ success: false, message: errors.join(', ') || 'Validation error', errors });
  }

  if (err.name === 'SequelizeDatabaseError' && ['22P02', '22007', '22008', '22003', '22001'].includes(err.original?.code)) {
    return res.status(400).json({ success: false, message: 'Invalid value in request' });
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (maximum 5 MB)' : err.message;
    return res.status(400).json({ success: false, message });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request is too large' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
  }

  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error('❌ Error:', err);

  const showMessage = err.expose || status < 500 || !isProduction;
  res.status(status).json({
    success: false,
    message: showMessage ? err.message : 'Server error. Please try again later.'
  });
};
