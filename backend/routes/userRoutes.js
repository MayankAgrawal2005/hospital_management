const express = require("express");
const router = express.Router();
const { getUsers, updateProfile, getRelatedUsers, deleteAccount } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Get doctors or patients
router.get("/", protect, getUsers);
router.get("/related", protect, getRelatedUsers);
router.put("/profile", protect, updateProfile);
router.delete("/account", protect, deleteAccount);

module.exports = router;