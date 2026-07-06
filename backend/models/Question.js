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
    enum: ['mcq', 'subjective', 'coding'],
    default: 'mcq'
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  wordLimit: {
    type: Number,
    default: 500
  },
  sampleAnswer: {
    type: String,
    default: ''
  },
  constraints: {
    type: String,
    default: ''
  },
  sampleInput: {
    type: String,
    default: ''
  },
  sampleOutput: {
    type: String,
    default: ''
  },
  allowedLanguages: {
    type: [String],
    default: ['java', 'python', 'cpp']
  },
  timeLimit: {
    type: Number,
    default: 2
  },
  memoryLimit: {
    type: Number,
    default: 256
  },
  testCases: [{
    input: String,
    output: String,
    isPublic: { type: Boolean, default: false }
  }],
  timerDuration: {
    type: Number,
    default: 0
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
