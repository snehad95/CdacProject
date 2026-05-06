import express from 'express';
import multer from 'multer';
import { addQuestion, getQuestionsByExam, deleteQuestion } from '../controllers/questionController.js';

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

router.post('/', upload.single('image'), addQuestion);
router.get('/exam/:examId', getQuestionsByExam);
router.delete('/:id', deleteQuestion);

export default router;
