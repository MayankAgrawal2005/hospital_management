const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let users;
    if (role) {
      users = await User.find({ role }).select("-password");
    } else {
      users = await User.find().select("-password");
    }

    res.json(users);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, specialization, experience, fees, bio, availableSlots, leaveDays, phone, dateOfBirth, bloodGroup, gender, clinicAddress } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (specialization) user.specialization = specialization;
    if (experience !== undefined) user.experience = Number(experience);
    if (fees !== undefined) user.fees = Number(fees);
    if (bio !== undefined) user.bio = bio;
    if (availableSlots !== undefined) user.availableSlots = availableSlots;
    if (leaveDays !== undefined) user.leaveDays = leaveDays;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (gender !== undefined) user.gender = gender;
    if (clinicAddress !== undefined) user.clinicAddress = clinicAddress;

    await user.save();

    // Do not return password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRelatedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const Appointment = require("../models/Appointment");

    let relatedUserIds = [];
    if (role === "doctor") {
      // Find all patients this doctor has had appointments with
      relatedUserIds = await Appointment.distinct("patientId", { doctorId: userId });
    } else {
      // Find all doctors this patient has had appointments with
      relatedUserIds = await Appointment.distinct("doctorId", { patientId: userId });
    }

    const users = await User.find({ _id: { $in: relatedUserIds } }).select("name email specialization");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const Appointment = require("../models/Appointment");
    const Report = require("../models/Report");
    const Prescription = require("../models/Prescription");

    // 1. Delete all associated data
    await Promise.all([
      Appointment.deleteMany({ $or: [{ patientId: userId }, { doctorId: userId }] }),
      Report.deleteMany({ $or: [{ patientId: userId }, { doctorId: userId }] }),
      Prescription.deleteMany({ $or: [{ patientId: userId }, { doctorId: userId }] }),
    ]);

    // 2. Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};