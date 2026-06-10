import express from 'express';
import multer from 'multer';
import { addQuestion, getQuestionsByExam, getQuestionsByPracticeTest, addQuestionsBulk, deleteQuestion } from '../controllers/questionController.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/', protect, teacherOrAdmin, upload.single('image'), addQuestion);
router.post('/bulk', protect, teacherOrAdmin, addQuestionsBulk);
router.get('/exam/:examId', protect, getQuestionsByExam);
router.get('/practice-test/:practiceTestId', protect, getQuestionsByPracticeTest);
router.delete('/:id', protect, teacherOrAdmin, deleteQuestion);

export default router;
