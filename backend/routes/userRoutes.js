const express = require("express");
const router = express.Router();
const { getUsers, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Get doctors or patients
router.get("/", protect, getUsers);
router.put("/profile", protect, updateProfile);

module.exports = router;