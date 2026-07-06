import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
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
  violationType: {
    type: String,
    required: true // 'Fullscreen Exit', 'Tab Change', 'Window Blur', 'Refresh Attempt'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Violation', violationSchema);
