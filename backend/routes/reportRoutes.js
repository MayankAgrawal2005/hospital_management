const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/cloudinaryConfig");
const { 
  uploadReport, 
  getMyReports, 
  getPatientReports, 
  updateReport,
  deleteReport 
} = require("../controllers/reportController");

router.post("/upload", protect, upload.single("report"), uploadReport);
router.get("/my", protect, getMyReports);
router.get("/patient/:patientId", protect, getPatientReports);
router.put("/:id", protect, updateReport);
router.delete("/:id", protect, deleteReport);

module.exports = router;
