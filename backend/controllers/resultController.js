import Result from '../models/Result.js';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';

export const submitExam = async (req, res) => {
  try {
    const { userId, examId, answers } = req.body; 

    // Check if user already submitted this exam
    const existingResult = await Result.findOne({ userId, examId });
    if (existingResult) {
      return res.status(400).json({ message: "You have already submitted this exam. Only one attempt is allowed." });
    }

    const questions = await Question.find({ examId });
    const examDetails = await Exam.findById(examId);
    let score = 0;
    let attemptedQuestions = 0;
    
    const gradedAnswers = answers.map(ans => {
      const question = questions.find(q => q._id.toString() === ans.questionId);
      const isCorrect = question && question.options.find(opt => opt.text === ans.selectedOptionText)?.isCorrect;
      
      if (ans.selectedOptionText) {
        attemptedQuestions += 1;
        if (isCorrect) {
          score += 1;
        } else {
          // Negative marking logic
          if (examDetails.negativeMarking && examDetails.negativeMarks) {
            score -= examDetails.negativeMarks;
          }
        }
      }
      
      return {
        questionId: ans.questionId,
        selectedOptionText: ans.selectedOptionText,
        isCorrect: !!isCorrect
      };
    });

    const maxPossibleScore = questions.length;
    const percentage = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
    const isPassed = examDetails && examDetails.passingScore ? (percentage >= examDetails.passingScore) : false;

    const newResult = new Result({
      userId,
      examId,
      score,
      totalQuestions: questions.length,
      attemptedQuestions,
      passed: isPassed,
      answers: gradedAnswers
    });

    await newResult.save();
    res.status(201).json(newResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResultsByStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await Result.find({ userId }).populate('examId').lean();

    // Attach dynamically calculated rank for each submitted exam (Only for passed students)
    const rankedResults = await Promise.all(results.map(async (r) => {
      if (!r.passed || !r.examId) {
        r.rank = 'N/A';
        return r;
      }

      // Find all PASSED results for this specific exam, sorted by score DESC, then time ASC
      const allPassedResults = await Result.find({ examId: r.examId._id, passed: true })
        .sort({ score: -1, submittedAt: 1 })
        .lean();
      
      const rankIndex = allPassedResults.findIndex(ex => ex._id.toString() === r._id.toString());
      r.rank = rankIndex !== -1 ? rankIndex + 1 : 'N/A';
      r.totalParticipants = allPassedResults.length;
      return r;
    }));

    res.status(200).json(rankedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResultsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    // For admin report: show all results, but indicate rank for passed ones
    const results = await Result.find({ examId })
      .populate('userId', 'name email')
      .populate('examId', 'title')
      .sort({ score: -1, submittedAt: 1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
