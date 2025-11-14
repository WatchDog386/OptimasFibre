import dotenv from '@dotenvx/dotenvx';
dotenv.config();

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
import receiptRoutes from './routes/receipts.js'; // ✅ Import receipts route

// Middleware
import { protect } from './middleware/authMiddleware.js';

// DB connection
import connectDB from './config/db.js';

// Environment variables validation
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'FRONTEND_URL'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// FRONTEND_URL cleanup
const FRONTEND_URL = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
console.log('🌍 FRONTEND_URL (sanitized):', FRONTEND_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Allowed origins for CORS
const allowedOrigins = [
  FRONTEND_URL,
  'https://www.optimaswifi.co.ke',
  'https://optimaswifi.co.ke',
  'https://optimasfibre.onrender.com',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
].filter(Boolean);

console.log('✅ Allowed CORS origins:', allowedOrigins);

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next();

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  }

  if (req.method === 'OPTIONS') return res.sendStatus(204); // Preflight
  next();
});

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://optimasfibre.onrender.com", "http://localhost:10000", "https://optimaswifi.co.ke", "https://api.cloudinary.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Core middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: NODE_ENV === 'production' ? 100 : 1000,
    message: { success: false, message: 'Too many requests. Try again later.' },
  })
);

// Logging
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', { stream: accessLogStream }));

// Static uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Health & root endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy ✅', env: NODE_ENV, allowedOrigins });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: '🚀 Optimas Fibre Backend running!', version: '1.0.2', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', protect, settingRoutes);
app.use('/api/invoices', invoiceRoutes);

// ✅ Critical fix: mount receipts route with protect middleware
app.use('/api/receipts', protect, receiptRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err.stack || err.message);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Failed: ' + Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate key error: A unique field already exists.';
  } else if (message.includes('CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
  }

  res.status(statusCode).json({ success: false, message, stack: NODE_ENV === 'development' ? err.stack : undefined });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🎉 Server running in ${NODE_ENV} mode`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`✅ Receipt system ENABLED at /api/receipts`);
      console.log(`✅ Started at: ${new Date().toISOString()}`);
    });

    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => console.log('✅ Server closed'));
      setTimeout(() => { console.error('❌ Forced shutdown after 10s'); process.exit(1); }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();