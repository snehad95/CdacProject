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
      const isSubjective = question && question.type === 'subjective';
      const isCoding = question && question.type === 'coding';
      const qMarks = question ? (question.marks || 1) : 1;
      
      if (isSubjective) {
        if (ans.subjectiveAnswer) {
          attemptedQuestions += 1;
        }
        return {
          questionId: ans.questionId,
          subjectiveAnswer: ans.subjectiveAnswer,
          isCorrect: false,
          marksObtained: 0
        };
      } else if (isCoding) {
        if (ans.sourceCode) {
          attemptedQuestions += 1;
        }
        const marksAwarded = Number(ans.marksObtained) || 0;
        score += marksAwarded;
        return {
          questionId: ans.questionId,
          sourceCode: ans.sourceCode,
          language: ans.language,
          testResults: ans.testResults || { passed: 0, total: 0 },
          isCorrect: marksAwarded === qMarks,
          marksObtained: marksAwarded
        };
      } else {
        const isCorrect = question && question.options.find(opt => opt.text === ans.selectedOptionText)?.isCorrect;
        let marksObtained = 0;
        if (ans.selectedOptionText) {
          attemptedQuestions += 1;
          if (isCorrect) {
            marksObtained = qMarks;
            score += qMarks;
          } else {
            // Negative marking logic
            if (examDetails.negativeMarking && examDetails.negativeMarks) {
              marksObtained = -examDetails.negativeMarks;
              score -= examDetails.negativeMarks;
            }
          }
        }
        return {
          questionId: ans.questionId,
          selectedOptionText: ans.selectedOptionText,
          isCorrect: !!isCorrect,
          marksObtained
        };
      }
    });

    const maxPossibleScore = questions.reduce((acc, q) => acc + (q.marks || 1), 0);
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
    const results = await Result.find({ userId })
      .populate('examId')
      .populate('answers.questionId')
      .lean();

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
      .populate('answers.questionId')
      .sort({ score: -1, submittedAt: 1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const gradeSubjectiveAnswer = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { questionId, marksObtained } = req.body;

    const resultDoc = await Result.findById(resultId).populate('examId');
    if (!resultDoc) {
      return res.status(404).json({ message: "Result not found" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Ensure marksObtained is not greater than the question's marks
    const maxMarks = question.marks || 1;
    if (marksObtained < 0 || marksObtained > maxMarks) {
      return res.status(400).json({ message: `Marks obtained must be between 0 and ${maxMarks}` });
    }

    // Update the specific answer
    const answer = resultDoc.answers.find(ans => ans.questionId.toString() === questionId);
    if (!answer) {
      return res.status(400).json({ message: "Answer for this question not found in result" });
    }

    answer.marksObtained = marksObtained;
    answer.isCorrect = marksObtained > 0;

    // Recalculate total score
    let newScore = 0;
    for (const ans of resultDoc.answers) {
      newScore += ans.marksObtained || 0;
    }
    resultDoc.score = newScore;

    // Recalculate pass status
    const allQuestions = await Question.find({ examId: resultDoc.examId._id });
    const maxPossibleScore = allQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
    const percentage = maxPossibleScore > 0 ? (newScore / maxPossibleScore) * 100 : 0;
    
    if (resultDoc.examId && resultDoc.examId.passingScore) {
      resultDoc.passed = percentage >= resultDoc.examId.passingScore;
    }

    await resultDoc.save();

    // Populate and send back updated result
    const updatedResult = await Result.findById(resultId)
      .populate('examId')
      .populate('answers.questionId')
      .lean();

    res.status(200).json(updatedResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
