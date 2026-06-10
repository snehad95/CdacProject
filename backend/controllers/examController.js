import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

export const createExam = async (req, res) => {
  try {
    const { title, category, description, startTime, endTime, durationMinutes, passingScore, resultsPublished, negativeMarking, negativeMarks, questions } = req.body;
    
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    const newExam = new Exam({
      title,
      category,
      description,
      startTime,
      endTime,
      durationMinutes,
      passingScore,
      resultsPublished: resultsPublished || false,
      negativeMarking: negativeMarking || false,
      negativeMarks: negativeMarks || 0,
      createdBy: req.user?._id || '000000000000000000000000'
    });

    await newExam.save();

    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map(q => ({
        examId: newExam._id,
        text: q.text,
        options: q.options
      }));
      await Question.insertMany(questionsToInsert);
      
      newExam.totalMarks = questions.length;
      await newExam.save();
    }

    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, startTime, endTime, durationMinutes, passingScore, resultsPublished } = req.body;

    const updatedExam = await Exam.findByIdAndUpdate(id, { title, category, description, startTime, endTime, durationMinutes, passingScore, resultsPublished }, { new: true });
    if (!updatedExam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExam = await Exam.findByIdAndDelete(id);
    if (!deletedExam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
