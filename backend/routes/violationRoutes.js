import express from 'express';
import { logViolation, getViolationsByExam } from '../controllers/violationController.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, logViolation);
router.get('/exam/:examId', protect, teacherOrAdmin, getViolationsByExam);

export default router;
