// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: {
//   type: String,
//   required: true,
//   unique: true
// },
//   password: String,
//   role: {
//     type: String,
//     enum: ["doctor", "patient"]
//   }
// });

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,

  role: {
    type: String,
    enum: ["doctor", "patient", "admin"]
  },

  // 🔥 Doctor Fields
  specialization: String,
  experience: Number,
  fees: Number,
  bio: String,
  availableSlots: {
    type: [String],
    default: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  leaveDays: {
    type: [String],
    default: []
  },

  // 🧑‍⚕️ Patient Profile Fields
  phone: { type: String, default: "" },
  dateOfBirth: { type: String, default: "" },
  bloodGroup: { type: String, default: "" },
  gender: { type: String, default: "" }
});

module.exports = mongoose.model("User", userSchema);