const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
  try {
    // Check if database is disconnected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection is offline. Please check your MongoDB Atlas network/IP whitelist." });
    }

    const {
      name,
      email,
      password,
      role,
      specialization,
      experience,
      fees,
      bio
    } = req.body;

    // check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      specialization,
      experience,
      fees,
      bio
    });

    const { password: _, ...userData } = user.toObject();
    
    // sign token 
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user: userData });

  } catch (err) {
    if (err.message.includes("timed out")) {
      return res.status(503).json({ message: "Database connection timeout. Please check your internet or MongoDB Atlas IP whitelist." });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Check if database is disconnected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection is offline. Please check your MongoDB Atlas network/IP whitelist." });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const { password: _, ...userData } = user.toObject();
    
    // sign token includes role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: userData });

  } catch (err) {
    if (err.message.includes("timed out")) {
      return res.status(503).json({ message: "Database connection timeout. Please check your internet or MongoDB Atlas IP whitelist." });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};