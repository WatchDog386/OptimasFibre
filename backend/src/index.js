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
import receiptRoutes from './routes/receipts.js';

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
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

console.log('✅ Allowed CORS origins:', allowedOrigins);

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('🚫 CORS blocked for origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
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
app.use(express.json({ limit: '50mb' })); // Increased for PDF/Excel exports
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Rate limiting - more generous for exports
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 200 : 2000,
  message: { success: false, message: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 50 : 500,
  message: { success: false, message: 'Too many export requests. Please wait a while.' },
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/invoices/export', exportLimiter);
app.use('/api/receipts/export', exportLimiter);

// Logging with enhanced format
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

// Custom morgan token for invoice/receipt operations
morgan.token('invoice-receipt', (req) => {
  if (req.path.includes('/invoices') || req.path.includes('/receipts')) {
    return `[${req.method} ${req.path}]`;
  }
  return '';
});

app.use(morgan(
  NODE_ENV === 'production' 
    ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :invoice-receipt'
    : ':method :url :status :res[content-length] - :response-time ms :invoice-receipt',
  { 
    stream: accessLogStream,
    skip: (req) => req.path === '/health' // Skip health checks in production logs
  }
));

// Static uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Create exports directory
const exportsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

// Health & root endpoints with enhanced status
app.get('/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'Server is healthy ✅',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    features: {
      invoices: true,
      receipts: true,
      pdf_export: true,
      excel_export: true,
      email_sending: true
    }
  };
  res.status(200).json(healthCheck);
});

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 Optimas Fibre Backend running!', 
    version: '2.0.0', 
    timestamp: new Date().toISOString(),
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

// API Documentation endpoint
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', protect, settingRoutes);

// ✅ Enhanced invoice routes with comprehensive features
app.use('/api/invoices', protect, invoiceRoutes);

// ✅ Enhanced receipt routes with comprehensive features
app.use('/api/receipts', protect, receiptRoutes);

// System status endpoint
app.get('/api/system/status', protect, (req, res) => {
  const status = {
    server: {
      status: 'healthy',
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name || 'N/A'
    },
    features: {
      invoices: {
        enabled: true,
        endpoints: ['CRUD', 'PDF Export', 'Excel Export', 'Email', 'Statistics']
      },
      receipts: {
        enabled: true,
        endpoints: ['CRUD', 'PDF Export', 'Bulk PDF Export', 'Email', 'Statistics']
      },
      file_operations: {
        uploads: fs.existsSync(uploadsDir),
        exports: fs.existsSync(exportsDir)
      }
    },
    timestamps: {
      server_start: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      current_time: new Date().toISOString()
    }
  };
  res.json(status);
});

// 404 handler with better error information
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found', 
    path: req.path,
    method: req.method,
    available_endpoints: [
      '/api/auth/*',
      '/api/invoices/*', 
      '/api/receipts/*',
      '/api/blog/*',
      '/api/portfolio/*',
      '/api/settings/*',
      '/health',
      '/api/docs'
    ]
  });
});

// Global error handler with enhanced error types
app.use((err, req, res, next) => {
  console.error('❌ Global error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Failed';
    details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  } 
  // Mongoose duplicate key errors
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Entry';
    const field = Object.keys(err.keyValue)[0];
    details = `${field} '${err.keyValue[field]}' already exists`;
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  // JWT expired
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // File system errors
  else if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
  }
  // CORS errors
  else if (message.includes('CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
  }
  // Rate limit errors
  else if (err.statusCode === 429) {
    statusCode = 429;
    message = 'Too many requests';
  }

  const errorResponse = {
    success: false,
    message,
    ...(details && { details }),
    ...(NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(errorResponse);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  return () => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Close server
    server.close(() => {
      console.log('✅ HTTP server closed');
      
      // Close database connection
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed');
        console.log('🎯 Shutdown complete');
        process.exit(0);
      });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
};

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🎉 ========================================`);
      console.log(`🚀 Optimas Fibre Backend Server Started!`);
      console.log(`🎯 ========================================`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 Port: ${PORT}`);
      console.log(`🕒 Started: ${new Date().toISOString()}`);
      console.log(`📊 ========================================`);
      console.log(`✅ Invoice System: FULLY ENABLED`);
      console.log(`   📝 CRUD Operations`);
      console.log(`   📄 PDF Export`);
      console.log(`   📊 Excel Export`);
      console.log(`   📧 Email Integration`);
      console.log(`   📈 Statistics & Analytics`);
      console.log(`✅ Receipt System: FULLY ENABLED`);
      console.log(`   📝 CRUD Operations`);
      console.log(`   📄 PDF Export`);
      console.log(`   📦 Bulk PDF Export`);
      console.log(`   📧 Email Integration`);
      console.log(`   📈 Statistics & Analytics`);
      console.log(`🔒 Authentication: JWT Protected`);
      console.log(`📡 CORS: Enabled for ${allowedOrigins.length} origins`);
      console.log(`🎯 ========================================`);
      console.log(`💡 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log(`🎯 ========================================\n`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', gracefulShutdown('SIGTERM'));
    process.on('SIGINT', gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;