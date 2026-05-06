import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
  },
  passingScore: {
    type: Number,
    required: true,
    default: 40
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resultsPublished: {
    type: Boolean,
    default: false
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  negativeMarks: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
