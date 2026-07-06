import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import userRoutes from './routes/userRoutes.js';
import practiceTestRoutes from './routes/practiceTestRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import violationRoutes from './routes/violationRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import compilerRoutes from './routes/compilerRoutes.js';
import { autoSeedIfEmpty } from './utils/autoSeed.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// A map to store active student timer statuses in memory (as a cache/backup sync)
const activeTimers = new Map();

io.on('connection', (socket) => {
  // Student joins a specific room for this exam
  socket.on('joinExam', ({ studentId, examId }) => {
    const roomName = `exam-${examId}-${studentId}`;
    socket.join(roomName);
    console.log(`[Socket] Student ${studentId} joined room ${roomName}`);
  });

  // Client emits ticks to back up remaining time and sync
  socket.on('tickTimer', ({ studentId, examId, remainingTime, questionId }) => {
    const timerKey = `${examId}-${studentId}`;
    activeTimers.set(timerKey, { remainingTime, questionId, lastUpdated: Date.now() });
    
    // Broadcast back to the room to confirm sync
    socket.to(`exam-${examId}-${studentId}`).emit('timerSynced', { remainingTime, questionId });
  });

  // Retrieve timer from memory cache
  socket.on('getTimerStatus', ({ studentId, examId }) => {
    const timerKey = `${examId}-${studentId}`;
    const status = activeTimers.get(timerKey);
    if (status) {
      socket.emit('timerStatusResponse', {
        remainingTime: status.remainingTime,
        questionId: status.questionId
      });
    } else {
      socket.emit('timerStatusResponse', null);
    }
  });

  socket.on('disconnect', () => {
    // Optional socket disconnect cleanup
  });
});

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practice-tests', practiceTestRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/compiler', compilerRoutes);

app.get('/', (req, res) => {
  res.send('CDAC ExamWeb API is running...');
});

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cdac-examweb';

mongoose.connect(CONNECTION_URL)
  .then(async () => {
    console.log("Connected to MongoDB.");
    await autoSeedIfEmpty();
    server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error) => console.log(error.message));
