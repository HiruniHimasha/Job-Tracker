const express = require("express");
const router = express.Router();
const { generateCoverLetter, analyzeJob } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// All AI routes are protected
router.use(protect);

router.post("/cover-letter", generateCoverLetter);
router.post("/analyze-job", analyzeJob);

module.exports = router;
