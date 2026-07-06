import express from 'express';
import { executeCode, testCode } from '../controllers/compilerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/execute', protect, executeCode);
router.post('/test', protect, testCode);

export default router;
