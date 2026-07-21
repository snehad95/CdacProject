import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';

export const createExam = async (req, res) => {
  try {
    const { title, category, description, startTime, endTime, durationMinutes, passingScore, resultsPublished, negativeMarking, negativeMarks, mcqDuration, subjectiveDuration, codingDuration, questions } = req.body;
    
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
      mcqDuration: mcqDuration || 0,
      subjectiveDuration: subjectiveDuration || 0,
      codingDuration: codingDuration || 0,
      createdBy: req.user?._id || '000000000000000000000000'
    });

    await newExam.save();

    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map(q => ({
        examId: newExam._id,
        text: q.text || '',
        type: q.type || 'mcq',
        options: q.options || [],
        marks: Number(q.marks) || 1,
        workspaceLines: Number(q.workspaceLines) || 10,
        title: q.title || '',
        description: q.description || '',
        wordLimit: Number(q.wordLimit) || 500,
        sampleAnswer: q.sampleAnswer || '',
        constraints: q.constraints || '',
        sampleInput: q.sampleInput || '',
        sampleOutput: q.sampleOutput || '',
        allowedLanguages: q.allowedLanguages || ['java', 'python', 'cpp'],
        timeLimit: Number(q.timeLimit) || 2,
        memoryLimit: Number(q.memoryLimit) || 256,
        testCases: q.testCases || [],
        timerDuration: Number(q.timerDuration) || 0
      }));
      await Question.insertMany(questionsToInsert);
      
      newExam.totalMarks = questionsToInsert.reduce((acc, q) => acc + (q.marks || 1), 0);
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
    const { title, category, description, startTime, endTime, durationMinutes, passingScore, resultsPublished, negativeMarking, negativeMarks, mcqDuration, subjectiveDuration, codingDuration } = req.body;

    const updatedExam = await Exam.findByIdAndUpdate(id, {
      title,
      category,
      description,
      startTime,
      endTime,
      durationMinutes,
      passingScore,
      resultsPublished,
      negativeMarking,
      negativeMarks,
      mcqDuration,
      subjectiveDuration,
      codingDuration
    }, { new: true });
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

    // Cascade delete associated questions and results
    await Question.deleteMany({ examId: id });
    await Result.deleteMany({ examId: id });

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
