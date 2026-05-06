import express from 'express';
import { submitExam, getResultsByStudent, getResultsByExam } from '../controllers/resultController.js';

const router = express.Router();

router.post('/submit', submitExam);
router.get('/student/:userId', getResultsByStudent);
router.get('/exam/:examId', getResultsByExam); // Used for ranking

export default router;
