import express from 'express';
import { getAllUsers, changeUserRole, updateUserProfile, deleteUser } from '../controllers/userController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, teacherOrAdmin, getAllUsers);
router.put('/:id/role', protect, admin, changeUserRole);
router.put('/profile', protect, updateUserProfile);
router.delete('/:id', protect, admin, deleteUser);

export default router;
