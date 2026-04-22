// Gemini AI Service
// Handles all communication with Google Gemini API

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Screens a resume against a job description using Gemini AI
 * @param {string} resumeText - Extracted text from the resume
 * @param {string} jobDescription - The job requirements/description
 * @returns {Object} AI screening result with score, summary, pros, cons
 */
async function screenResume(resumeText, jobDescription) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
  "recommendation": "<Final hiring recommendation in 1 sentence>"
}

Only return valid JSON. No extra text.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean response (remove markdown code blocks if present)
    const cleanJSON = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanJSON);
}

module.exports = { screenResume };
