import express from 'express';
import Message from '../models/Message.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log('Contact Message Received:', req.body);
    const newMessage = await Message.create({ name, email, subject, message });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin or Teacher
router.get('/', protect, teacherOrAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/Admin or Teacher
router.delete('/:id', protect, teacherOrAdmin, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
