import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // should be 'student', 'teacher', or 'admin'

    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
