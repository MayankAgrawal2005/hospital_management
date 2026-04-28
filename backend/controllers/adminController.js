const User = require("../models/User");
const Appointment = require("../models/Appointment");

exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const doctors = await User.countDocuments({ role: "doctor" });
    const patients = await User.countDocuments({ role: "patient" });

    const totalAppointments = await Appointment.countDocuments({});
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });

    // Calculate simulated platform revenue 
    // Assumption: we take a 10% fee on all completed appointments (derived from Doctor fees)
    const completedApptsWithDocs = await Appointment.find({ status: "completed" }).populate("doctorId");
    let totalRevenue = 0;
    completedApptsWithDocs.forEach(appt => {
      if (appt.doctorId && appt.doctorId.fees) {
        totalRevenue += appt.doctorId.fees;
      }
    });

    res.json({
      totalUsers,
      doctors,
      patients,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      platformRevenue: totalRevenue * 0.1 // 10% cut
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attempt to clear associated appointments for clean state
    if (user.role === "doctor") {
      await Appointment.deleteMany({ doctorId: user._id });
    } else {
      await Appointment.deleteMany({ patientId: user._id });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User securely deleted from platform" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
