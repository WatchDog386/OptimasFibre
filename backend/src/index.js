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
import receiptRoutes from './routes/receipts.js'; // ✅ Fixed - 404 handler now uses valid syntax

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

// ✅ FIX: Add trust proxy for Render.com (IMPORTANT!)
app.set('trust proxy', 1); // Trust first proxy (Render's load balancer)

// Allowed origins for CORS
const allowedOrigins = [
  FRONTEND_URL,
  'https://www.optimaswifi.co.ke',
  'https://optimaswifi.co.ke',
  'https://optimasfibre.onrender.com',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

console.log('✅ Allowed CORS origins:', allowedOrigins);

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // mobile apps or curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log('🚫 CORS blocked for origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['Content-Disposition']
}));

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ✅ UPDATED: Rate limiting with proper proxy configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 200 : 2000,
  message: { success: false, message: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true } // ✅ Added for proxy support
});

const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 50 : 500,
  message: { success: false, message: 'Too many export requests. Please wait a while.' },
  validate: { trustProxy: true } // ✅ Added for proxy support
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/invoices/export', exportLimiter);
app.use('/api/receipts/export', exportLimiter);

// Logging
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
morgan.token('invoice-receipt', (req) => req.path.includes('/invoices') || req.path.includes('/receipts') ? `[${req.method} ${req.path}]` : '');
app.use(morgan(
  NODE_ENV === 'production'
    ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :invoice-receipt'
    : ':method :url :status :res[content-length] - :response-time ms :invoice-receipt',
  { stream: accessLogStream, skip: (req) => req.path === '/health' }
));

// Static directories
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const exportsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

// Health & root
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy ✅',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    proxy: req.ip, // ✅ Shows proxy IP
    features: { invoices: true, receipts: true, pdf_export: true, excel_export: true, email_sending: true }
  });
});

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 Optimas Fibre Backend running!', 
    version: '2.0.0', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    proxy: req.ip, // ✅ Shows proxy IP
    features: [
      'Complete Invoice Management',
      'Complete Receipt Management', 
      'PDF Export System',
      'Excel Export System',
      'Email Integration',
      'Advanced Search & Filtering',
      'Real-time Statistics'
    ]
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'Optimas Fibre API Documentation',
    endpoints: { 
      auth: { 
        login: 'POST /api/auth/login', 
        register: 'POST /api/auth/register', 
        logout: 'POST /api/auth/logout', 
        profile: 'GET /api/auth/profile' 
      }, 
      invoices: { 
        list: 'GET /api/invoices', 
        create: 'POST /api/invoices', 
        get: 'GET /api/invoices/:id', 
        update: 'PUT /api/invoices/:id', 
        delete: 'DELETE /api/invoices/:id', 
        markPaid: 'PATCH /api/invoices/:id/status', 
        export: { 
          pdf: 'GET /api/invoices/:id/export/pdf', 
          excel: 'GET /api/invoices/export/excel' 
        }, 
        send: 'POST /api/invoices/:id/send', 
        stats: 'GET /api/invoices/stats/summary' 
      }, 
      receipts: { 
        list: 'GET /api/receipts', 
        create: 'POST /api/receipts', 
        get: 'GET /api/receipts/:id', 
        update: 'PUT /api/receipts/:id', 
        delete: 'DELETE /api/receipts/:id', 
        export: { 
          pdf: 'GET /api/receipts/:id/export/pdf', 
          all_pdf: 'GET /api/receipts/export/pdf' 
        }, 
        send: 'POST /api/receipts/:id/send', 
        stats: 'GET /api/receipts/stats/summary' 
      }, 
      blog: 'GET/POST/PUT/DELETE /api/blog', 
      portfolio: 'GET/POST/PUT/DELETE /api/portfolio', 
      settings: 'GET/POST /api/settings' 
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', protect, settingRoutes);
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/receipts', protect, receiptRoutes); // ✅ Fixed - 404 handler now uses valid syntax

// System status
app.get('/api/system/status', protect, (req, res) => {
  res.json({
    server: { 
      status: 'healthy', 
      environment: NODE_ENV, 
      uptime: process.uptime(), 
      memory: process.memoryUsage(),
      proxy_enabled: true,
      client_ip: req.ip
    },
    database: { 
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', 
      name: mongoose.connection.name || 'N/A' 
    },
    features: { 
      invoices: { enabled: true }, 
      receipts: { enabled: true }, 
      file_operations: { 
        uploads: fs.existsSync(uploadsDir), 
        exports: fs.existsSync(exportsDir) 
      },
      email: { enabled: true, host: process.env.EMAIL_HOST || 'Not configured' }
    },
    timestamps: { 
      server_start: new Date(Date.now() - process.uptime() * 1000).toISOString(), 
      current_time: new Date().toISOString() 
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found', 
    path: req.path, 
    method: req.method,
    available_endpoints: ['/api/auth', '/api/invoices', '/api/receipts', '/api/blog', '/api/portfolio', '/api/settings']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', { 
    message: err.message, 
    stack: err.stack, 
    path: req.path, 
    method: req.method,
    client_ip: req.ip // ✅ Log client IP
  });
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Entry';
  }
  
  res.status(statusCode).json({ 
    success: false, 
    message, 
    timestamp: new Date().toISOString(), 
    ...(NODE_ENV === 'development' && { stack: err.stack }) 
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => () => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      console.log('🎯 Shutdown complete');
      process.exit(0);
    });
  });
  setTimeout(() => { 
    console.error('❌ Force shutdown'); 
    process.exit(1); 
  }, 10000);
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Public URL: https://optimasfibre.onrender.com`);
      console.log(`✅ Trust proxy: enabled (for Render.com)`);
    });
    
    process.on('SIGTERM', gracefulShutdown('SIGTERM'));
    process.on('SIGINT', gracefulShutdown('SIGINT'));
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;