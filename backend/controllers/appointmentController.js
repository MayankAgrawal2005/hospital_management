const Appointment = require("../models/Appointment");
const crypto = require("crypto");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, appointmentType } = req.body;
    
    // We get patientId from the authenticated user token
    const patientId = req.user.id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, Date, and Time fields are required" });
    }

    // Check for double booking
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      time,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    let meetingLink = "";
    if (appointmentType === "Online") {
      const uniqueId = crypto.randomBytes(8).toString("hex");
      meetingLink = `https://meet.jit.si/CarePoint-${uniqueId}`;
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      appointmentType: appointmentType || "In-Person",
      meetingLink,
      status: "booked"
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let appointments;

    if (role === "doctor") {
      appointments = await Appointment.find({ doctorId: userId })
        .populate("patientId", "name email");
    } 
    else if (role === "patient") {
      appointments = await Appointment.find({ patientId: userId })
        .populate("doctorId", "name email");
    } 
    else {
      // Admin case if implemented in future
      appointments = await Appointment.find()
        .populate("patientId", "name email")
        .populate("doctorId", "name email");
    }

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Optional: add authorization check to ensure only the patient or doctor can cancel

    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      message: "Appointment cancelled successfully",
      appointment
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Optional: add authorization to ensure only doctor can complete
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: "Only doctors can complete appointments" });
    }

    appointment.status = "completed";
    await appointment.save();

    res.json({
      message: "Appointment marked as completed",
      appointment
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookedSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "DoctorId and date are required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" }
    });

    const bookedSlots = appointments.map(a => a.time).filter(Boolean);
    res.json(bookedSlots);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};