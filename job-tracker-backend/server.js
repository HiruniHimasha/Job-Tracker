// server.js
const express  = require("express");
const cors     = require("cors");
const dotenv   = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/ai",           require("./routes/aiRoutes"));
app.use("/api/resume",       require("./routes/resumeRoutes"));
app.use("/api/suggestions",  require("./routes/suggestionsRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Job Tracker API is running 🚀" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Only start a standalone server when run directly (e.g. `npm run dev` locally).
// On Vercel, this file is required by /api/[...slug].js instead, and Vercel
// handles the listening/port itself.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;