// Screening Controller
// Handles the full resume screening pipeline:
// 1. Receive uploaded file
// 2. Extract text from PDF/DOCX
// 3. Send to Gemini AI for analysis
// 4. Save result to MongoDB
// 5. Send result email to candidate

const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/resume.model');
const { screenResume } = require('../services/gemini.service');
const { sendScreeningResultEmail } = require('../services/email.service');

async function extractTextFromPDF(filePath) {
    const buffer = fs.readFileSync(filePath);
    try {
        // Try as a function (pdf-parse v1)
        if (typeof pdfParse === 'function') {
            const data = await pdfParse(buffer);
            return data.text;
        } 
        // Try as a class or object (pdf-parse v2)
        const pdfParseObj = pdfParse.default || pdfParse;
        if (typeof pdfParseObj === 'function') {
            const data = await pdfParseObj(buffer);
            return data.text;
        }
        if (pdfParseObj && pdfParseObj.PDFParse) {
            const parser = new pdfParseObj.PDFParse();
            const data = await parser.parse(buffer);
            return data.text;
        }
        throw new Error('Unsupported pdf-parse version or format');
    } catch (err) {
        console.error('PDF Extraction Error:', err.message);
        throw err;
    }
}

// ─── Helper: Extract text from DOCX ───────────────────────────────────────────
async function extractTextFromDOCX(filePath) {
    // Use mammoth if available, otherwise read raw text
    try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (err) {
        // Fallback: try reading as text
        return fs.readFileSync(filePath, 'utf8');
    }
}

// ─── POST /api/screen-resume ──────────────────────────────────────────────────
// Main endpoint: accepts file upload + candidate info + job description
async function screenResumeHandler(req, res) {
    const resumeDoc = null;

    try {
        // 1️⃣ Validate required fields
        const { candidateName, candidateEmail, jobTitle, jobDescription } = req.body;

        if (!candidateName || !candidateEmail || !jobTitle || !jobDescription) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: candidateName, candidateEmail, jobTitle, jobDescription'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No resume file uploaded. Please upload a PDF or DOCX file.'
            });
        }

        const fileExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');

        // 2️⃣ Create initial DB record (status: processing)
        const newResume = await Resume.create({
            candidateName,
            candidateEmail,
            jobTitle,
            jobDescription,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: fileExt,
            status: 'processing'
        });

        // 3️⃣ Extract text from the resume file
        let extractedText = '';
        if (fileExt === 'pdf') {
            extractedText = await extractTextFromPDF(req.file.path);
        } else if (fileExt === 'docx') {
            extractedText = await extractTextFromDOCX(req.file.path);
        }

        if (!extractedText || extractedText.trim().length < 50) {
            await Resume.findByIdAndUpdate(newResume._id, {
                status: 'failed',
                errorMessage: 'Could not extract readable text from the uploaded file.'
            });
            return res.status(422).json({
                success: false,
                error: 'Could not extract readable text from the resume. Please upload a text-based PDF.'
            });
        }

        // Save extracted text
        await Resume.findByIdAndUpdate(newResume._id, { extractedText });

        // 4️⃣ Send to Gemini AI for screening
        console.log(`🤖 Sending resume to Gemini AI for: ${candidateName}`);
        const aiResult = await screenResume(extractedText, jobDescription);

        // 5️⃣ Update DB with AI result
        await Resume.findByIdAndUpdate(newResume._id, {
            screeningResult: aiResult,
            status: 'completed'
        });

        // 6️⃣ Send result email to candidate (non-blocking — don't fail if email fails)
        let emailSent = false;
        try {
            await sendScreeningResultEmail(candidateEmail, candidateName, jobTitle, aiResult);
            await Resume.findByIdAndUpdate(newResume._id, {
                emailSent: true,
                emailSentAt: new Date()
            });
            emailSent = true;
            console.log(`📧 Email sent to ${candidateEmail}`);
        } catch (emailErr) {
            console.error('⚠️  Email send failed (non-critical):', emailErr.message);
        }

        // 7️⃣ Return success response
        const finalResume = await Resume.findById(newResume._id);
        return res.status(200).json({
            success: true,
            message: `Resume screened successfully${emailSent ? ' and result emailed to candidate' : ''}`,
            data: {
                resumeId: finalResume._id,
                candidateName: finalResume.candidateName,
                candidateEmail: finalResume.candidateEmail,
                jobTitle: finalResume.jobTitle,
                status: finalResume.status,
                emailSent: finalResume.emailSent,
                screeningResult: finalResume.screeningResult
            }
        });

    } catch (error) {
        console.error('❌ Screening error:', error.message);

        // Mark as failed in DB if we have a record
        if (resumeDoc?._id) {
            await Resume.findByIdAndUpdate(resumeDoc._id, {
                status: 'failed',
                errorMessage: error.message
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Resume screening failed',
            details: error.message
        });
    }
}

// ─── GET /api/resumes ─────────────────────────────────────────────────────────
// Get all screened resumes (with pagination)
async function getAllResumes(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Resume.countDocuments();
        const resumes = await Resume.find()
            .select('-extractedText -filePath')    // Exclude heavy fields
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: resumes
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// ─── GET /api/resumes/:id ─────────────────────────────────────────────────────
// Get a single resume screening result by ID
async function getResumeById(req, res) {
    try {
        const resume = await Resume.findById(req.params.id).select('-filePath');
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }
        return res.status(200).json({ success: true, data: resume });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// ─── DELETE /api/resumes/:id ──────────────────────────────────────────────────
// Delete a resume record (and its file from disk)
async function deleteResume(req, res) {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }

        // Delete file from disk
        if (resume.filePath && fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
        }

        await Resume.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Resume deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    screenResumeHandler,
    getAllResumes,
    getResumeById,
    deleteResume
};
