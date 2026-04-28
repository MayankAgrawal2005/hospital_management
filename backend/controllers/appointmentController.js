const Appointment = require("../models/Appointment");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    
    // We get patientId from the authenticated user token
    const patientId = req.user.id;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Doctor and Date fields are required" });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
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