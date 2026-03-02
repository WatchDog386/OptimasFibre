// backend/updateAdminRoles.mjs
import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';

const updateAdminRoles = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('❌ MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const adminEmails = [
      'fanteskorri36@gmail.com',
      'info@optimas.co.ke',
      'blukongo92@gmail.com',
      'kalumumutethya@gmail.com'
    ];

    for (const email of adminEmails) {
      const result = await User.updateOne(
        { email },
        { $set: { role: 'admin' } }
      );

      if (result.matchedCount === 0) {
        console.log(`❌ No user found with email: ${email}`);
      } else if (result.modifiedCount === 0) {
        console.log(`⚠️  User ${email} already had role:admin or no change needed`);
      } else {
        console.log(`✅ Successfully updated role to 'admin' for: ${email}`);
      }
    }

    console.log('🎉 Admin roles update completed.');
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin roles:', error.message);
    process.exit(1);
  }
};

updateAdminRoles();