// AI Screening Service — Production Grade v4
// Uses axios (not native fetch) — more reliable on all Node.js versions & networks.
//
// Provider priority:
//   1. Groq API         — free 500K tokens/day, Llama 3.3 70B, accessible globally
//   2. Direct Gemini    — if key has quota and region allows
//   3. OpenRouter       — dynamically discovered free models
//   4. Offline fallback — deterministic, no AI call

'use strict';

require('dotenv').config({ override: true });
const axios         = require('axios');
const { GoogleGenAI } = require('@google/genai');

// ─── Token Budget ─────────────────────────────────────────────────────────────
const MAX_RESUME_CHARS = 8000;  // ~2 000 tokens
const MAX_JOB_CHARS    = 2000;  // ~500  tokens

// ─── Gemini Sequential Rate-Limit Queue ───────────────────────────────────────
const GEMINI_MIN_INTERVAL_MS = 4500; // ~13 RPM — safely under 15 RPM free cap
let _geminiTail   = Promise.resolve();
let _lastCallTime = 0;

function scheduleGeminiCall(fn) {
    const call = _geminiTail.then(async () => {
        const wait = GEMINI_MIN_INTERVAL_MS - (Date.now() - _lastCallTime);
        if (wait > 0 && _lastCallTime > 0) await new Promise(r => setTimeout(r, wait));
        _lastCallTime = Date.now();
        return fn();
    });
    _geminiTail = call.catch(() => {});
    return call;
}

// ─── Dynamic OpenRouter Model Discovery ───────────────────────────────────────
let _cachedFreeModels = null;
let _cacheTimestamp   = 0;
const MODEL_CACHE_TTL = 30 * 60 * 1000;

const PREFERRED_OPENROUTER_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'qwen/qwen3-235b-a22b:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
];

async function discoverFreeModels() {
    const now = Date.now();
    if (_cachedFreeModels && (now - _cacheTimestamp) < MODEL_CACHE_TTL) {
        return _cachedFreeModels;
    }
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return [];

    try {
        const { data } = await axios.get('https://openrouter.ai/api/v1/models', {
            headers: { Authorization: `Bearer ${key}` },
            timeout: 10000
        });
        const liveIds = new Set(
            (data?.data ?? []).filter(m => m.id.endsWith(':free')).map(m => m.id)
        );
        const ordered = PREFERRED_OPENROUTER_MODELS.filter(id => liveIds.has(id));
        for (const id of liveIds) { if (!ordered.includes(id)) ordered.push(id); }
        _cachedFreeModels = ordered.slice(0, 8);
        _cacheTimestamp   = now;
        console.log(`🌐 [OpenRouter] ${_cachedFreeModels.length} live free models:`, _cachedFreeModels);
        return _cachedFreeModels;
    } catch (err) {
        console.warn('⚠️  [OpenRouter] Model discovery failed:', err.message);
        _cachedFreeModels = PREFERRED_OPENROUTER_MODELS;
        _cacheTimestamp   = now;
        return _cachedFreeModels;
    }
}

discoverFreeModels().catch(() => {}); // warm cache at startup

// ─── Text Preprocessor ────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
    'a','about','above','after','again','against','all','am','an','and','any','are','as','at',
    'be','because','been','before','being','below','between','both','but','by','could','did',
    'do','does','doing','down','during','each','few','for','from','further','had','has','have',
    'having','he','her','here','hers','herself','him','himself','his','how','i','if','in','into',
    'is','it','its','itself','me','more','most','my','myself','no','nor','not','of','off','on',
    'once','only','or','other','our','ours','ourselves','out','over','own','same','she','should',
    'so','some','such','than','that','the','their','theirs','them','themselves','then','there',
    'these','they','this','those','through','to','too','under','until','up','very','was','we',
    'were','what','when','where','which','while','who','whom','why','with','would','you','your',
    'yours','yourself','yourselves'
]);

function preprocessText(text, maxChars) {
    if (!text) return '';
    return text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .split(' ')
        .filter(w => !STOP_WORDS.has(w.toLowerCase()))
        .join(' ')
        .substring(0, maxChars)
        .trim();
}

