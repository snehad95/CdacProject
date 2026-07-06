import mongoose from 'mongoose';

const examProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  currentQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOptionText: String,
    subjectiveAnswer: String,
    sourceCode: String,
    language: String,
    timeLeft: Number, // remaining time in seconds for this question or section
    locked: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

// Avoid duplicate progress logs per student per exam
examProgressSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export default mongoose.model('ExamProgress', examProgressSchema);
