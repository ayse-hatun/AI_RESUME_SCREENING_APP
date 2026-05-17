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
const Job = require('../models/job.model');
const { screenResume } = require('../services/gemini.service');
const { sendScreeningResultEmail, sendStatusUpdateEmail } = require('../services/email.service');

const MAX_UPLOAD_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


async function extractTextFromPDF(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error('File not found at ' + filePath);
    }
    const buffer = fs.readFileSync(filePath);
    try {
        // Use pdf-parse with options to be more forgiving
        const options = {
            pagerender: function(pageData) {
                return pageData.getTextContent()
                    .then(function(textContent) {
                        return textContent.items.map(item => item.str).join(' ');
                    });
            }
        };

        const data = await pdfParse(buffer, options);
        return data.text;
    } catch (err) {
        console.error('PDF Extraction Error:', err.message);
        // Fallback: try a simpler parse if the first one fails with XRef
        try {
            const data = await pdfParse(buffer);
            return data.text;
        } catch (innerErr) {
            console.error('PDF Fallback Extraction Error:', innerErr.message);
            throw new Error(`Failed to parse PDF: ${err.message} | Fallback Error: ${innerErr.message}`);
        }
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
    let resumeId = null;

    try {
        // 1️⃣ Validate required fields
        let { candidateName, candidateEmail, jobId, jobTitle, jobDescription } = req.body;

        // If jobId is provided, fetch job details from DB
        if (jobId) {
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({ success: false, error: 'Selected Job not found' });
            }
            jobTitle = job.title;
            jobDescription = job.description;
        }

        if (!candidateName || !candidateEmail || !jobTitle || !jobDescription) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: candidateName, candidateEmail, and (jobId or jobTitle+jobDescription)'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No resume file uploaded. Please upload a PDF or DOCX file.'
            });
        }

        const fileExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');

        // 2️⃣ Create initial DB record (status: pending)
        const newResume = await Resume.create({
            candidateName,
            candidateEmail,
            jobId: jobId || null,
            jobTitle,
            jobDescription,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: fileExt,
            status: 'pending' // changed from processing
        });

        resumeId = newResume._id;

        // 3️⃣ Return 202 Accepted immediately so frontend doesn't block
        res.status(202).json({
            success: true,
            message: 'Resume received and is being processed in the background.',
            data: {
                resumeId: newResume._id,
                status: 'pending',
                checkStatusUrl: `/api/resumes/${newResume._id}/status`
            }
        });

        // 4️⃣ Process in the background (fully decoupled from request lifecycle)
        setTimeout(() => {
            processResumeBackground(newResume._id, fileExt, req.file.path, candidateName, candidateEmail, jobTitle, jobDescription, jobId);
        }, 50);

    } catch (error) {
        console.error('❌ Upload error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Resume upload failed',
            details: error.message
        });
    }
}

