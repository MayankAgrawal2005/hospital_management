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
  bio: String
});

module.exports = mongoose.model("User", userSchema);