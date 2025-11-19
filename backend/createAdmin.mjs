import mongoose from "mongoose";
import "dotenv/config";
import User from "./src/models/User.js";

const createAdmins = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("❌ MONGODB_URI missing in .env");
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ Connected!");

    const admins = [
      { email: "fanteskorri36@gmail.com", password: "fantes36" },
      { email: "info@optimas.co.ke", password: "@Optimas$12" }
    ];

    for (const admin of admins) {
      console.log(`\n➡️ Processing admin: ${admin.email}`);

      let user = await User.findOne({ email: admin.email }).select("+password");

      if (user) {
        console.log("🔄 Existing user found. Updating...");
        user.password = admin.password; // triggers hashing
        user.role = "admin";
        await user.save();
        console.log(`✅ Updated admin → ${admin.email}`);
      } else {
        console.log("🆕 Creating new admin...");
        const newUser = new User({
          email: admin.email,
          password: admin.password,
          role: "admin",
        });
        await newUser.save();
        console.log(`✅ Created new admin → ${admin.email}`);
      }
    }

    console.log("\n🎉 All admin tasks complete.");
    await mongoose.connection.close();
    console.log("🔌 Connection closed.");
    process.exit(0);

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
};

createAdmins();
