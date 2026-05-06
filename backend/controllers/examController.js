import Exam from '../models/Exam.js';

export const createExam = async (req, res) => {
  try {
    const { title, category, description, startTime, endTime, durationMinutes, passingScore, resultsPublished } = req.body;
    
    // Verify times are valid dates
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
      createdBy: req.userId || '000000000000000000000000' // Placeholder until secure auth middleware
    });

    await newExam.save();
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
