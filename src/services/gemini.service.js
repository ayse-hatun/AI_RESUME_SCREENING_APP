// AI Service
// Handles structured screening using a Multi-LLM Failover System:
// PRIMARY:  Google Gemini API      (gemini-2.0-flash)
// BACKUP_1: OpenAI API             (gpt-4o-mini)
// BACKUP_2: OpenRouter             (google/gemini-2.0-flash-lite:free)
// BACKUP_3: OpenRouter (fallback)  (meta-llama/llama-3.1-8b-instruct:free)

require('dotenv').config({ override: true });
const { GoogleGenAI } = require('@google/genai');

// --- Global Rate Limiter & Queue ---
// Limits execution to 1 request at a time with a minimum delay between requests
// to respect the Free Tier 15 Requests Per Minute (RPM) limit.
const queue = [];
let isProcessing = false;
const MIN_DELAY_MS = 4200; // 4.2 seconds between requests ensures max ~14 RPM

async function processQueue() {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    while (queue.length > 0) {
        const { execute, resolve, reject } = queue.shift();
        const startTime = Date.now();
        
        try {
            const result = await execute();
            resolve(result);
        } catch (err) {
            reject(err);
        }

        // Wait to enforce the RPM limit before processing the next item
        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_DELAY_MS && queue.length > 0) {
            await new Promise(r => setTimeout(r, MIN_DELAY_MS - elapsed));
        }
    }

    isProcessing = false;
}

function enqueueTask(executeFn) {
    return new Promise((resolve, reject) => {
        queue.push({ execute: executeFn, resolve, reject });
        processQueue(); // Start processing if not already running
    });
}

// --- Text Optimization / Token Preprocessing ---
const STOP_WORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", 
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", 
    "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", 
    "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", 
    "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", 
    "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", 
    "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", 
    "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", 
    "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
]);

function cleanText(text) {
    if (!text) return '';
    // Normalize newlines and whitespace
    let clean = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
    // Keep casing but clean stop words
    const words = clean.split(' ');
    const filteredWords = words.filter(word => !STOP_WORDS.has(word.toLowerCase()));
    
    // Trim to roughly 3,000 tokens (~12,000 characters)
    return filteredWords.join(' ').substring(0, 12000).trim();
}

// --- Robust JSON parser: strips markdown fences and extracts first JSON object ---
function safeParseJSON(rawText) {
    if (!rawText) throw new Error('Empty response from LLM');
    // Strip markdown code fences like ```json ... ```
    let cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    // Try direct parse first
    try { return JSON.parse(cleaned); } catch (_) {}
    // Extract first {...} block from the text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
        try { return JSON.parse(match[0]); } catch (_) {}
    }
    throw new Error(`Could not parse JSON from LLM response: ${rawText.substring(0, 200)}`);
}

// --- Failover HTTP request helper ---
// NOTE: response_format is intentionally omitted — xAI (Grok) and OpenRouter do not support it.
// JSON output is enforced via the prompt instead.
async function callOpenAICompatible(url, apiKey, model, prompt) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'SmartHire'
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM returned empty content');
    return content;
}

// --- Fallback generator ---
function generateOfflineFallback(errorMessage = "All AI services failed.") {
    return {
        matchScore: 50,
        verdict: "Borderline",
        summary: `AI Screening offline. Marked for manual review. (${errorMessage})`,
        strengths: ["None (AI offline)"],
        weaknesses: ["None (AI offline)"],
        skills: {
            matched: [],
            missing: []
        },
        experienceMatch: "Meets",
        recommendation: "review",
        candidateProfile: {
            name: "Candidate Profile",
            email: null,
            location: null,
            totalExperienceYears: 0,
            university: null,
            availability: null
        },
        skillProficiency: [],
        employmentHistory: [],
        aiNote: "AI Offline: pending manual review."
    };
}

/**
 * Screens a resume against a job description using Gemini AI, with multi-LLM failover to OpenAI, OpenRouter, and Groq
 */
