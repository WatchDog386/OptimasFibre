// Express application (no network or database side effects — see index.js for startup).
import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import receiptRoutes from './routes/receipts.js';
import vacancyRoutes from './routes/vacancyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';

import { isDatabaseUp } from './config/db.js';
import { isProduction } from './config/env.js';
import { UPLOADS_DIR } from './config/paths.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// One reverse proxy (Nginx) sits in front of the app; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);
app.disable('x-powered-by');

/* ---------- CORS ---------- */
const allowedOrigins = new Set([
  ...(process.env.FRONTEND_URL || '').split(','),
  ...(process.env.CORS_ORIGINS || '').split(','),
  'https://www.optimaswifi.co.ke',
  'https://optimaswifi.co.ke',
  ...(isProduction ? [] : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'])
].map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean));

app.use(cors({
  // Requests from other origins simply get no CORS headers, so browsers block them.
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

/* ---------- Security & parsing ---------- */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
// Large limit because the dashboard uploads browser-generated PDFs and profile images as base64.
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(isProduction ? 'combined' : 'dev'));
}

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 600 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down and try again shortly.' }
}));

/* ---------- Health ---------- */
app.get('/health', async (req, res) => {
  const dbUp = await isDatabaseUp();
  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    status: dbUp ? 'healthy' : 'unhealthy',
    db: dbUp ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

/* ---------- Uploaded images ---------- */
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '7d',
  index: false,
  dotfiles: 'ignore',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
}));

/* ---------- Sitemap (Nginx forwards /sitemap.xml here) ---------- */
app.use(sitemapRoutes);

/* ---------- API ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
