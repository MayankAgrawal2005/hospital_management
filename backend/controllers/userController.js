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
    const { name, specialization, experience, fees, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (specialization) user.specialization = specialization;
    if (experience !== undefined) user.experience = Number(experience);
    if (fees !== undefined) user.fees = Number(fees);
    if (bio !== undefined) user.bio = bio;

    await user.save();

    // Do not return password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};