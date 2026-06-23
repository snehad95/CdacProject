import express from 'express';
import multer from 'multer';
import PracticeTest from '../models/PracticeTest.js';
import Question from '../models/Question.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// @desc    Get all practice tests
// @route   GET /api/practice-tests
router.get('/', async (req, res) => {
  try {
    const tests = await PracticeTest.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a practice test
// @route   POST /api/practice-tests
router.post('/', protect, teacherOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    let imagePath = '';
    
    if (req.file) {
      imagePath = `http://localhost:5000/uploads/${req.file.filename}`;
    } else {
      imagePath = req.body.image; // Fallback to URL if no file provided
    }

    const test = new PracticeTest({
      title,
      description,
      image: imagePath || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500',
      createdBy: req.user._id
    });
    const created = await test.save();

    if (req.body.questions) {
      const parsedQuestions = typeof req.body.questions === 'string' ? JSON.parse(req.body.questions) : req.body.questions;
      if (parsedQuestions && parsedQuestions.length > 0) {
        const questionsToInsert = parsedQuestions.map(q => ({
          practiceTestId: created._id,
          text: q.text,
          options: q.options
        }));
        await Question.insertMany(questionsToInsert);
      }
    }

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a practice test
// @route   PUT /api/practice-tests/:id
router.put('/:id', protect, teacherOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const test = await PracticeTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Not found' });

    test.title = req.body.title || test.title;
    test.description = req.body.description || test.description;
    if (req.file) {
      test.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updated = await test.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a practice test
router.delete('/:id', protect, teacherOrAdmin, async (req, res) => {
  try {
    const test = await PracticeTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Not found' });
    
    // Cascade delete associated questions
    await Question.deleteMany({ practiceTestId: req.params.id });
    await PracticeTest.deleteOne({ _id: req.params.id });
    res.json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
