const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// app.use(cors());
app.use(cors()); // Allow all origins for production
app.use(express.json());

const uri = process.env.MONGO;

let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  console.log("Connecting to MongoDB...");
  cachedDb = await mongoose.connect(process.env.MONGO);
  return cachedDb;
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("DB Connection Error:", err);
    res.status(503).json({ message: "Database connection failed. Please check your MONGO variable in Vercel." });
  }
});


app.get("/", (req, res) => {
  res.send("🚀 CareSync 360 API is running successfully!");
});

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

const PORT = process.env.PORT || 5000;

// Export for Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
