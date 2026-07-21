import express from 'express';
import multer from 'multer';
import Certificate from '../models/Certificate.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'cert-' + Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// @desc    Upload Certificate PDF
// @route   POST /api/certificates
router.post('/', protect, teacherOrAdmin, upload.single('pdf'), async (req, res) => {
  try {
    const { studentId, examId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const pdfUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Check if certificate already exists for this student and exam
    let certificate = await Certificate.findOne({ studentId, examId });
    if (certificate) {
      certificate.pdfUrl = pdfUrl;
      certificate.isPublished = false; // reset publish status on re-upload
      await certificate.save();
    } else {
      certificate = new Certificate({
        studentId,
        examId,
        pdfUrl
      });
      await certificate.save();
    }

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Issue Dynamic Certificate (no file upload needed)
// @route   POST /api/certificates/dynamic
router.post('/dynamic', protect, teacherOrAdmin, async (req, res) => {
  try {
    const { studentId, examId } = req.body;
    if (!studentId || !examId) {
      return res.status(400).json({ message: 'Please provide studentId and examId' });
    }

    let certificate = await Certificate.findOne({ studentId, examId });
    if (certificate) {
      certificate.pdfUrl = 'DYNAMIC_CERTIFICATE';
      certificate.isPublished = true;
      await certificate.save();
    } else {
      certificate = new Certificate({
        studentId,
        examId,
        pdfUrl: 'DYNAMIC_CERTIFICATE',
        isPublished: true
      });
      await certificate.save();
    }

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Publish Certificate
// @route   PUT /api/certificates/:id/publish
router.put('/:id/publish', protect, teacherOrAdmin, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    certificate.isPublished = true;
    certificate.publishedAt = Date.now();
    await certificate.save();

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all certificates (admin view)
// @route   GET /api/certificates
router.get('/', protect, teacherOrAdmin, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('studentId', 'name email')
      .populate('examId', 'title');
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get published certificates for logged-in student
// @route   GET /api/certificates/my
router.get('/my', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ 
      studentId: req.user._id,
      isPublished: true
    }).populate('examId', 'title description durationMinutes');
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
router.delete('/:id', protect, teacherOrAdmin, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    await Certificate.deleteOne({ _id: req.params.id });
    res.json({ message: 'Certificate removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
