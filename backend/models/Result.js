import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  attemptedQuestions: {
    type: Number,
    default: 0,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    selectedOptionText: String,
    subjectiveAnswer: String,
    sourceCode: String,
    language: String,
    testResults: {
      passed: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    isCorrect: Boolean,
    marksObtained: {
      type: Number,
      default: 0
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export default mongoose.model('Result', resultSchema);
