// backend/src/config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Connects to MongoDB using the URI from environment variables.
 * @returns {Promise<void>} Resolves when connected, rejects on error.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
    }

    // Connect to MongoDB (Mongoose 6+ doesn't need deprecated options)
    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection event listeners for better observability
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected Successfully');
    });

    // Optional: Log when connection is open
    mongoose.connection.once('open', () => {
      console.log('🔌 MongoDB Connection Established');
    });

  } catch (error) {
    console.error('💥 Fatal MongoDB Connection Error:', error.message);
    console.error('Stack Trace:', error.stack);
    // In production, you might want to retry or notify monitoring instead of exiting
    process.exit(1);
  }
};

export default connectDB;