const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  savePrescription, 
  getPrescriptionByAppointment, 
  getMyPrescriptions,
  deletePrescription 
} = require("../controllers/prescriptionController");

router.post("/", protect, savePrescription);
router.get("/my", protect, getMyPrescriptions);
router.get("/appointment/:appointmentId", protect, getPrescriptionByAppointment);
router.delete("/:id", protect, deletePrescription);

module.exports = router;
