import express from 'express';
import multer from 'multer';
import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'flyer-' + Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', protect, admin, upload.single('flyer'), createCourse);
router.put('/:id', protect, admin, upload.single('flyer'), updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

export default router;
