const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  status: {
    type: String,
    default: "booked"
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);