const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");

exports.savePrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, notes, suggestedTests, status } = req.body;
    const doctorId = req.user.id;

    if (!appointmentId || !medicines || !notes) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Upsert logic: If prescription exists for this appointment, update it
    let prescription = await Prescription.findOne({ appointmentId });

    if (prescription) {
      prescription.medicines = medicines;
      prescription.notes = notes;
      prescription.suggestedTests = suggestedTests;
      prescription.status = status || "draft";
      await prescription.save();
    } else {
      prescription = await Prescription.create({
        appointmentId,
        patientId: appointment.patientId,
        doctorId,
        medicines,
        notes,
        suggestedTests,
        status: status || "draft"
      });
    }

    res.status(200).json({
      message: `Prescription saved as ${prescription.status}`,
      prescription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const prescription = await Prescription.findOne({ appointmentId })
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email");

    if (!prescription) {
      return res.status(404).json({ message: "No prescription found for this appointment" });
    }

    // Privacy check: Patients only see final prescriptions
    if (req.user.role === "patient" && prescription.status !== "final") {
      return res.status(403).json({ message: "Prescription is not yet finalized by the doctor" });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = {};
    if (role === "doctor") {
      query = { doctorId: userId };
    } else {
      query = { patientId: userId, status: "final" };
    }

    const prescriptions = await Prescription.find(query)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
