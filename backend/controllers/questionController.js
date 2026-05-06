import Question from '../models/Question.js';
import Exam from '../models/Exam.js';

export const addQuestion = async (req, res) => {
  try {
    const { examId, text, options } = req.body;
    let imageUrl = null;
    
    // Check if an image was uploaded via Multer
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;

    const newQuestion = new Question({
      examId,
      text,
      options: parsedOptions,
      imageUrl
    });

    await newQuestion.save();

    // Auto-update totalMarks on the parent exam (1 mark per question)
    const questionCount = await Question.countDocuments({ examId });
    await Exam.findByIdAndUpdate(examId, { totalMarks: questionCount });

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const questions = await Question.find({ examId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // Auto-update totalMarks on the parent exam
    const questionCount = await Question.countDocuments({ examId: question.examId });
    await Exam.findByIdAndUpdate(question.examId, { totalMarks: questionCount });

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
