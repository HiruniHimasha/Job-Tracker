// api/[...slug].js
// Vercel routes every /api/* request into this function. Vercel's Node.js
// runtime can run an Express app directly — no extra wrapper package needed.
module.exports = require("../job-tracker-backend/server");
