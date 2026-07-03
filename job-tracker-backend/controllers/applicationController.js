// applicationController.js — FIXED to save interview fields
// Bug fix: createApplication now includes interviewDate, interviewTime, interviewType, interviewNotes

const Application = require("../models/Application");

// @desc    Get all applications for logged-in user
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res) => {
  try {
    const { status, sort } = req.query;

    let query = { user: req.user._id };

    if (status && status !== "All") {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest")  sortOption = { createdAt: 1 };
    if (sort === "company") sortOption = { company: 1 };

    const applications = await Application.find(query).sort(sortOption);

    const stats = {
      total:     await Application.countDocuments({ user: req.user._id }),
      applied:   await Application.countDocuments({ user: req.user._id, status: "Applied" }),
      interview: await Application.countDocuments({ user: req.user._id, status: "Interview" }),
      offer:     await Application.countDocuments({ user: req.user._id, status: "Offer" }),
      rejected:  await Application.countDocuments({ user: req.user._id, status: "Rejected" }),
    };

    res.status(200).json({ success: true, count: applications.length, stats, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res) => {
  try {
    const {
      company, role, location, jobUrl, status, notes, salary,
      jobDescription, appliedDate,
      // ── Interview fields (FIXED: now included) ──
      interviewDate, interviewTime, interviewType, interviewNotes,
    } = req.body;

    const application = await Application.create({
      user: req.user._id,
      company,
      role,
      location,
      jobUrl,
      status,
      notes,
      salary,
      jobDescription,
      appliedDate,
      // ── Interview fields ──
      interviewDate:  interviewDate  || undefined,
      interviewTime:  interviewTime  || undefined,
      interviewType:  interviewType  || 'Online',
      interviewNotes: interviewNotes || undefined,
    });

    res.status(201).json({ success: true, message: "Application added!", application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res) => {
  try {
    let application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    // req.body already includes all fields (interview fields included)
    application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Application updated!", application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Application deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
};