function cleanText(text) { return preprocessText(text, MAX_RESUME_CHARS); }

// ─── JSON Parser ──────────────────────────────────────────────────────────────
function safeParseJSON(raw) {
    if (!raw) throw new Error('Empty LLM response');
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    try { return JSON.parse(cleaned); } catch (_) {}
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
    throw new Error(`JSON parse failed: ${raw.substring(0, 300)}`);
}

// ─── Prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(resumeText, jobText) {
    return `You are an expert ATS. Analyse the resume against the job description.
Return ONLY a valid JSON object — no markdown fences, no extra text.

JOB DESCRIPTION:
${jobText}

RESUME:
${resumeText}

Required JSON schema:
{
  "matchScore": <integer 0-100>,
  "verdict": "<Highly Recommended|Recommended|Borderline|Not Recommended>",
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<str>"],
  "weaknesses": ["<str>"],
  "skills": { "matched": ["<skill>"], "missing": ["<skill>"] },
  "experienceMatch": "<Exceeds|Meets|Below expectations>",
  "recommendation": "<shortlist|reject|review>",
  "candidateProfile": {
    "name": "<full name or null>",
    "email": "<email or null>",
    "location": "<city/country or null>",
    "totalExperienceYears": <number>,
    "university": "<institution or null>",
    "availability": "<availability or null>"
  },
  "skillProficiency": [
    { "skill": "<name>", "level": "<Beginner|Intermediate|Advanced|Expert>", "percentage": <0-100> }
  ],
  "employmentHistory": [
    { "company": "<name>", "role": "<title>", "duration": "<period>", "description": "<1 line>" }
  ],
  "aiNote": "<1 sentence key insight>"
}`;
}

// ─── Groq API Call (axios) ────────────────────────────────────────────────────
// Groq: free 500K tokens/day, 6K tokens/min. Models: llama-3.3-70b, gemma2-9b
const GROQ_MODELS = [
    'llama-3.3-70b-versatile',  // best quality, 6K TPM
    'gemma2-9b-it',             // faster, lighter
    'llama3-8b-8192',           // fallback
];

