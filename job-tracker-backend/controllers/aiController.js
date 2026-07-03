// controllers/aiController.js
// Uses OpenRouter API (free tier) — replaces Gemini

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/auto"; // auto picks the best free model available

// Helper: call OpenRouter
async function callOpenRouter(prompt) {
  const response = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "Job Tracker AI"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `OpenRouter error: ${response.status}`);
  }

  return data.choices[0].message.content;
}

// ──────────────────────────────────────────────
// Generate Cover Letter
// ──────────────────────────────────────────────
const generateCoverLetter = async (req, res) => {
  try {
    const { jobDescription, company, role, userName } = req.body;

    if (!jobDescription || !company || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide job description, company, and role.",
      });
    }

    const prompt = `
Write a professional cover letter.

Applicant Name: ${userName || "the applicant"}
Company: ${company}
Job Role: ${role}
Job Description: ${jobDescription}

Rules:
- 3 to 4 paragraphs
- Start with "Dear Hiring Manager,"
- No placeholders like [Name] or [Date]
- Professional, engaging, and concise
- Highlight relevant skills matching the job description
- End with a confident closing
`;

    const coverLetter = await callOpenRouter(prompt);

    return res.status(200).json({ success: true, coverLetter });

  } catch (error) {
    console.error("OpenRouter Error (Cover Letter):", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────
// Analyze Job Description
// ──────────────────────────────────────────────
const analyzeJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    const prompt = `
Analyze the job description below.
Return ONLY valid JSON. No explanation, no markdown, no extra text.

Format:
{
  "requiredSkills": [],
  "niceToHaveSkills": [],
  "experienceLevel": "",
  "jobType": "",
  "keyResponsibilities": [],
  "tips": ""
}

Job Description:
${jobDescription}
`;

    const text = await callOpenRouter(prompt);

    let analysis;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI returned invalid format. Try again.");
      analysis = JSON.parse(jsonMatch[0]);
    }

    return res.status(200).json({ success: true, analysis });

  } catch (error) {
    console.error("OpenRouter Error (Analyze Job):", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateCoverLetter, analyzeJob };
