const Report = require("../models/Report");

exports.uploadReport = async (req, res) => {
  try {
    const { reportName, reportType, patientId, appointmentId } = req.body;
    const uploadedBy = req.user.role;
    const doctorId = uploadedBy === "doctor" ? req.user.id : req.body.doctorId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File Uploaded to Cloudinary:", req.file);

    const report = await Report.create({
      reportName,
      reportType,
      fileUrl: req.file.path,
      publicId: req.file.filename,
      patientId: uploadedBy === "patient" ? req.user.id : patientId,
      doctorId,
      appointmentId,
      uploadedBy
    });

    res.status(201).json({
      message: "Report uploaded successfully",
      report
    });
  } catch (error) {
    console.error("Upload Error Full:", error);
    res.status(500).json({ error: error.message, details: error });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { view } = req.query;

    let query = {};
    if (role === "doctor") {
      if (view === "personal") {
        query = { patientId: userId };
      } else {
        // Doctors see reports they uploaded OR reports for patients in appointments they have
        query = { doctorId: userId };
      }
    } else {
      query = { patientId: userId };
    }

    const reports = await Report.find(query)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // SECURITY CHECK: Only allow doctor to see patient reports if they have an appointment together
    const Appointment = require("../models/Appointment");
    const hasAppointment = await Appointment.findOne({
      patientId,
      doctorId,
      status: { $in: ["booked", "completed", "rescheduled"] }
    });

    if (!hasAppointment) {
      return res.status(403).json({ message: "You don't have permission to view this patient's records." });
    }

    const reports = await Report.find({ patientId })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportName, reportType } = req.body;
    
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Only uploader can edit
    const isOwner = (report.uploadedBy === "patient" && report.patientId.toString() === req.user.id) ||
                    (report.uploadedBy === "doctor" && report.doctorId?.toString() === req.user.id);

    if (!isOwner) return res.status(403).json({ message: "Not authorized to edit this report" });

    report.reportName = reportName || report.reportName;
    report.reportType = reportType || report.reportType;
    await report.save();

    res.json({ message: "Report updated successfully", report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) return res.status(404).json({ message: "Report not found" });

    // Authorization: Only uploader can delete, OR the doctor if they are the one linked to the report
    const isUploader = (report.uploadedBy === "patient" && report.patientId.toString() === req.user.id) ||
                       (report.uploadedBy === "doctor" && report.doctorId?.toString() === req.user.id);

    const isLinkedDoctor = (req.user.role === "doctor" && report.doctorId?.toString() === req.user.id);

    if (!isUploader && !isLinkedDoctor) return res.status(403).json({ message: "Not authorized to delete this report" });

    // Optional: Delete from cloudinary too
    try {
      const { cloudinary } = require("../utils/cloudinaryConfig");
      await cloudinary.uploader.destroy(report.publicId);
    } catch (e) {
      console.error("Cloudinary Delete Failed:", e);
    }

    await Report.findByIdAndDelete(id);
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
