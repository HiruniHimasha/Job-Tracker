// routes/suggestionsRoutes.js
const express = require("express");
const router  = express.Router();
const { generateSuggestions } = require("../controllers/suggestionsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/generate", generateSuggestions);

module.exports = router;
