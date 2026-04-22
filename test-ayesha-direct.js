/**
 * Direct Test Script for Ayesha Rasheed's Resume
 * This script bypasses the HTTP server and directly calls the AI screening functions.
 * Run this with: node test-ayesha-direct.js
 */

const fs = require('fs');
const path = require('path');
const { screenResume } = require('./src/services/gemini.service');

// Configuration
const RESUME_PATH = "C:\\Users\\AKUWAT\\Downloads\\Ayesha Rasheed.docx";
const JOB_TITLE = "Senior Full Stack Developer";
const JOB_DESCRIPTION = `
We are looking for a Senior Full Stack Developer to join our team. 
The ideal candidate should have:
- 3+ years of experience with Node.js and React.js
- Strong proficiency in JavaScript/TypeScript
- Experience with MongoDB and REST APIs
- Knowledge of system architecture and cloud platforms (AWS/Azure/GCP)
- Experience in professional portfolio development or AI applications is a plus.
`;

async function getDocxText(filePath) {
    try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (err) {
        console.error("\n❌ Error: mammoth library is required for .docx files but is not installed.");
        console.log("Please run: npm install mammoth");
        console.log("\nTrying fallback: reading file raw (this might not work well)...");
        const data = fs.readFileSync(filePath, 'utf8');
        // Very basic extraction of printable characters as a last resort
        return data.replace(/[^\x20-\x7E\n\t]/g, ' ');
    }
}

async function runTest() {
    console.log("🚀 Starting direct screening for Ayesha Rasheed...");
    
    if (!fs.existsSync(RESUME_PATH)) {
        console.error(`❌ Resume file not found at: ${RESUME_PATH}`);
        return;
    }

    console.log("📄 Reading resume file...");
    const resumeText = await getDocxText(RESUME_PATH);
    
    if (!resumeText || resumeText.length < 100) {
        console.error("❌ Failed to extract meaningful text from the resume.");
        return;
    }

    console.log("🤖 Sending to Gemini AI for screening (gemini-2.5-flash)...");
    try {
        const aiResult = await screenResume(resumeText, JOB_DESCRIPTION);
        
        console.log("\n" + "=".repeat(50));
        console.log("✅ SCREENING RESULT");
        console.log("=".repeat(50));
        console.log(`\nMatch Score: ${aiResult.matchScore}%`);
        console.log(`Verdict: ${aiResult.verdict}`);
        console.log(`Summary: ${aiResult.summary}`);
        
        console.log("\nStrengths:");
        aiResult.strengths.forEach(s => console.log(` - ${s}`));
        
        console.log("\nWeaknesses:");
        aiResult.weaknesses.forEach(w => console.log(` - ${w}`));
        
        console.log("\nSkills Matched:", aiResult.skills.matched.join(", "));
        console.log("Skills Missing:", aiResult.skills.missing.join(", "));
        
        console.log(`\nRecommendation: ${aiResult.recommendation}`);
        console.log("=".repeat(50));
        
    } catch (error) {
        console.error("\n❌ AI Screening failed:", error.message);
        if (error.message.includes("quota")) {
            console.log("Tip: You might have hit the Gemini API free tier limit. Try again in a minute.");
        }
    }
}

runTest();
