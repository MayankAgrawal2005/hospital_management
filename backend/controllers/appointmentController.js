const Appointment = require("../models/Appointment");
const User = require("../models/User");
const {
  sendBookingConfirmation,
  sendCancellationNotice,
  sendCompletionNotice,
  sendRescheduleRequestNotice,
  sendRescheduleConfirmationNotice
} = require("../utils/emailService");
const crypto = require("crypto");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, appointmentType } = req.body;

    // We get patientId from the authenticated user token
    const patientId = req.user.id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, Date, and Time fields are required" });
    }

    // Check if doctor is on leave
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // `date` comes from the frontend as a YYYY-MM-DD string or similar
    // We compare with the stored string in leaveDays
    const formattedDate = new Date(date).toISOString().split("T")[0];
    if (doctor.leaveDays && doctor.leaveDays.includes(formattedDate)) {
      return res.status(400).json({ message: "Doctor is on leave on this date. Please select another date." });
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

    // Send Email Notification
    try {
      const patient = await User.findById(patientId);
      if (patient && patient.email) {
        // Send email silently in the background
        sendBookingConfirmation(patient.email, patient.name, doctor.name, date, time);
      }
    } catch (emailErr) {
      console.error("Failed to send booking email:", emailErr);
    }

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
    const { reason } = req.body;

    const appointment = await Appointment.findById(id).populate("patientId", "name email").populate("doctorId", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Optional: add authorization check to ensure only the patient or doctor can cancel

    appointment.status = "cancelled";
    appointment.cancelledBy = req.user.role;
    appointment.cancellationReason = reason || "No reason provided";
    await appointment.save();

    // Send Email Notification
    try {
      if (appointment.patientId && appointment.patientId.email) {
        sendCancellationNotice(
          appointment.patientId.email,
          appointment.patientId.name,
          appointment.doctorId.name,
          appointment.date,
          appointment.time,
          appointment.cancellationReason,
          appointment.cancelledBy
        );
      }
    } catch (emailErr) {
      console.error("Failed to send cancellation email:", emailErr);
    }

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

    const appointment = await Appointment.findById(id).populate("patientId", "name email").populate("doctorId", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Optional: add authorization to ensure only doctor can complete
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: "Only doctors can complete appointments" });
    }

    appointment.status = "completed";
    await appointment.save();

    // Send Email Notification
    try {
      if (appointment.patientId && appointment.patientId.email) {
        sendCompletionNotice(
          appointment.patientId.email,
          appointment.patientId.name,
          appointment.doctorId.name
        );
      }
    } catch (emailErr) {
      console.error("Failed to send completion email:", emailErr);
    }

    res.json({
      message: "Appointment marked as completed",
      appointment
    });
  } catch (error) {
    console.error("Complete Appointment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestReschedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { requestedDate, requestedTime } = req.body;

    if (!requestedDate || !requestedTime) {
      return res.status(400).json({ message: "requestedDate and requestedTime are required" });
    }

    const appointment = await Appointment.findById(id)
      .populate("patientId", "name email")
      .populate("doctorId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Save requested time and update status
    appointment.status = "reschedule_requested";
    appointment.requestedDate = requestedDate;
    appointment.requestedTime = requestedTime;
    await appointment.save();

    // Notify doctor
    try {
      if (appointment.doctorId && appointment.doctorId.email) {
        sendRescheduleRequestNotice(
          appointment.doctorId.email,
          appointment.doctorId.name,
          appointment.patientId.name,
          appointment.date,
          appointment.time,
          requestedDate,
          requestedTime
        );
      }
    } catch (emailErr) {
      console.error("Failed to send reschedule request email:", emailErr);
    }

    res.json({
      message: "Reschedule request sent to doctor successfully",
      appointment
    });
  } catch (error) {
    console.error("Request Reschedule Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({ message: "newDate and newTime are required" });
    }

    const appointment = await Appointment.findById(id).populate("patientId", "name email").populate("doctorId", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.date = newDate;
    appointment.time = newTime;
    appointment.status = "rescheduled"; // Update status to rescheduled to indicate it has been moved
    appointment.cancelledBy = null;
    appointment.cancellationReason = null;
    appointment.requestedDate = null;
    appointment.requestedTime = null;
    await appointment.save();

    // Send confirmation email to patient
    try {
      if (appointment.patientId && appointment.patientId.email) {
        sendRescheduleConfirmationNotice(
          appointment.patientId.email,
          appointment.patientId.name,
          appointment.doctorId.name,
          appointment.date,
          appointment.time
        );
      }
    } catch (emailErr) {
      console.error("Failed to send reschedule email:", emailErr);
    }

    res.json({
      message: "Appointment rescheduled successfully",
      appointment
    });
  } catch (error) {
    console.error("Reschedule Appointment Error:", error);
    res.status(500).json({ message: "Server error" });
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