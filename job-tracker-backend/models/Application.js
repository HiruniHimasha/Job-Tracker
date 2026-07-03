// Application.js — Clean model with interview fields (no duplicates)
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "Not specified",
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"],
      default: "Applied",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    jobDescription: {
      type: String,
    },
    // ── Interview scheduling fields ──
    interviewDate: {
      type: Date,
    },
    interviewTime: {
      type: String,  // e.g. "10:30"
    },
    interviewType: {
      type: String,
      enum: ["Phone", "Online", "In-Person", "Technical", "HR"],
      default: "Online",
    },
    interviewNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);