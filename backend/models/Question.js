import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: false,
  },
  practiceTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeTest',
    required: false,
  },
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    enum: ['mcq', 'subjective'],
    default: 'mcq'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  marks: {
    type: Number,
    default: 1
  },
  workspaceLines: {
    type: Number,
    default: 10
  }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
