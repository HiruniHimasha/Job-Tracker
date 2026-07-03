// routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const { uploadMiddleware, analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/resume/analyze
// uploadMiddleware runs first (handles the file upload)
// then protect checks the JWT token
// then analyzeResume does the AI analysis
router.post('/analyze', uploadMiddleware, protect, analyzeResume);

module.exports = router;
