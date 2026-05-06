import Course from '../models/Course.js';

export const createCourse = async (req, res) => {
  console.log("Create Course Request - Body:", req.body);
  console.log("Create Course Request - File:", req.file);
  try {
    let data = req.body;
    // If sent via FormData as a string
    if (typeof req.body.data === 'string') {
      data = JSON.parse(req.body.data);
      console.log("Parsed Data from FormData:", data);
    }
    
    if (req.file) {
      data.flyerUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      data.fileType = req.file.mimetype.split('/')[1].toUpperCase();
      const sizeKB = (req.file.size / 1024).toFixed(0);
      data.fileSize = sizeKB > 1000 ? (sizeKB / 1024).toFixed(1) + ' MB' : sizeKB + ' KB';
      const now = new Date();
      data.uploadDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    }

    const course = new Course(data);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ category: 1, createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  console.log("Update Course Request - Body:", req.body);
  console.log("Update Course Request - File:", req.file);
  try {
    let data = req.body;
    if (typeof req.body.data === 'string') {
      data = JSON.parse(req.body.data);
      console.log("Parsed Data from FormData:", data);
    }

    if (req.file) {
      data.flyerUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      data.fileType = req.file.mimetype.split('/')[1].toUpperCase();
      const sizeKB = (req.file.size / 1024).toFixed(0);
      data.fileSize = sizeKB > 1000 ? (sizeKB / 1024).toFixed(1) + ' MB' : sizeKB + ' KB';
      const now = new Date();
      data.uploadDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    }

    const course = await Course.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
