import Testimonial from '../models/Testimonial.js';

export const createTestimonial = async (req, res) => {
  try {
    let data = req.body;
    if (req.body.data) {
      if (typeof req.body.data === 'string') {
        data = JSON.parse(req.body.data);
      } else if (typeof req.body.data === 'object') {
        data = req.body.data;
      }
    }

    const testimonial = new Testimonial({
      studentId: req.user._id,
      studentName: req.user.name,
      feedback: data.feedback,
      status: 'pending',
      isPublished: false
    });

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        testimonial.profileImageUrl = `http://localhost:5000/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.video && req.files.video[0]) {
        testimonial.videoUrl = `http://localhost:5000/uploads/${req.files.video[0].filename}`;
      }
    }

    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (err) {
    console.error("Error creating testimonial:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getMyTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPublishedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved', isPublished: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    let data = req.body;
    if (req.body.data) {
      if (typeof req.body.data === 'string') {
        data = JSON.parse(req.body.data);
      } else if (typeof req.body.data === 'object') {
        data = req.body.data;
      }
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (data.feedback !== undefined) testimonial.feedback = data.feedback;
    if (data.status !== undefined) testimonial.status = data.status;
    if (data.isPublished !== undefined) testimonial.isPublished = data.isPublished;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        testimonial.profileImageUrl = `http://localhost:5000/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.video && req.files.video[0]) {
        testimonial.videoUrl = `http://localhost:5000/uploads/${req.files.video[0].filename}`;
      }
    }

    await testimonial.save();
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
