// controllers/suggestionsController.js
// Fetches REAL job listings (Sri Lanka + International, mixed) using the
// free JSearch API (RapidAPI), then uses OpenRouter AI just to score/rank
// how well each real job matches the user's tracked applications.

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const JSEARCH_HOST  = "jsearch.p.rapidapi.com";
const JSEARCH_URL   = "https://jsearch.p.rapidapi.com/search-v2";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE    = "https://openrouter.ai/api/v1/chat/completions";
const MODEL              = "openrouter/auto";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: call JSearch for real job listings
// Throws on actual API errors (auth, rate limit, etc.) so callers can tell
// the difference between "API broke" and "genuinely zero results".
// ─────────────────────────────────────────────────────────────────────────────
async function searchJobs(query, { num_pages = 1, country = null } = {}) {
  let url = `${JSEARCH_URL}?query=${encodeURIComponent(query)}&page=1&num_pages=${num_pages}`;
  if (country) url += `&country=${country}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": JSEARCH_HOST,
    },
  });

  const rawText = await response.text();

  if (!response.ok) {
    console.error(`JSearch API error (${response.status}) for query "${query}":`, rawText.slice(0, 300));
    throw new Error(`JSearch API error (${response.status})`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error(`JSearch returned non-JSON for query "${query}":`, rawText.slice(0, 300));
    throw new Error("JSearch returned an unexpected (non-JSON) response");
  }

  // Log the full parsed response (truncated) so we can see status/request_id/error fields
  console.log(`JSearch raw response for "${query}":`, JSON.stringify(data).slice(0, 500));

  if (data.status === "ERROR" || data.error) {
    const msg = data.error?.message || data.message || "JSearch returned an error status";
    console.error(`JSearch logical error for query "${query}":`, msg);
    throw new Error(msg);
  }

  // search-v2 nests results as data.data.jobs (an object), while the older
  // /search endpoint returned data.data directly as an array. Support both.
  const jobs = Array.isArray(data.data)
    ? data.data
    : (data.data?.jobs || []);

  console.log(`JSearch: "${query}" → ${jobs.length} results`);
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: try a list of query variants in order, return the first that yields
// results. This handles JSearch returning zero results for narrow/exact
// phrasing (common for smaller markets like Sri Lanka).
// ─────────────────────────────────────────────────────────────────────────────
async function searchJobsWithFallback(queries, options = {}) {
  let lastError = null;
  for (const q of queries) {
    try {
      const results = await searchJobs(q, options);
      if (results.length > 0) return results;
    } catch (err) {
      lastError = err;
      // keep trying remaining fallback queries
    }
  }
  if (lastError) throw lastError; // all attempts errored (not just empty)
  return []; // all attempts succeeded but genuinely returned nothing
}

// Build a list of fallback query variants, from most specific to broadest.
function buildRoleQueryVariants(role, locationPhrase) {
  const cleanRole = role.trim();
  const words = cleanRole.split(/\s+/);
  const variants = [
    `${cleanRole} ${locationPhrase}`,
    `${cleanRole} jobs ${locationPhrase}`,
  ];
  if (words.length >= 2) {
    variants.push(`${words.slice(-2).join(' ')} ${locationPhrase}`); // last 2 words, e.g. "Stack Developer"
  }
  if (words.length >= 1) {
    variants.push(`${words[words.length - 1]} ${locationPhrase}`); // last word, e.g. "Developer"
  }
  return variants;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: call OpenRouter AI to compute match scores + reasons
// ─────────────────────────────────────────────────────────────────────────────
async function callOpenRouter(prompt) {
  const response = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "Job Tracker AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2500,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `OpenRouter error: ${response.status}`);
  return data.choices[0].message.content;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalize a raw JSearch job object into our card shape
// ─────────────────────────────────────────────────────────────────────────────
function normalizeJob(job, regionTag) {
  const company = job.employer_name || "Unknown Company";

  // Build a readable location string
  let location = "Remote";
  if (job.job_city && job.job_country) {
    location = `${job.job_city}, ${job.job_country}`;
  } else if (job.job_country) {
    location = job.job_country;
  } else if (job.job_is_remote) {
    location = "Remote";
  }

  // Salary string (JSearch sometimes provides min/max)
  let salary = "";
  if (job.job_min_salary && job.job_max_salary) {
    const currency = job.job_salary_currency || "USD";
    salary = `${currency} ${Math.round(job.job_min_salary / 1000)}K – ${Math.round(job.job_max_salary / 1000)}K`;
  }

  // Job type
  let type = "Full-time";
  if (job.job_is_remote) type = "Remote";
  else if (job.job_employment_type === "CONTRACTOR") type = "Contract";
  else if (job.job_employment_type === "PARTTIME") type = "Part-time";

  // Posted-ago string
  let postedAgo = "Recently";
  if (job.job_posted_at_datetime_utc) {
    const days = Math.floor((Date.now() - new Date(job.job_posted_at_datetime_utc)) / 86400000);
    postedAgo = days <= 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
  }

  // Extract a few skill-like keywords from the description (very rough)
  const desc = (job.job_description || "").toLowerCase();
  const SKILL_BANK = [
    "react", "node.js", "node", "javascript", "typescript", "python", "java",
    "flutter", "figma", "sql", "mongodb", "aws", "docker", "kubernetes",
    "php", "laravel", "vue", "angular", "express", "next.js", "html", "css",
    "git", "rest api", "graphql", "ui/ux", "tailwind",
  ];
  const tags = SKILL_BANK.filter(skill => desc.includes(skill)).slice(0, 4);

  return {
    id: job.job_id || `${company}-${job.job_title}`.replace(/\s+/g, "-"),
    role: job.job_title || "Job Opening",
    company,
    location,
    type,
    salary,
    tags: tags.length ? tags : ["See description"],
    postedAgo,
    logo: company.charAt(0).toUpperCase(),
    jobUrl: job.job_apply_link || job.job_google_link || "",
    region: regionTag, // "Sri Lanka" or "International"
    rawDescription: (job.job_description || "").slice(0, 600), // trimmed for AI prompt
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main controller: POST /api/suggestions/generate
// Body: { applications: [ { company, role, status } ] }
// ─────────────────────────────────────────────────────────────────────────────
const generateSuggestions = async (req, res) => {
  try {
    const { applications } = req.body;

    if (!applications || applications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No applications provided. Add some applications first.",
      });
    }

    if (!RAPIDAPI_KEY) {
      return res.status(500).json({
        success: false,
        message: "RAPIDAPI_KEY is not set on the server. Add it to your .env file.",
      });
    }

    // ── Step 1: figure out the primary role(s) the user is targeting ──────
    const roleCounts = {};
    applications.forEach(a => {
      const r = (a.role || "").trim();
      if (r) roleCounts[r] = (roleCounts[r] || 0) + 1;
    });
    const sortedRoles = Object.keys(roleCounts).sort((a, b) => roleCounts[b] - roleCounts[a]);
    const primaryRole = sortedRoles[0] || "Software Engineer";

    // ── Step 2: fetch REAL jobs from JSearch — Sri Lanka + International ──
    const sriLankaQueries      = buildRoleQueryVariants(primaryRole, "in Sri Lanka");
    const internationalQueries = buildRoleQueryVariants(primaryRole, "remote");

    let sriLankaJobsRaw = [];
    let internationalJobsRaw = [];
    let apiErrorMessage = null;

    try {
      [sriLankaJobsRaw, internationalJobsRaw] = await Promise.all([
        searchJobsWithFallback(sriLankaQueries, { country: "lk" }).catch(err => { apiErrorMessage = err.message; return []; }),
        searchJobsWithFallback(internationalQueries, {}).catch(err => { apiErrorMessage = err.message; return []; }),
      ]);
    } catch (err) {
      apiErrorMessage = err.message;
    }

    const sriLankaJobs      = sriLankaJobsRaw.slice(0, 6).map(j => normalizeJob(j, "Sri Lanka"));
    const internationalJobs = internationalJobsRaw.slice(0, 6).map(j => normalizeJob(j, "International"));

    const allJobs = [...sriLankaJobs, ...internationalJobs];

    if (allJobs.length === 0) {
      // Distinguish "API actually broke" (auth/rate-limit/etc.) from "genuinely no listings"
      if (apiErrorMessage) {
        return res.status(502).json({
          success: false,
          message: `Job search service error: ${apiErrorMessage}. Check your RAPIDAPI_KEY is valid and your JSearch quota hasn't been exceeded.`,
        });
      }
      return res.status(404).json({
        success: false,
        message: `No live job listings found for "${primaryRole}" right now in Sri Lanka or remotely. Try adding an application with a more common job title (e.g. "Software Engineer", "Developer") and search again.`,
      });
    }

    // ── Step 3: ask AI to score each REAL job against the user's history ──
    const appSummary = applications
      .slice(0, 15)
      .map(a => `- ${a.role} at ${a.company} (${a.status})`)
      .join("\n");

    const jobsForPrompt = allJobs.map((j, i) => ({
      index: i,
      role: j.role,
      company: j.company,
      location: j.location,
      descriptionSnippet: j.rawDescription,
    }));

    const prompt = `
You are a career advisor AI. A user has applied to these jobs:
${appSummary}

Below is a list of REAL, currently open job postings (index, role, company, location, description snippet).
For EACH job, give a matchScore (0-100, how well it fits the user's application history) and a one-sentence reason.

Jobs:
${JSON.stringify(jobsForPrompt, null, 2)}

Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "scores": [
    { "index": 0, "matchScore": 88, "reason": "Matches your Frontend Developer background closely" }
  ]
}
`;

    let scoredMeta = [];
    try {
      const text = await callOpenRouter(prompt);
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0] || clean);
      scoredMeta = parsed.scores || [];
    } catch (aiErr) {
      console.warn("AI scoring failed, falling back to default scores:", aiErr.message);
      scoredMeta = allJobs.map((_, i) => ({
        index: i,
        matchScore: 75,
        reason: "Relevant to your job search based on role similarity.",
      }));
    }

    // ── Step 4: merge AI scores back into the real job objects ────────────
    const finalSuggestions = allJobs.map((job, i) => {
      const meta = scoredMeta.find(s => s.index === i) || { matchScore: 70, reason: "Relevant match." };
      const { rawDescription, ...cleanJob } = job; // strip large description before sending to client
      return {
        ...cleanJob,
        matchScore: meta.matchScore,
        reason: meta.reason,
      };
    });

    // Sort: highest match first
    finalSuggestions.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      suggestions: finalSuggestions,
      searchQuery: `${primaryRole} — Sri Lanka & International`,
      counts: {
        sriLanka: sriLankaJobs.length,
        international: internationalJobs.length,
      },
    });

  } catch (error) {
    console.error("Suggestions Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateSuggestions };
