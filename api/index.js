// api/index.js
// All /api/* requests are rewritten here (see vercel.json), and Express
// handles internal routing (auth, applications, ai, resume, suggestions).
module.exports = require("../job-tracker-backend/server");
