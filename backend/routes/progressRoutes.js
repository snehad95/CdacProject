import express from 'express';
import { saveProgress, getProgress, deleteProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, saveProgress);
router.get('/:examId/:studentId', protect, getProgress);
router.delete('/:examId/:studentId', protect, deleteProgress);

export default router;
