import express from 'express';
import { submitExam, getResultsByStudent, getResultsByExam, gradeSubjectiveAnswer } from '../controllers/resultController.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', submitExam);
router.get('/student/:userId', getResultsByStudent);
router.get('/exam/:examId', getResultsByExam); // Used for ranking
router.put('/:resultId/grade', protect, teacherOrAdmin, gradeSubjectiveAnswer);

export default router;
