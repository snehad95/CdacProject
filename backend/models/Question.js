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
  options: [{
    text: String,
    isCorrect: Boolean
  }],
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
