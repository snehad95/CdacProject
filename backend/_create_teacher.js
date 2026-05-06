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
    const hashedPassword = await bcrypt.hash('teacher123', salt);
    
    await User.findOneAndUpdate(
      { email: 'teacher@cdac.com' },
      {
        name: 'Lead Teacher',
        email: 'teacher@cdac.com',
        password: hashedPassword,
        role: 'teacher'
      },
      { upsert: true, new: true }
    );
    
    console.log("Teacher account created/verified! Email: teacher@cdac.com, Password: teacher123");
    process.exit(0);
  })
  .catch(err => {
    console.error("MongoDB Connection Error: ", err);
    process.exit(1);
  });
