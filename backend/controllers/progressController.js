import ExamProgress from '../models/ExamProgress.js';

export const saveProgress = async (req, res) => {
  try {
    const { studentId, examId, currentQuestionId, answers } = req.body;

    if (!studentId || !examId) {
      return res.status(400).json({ message: "studentId and examId are required." });
    }

    const progress = await ExamProgress.findOneAndUpdate(
      { studentId, examId },
      { studentId, examId, currentQuestionId, answers },
      { new: true, upsert: true }
    );

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    const progress = await ExamProgress.findOne({ studentId, examId });
    if (!progress) {
      return res.status(200).json(null);
    }
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProgress = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    await ExamProgress.findOneAndDelete({ studentId, examId });
    res.status(200).json({ message: "Progress progress cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
