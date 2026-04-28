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
    default: "booked"
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);