import express from 'express';
import { createExam, getExams, updateExam, deleteExam } from '../controllers/examController.js';

const router = express.Router();

router.post('/', createExam);
router.get('/', getExams);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

export default router;
