import User from '../models/User.js';
import Course from '../models/Course.js';
import PracticeTest from '../models/PracticeTest.js';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import Testimonial from '../models/Testimonial.js';
import Message from '../models/Message.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { seedCourses } from '../seed_courses.js';
import { seedData } from '../seed_data.js';

export const autoSeedIfEmpty = async () => {
  try {
    const courseCount = await Course.countDocuments();
    const testCount = await PracticeTest.countDocuments();
    const userCount = await User.countDocuments();

    if (courseCount === 0 || testCount === 0 || userCount === 0) {
      console.log('🌱 Database is empty or partially empty. Initiating automatic seeding...');

      // 1. Seed courses if none
      if (courseCount === 0) {
        console.log('Seeding default courses...');
        await seedCourses(false);
      }

      // 2. Seed practice tests and exams
      if (testCount === 0) {
        console.log('Seeding practice tests, exams, and questions...');
        await seedData(false);
      }

      // 3. Ensure admin and teacher users exist
      const adminExists = await User.findOne({ email: 'admin@admin.com' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const adminUser = new User({
          _id: '69e5e511121880e77769316f', // Ensure same admin ID as create scripts / seeds
          name: 'Admin',
          email: 'admin@admin.com',
          password: hashedPassword,
          role: 'admin'
        });
        await adminUser.save();
        console.log("Admin account created! Email: admin@admin.com, Password: admin123");
      }

      const teacherExists = await User.findOne({ email: 'teacher@cdac.com' });
      if (!teacherExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('teacher123', salt);
        const teacherUser = new User({
          name: 'Lead Teacher',
          email: 'teacher@cdac.com',
          password: hashedPassword,
          role: 'teacher'
        });
        await teacherUser.save();
        console.log("Teacher account created! Email: teacher@cdac.com, Password: teacher123");
      }

      // 4. Ensure some default testimonials exist
      const testimonialCount = await Testimonial.countDocuments();
      if (testimonialCount === 0) {
        console.log('Seeding default testimonials...');
        // Create a dummy student to be owner of testimonials
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('student123', salt);
        const student = await User.findOneAndUpdate(
          { email: 'student@cdac.com' },
          { name: 'Rohan Sharma', email: 'student@cdac.com', password: hashedPassword, role: 'student' },
          { upsert: true, new: true }
        );

        await Testimonial.insertMany([
          {
            studentId: student._id,
            studentName: 'Rohan Sharma',
            feedback: 'The practice portal was instrumental in my PGCP-AC preparation. The data structure questions are highly relevant!',
            status: 'approved',
            isPublished: true
          },
          {
            studentId: student._id,
            studentName: 'Neha Patel',
            feedback: 'I loved the user interface and instant scoring feedback in the Practice Arena. Highly recommend it to anyone preping for CDAC.',
            status: 'approved',
            isPublished: true
          }
        ]);
        console.log('✅ Seeded 2 testimonials.');
      }

      // 5. Ensure some default messages exist in the inbox so that message section has visible entries
      const messageCount = await Message.countDocuments();
      if (messageCount === 0) {
        await Message.insertMany([
          {
            name: 'Vikram Singh',
            email: 'vikram@gmail.com',
            subject: 'Inquiry regarding PGCP-ASSD fee installments',
            message: 'Hello, could you please clarify if the second installment of PGCP-ASSD fee can be paid in sub-installments? Thank you.'
          },
          {
            name: 'Aishwarya Roy',
            email: 'aishwarya@gmail.com',
            subject: 'Trouble accessing practice tests',
            message: 'Hi, I am unable to view the data structures quiz questions in my dashboard. Please assist.'
          }
        ]);
        console.log('✅ Seeded default contact messages.');
      }

      console.log('🌱 Automatic seeding completed successfully!');
    } else {
      console.log('✔ Database already has data. Skipping automatic seeding.');
    }
  } catch (error) {
    console.error('❌ Error during automatic seeding:', error);
  }
};
