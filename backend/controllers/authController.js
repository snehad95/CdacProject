import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }
    const emailClean = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: emailClean });
    if (existingUser) return res.status(400).json({ message: "User already exists with this email." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create({ name: name.trim(), email: emailClean, password: hashedPassword, role: role || 'student' });

    const sessionId = crypto.randomBytes(16).toString('hex');
    result.sessionId = sessionId;
    await result.save();

    const token = jwt.sign(
      { email: result.email, id: result._id, role: result.role, name: result.name, sessionId },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: "5h" }
    );

    res.status(201).json({ 
      message: "User registered successfully", 
      user: { id: result._id, email: result.email, role: result.role, name: result.name },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }
    const emailClean = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: emailClean });
    if (!existingUser) return res.status(404).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials." });

    const sessionId = crypto.randomBytes(16).toString('hex');
    existingUser.sessionId = sessionId;
    await existingUser.save();

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id, role: existingUser.role, name: existingUser.name, sessionId },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: "5h" }
    );

    res.status(200).json({ user: { id: existingUser._id, email: existingUser.email, role: existingUser.role, name: existingUser.name }, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};
