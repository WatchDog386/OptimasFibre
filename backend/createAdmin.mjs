// backend/createAdmin.mjs
import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';

const createAdmins = async () => {
  try {
    // 1. Validate MongoDB URI
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('❌ MONGODB_URI is not defined in environment variables. Check your .env file.');
    }

    // 2. Connect to MongoDB
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // fail fast if can't connect
    });
    console.log('✅ Connected to MongoDB');

    // 3. Define admins
    const admins = [
      { email: 'fanteskorri36@gmail.com', password: 'fantes36' },
      { email: 'info@optimas.co.ke', password: '@Optimas$12' }
    ];

    // 4. Validate passwords meet minimum length (model requires 6+)
    for (const admin of admins) {
      if (admin.password.length < 6) {
        throw new Error(`❌ Password for ${admin.email} is too short. Must be at least 6 characters.`);
      }
    }

    // 5. Create admins
    for (const adminData of admins) {
      const { email, password } = adminData;

      // Check if already exists
      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`⚠️  Admin with email ${email} already exists. Skipping…`);
        continue;
      }

      // Create new admin
      const newAdmin = new User({
        email,
        password,
        role: 'admin' // ✅ Now your schema supports this!
      });

      await newAdmin.save();
      console.log(`✅ Admin created successfully → Email: ${email}, Role: ${newAdmin.role}`);
    }

    console.log('🎉 All admins created or skipped successfully.');

    // 6. Gracefully disconnect
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error during admin creation:');
    console.error(error.message);
    if (error.name === 'ValidationError') {
      console.error('📄 Validation failed. Check password length or email format.');
    }
    if (error.name === 'MongoServerSelectionError') {
      console.error('🌐 Could not connect to MongoDB. Check your MONGODB_URI and network.');
    }
    process.exit(1);
  }
};

// Run script
createAdmins();