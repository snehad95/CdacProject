import Violation from '../models/Violation.js';

export const logViolation = async (req, res) => {
  try {
    const { studentId, examId, violationType } = req.body;
    
    if (!studentId || !examId || !violationType) {
      return res.status(400).json({ message: "studentId, examId and violationType are required." });
    }

    const newViolation = new Violation({
      studentId,
      examId,
      violationType
    });

    await newViolation.save();
    res.status(201).json(newViolation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getViolationsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const violations = await Violation.find({ examId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
