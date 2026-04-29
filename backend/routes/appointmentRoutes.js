// const express = require("express");
// const router = express.Router();
// const {
//   bookAppointment,
//   getAppointments,
//   cancelAppointment
// } = require("../controllers/appointmentController");

// router.post("/", bookAppointment);              
// router.get("/", getAppointments);               
// router.put("/:id/cancel", cancelAppointment);   

// module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  bookAppointment,
  getAppointments,
  cancelAppointment,
  completeAppointment,
  getBookedSlots,
  rescheduleAppointment,
  requestReschedule
} = require("../controllers/appointmentController");

router.post("/", protect, bookAppointment);
router.get("/", protect, getAppointments);
router.get("/doctor/:doctorId/booked-slots", protect, getBookedSlots);
router.put("/:id/cancel", protect, cancelAppointment);
router.put("/:id/complete", protect, completeAppointment);
router.put("/:id/reschedule", protect, rescheduleAppointment);
router.put("/:id/request-reschedule", protect, requestReschedule);

module.exports = router;