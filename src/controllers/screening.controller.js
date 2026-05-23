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
const { screenResume, cleanText } = require('../services/gemini.service');
const { sendScreeningResultEmail, sendStatusUpdateEmail } = require('../services/email.service');
const { moveFileToUserFolder } = require('../utils/file');

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
            pagerender: function (pageData) {
                return pageData.getTextContent()
                    .then(function (textContent) {
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

        let autoRejectionEnabled = false;
        let autoRejectionThreshold = 40;

        // If jobId is provided, fetch job details from DB
        if (jobId) {
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({ success: false, error: 'Selected Job not found' });
            }
            jobTitle = job.title;
            jobDescription = job.description;
            autoRejectionEnabled = job.autoRejectionEnabled || false;
            autoRejectionThreshold = Math.max(40, job.autoRejectionThreshold || 40);
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
 
        // Move file to user isolated folder
        const secureFilePath = moveFileToUserFolder(req.file.path, req.user._id);

        // 2️⃣ Create initial DB record (status: pending)
        const newResume = await Resume.create({
            candidateName,
            candidateEmail,
            jobId: jobId || null,
            jobTitle,
            jobDescription,
            fileName: req.file.originalname,
            filePath: secureFilePath,
            fileType: fileExt,
            status: 'pending', // changed from processing
            createdBy: req.user._id
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
            processResumeBackground(newResume._id, fileExt, secureFilePath, candidateName, candidateEmail, jobTitle, jobDescription, jobId, autoRejectionEnabled, autoRejectionThreshold);
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
        let autoRejectionEnabled = false;
        let autoRejectionThreshold = 40;

        if (jobId) {
            const job = await Job.findById(jobId);
            if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
            targetJobTitle = job.title;
            targetJobDesc = job.description;
            autoRejectionEnabled = job.autoRejectionEnabled || false;
            autoRejectionThreshold = Math.max(40, job.autoRejectionThreshold || 40);
        }

        // 2️⃣ Create records for each file as PENDING
        const resumeDocs = req.files.map(file => {
            const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
            const secureFilePath = moveFileToUserFolder(file.path, req.user._id);
            return {
                candidateName: file.originalname.split('.')[0],
                candidateEmail: 'bulk-upload@pending.ai',
                jobId: jobId || null,
                jobTitle: targetJobTitle,
                jobDescription: targetJobDesc,
                fileName: file.originalname,
                filePath: secureFilePath,
                fileType: fileExt,
                status: 'pending',
                pipelineStage: 'applied', // Put them in the applied column immediately
                createdBy: req.user._id
            };
        });

        const insertedResumes = await Resume.insertMany(resumeDocs);

        const tasks = insertedResumes.map((resume, index) => ({
            id: resume._id,
            fileExt: resumeDocs[index].fileType,
            path: resumeDocs[index].filePath,
            name: resume.candidateName,
            email: resume.candidateEmail
        }));

        const resumeIds = insertedResumes.map(r => r._id);

        console.log(`✅ ${resumeIds.length} records created. Queueing sequential processing...`);

        // 3️⃣ Sequential Background Processor
        // Resumes are processed ONE AT A TIME. The AI service already enforces
        // a 4.5 s gap between Gemini calls — running in parallel would just cause
        // all calls to queue up inside the service anyway, burning concurrency
        // overhead and making rate-limit collisions more likely.
        const runSequential = async () => {
            const totalStart = Date.now();
            console.log(`🔄 [Bulk] Starting sequential processing of ${tasks.length} resume(s)...`);

            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                console.log(`📄 [Bulk] Processing ${i + 1}/${tasks.length}: ${task.name}`);
                try {
                    await processResumeBackground(
                        task.id,
                        task.fileExt,
                        task.path,
                        task.name,
                        task.email,
                        targetJobTitle,
                        targetJobDesc,
                        jobId,
                        autoRejectionEnabled,
                        autoRejectionThreshold
                    );
                } catch (err) {
                    console.error(`❌ [Bulk] Failed for ${task.id} (${task.name}):`, err.message);
                    // Continue with next resume — one failure must not stop the batch
                }
            }

            const totalTime = ((Date.now() - totalStart) / 1000).toFixed(1);
            console.log(`🏁 [Bulk] Complete — ${tasks.length} resume(s) in ${totalTime}s`);
        };

        // Kick off on next tick so the HTTP 202 response is sent first
        setTimeout(runSequential, 100);

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
async function processResumeBackground(resumeId, fileExt, filePath, candidateName, candidateEmail, jobTitle, jobDescription, jobId, autoRejectionEnabled = false, autoRejectionThreshold = 40) {
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

        // Caching System
        const crypto = require('crypto');
        const preprocessedResume = cleanText(extractedText);
        const preprocessedJob = cleanText(jobDescription);
        
        // Calculate the cache key by combining resume and job content
        const cacheHash = crypto.createHash('sha256').update(preprocessedResume + '|||' + preprocessedJob).digest('hex');

        // Look for any existing successfully completed resume matching this hash
        const cachedResume = await Resume.findOne({ cacheHash, status: 'completed' });

        let aiResult;
        if (cachedResume) {
            console.log(`🎯 Cache Hit! Reusing completed AI analysis for hash: ${cacheHash}`);
            aiResult = {
                ...cachedResume.screeningResult.toObject(),
                candidateProfile: cachedResume.candidateProfile ? cachedResume.candidateProfile.toObject() : undefined,
                skillProficiency: cachedResume.skillProficiency ? cachedResume.skillProficiency.map(s => s.toObject()) : undefined,
                employmentHistory: cachedResume.employmentHistory ? cachedResume.employmentHistory.map(e => e.toObject()) : undefined,
                aiNote: cachedResume.aiNote
            };
        } else {
            // Send to the failover AI system
            console.log(`🤖 Background: Sending resume to AI system for: ${candidateName}`);
            aiResult = await screenResume(extractedText, jobDescription);
        }

        // Build a single update object with all results
        const updateData = {
            extractedText,
            cacheHash,
            screeningResult: aiResult,
            candidateProfile: aiResult.candidateProfile,
            skillProficiency: aiResult.skillProficiency,
            employmentHistory: aiResult.employmentHistory,
            aiNote: aiResult.aiNote,
            status: 'completed'
        };

        // Resolve candidate email from AI if current email is placeholder
        let resolvedEmail = candidateEmail;
        if ((!candidateEmail || candidateEmail === 'bulk-upload@pending.ai') && aiResult.candidateProfile?.email) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            const extractedEmail = aiResult.candidateProfile.email.trim().toLowerCase();
            if (emailRegex.test(extractedEmail)) {
                resolvedEmail = extractedEmail;
                updateData.candidateEmail = resolvedEmail;
                console.log(`📧 Resolved real email from CV: ${resolvedEmail}`);
            }
        }

        // Resolve candidate name from AI if currently it's just a filename or placeholder
        let resolvedName = candidateName;
        if (aiResult.candidateProfile?.name) {
            const extractedName = aiResult.candidateProfile.name.trim();
            // Update if it's currently a placeholder or contains file extension dots
            if (!candidateName || candidateName === 'bulk-upload' || candidateName.includes('.') || candidateName.toLowerCase().includes('resume')) {
                resolvedName = extractedName;
                updateData.candidateName = resolvedName;
                console.log(`👤 Resolved real name from CV: ${resolvedName}`);
            }
        }

        // ─── Auto-Rejection Logic ───
        const score = aiResult.matchScore != null ? Number(aiResult.matchScore) : NaN;
        let threshold = autoRejectionThreshold != null ? Number(autoRejectionThreshold) : NaN;
        if (!isNaN(threshold)) {
            threshold = Math.max(40, threshold);
        }

        if (jobId && autoRejectionEnabled && !isNaN(score) && !isNaN(threshold) && score < threshold) {
            updateData.pipelineStage = 'rejected';
            updateData.aiNote = `[AUTO-REJECTED] Score ${score}% is below threshold (${threshold}%). ${aiResult.aiNote || ''}`;
            console.log(`🚫 Background: Auto-rejected ${resolvedName} (Score: ${score}%, Threshold: ${threshold}%)`);
        }

        // Single atomic DB write with all results
        await Resume.findByIdAndUpdate(resumeId, updateData);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Background: ${resolvedName} completed in ${elapsed}s`);

        // Send result email to candidate if we have a valid non-placeholder email
        if (resolvedEmail && resolvedEmail !== 'bulk-upload@pending.ai') {
            sendScreeningResultEmail(resolvedEmail, resolvedName, jobTitle, aiResult)
                .then(() => {
                    Resume.findByIdAndUpdate(resumeId, {
                        emailSent: true,
                        emailSentAt: new Date()
                    }).catch(() => { });
                    console.log(`📧 Background: Email sent to ${resolvedEmail}`);
                })
                .catch(emailErr => {
                    console.error('⚠️ Background: Email send failed (non-critical):', emailErr.message);
                });
        } else {
            console.log(`⚠️ Background: Skipping email sending, no real candidate email available.`);
        }

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

        // Get all jobs created by this user
        const userJobs = await Job.find({ createdBy: req.user._id }).select('_id');
        const jobIds = userJobs.map(j => j._id);

        // Filter: either the resume is associated with one of the user's jobs,
        // or the resume was explicitly uploaded by the user.
        const filter = {
            $or: [
                { jobId: { $in: jobIds } },
                { createdBy: req.user._id }
            ]
        };

        const total = await Resume.countDocuments(filter);
        const resumes = await Resume.find(filter)
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

        // Ownership validation: must be admin, or have created the resume, or created the job associated with the resume
        let isAuthorized = req.user.role === 'admin' || (resume.createdBy && resume.createdBy.toString() === req.user._id.toString());
        
        if (!isAuthorized && resume.jobId) {
            const job = await Job.findById(resume.jobId);
            if (job && job.createdBy.toString() === req.user._id.toString()) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to access this resume' });
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

        // Ownership validation: must be admin, or have created the resume, or created the job associated with the resume
        let isAuthorized = req.user.role === 'admin' || (resume.createdBy && resume.createdBy.toString() === req.user._id.toString());
        
        if (!isAuthorized && resume.jobId) {
            const job = await Job.findById(resume.jobId);
            if (job && job.createdBy.toString() === req.user._id.toString()) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this resume' });
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

        // Ownership validation: must be admin, or have created the resume, or created the job associated with the resume
        let isAuthorized = req.user.role === 'admin' || (resume.createdBy && resume.createdBy.toString() === req.user._id.toString());
        
        if (!isAuthorized && resume.jobId) {
            const jobOwner = resume.jobId.createdBy ? resume.jobId.createdBy.toString() : null;
            if (jobOwner === req.user._id.toString()) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this resume' });
        }

        resume.pipelineStage = stage;
        resume.pipelineStageChangedAt = new Date();
        if (stage === 'shortlisted') {
            resume.shortlistedAt = new Date();
        }
        await resume.save();

        // Optional email sending logic based on stage (non-blocking)
        if (['shortlisted', 'rejected', 'applied'].includes(stage) && sendEmail) {
            const shortReason = resume.screeningResult?.summary || resume.aiNote || '';
            sendStatusUpdateEmail(resume.candidateEmail, resume.candidateName, resume.jobTitle, stage, shortReason)
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
        const resume = await Resume.findById(req.params.id).select('status errorMessage pipelineStage createdBy jobId');
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }

        // Ownership validation: must be admin, or have created the resume, or created the job associated with the resume
        let isAuthorized = req.user.role === 'admin' || (resume.createdBy && resume.createdBy.toString() === req.user._id.toString());
        
        if (!isAuthorized && resume.jobId) {
            const job = await Job.findById(resume.jobId);
            if (job && job.createdBy.toString() === req.user._id.toString()) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to access this resume status' });
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

        // Ownership validation: must be admin, or have created the resume, or created the job associated with the resume
        let isAuthorized = req.user.role === 'admin' || (resume.createdBy && resume.createdBy.toString() === req.user._id.toString());
        
        if (!isAuthorized && resume.jobId) {
            const job = await Job.findById(resume.jobId);
            if (job && job.createdBy.toString() === req.user._id.toString()) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to retry this resume' });
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
        let autoRejectionEnabled = false;
        let autoRejectionThreshold = 40;
        if (resume.jobId) {
            const job = await Job.findById(resume.jobId);
            if (job) {
                autoRejectionEnabled = job.autoRejectionEnabled || false;
                autoRejectionThreshold = Math.max(40, job.autoRejectionThreshold || 40);
            }
        }

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
                resume.jobId,
                autoRejectionEnabled,
                autoRejectionThreshold
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
