import express from 'express';
import { createExam, getExams, updateExam, deleteExam } from '../controllers/examController.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, teacherOrAdmin, createExam);
router.get('/', getExams);
router.put('/:id', protect, teacherOrAdmin, updateExam);
router.delete('/:id', protect, teacherOrAdmin, deleteExam);

export default router;
