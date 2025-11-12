// server.js — FINAL BACKEND VERSION (Mongoose Error Handling Improved)
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
import mongoose from 'mongoose'; // Import mongoose for error type check

// Routes
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

// DB connection
import connectDB from './config/db.js';

// Middleware
import { protect } from './middleware/authMiddleware.js';

// ✅ Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'FRONTEND_URL'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// Normalize FRONTEND_URL (remove trailing slash and spaces)
const FRONTEND_URL = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
console.log('🌍 FRONTEND_URL (sanitized):', FRONTEND_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Logging setup
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

// ✅ Security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                // Added opt-in for potential cloud storage or CDN images
                imgSrc: ["'self'", "data:", "https:", "blob:"], 
                scriptSrc: ["'self'", "'unsafe-inline'"],
                // Added allowed origins for connection headers
                connectSrc: ["'self'", "https://optimasfibre.onrender.com", "http://localhost:10000", "https://optimaswifi.co.ke"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// ✅ CORS: Build clean, normalized allowed origins
const allowedOrigins = [
    FRONTEND_URL,
    'https://www.optimaswifi.co.ke',
    'https://optimasfibre.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
    .filter(Boolean)
    .map(origin => origin.trim())
    .filter((origin, i, self) => self.indexOf(origin) === i); // dedupe

console.log('✅ Allowed CORS origins:', allowedOrigins);

// Apply CORS middleware
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl) or if origin is explicitly allowed
            if (!origin || allowedOrigins.includes(origin.trim())) { 
                return callback(null, true);
            }
            
            // Allow localhost/127.0.0.1 origins if any variation is allowed in the list (simplifies configuration)
            if (NODE_ENV === 'development' && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
                return callback(null, true);
            }
            
            console.warn(`❌ CORS blocked: ${origin}`);
            return callback(new Error(`CORS: Origin ${origin} not permitted`), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        optionsSuccessStatus: 200,
    })
);

// ✅ UNIVERSAL PREFLIGHT HANDLER
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        // Reuse CORS middleware for preflight
        cors()(req, res, () => {
            res.status(204).end(); // Standard preflight response
        });
    } else {
        next();
    }
});

// ✅ Rate limiting
app.use(
    '/api/',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: NODE_ENV === 'production' ? 100 : 1000,
        message: { success: false, message: 'Too many requests. Please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// ✅ Body parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ MongoDB injection sanitization
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    // Strips potential MongoDB operator strings from user input
                    const dangerousPatterns = [
                        /\$where/i, /\$ne/i, /\$nin/i, /\$gt/i, /\$gte/i,
                        /\$lt/i, /\$lte/i, /\$regex/i, /\$options/i,
                        /\$expr/i, /\$jsonSchema/i, /\$mod/i, /\$text/i,
                        /\$search/i, /\$all/i, /\$elemMatch/i, /\$size/i
                    ];
                    for (const pattern of dangerousPatterns) {
                        obj[key] = obj[key].replace(pattern, '');
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    sanitize(obj[key]);
                }
            }
        }
    };
    sanitize(req.body);
    sanitize(req.query);
    next();
});

// ✅ Logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', { stream: accessLogStream }));

// ✅ Static files
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ✅ Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy ✅',
        timestamp: new Date().toISOString(),
        env: NODE_ENV,
        allowedOrigins,
    });
});

// ✅ Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 Optimas Fibre Backend running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            blog: '/api/blog',
            portfolio: '/api/portfolio',
            settings: '/api/settings (protected)',
            invoices: '/api/invoices',
            health: '/health',
        },
    });
});

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', protect, settingRoutes);
app.use('/api/invoices', invoiceRoutes);

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path,
    });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    console.error('❌ Global error:', err.stack || err.message);

    // Mongoose Validation Error (if missed by the controller)
    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation Failed: ' + Object.values(err.errors).map(e => e.message).join(', ');
    } 
    // MongoDB Duplicate Key Error (E11000)
    else if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate key error: A unique field already exists.';
    }
    // CORS Error handling
    else if (message.includes('CORS')) {
        statusCode = 403;
        message = 'CORS policy violation';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// ✅ Start server
const startServer = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await connectDB();

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🎉 Server running in ${NODE_ENV} mode`);
            console.log(`🌐 Port: ${PORT}`);
            console.log(`🔗 Health: http://localhost:${PORT}/health`);
            console.log(`✅ Started at: ${new Date().toISOString()}`);
        });

        const shutdown = (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
            setTimeout(() => {
                console.error('❌ Forced shutdown after 10s');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('unhandledRejection', (reason) => {
            console.error('❌ Unhandled Rejection:', reason);
            shutdown('Unhandled Rejection');
        });
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            shutdown('Uncaught Exception');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();