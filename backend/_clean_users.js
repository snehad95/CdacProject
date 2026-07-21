import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cdac-examweb';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB...");
    const salt = await bcrypt.genSalt(10);
    
    // Ensure Admin exists
    const adminPass = await bcrypt.hash('admin123', salt);
    await User.findOneAndUpdate(
      { email: 'admin@admin.com' },
      { name: 'Admin', email: 'admin@admin.com', password: adminPass, role: 'admin' },
      { upsert: true, new: true }
    );

    // Ensure Teacher exists
    const teacherPass = await bcrypt.hash('teacher123', salt);
    await User.findOneAndUpdate(
      { email: 'teacher@cdac.com' },
      { name: 'Lead Teacher', email: 'teacher@cdac.com', password: teacherPass, role: 'teacher' },
      { upsert: true, new: true }
    );

    // Delete all users EXCEPT admin and teacher roles
    const res = await User.deleteMany({
      role: { $nin: ['admin', 'teacher'] }
    });
    
    console.log(`🗑️ Removed ${res.deletedCount} student/other users from the database.`);
    
    // List remaining users
    const remainingUsers = await User.find({}, 'name email role');
    console.log("\n✅ Current Users in Database (Only Admin & Teacher):");
    remainingUsers.forEach(u => {
      console.log(`- [${u.role.toUpperCase()}] ${u.name} (${u.email})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error: ", err);
    process.exit(1);
  });
