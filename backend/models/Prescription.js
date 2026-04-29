const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  medicines: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      duration: { type: String, required: true },
      instruction: { type: String }
    }
  ],
  notes: {
    type: String,
    required: true
  },
  suggestedTests: {
    type: String
  },
  status: {
    type: String,
    enum: ["draft", "final"],
    default: "draft"
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);
