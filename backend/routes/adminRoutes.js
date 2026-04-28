const express = require("express");
const router = express.Router();
const { getPlatformStats, getAllUsers, deleteUser } = require("../controllers/adminController");
const { protect, protectAdmin } = require("../middleware/authMiddleware");

// All routes here run sequentially through protect AND protectAdmin
router.get("/stats", protect, protectAdmin, getPlatformStats);
router.get("/users", protect, protectAdmin, getAllUsers);
router.delete("/users/:id", protect, protectAdmin, deleteUser);

module.exports = router;
