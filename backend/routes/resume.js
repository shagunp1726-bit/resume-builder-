const express = require('express');
const axios = require('axios');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// ─── Helper: strip markdown code fences the AI sometimes wraps JSON in ────────
function sanitizeJsonString(raw) {
  return raw
    .trim()
    .replace(/^```(?:json)?[\r\n]*/i, '')
    .replace(/```[\s]*$/i, '')
    .trim();
}

// ─── Helper: build the experience JSON schema hint for the prompt ─────────────
function buildExperienceHint(experience) {
  if (!experience || experience.length === 0) return '[]';
  return JSON.stringify(
    experience.map((e) => ({
      company: e.company || '',
      role: e.role || '',
      duration: e.duration || '',
      rawDescription: e.description || '',
    }))
  );
}

// ─── Helper: build the projects JSON schema hint for the prompt ───────────────
function buildProjectsHint(projects) {
  if (!projects || projects.length === 0) return '[]';
  return JSON.stringify(
    projects.map((p) => ({
      title: p.title || '',
      techStack: p.techStack || '',
      rawDescription: p.description || '',
    }))
  );
}

router.post('/generate', async (req, res) => {
  try {
    const { personalInfo, education, experience, projects, skills, jobRole } = req.body;

    // ── Build education and skills context for the prompt ──────────────────────
    const educationText =
      education && education.length > 0
        ? education.map((e) => `${e.degree} from ${e.college}, ${e.year}`).join('; ')
        : 'No education listed';

    const skillsText =
      skills && skills.length > 0
        ? skills.map((s) => `${s.category}: ${s.items}`).join('; ')
        : 'Not specified';

    // ── Feed the raw arrays to the AI as JSON so it can map indices back ───────
    const experienceHint = buildExperienceHint(experience);
    const projectsHint   = buildProjectsHint(projects);

    // ── Strict JSON-output prompt ──────────────────────────────────────────────
    const prompt = `
You are an elite professional resume writer. Your job is to transform raw user input into a polished, corporate-quality resume.

### Candidate Context
- Name: ${personalInfo.name || 'Candidate'}
- Target Role: ${jobRole || 'Software Developer'}
- Skills: ${skillsText}
- Education: ${educationText}

### Task 1 — Professional Summary
Write a single paragraph of exactly 80–100 words. The tone must be confident, results-driven, and tailored to the target role. No bullet points. No filler phrases like "Dynamic professional." Start directly with the candidate's value proposition.

### Task 2 — Upgrade Experience Descriptions
You are given an array of work experience entries in JSON. For each entry, completely rewrite the "rawDescription" field into 3 to 4 high-impact bullet points. Each bullet must start with a strong action verb (e.g., Architected, Spearheaded, Engineered, Optimised, Automated, Delivered, Reduced, Scaled, Integrated, Launched). Use concrete, results-oriented language. If the raw description is vague (like "made website"), infer realistic, professional accomplishments aligned to the role and tech context. Separate bullet points with a literal newline character (\n) and prefix each with "• ".

Input experience array:
${experienceHint}

### Task 3 — Upgrade Project Descriptions
You are given an array of project entries in JSON. For each entry, completely rewrite the "rawDescription" into 2 to 3 high-impact bullet points using the same rules as Task 2. Infer professional scope and impact if the raw text is brief.

Input projects array:
${projectsHint}

### Strict Output Format
Return ONLY a single, valid, raw JSON object — no markdown fences, no commentary, no explanation outside the JSON. The JSON must match this exact structure:

{
  "aiSummary": "<80-100 word paragraph here>",
  "upgradedExperience": [
    {
      "company": "<same company name from input>",
      "role": "<same role from input>",
      "duration": "<same duration from input>",
      "description": "• Bullet point one\n• Bullet point two\n• Bullet point three"
    }
  ],
  "upgradedProjects": [
    {
      "title": "<same title from input>",
      "techStack": "<same techStack from input>",
      "description": "• Bullet point one\n• Bullet point two"
    }
  ]
}

IMPORTANT RULES:
1. The number of objects in "upgradedExperience" MUST exactly match the number of objects in the input experience array.
2. The number of objects in "upgradedProjects" MUST exactly match the number of objects in the input projects array.
3. Do NOT add markdown code fences (\`\`\`json) anywhere.
4. Do NOT include any text before or after the JSON object.
5. Ensure the JSON is valid and can be parsed by JSON.parse() without errors.
`;

    // ── Call Gemini API with retry on 503 overload ────────────────────────────
    const GEMINI_MODELS = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.5-flash',
    ];
    const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
    const MAX_RETRIES = 3;

    let geminiResponse = null;
    let lastError = null;

    for (const model of GEMINI_MODELS) {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          geminiResponse = await axios.post(
            `${GEMINI_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              },
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
          // success — break out of both loops
          lastError = null;
          break;
        } catch (apiErr) {
          lastError = apiErr;
          const status = apiErr.response && apiErr.response.status;
          if (status === 503 || status === 429) {
            // overloaded or rate-limited — wait then retry
            const waitMs = attempt * 1500;
            console.warn(`Model ${model} attempt ${attempt} failed (${status}). Retrying in ${waitMs}ms…`);
            await new Promise((r) => setTimeout(r, waitMs));
          } else {
            // non-retryable error — break inner loop, try next model
            console.warn(`Model ${model} failed with status ${status}. Trying next model…`);
            break;
          }
        }
      }
      if (geminiResponse) break; // got a successful response
    }

    if (!geminiResponse) {
      const errData = lastError && lastError.response && lastError.response.data;
      console.error('All Gemini models failed:', JSON.stringify(errData, null, 2));
      return res.status(502).json({
        message: 'AI generation failed. The Gemini API is temporarily overloaded. Please wait a minute and try again.',
        details: errData,
      });
    }

    const rawText = geminiResponse.data.candidates[0].content.parts[0].text;

    // ── Sanitize and parse the JSON response ───────────────────────────────────
    let aiResult;
    try {
      const cleanText = sanitizeJsonString(rawText);
      aiResult = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error('Gemini JSON parse error. Raw output:\n', rawText);
      return res.status(502).json({
        message: 'AI returned malformed JSON. Please try again.',
        rawOutput: rawText,
      });
    }

    const { aiSummary, upgradedExperience, upgradedProjects } = aiResult;

    // ── Validate the parsed structure ──────────────────────────────────────────
    if (typeof aiSummary !== 'string') {
      return res.status(502).json({ message: 'AI response missing aiSummary field.' });
    }

    // ── Map AI-upgraded descriptions back onto the original experience array ───
    const enrichedExperience =
      experience && experience.length > 0
        ? experience.map((exp, idx) => {
            const upgraded = upgradedExperience && upgradedExperience[idx];
            return {
              company:     upgraded?.company     || exp.company,
              role:        upgraded?.role        || exp.role,
              duration:    upgraded?.duration    || exp.duration,
              description: upgraded?.description || exp.description,
            };
          })
        : [];

    // ── Map AI-upgraded descriptions back onto the original projects array ─────
    const enrichedProjects =
      projects && projects.length > 0
        ? projects.map((proj, idx) => {
            const upgraded = upgradedProjects && upgradedProjects[idx];
            return {
              title:       upgraded?.title       || proj.title,
              techStack:   upgraded?.techStack   || proj.techStack,
              description: upgraded?.description || proj.description,
            };
          })
        : [];

    // ── Persist the fully enriched resume document ─────────────────────────────
    const resume = new Resume({
      userId:      req.user.userId,
      personalInfo,
      education,
      experience:  enrichedExperience,
      projects:    enrichedProjects,
      skills,
      jobRole,
      aiSummary:   aiSummary.trim(),
    });

    const savedResume = await resume.save();

    res.status(201).json(savedResume);
  } catch (err) {
    console.error('Resume generate error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.get('/my-resumes', async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    if (resume.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    if (resume.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
