import express from 'express';
import { getAllUsers, changeUserRole } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.put('/:id/role', changeUserRole);

export default router;
