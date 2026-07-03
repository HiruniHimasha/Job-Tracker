// api/[...slug].js
// Vercel routes every /api/* request into this single serverless function,
// which hands it to your existing Express app unchanged.
const serverless = require("serverless-http");
const app = require("../job-tracker-backend/server");

module.exports = serverless(app);