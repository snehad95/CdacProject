import express from 'express';
import { getAllUsers, changeUserRole } from '../controllers/userController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, teacherOrAdmin, getAllUsers);
router.put('/:id/role', protect, admin, changeUserRole);

export default router;
