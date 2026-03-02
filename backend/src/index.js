// src/index.js
import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import receiptRoutes from './routes/receipts.js';

// Middleware
import { protect } from './middleware/authMiddleware.js';

// DB
import connectDB from './config/db.js';

/* =========================================================
   ENV VALIDATION
========================================================= */
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'FRONTEND_URL', 'RESEND_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length) {
  console.error('❌ Missing env vars:', missingEnvVars);
  process.exit(1);
}

/* =========================================================
   APP SETUP
========================================================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('trust proxy', 1);

/* =========================================================
   CORS
========================================================= */
const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/$/, '');

const allowedOrigins = [
  FRONTEND_URL,
  'https://www.optimaswifi.co.ke',
  'https://optimaswifi.co.ke',
  'https://optimasfibre.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002'
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

/* =========================================================
   SECURITY & CORE MIDDLEWARE
========================================================= */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

/* =========================================================
   RATE LIMITING
========================================================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 200 : 2000,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

/* =========================================================
   LOGGING
========================================================= */
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

/* =========================================================
   HEALTH
========================================================= */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

/* =========================================================
   ROUTES (🔥 FIXED)
========================================================= */
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', blogRoutes);
app.use('/api/settings', protect, settingRoutes);

// 🔥🔥🔥 CRITICAL FIX — NO `protect` HERE
app.use('/api/invoices', invoiceRoutes);
app.use('/api/receipts', receiptRoutes);

/* =========================================================
   404
========================================================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

/* =========================================================
   START SERVER
========================================================= */
const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 ENV: ${NODE_ENV}`);
  });
};

start();

export default app;
