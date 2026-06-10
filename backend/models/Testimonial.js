import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  profileImageUrl: {
    type: String,
    default: null,
  },
  videoUrl: {
    type: String,
    default: null,
  },
  feedback: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isPublished: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
