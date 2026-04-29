const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportName: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    enum: ["Blood Test", "Sonography", "X-Ray", "MRI", "CT Scan", "Vaccination", "Other"],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String, // To delete from cloudinary later if needed
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  uploadedBy: {
    type: String,
    enum: ["patient", "doctor"],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);
