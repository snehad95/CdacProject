import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  categoryBgColor: { type: String, default: '#f8a39a' },
  title: { type: String, required: true },
  fullName: { type: String, required: true },
  abbr: { type: String, required: true },
  iconColor: { type: String, default: '#2a6ce4' },
  focus: { type: String },
  eligibility: { type: String },
  fees: { type: String },
  contents: [{
    title: String,
    duration: String,
    modules: [String]
  }],
  outcome: { type: String },
  training: [{
    name: String,
    address: String,
    phone: String,
    contact: String,
    email: String,
    otherCourses: String
  }],
  faqs: [{
    q: String,
    a: String
  }],
  flyerUrl: { type: String, default: '/PDF_PGCP_AC.pdf' },
  fileType: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '992 KB' },
  uploadDate: { type: String, default: '27/11/2025' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', courseSchema);
