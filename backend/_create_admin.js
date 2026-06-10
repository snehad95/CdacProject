import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cdac-examweb';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.findOneAndUpdate(
      { email: 'admin@admin.com' },
      {
        // name: 'Super Admin',
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    
    console.log("Admin account created/verified! Email: admin@admin.com, Password: admin123");
    process.exit(0);
  })
  .catch(err => {
    console.error("MongoDB Connection Error: ", err);
    process.exit(1);
  });
