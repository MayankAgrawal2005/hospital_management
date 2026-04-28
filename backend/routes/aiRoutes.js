const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { triageSymptoms } = require("../controllers/aiController");

router.post("/triage", protect, triageSymptoms);

module.exports = router;
