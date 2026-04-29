const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// app.use(cors());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

const uri = process.env.MONGO;

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: err
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
