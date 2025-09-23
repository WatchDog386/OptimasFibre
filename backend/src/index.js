// backend/src/index.js

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
import multer from 'multer';

// Import routes
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

// Import DB connection function
import connectDB from './config/db.js';

// Import middleware
import { protect } from './middleware/authMiddleware.js';

// ✅ Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'FRONTEND_URL'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('❌ Please check your .env.keys file or Render dashboard for DOTENV_PRIVATE_KEY');
  process.exit(1);
}

// ✅ For debugging
console.log('🔧 Loaded MONGODB_URI:', process.env.MONGODB_URI ? 'Yes' : 'No');
console.log('🌍 Loaded FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('🔐 JWT_SECRET length:', process.env.JWT_SECRET?.length || 0, 'characters');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create log directory if it doesn't exist
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https:", "http:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// ✅ DYNAMIC CORS — Reads from environment variables
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://localhost:10000',
  'https://optimaswifi.co.ke',
  'https://optimasfibre.onrender.com'
]
  .filter(Boolean)
  .map(origin => origin.trim());

console.log('✅ Allowed CORS origins:', allowedOrigins.join(', '));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, server-side)
    if (!origin) {
      return callback(null, true);
    }

    console.log('🔍 CORS check for origin:', origin);

    if (!allowedOrigins.includes(origin)) {
      const msg = `❌ The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Compression & body parsers
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ MongoDB injection sanitization middleware
app.use((req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
});

function sanitizeObject(obj) {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        const prohibitedPatterns = [
          /\$where/i, /\$ne/i, /\$nin/i, /\$gt/i, /\$gte/i, 
          /\$lt/i, /\$lte/i, /\$regex/i, /\$options/i, /\$expr/i,
          /\$jsonSchema/i, /\$mod/i, /\$text/i, /\$search/i,
          /\$all/i, /\$elemMatch/i, /\$size/i
        ];
        prohibitedPatterns.forEach(pattern => {
          if (pattern.test(obj[key])) {
            obj[key] = obj[key].replace(pattern, '');
          }
        });
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    });
  }
}

// Logging
if (NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create portfolio uploads directory
const portfolioUploadsDir = path.join(uploadsDir, 'portfolio');
if (!fs.existsSync(portfolioUploadsDir)) {
  fs.mkdirSync(portfolioUploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Backend is running!');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', protect, settingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err.message);
  console.error('❌ Stack trace:', err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  if (err.message && err.message.includes('Only image files are allowed')) {
    statusCode = 400;
    message = 'Only image files are allowed';
  }
  if (err.message && err.message.includes('File too large')) {
    statusCode = 400;
    message = 'File size exceeds limit (5MB)';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { 
      stack: err.stack,
      fullError: err 
    })
  });
});

// Start server only after DB connects
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`✅ Listening on all interfaces (0.0.0.0:${PORT})`);
      console.log(`✅ Visit health check: http://localhost:${PORT}/health`);
      console.log(`✅ API endpoints:`);
      console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   - Blog: http://localhost:${PORT}/api/blog`);
      console.log(`   - Portfolio: http://localhost:${PORT}/api/portfolio`);
      console.log(`   - Settings: http://localhost:${PORT}/api/settings`);
    });

    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully…`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Promise Rejection:', err);
      shutdown('Unhandled Rejection');
    });
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      shutdown('Uncaught Exception');
    });

  } catch (err) {
    console.error('❌ Could not start server:', err);
    process.exit(1);
  }
};

startServer();