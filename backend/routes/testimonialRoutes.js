import express from 'express';
import multer from 'multer';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';
import {
  createTestimonial,
  getMyTestimonials,
  getPublishedTestimonials,
  getAdminTestimonials,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController.js';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile image!'), false);
      }
    } else if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for testimonial video!'), false);
      }
    } else {
      cb(new Error('Unexpected field: ' + file.fieldname), false);
    }
  }
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// Public route
router.get('/', getPublishedTestimonials);

// Student route
router.get('/my', protect, getMyTestimonials);
router.post('/', protect, uploadFields, createTestimonial);

// Admin routes
router.get('/admin', protect, teacherOrAdmin, getAdminTestimonials);
router.put('/admin/:id', protect, teacherOrAdmin, uploadFields, updateTestimonial);
router.delete('/admin/:id', protect, teacherOrAdmin, deleteTestimonial);

export default router;