async function callGroq(prompt) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY not set');

    for (const model of GROQ_MODELS) {
        try {
            console.log(`🤖 [Groq] Trying ${model}...`);
            const { data } = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model,
                    messages:    [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    max_tokens:  1000
                },
                {
                    headers: {
                        Authorization:  `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            const content = data?.choices?.[0]?.message?.content;
            if (!content) throw new Error('Empty content');
            console.log(`✅ [Groq] ${model} succeeded.`);
            return safeParseJSON(content);
        } catch (err) {
            const status = err.response?.status;
            console.warn(`⚠️  [Groq] ${model} failed (${status ?? err.message.substring(0, 80)})`);
            if (status === 429) {
                // Groq 429 usually resets in seconds — wait and try next model
                await new Promise(r => setTimeout(r, 3000));
            }
            // Continue to next Groq model
        }
    }
    throw new Error('All Groq models failed');
}

// ─── OpenRouter API Call (axios) ──────────────────────────────────────────────
async function callOpenRouter(modelId, prompt) {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error('OPENROUTER_API_KEY not configured');

    const doRequest = () => axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model:       modelId,
            messages:    [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens:  1000
        },
        {
            headers: {
                Authorization:  `Bearer ${key}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
                'X-Title':      'SmartHire AI'
            },
            timeout: 30000,
            validateStatus: () => true // Don't throw on 4xx — handle manually
        }
    );

    let res = await doRequest();

    if (res.status === 429) {
        const retryAfter = res.data?.error?.metadata?.retry_after_seconds ?? 10;
        const waitMs     = Math.ceil(retryAfter) * 1000 + 500;
        console.log(`⏳ [OpenRouter] ${modelId} → 429, waiting ${waitMs}ms...`);
        await new Promise(r => setTimeout(r, waitMs));
        res = await doRequest();
    }

    if (res.status === 404) {
        _cachedFreeModels = null; // Invalidate cache — model gone
        throw new Error(`404: model ${modelId} no longer exists on OpenRouter`);
    }

    if (res.status !== 200) {
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.data?.error ?? res.data).substring(0, 200)}`);
    }

    const content = res.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenRouter returned empty content');
    return safeParseJSON(content);
}

// ─── Offline Fallback ─────────────────────────────────────────────────────────
function generateOfflineFallback(reason = 'All AI providers unavailable.') {
    return {
        matchScore: 50, verdict: 'Borderline',
        summary: `AI Screening offline — manual review required. (${reason})`,
        strengths: [], weaknesses: [],
        skills: { matched: [], missing: [] },
        experienceMatch: 'Meets', recommendation: 'review',
        candidateProfile: {
            name: null, email: null, location: null,
            totalExperienceYears: 0, university: null, availability: null
        },
        skillProficiency: [], employmentHistory: [],
        aiNote: 'AI offline — awaiting manual review.'
    };
}

// ─── Main: screenResume ───────────────────────────────────────────────────────
async function screenResume(resumeText, jobDescription) {
    const processedResume = preprocessText(resumeText,    MAX_RESUME_CHARS);
    const processedJob    = preprocessText(jobDescription, MAX_JOB_CHARS);
    const prompt          = buildPrompt(processedResume, processedJob);
    let lastError;

    // ── 1. Groq (Primary — best free option, globally accessible) ─────────────
    if (process.env.GROQ_API_KEY) {
        try {
            return await callGroq(prompt);
        } catch (err) {
            lastError = err;
            console.warn(`⚠️  [AI] Groq fully failed: ${err.message}`);
        }
    } else {
        console.warn('⚠️  [AI] GROQ_API_KEY not set — add it to .env for best results');
    }

    // ── 2. Direct Gemini (if key has quota and region allows) ─────────────────
    if (process.env.GEMINI_API_KEY) {
        for (const model of ['gemini-2.0-flash', 'gemini-2.0-flash-lite']) {
            try {
                const result = await scheduleGeminiCall(async () => {
                    console.log(`🤖 [AI] Direct Gemini → ${model}...`);
                    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                    const response = await ai.models.generateContent({
                        model, contents: prompt,
                        config: { temperature: 0.1, maxOutputTokens: 1000 }
                    });
                    const text = response.text;
                    if (!text) throw new Error('empty response');
                    return safeParseJSON(text);
                });
                console.log(`✅ [AI] Gemini ${model} succeeded.`);
                return result;
            } catch (err) {
                lastError = err;
                const isZeroQuota = /limit[\":\s]+0/i.test(err.message);
                const isNotFound  = /404|NOT_FOUND/i.test(err.message);
                const isFetch     = /fetch failed|ECONNREFUSED|ENOTFOUND|network/i.test(err.message);
                console.warn(`⚠️  [AI] Gemini ${model}: ${err.message.substring(0, 120)}`);
                if (isZeroQuota || isNotFound || isFetch) {
                    console.warn('🚫 [AI] Gemini skipped (quota/region/network block).');
                    break;
                }
                if (/429|RESOURCE_EXHAUSTED/i.test(err.message)) {
                    await new Promise(r => setTimeout(r, 8000));
                }
            }
        }
    }

    // ── 3. OpenRouter fallbacks (dynamically discovered) ─────────────────────
    if (process.env.OPENROUTER_API_KEY) {
        const models = await discoverFreeModels();
        for (const modelId of models) {
            try {
                console.log(`🤖 [AI] OpenRouter → ${modelId}...`);
                const result = await callOpenRouter(modelId, prompt);
                console.log(`✅ [AI] OpenRouter ${modelId} succeeded.`);
                return result;
            } catch (err) {
                lastError = err;
                console.warn(`⚠️  [AI] OpenRouter ${modelId}: ${err.message.substring(0, 120)}`);
            }
        }
    }

    // ── 4. All failed ─────────────────────────────────────────────────────────
    console.error(`❌ [AI] All providers exhausted. Last: ${lastError?.message?.substring(0, 200)}`);
    return generateOfflineFallback(lastError?.message?.substring(0, 200));
}

module.exports = { screenResume, cleanText };
