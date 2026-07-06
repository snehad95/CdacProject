import Question from '../models/Question.js';
import Exam from '../models/Exam.js';

export const addQuestion = async (req, res) => {
  try {
    const {
      examId,
      practiceTestId,
      text,
      type,
      options,
      marks,
      workspaceLines,
      title,
      description,
      wordLimit,
      sampleAnswer,
      constraints,
      sampleInput,
      sampleOutput,
      allowedLanguages,
      timeLimit,
      memoryLimit,
      testCases,
      timerDuration
    } = req.body;
    let imageUrl = null;
    
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const parsedOptions = options ? (typeof options === 'string' ? JSON.parse(options) : options) : [];
    const parsedAllowedLanguages = allowedLanguages ? (typeof allowedLanguages === 'string' ? JSON.parse(allowedLanguages) : allowedLanguages) : ['java', 'python', 'cpp'];
    const parsedTestCases = testCases ? (typeof testCases === 'string' ? JSON.parse(testCases) : testCases) : [];

    const newQuestion = new Question({
      examId: examId || undefined,
      practiceTestId: practiceTestId || undefined,
      text,
      type: type || 'mcq',
      options: parsedOptions,
      imageUrl,
      marks: Number(marks) || 1,
      workspaceLines: Number(workspaceLines) || 10,
      title: title || '',
      description: description || '',
      wordLimit: Number(wordLimit) || 500,
      sampleAnswer: sampleAnswer || '',
      constraints: constraints || '',
      sampleInput: sampleInput || '',
      sampleOutput: sampleOutput || '',
      allowedLanguages: parsedAllowedLanguages,
      timeLimit: Number(timeLimit) || 2,
      memoryLimit: Number(memoryLimit) || 256,
      testCases: parsedTestCases,
      timerDuration: Number(timerDuration) || 0
    });

    await newQuestion.save();

    if (examId) {
      const allQuestions = await Question.find({ examId });
      const totalMarks = allQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
      await Exam.findByIdAndUpdate(examId, { totalMarks });
    }

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

export const getQuestionsByPracticeTest = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const questions = await Question.find({ practiceTestId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addQuestionsBulk = async (req, res) => {
  try {
    const { examId, practiceTestId, questions } = req.body;

    if (!examId && !practiceTestId) {
      return res.status(400).json({ message: "Target examId or practiceTestId is required." });
    }

    const parsedQuestions = questions.map(q => ({
      examId: examId || undefined,
      practiceTestId: practiceTestId || undefined,
      text: q.text,
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

    const inserted = await Question.insertMany(parsedQuestions);

    if (examId) {
      const allQuestions = await Question.find({ examId });
      const totalMarks = allQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
      await Exam.findByIdAndUpdate(examId, { totalMarks });
    }

    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (question.examId) {
      const allQuestions = await Question.find({ examId: question.examId });
      const totalMarks = allQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
      await Exam.findByIdAndUpdate(question.examId, { totalMarks });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