async function screenResume(resumeText, jobDescription) {
    const safeResumeText = cleanText(resumeText);
    const safeJobDesc = cleanText(jobDescription);

    const prompt = `
Analyze this resume text against the job description.
---JOB DESCRIPTION---
${safeJobDesc}
---RESUME---
${safeResumeText}

Output a single structured JSON object matching this schema:
{
  "matchScore": 0-100,
  "verdict": "Highly Recommended | Recommended | Borderline | Not Recommended",
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "skills": {
    "matched": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"]
  },
  "experienceMatch": "Exceeds | Meets | Below expectations",
  "recommendation": "shortlist | reject | review",
  "candidateProfile": {
    "name": "full name or null",
    "email": "email or null",
    "location": "location or null",
    "totalExperienceYears": number of years,
    "university": "university name or null",
    "availability": "availability or null"
  },
  "skillProficiency": [
    { "skill": "skill", "level": "Beginner|Intermediate|Advanced|Expert", "percentage": 0-100 }
  ],
  "employmentHistory": [
    { "company": "company", "role": "role", "duration": "duration", "description": "desc" }
  ],
  "aiNote": "1 sentence highlight"
}
Only return valid JSON. Do not include markdown codeblocks or extra text.
`;

    return enqueueTask(async () => {
        let lastError;

        // --- 1. PRIMARY: Gemini API ---
        if (process.env.GEMINI_API_KEY) {
            console.log(`🤖 LLM Flow: Trying PRIMARY (Gemini)...`);
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            for (let i = 0; i < 2; i++) {
                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.0-flash',
                        contents: prompt,
                    });
                    const text = response.text;
                    const cleanJSON = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    return JSON.parse(cleanJSON);
                } catch (err) {
                    lastError = err;
                    console.warn(`⚠️ Gemini Attempt ${i + 1} failed: ${err.message}`);
                    if (i === 0 && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('503'))) {
                        await new Promise(r => setTimeout(r, 4000)); // wait 4 seconds before retry
                    }
                }
            }
        }

        // --- 2. BACKUP 1: OpenAI API ---
        if (process.env.OPENAI_API_KEY) {
            console.log(`🤖 Failover: Trying BACKUP 1 (OpenAI)...`);
            try {
                const resultText = await callOpenAICompatible(
                    'https://api.openai.com/v1/chat/completions',
                    process.env.OPENAI_API_KEY,
                    'gpt-4o-mini',
                    prompt
                );
                const cleanJSON = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                return JSON.parse(cleanJSON);
            } catch (err) {
                lastError = err;
                console.warn(`⚠️ OpenAI backup failed: ${err.message}`);
            }
        }

        // --- 3. BACKUP 2: OpenRouter ---
        if (process.env.OPENROUTER_API_KEY) {
            console.log(`🤖 Failover: Trying BACKUP 2 (OpenRouter)...`);
            try {
                const resultText = await callOpenAICompatible(
                    'https://openrouter.ai/api/v1/chat/completions',
                    process.env.OPENROUTER_API_KEY,
                    'google/gemini-2.0-flash-lite:free',
                    prompt
                );
                const cleanJSON = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                return JSON.parse(cleanJSON);
            } catch (err) {
                lastError = err;
                console.warn(`⚠️ OpenRouter backup failed: ${err.message}`);
            }
        }

        // --- 4. BACKUP 3: OpenRouter (secondary model — Llama 3.1 8B free) ---
        if (process.env.OPENROUTER_API_KEY) {
            console.log(`🤖 Failover: Trying BACKUP 3 (OpenRouter Llama-3.1-8B)...`);
            try {
                const resultText = await callOpenAICompatible(
                    'https://openrouter.ai/api/v1/chat/completions',
                    process.env.OPENROUTER_API_KEY,
                    'meta-llama/llama-3.1-8b-instruct:free',
                    prompt
                );
                const cleanJSON = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                return JSON.parse(cleanJSON);
            } catch (err) {
                lastError = err;
                console.warn(`⚠️ OpenRouter Backup 3 failed: ${err.message}`);
            }
        }

        // --- 5. ALL FAILURES: Return Caching Fallback Response ---
        console.error(`❌ ALL LLM providers failed. Returning fallback offline result. Last error:`, lastError?.message);
        return generateOfflineFallback(lastError?.message);
    });
}

module.exports = { screenResume, cleanText };
