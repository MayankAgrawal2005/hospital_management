const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  time: String,
  appointmentType: {
    type: String,
    enum: ["In-Person", "Online"],
    default: "In-Person"
  },
  meetingLink: {
    type: String
  },
  status: {
    type: String,
    enum: ["booked", "completed", "cancelled", "rescheduled", "no_show", "reschedule_requested"],
    default: "booked"
  },
  requestedDate: {
    type: Date,
    default: null
  },
  requestedTime: {
    type: String,
    default: null
  },
  cancelledBy: {
    type: String,
    enum: ["patient", "doctor", "admin", null],
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);