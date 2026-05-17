// Gemini AI Service
// Handles all communication with Google Gemini API
// Uses the new @google/genai SDK with gemini-2.0-flash for speed

require('dotenv').config({ override: true });
const { GoogleGenAI } = require('@google/genai');

/**
 * Screens a resume against a job description using Gemini AI
 * @param {string} resumeText - Extracted text from the resume
 * @param {string} jobDescription - The job requirements/description
 * @returns {Object} AI screening result with score, summary, pros, cons
 */
async function screenResume(resumeText, jobDescription) {
    // Initialize inside the function to guarantee the latest API key from .env is used
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert AI HR recruiter. Analyze the following resume against the job description.

---JOB DESCRIPTION---
${jobDescription}

---RESUME---
${resumeText}

Please provide a structured JSON response with the following fields:
{
  "matchScore": <number from 0 to 100>,
  "verdict": "<Highly Recommended | Recommended | Borderline | Not Recommended>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "skills": {
    "matched": ["<skill1>", "<skill2>"],
    "missing": ["<skill1>", "<skill2>"]
  },
  "experienceMatch": "<Exceeds | Meets | Below expectations>",
  "recommendation": "<Final hiring recommendation in 1 sentence>",
  
  "candidateProfile": {
    "location": "<Extracted location or null>",
    "totalExperienceYears": <Extracted number of years or 0>,
    "university": "<Extracted university name or null>",
    "availability": "<Extracted availability or null>"
  },
  "skillProficiency": [
    { "skill": "<Skill name>", "level": "<Beginner|Intermediate|Advanced|Expert>", "percentage": <0-100> }
  ],
  "employmentHistory": [
    { "company": "<Company name>", "role": "<Role title>", "duration": "<Time period>", "description": "<Brief description>" }
  ],
  "aiNote": "<A very short 1 sentence highlight, e.g., 'Top 1% of applicant pool based on skill match'>"
}

Only return valid JSON. No extra text.
`;

    let lastError;
    for (let i = 0; i < 3; i++) {
        try {
            const startTime = Date.now();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`⚡ Gemini responded in ${elapsed}s`);

            const text = response.text;

            // Clean response (remove markdown code blocks if present)
            const cleanJSON = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            return JSON.parse(cleanJSON);
        } catch (err) {
            lastError = err;
            const errorMsg = err.message || '';
            
            // Retry on rate limit (429) or server errors (503, 500)
            if (errorMsg.includes('503') || errorMsg.includes('429') || errorMsg.includes('500') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
                const delay = 1000 * (i + 1);
                console.log(`⚠️ Gemini busy (attempt ${i + 1}/3). Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

module.exports = { screenResume };
