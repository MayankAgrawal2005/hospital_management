const express = require("express");
const router = express.Router();
const { register, login, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.put("/change-password", protect, updatePassword);

module.exports = router;