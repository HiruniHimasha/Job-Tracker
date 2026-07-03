// controllers/resumeController.js

const multer = require("multer");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

// ─── Multer upload middleware ─────────────────────────────────────────────────
const storage = multer.memoryStorage();

exports.uploadMiddleware = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, TXT, DOC, and DOCX files are allowed"), false);
        }
    }
}).single("resume");

// ─── analyzeResume controller ─────────────────────────────────────────────────
exports.analyzeResume = async (req, res) => {
    try {
        let resumeText = req.body.resumeText || "";
        const { jobDescription } = req.body;

        // If a file was uploaded, extract its text
        if (req.file) {
            if (req.file.mimetype === "application/pdf") {
                const parsed = await pdfParse(req.file.buffer);
                resumeText = parsed.text;
            } else {
                resumeText = req.file.buffer.toString("utf-8");
            }
        }

        if (!resumeText || resumeText.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Resume text is required. Provide resumeText in the body or upload a file."
            });
        }

        const prompt = `
You are a professional resume reviewer and career coach.

Analyze this resume and return ONLY valid JSON — no markdown, no explanation, no extra text.

JSON format:
{
  "overallScore": 0,
  "summary": "",
  "strengths": [],
  "improvements": [],
  "missingKeywords": [],
  "topSkills": [],
  "experienceLevel": ""
}

${jobDescription ? `Job Description:\n${jobDescription}\n` : ""}

Resume:
${resumeText}
`;

        // ─── OpenRouter API call ──────────────────────────────────────────────
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Job Tracker Resume Analyzer"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "OpenRouter API error");
        }

        const aiResponse = data.choices[0].message.content;

        let result;
        try {
            const clean = aiResponse.replace(/```json|```/g, "").trim();
            result = JSON.parse(clean);
        } catch (parseError) {
            console.log("JSON parse failed:", aiResponse);
            result = {
                overallScore: 0,
                summary: aiResponse,
                strengths: [],
                improvements: [],
                missingKeywords: [],
                topSkills: [],
                experienceLevel: "Unknown"
            };
        }

        return res.json({
            success: true,
            analysis: result
        });

    } catch (error) {
        console.error("Resume analysis error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Resume analysis failed",
            error: error.message
        });
    }
};