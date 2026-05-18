const Job = require('../models/job.model');
const Resume = require('../models/resume.model');
const path = require('path');
const { processResumeBackground } = require('./screening.controller');

/**
 * @desc    Get all active jobs for candidates
 * @route   GET /api/public/jobs
 * @access  Public
 */
exports.getActiveJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'active' })
            .select('title department location description requiredSkills experienceYears educationLevel createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get a single active job by ID
 * @route   GET /api/public/jobs/:id
 * @access  Public
 */
exports.getPublicJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .select('title department location description requiredSkills experienceYears educationLevel status createdAt');

        if (!job || job.status !== 'active') {
            return res.status(404).json({ success: false, error: 'Job not found or is no longer active' });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Submit a candidate application
 * @route   POST /api/public/apply
 * @access  Public
 */
exports.submitApplication = async (req, res) => {
    try {
        const { fullName, candidateName, email, candidateEmail, phone, jobId } = req.body;

        // Support both field naming conventions (career page vs public apply)
        const resolvedName = fullName || candidateName;
        const resolvedEmail = email || candidateEmail;

        // 1. Validate required fields
        if (!resolvedName || !resolvedEmail || !req.file || !jobId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide full name, email, jobId, and a resume file' 
            });
        }

        // 2. Confirm job exists and is active
        const job = await Job.findById(jobId);
        if (!job || job.status !== 'active') {
            return res.status(404).json({ success: false, error: 'Job not found or is closed' });
        }

        // 2.5 Confirm not already applied
        const existingApplication = await Resume.findOne({
            candidateEmail: resolvedEmail,
            jobId: job._id
        });
        
        if (existingApplication) {
            return res.status(409).json({ 
                success: false, 
                error: 'You have already submitted an application for this position using this email address.' 
            });
        }

        // 3. Create new Resume/Application record
        // We set status to 'pending' to trigger the existing AI pipeline
        const application = await Resume.create({
            candidateName: resolvedName,
            candidateEmail: resolvedEmail,
            candidateProfile: {
                location: 'Not Provided', // Default
                phone: phone || ''
            },
            jobId: job._id,
            jobTitle: job.title,
            jobDescription: job.description,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
            status: 'pending',
            pipelineStage: 'applied'
        });

        // 4. Trigger AI screening in the background (fully decoupled)
        const fileExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');
        setTimeout(() => {
            processResumeBackground(
                application._id, 
                fileExt, 
                req.file.path, 
                resolvedName, 
                resolvedEmail, 
                job.title, 
                job.description, 
                job._id,
                job.autoRejectionEnabled || false,
                job.autoRejectionThreshold || 0
            );
        }, 50);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                id: application._id,
                candidateName: application.candidateName
            }
        });
    } catch (error) {
        console.error('❌ Public Application Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack // Temporarily include stack for debugging
        });
    }
};
