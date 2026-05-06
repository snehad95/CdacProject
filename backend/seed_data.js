import mongoose from 'mongoose';
import PracticeTest from './models/PracticeTest.js';
import Exam from './models/Exam.js';
import Question from './models/Question.js';
import dotenv from 'dotenv';

dotenv.config();

const CONNECTION_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cdac-examweb';
const adminId = '69e5e511121880e77769316f'; 

const seedData = async () => {
  try {
    await mongoose.connect(CONNECTION_URL);
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed Practice Tests
    const practiceTests = [
      {
        title: 'Software Development',
        description: 'Practice questions on Java, C++, and Web Technologies.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500',
        createdBy: adminId
      },
      {
        title: 'Network Security',
        description: 'Practice test for Cyber Security and Networking fundamentals.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=500',
        createdBy: adminId
      },
      {
        title: 'Operating Systems',
        description: 'Explore OS concepts, Memory management, and File systems.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500',
        createdBy: adminId
      }
    ];

    await PracticeTest.deleteMany({});
    const createdPracticeTests = await PracticeTest.insertMany(practiceTests);
    console.log('✅ Seeded Practice Tests');

    // 2. Seed Exams
    const exams = [
      {
        title: 'CDAC Entrance Exam 2026',
        category: 'Entrance',
        description: 'Entrance examination for C-DAC Post Graduate Diploma courses.',
        startTime: new Date('2026-05-10T10:00:00'),
        endTime: new Date('2026-05-10T13:00:00'),
        durationMinutes: 180,
        passingScore: 40,
        totalMarks: 3,
        resultsPublished: false,
        createdBy: adminId
      }
    ];

    await Exam.deleteMany({});
    const createdExams = await Exam.insertMany(exams);
    console.log('✅ Seeded Exams');

    // 3. Seed Questions for the Exam
    const examId = createdExams[0]._id;
    const questions = [
      {
        examId,
        text: 'What is the correct way to declare a constant in JavaScript?',
        options: [
          { text: 'var x = 10;', isCorrect: false },
          { text: 'let x = 10;', isCorrect: false },
          { text: 'const x = 10;', isCorrect: true },
          { text: 'constant x = 10;', isCorrect: false }
        ],
        createdBy: adminId
      },
      {
        examId,
        text: 'Which data structure follows the LIFO (Last In First Out) principle?',
        options: [
          { text: 'Queue', isCorrect: false },
          { text: 'Stack', isCorrect: true },
          { text: 'Linked List', isCorrect: false },
          { text: 'Tree', isCorrect: false }
        ],
        createdBy: adminId
      },
      {
        examId,
        text: 'Identify the protocol used for secure web communication.',
        options: [
          { text: 'HTTP', isCorrect: false },
          { text: 'FTP', isCorrect: false },
          { text: 'HTTPS', isCorrect: true },
          { text: 'SMTP', isCorrect: false }
        ],
        createdBy: adminId
      }
    ];

    await Question.deleteMany({ examId }); // Only delete questions for this seeded exam
    await Question.insertMany(questions);
    console.log('✅ Seeded Questions');

    console.log('\n🌟 Data seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