// ─── POST /api/bulk-screen-resume ─────────────────────────────────────────────
// Handles multiple resume uploads for a single job
async function bulkScreenResumeHandler(req, res) {
    try {
        const { jobId, jobTitle, jobDescription } = req.body;
        
        console.log(`📂 Bulk Upload Started: ${req.files?.length} files for Job ${jobId}`);
        
        // 1️⃣ Validate
        if (!jobId && (!jobTitle || !jobDescription)) {
            console.log('❌ Bulk Upload Failed: Missing Job ID/Desc');
            return res.status(400).json({ success: false, error: 'Missing Job ID or Description' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        if (req.files.length > MAX_UPLOAD_FILES) {
            return res.status(400).json({ 
                success: false, 
                error: `Too many files. Max ${MAX_UPLOAD_FILES} files allowed per batch.` 
            });
        }

        // Validate each file before processing anything
        for (const file of req.files) {
            const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
            if (!['pdf', 'docx', 'txt'].includes(fileExt)) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Unsupported file type: .${fileExt} in file ${file.originalname}. Only PDF, DOCX, and TXT are allowed.` 
                });
            }
            if (file.size > MAX_FILE_SIZE) {
                return res.status(400).json({ 
                    success: false, 
                    error: `File ${file.originalname} exceeds the 5MB size limit.` 
                });
            }
        }


        let targetJobTitle = jobTitle;
        let targetJobDesc = jobDescription;

        if (jobId) {
            const job = await Job.findById(jobId);
            if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
            targetJobTitle = job.title;
            targetJobDesc = job.description;
        }

        // 2️⃣ Create records for each file as PENDING
        const tasks = [];
        const resumeIds = [];

        for (const file of req.files) {
            const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
            const resume = await Resume.create({
                candidateName: file.originalname.split('.')[0], 
                candidateEmail: 'bulk-upload@pending.ai',      
                jobId: jobId || null,
                jobTitle: targetJobTitle,
                jobDescription: targetJobDesc,
                fileName: file.originalname,
                filePath: file.path,
                fileType: fileExt,
                status: 'pending',
                pipelineStage: 'applied' // Put them in the applied column immediately
            });
            
            resumeIds.push(resume._id);
            tasks.push({
                id: resume._id,
                fileExt,
                path: file.path,
                name: resume.candidateName,
                email: resume.candidateEmail
            });
        }

        console.log(`✅ ${resumeIds.length} records created. Queueing sequential processing...`);

        // 3️⃣ Parallel Background Processor (2 at a time)
        // Process resumes in batches of 2 to maximize throughput without hitting rate limits
        const BATCH_SIZE = 2;
        const runParallelBatches = async () => {
            const totalStart = Date.now();
            for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
                const batch = tasks.slice(i, i + BATCH_SIZE);
                console.log(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tasks.length / BATCH_SIZE)}: [${batch.map(t => t.name).join(', ')}]`);
                
                // Process batch in parallel
                await Promise.allSettled(
                    batch.map(task => 
                        processResumeBackground(
                            task.id, 
                            task.fileExt, 
                            task.path, 
                            task.name, 
                            task.email, 
                            targetJobTitle, 
                            targetJobDesc, 
                            jobId
                        ).catch(err => {
                            console.error(`❌ Processing failed for ${task.id}:`, err.message);
                        })
                    )
                );
                
                // Small cooldown between batches to avoid rate limiting
                if (i + BATCH_SIZE < tasks.length) {
                    await new Promise(r => setTimeout(r, 500));
                }
            }
            const totalTime = ((Date.now() - totalStart) / 1000).toFixed(1);
            console.log(`🏁 Bulk processing complete for Job ${jobId} — ${tasks.length} resumes in ${totalTime}s`);
        };

        // Start the queue on next tick
        setTimeout(runParallelBatches, 100);

        res.status(202).json({
            success: true,
            message: `${req.files.length} resumes uploaded successfully. Processing has started in the background.`,
            count: req.files.length,
            resumeIds
        });

    } catch (error) {
        console.error('🔥 Bulk Upload Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

// ─── Background Processor ──────────────────────────────────────────────────────
async function processResumeBackground(resumeId, fileExt, filePath, candidateName, candidateEmail, jobTitle, jobDescription, jobId) {
    const startTime = Date.now();
    try {
        await Resume.findByIdAndUpdate(resumeId, { status: 'processing' });

        // Extract text from the resume file
        let extractedText = '';
        if (fileExt === 'pdf') {
            extractedText = await extractTextFromPDF(filePath);
        } else if (fileExt === 'docx') {
            extractedText = await extractTextFromDOCX(filePath);
        } else if (fileExt === 'txt') {
            extractedText = fs.readFileSync(filePath, 'utf8');
        } else {
            // Explicitly handle unsupported types to avoid empty extractedText issues
            await Resume.findByIdAndUpdate(resumeId, { 
                status: 'failed', 
                errorMessage: `Unsupported file type: ${fileExt}` 
            });
            return;
        }


        if (!extractedText || extractedText.trim().length < 50) {
            await Resume.findByIdAndUpdate(resumeId, {
                status: 'failed',
                errorMessage: 'Could not extract readable text from the uploaded file.'
            });
            return;
        }

        // Send to Gemini AI for screening
        console.log(`🤖 Background: Sending resume to Gemini AI for: ${candidateName}`);
        const aiResult = await screenResume(extractedText, jobDescription);

        // Build a single update object with all results
        const updateData = {
            extractedText,
            screeningResult: aiResult,
            candidateProfile: aiResult.candidateProfile,
            skillProficiency: aiResult.skillProficiency,
            employmentHistory: aiResult.employmentHistory,
            aiNote: aiResult.aiNote,
            status: 'completed'
        };

        // ─── Auto-Rejection Logic ───
        if (jobId) {
            const job = await Job.findById(jobId);
            if (job && job.autoRejectionEnabled && aiResult.matchScore < job.autoRejectionThreshold) {
                updateData.pipelineStage = 'rejected';
                updateData.aiNote = `[AUTO-REJECTED] Score ${aiResult.matchScore} is below threshold (${job.autoRejectionThreshold}). ${aiResult.aiNote || ''}`;
                console.log(`🚫 Background: Auto-rejected ${candidateName} (Score: ${aiResult.matchScore})`);
            }
        }

        // Single atomic DB write with all results
        await Resume.findByIdAndUpdate(resumeId, updateData);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Background: ${candidateName} completed in ${elapsed}s`);

        // Send result email to candidate (non-blocking, don't slow down processing)
        sendScreeningResultEmail(candidateEmail, candidateName, jobTitle, aiResult)
            .then(() => {
                Resume.findByIdAndUpdate(resumeId, {
                    emailSent: true,
                    emailSentAt: new Date()
                }).catch(() => {});
                console.log(`📧 Background: Email sent to ${candidateEmail}`);
            })
            .catch(emailErr => {
                console.error('⚠️ Background: Email send failed (non-critical):', emailErr.message);
            });

    } catch (error) {
        console.error(`❌ Background processing error for resume ${resumeId}:`, error.message);
        await Resume.findByIdAndUpdate(resumeId, {
            status: 'failed',
            errorMessage: error.message
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

// ─── PATCH /api/resumes/:id/stage ─────────────────────────────────────────────
// Update candidate pipeline stage (and optionally send email if shortlisted)
async function updatePipelineStage(req, res) {
    try {
        const { stage, sendEmail } = req.body;
        
        const validStages = ['applied', 'screened', 'shortlisted', 'rejected', 'hired'];
        if (!validStages.includes(stage)) {
            return res.status(400).json({ success: false, error: 'Invalid pipeline stage' });
        }

        const resume = await Resume.findById(req.params.id).populate('jobId');
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }

        resume.pipelineStage = stage;
        resume.pipelineStageChangedAt = new Date();
        if (stage === 'shortlisted') {
            resume.shortlistedAt = new Date();
        }
        await resume.save();

        // Optional email sending logic based on stage (non-blocking)
        if (['shortlisted', 'rejected', 'applied'].includes(stage) && sendEmail) {
            sendStatusUpdateEmail(resume.candidateEmail, resume.candidateName, resume.jobTitle, stage)
                .catch(err => {
                    console.error(`⚠️ Failed to send ${stage} email to ${resume.candidateEmail}:`, err.message);
                });
        }

        return res.status(200).json({ success: true, data: resume });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// ─── GET /api/resumes/:id/status ──────────────────────────────────────────────
// Poll processing status for async uploads
async function getResumeStatus(req, res) {
    try {
        const resume = await Resume.findById(req.params.id).select('status errorMessage pipelineStage');
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }
        return res.status(200).json({ success: true, data: resume });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// ─── POST /api/resumes/:id/retry ──────────────────────────────────────────────
// Retry a failed resume screening
async function retryResume(req, res) {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }
        if (resume.status !== 'failed') {
            return res.status(400).json({ success: false, error: 'Only failed resumes can be retried' });
        }

        // Reset status to pending
        await Resume.findByIdAndUpdate(resume._id, { 
            status: 'pending', 
            errorMessage: null 
        });

        // Re-trigger background processing
        const fileExt = resume.fileType || path.extname(resume.fileName).toLowerCase().replace('.', '');
        setTimeout(() => {
            processResumeBackground(
                resume._id,
                fileExt,
                resume.filePath,
                resume.candidateName,
                resume.candidateEmail,
                resume.jobTitle,
                resume.jobDescription,
                resume.jobId
            );
        }, 100);

        return res.status(202).json({ 
            success: true, 
            message: 'Resume re-queued for processing' 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    screenResumeHandler,
    bulkScreenResumeHandler,
    getAllResumes,
    getResumeById,
    deleteResume,
    updatePipelineStage,
    getResumeStatus,
    retryResume,
    processResumeBackground
};
