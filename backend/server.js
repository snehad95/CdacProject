import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import userRoutes from './routes/userRoutes.js';
import practiceTestRoutes from './routes/practiceTestRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();

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

app.get('/', (req, res) => {
  res.send('CDAC ExamWeb API is running...');
});

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cdac-examweb';

mongoose.connect(CONNECTION_URL)
  .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
  .catch((error) => console.log(error.message));
