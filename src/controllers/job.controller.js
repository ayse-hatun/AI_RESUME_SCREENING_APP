// Job Controller
// Handles CRUD operations for job postings

const Job = require('../models/job.model');
const Resume = require('../models/resume.model');

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private
 */
exports.createJob = async (req, res) => {
    try {
        const { title, description, requiredSkills, experienceYears, department, location, educationLevel, workType, salaryRange } = req.body;
        
        const job = new Job({
            title,
            description,
            requiredSkills,
            experienceYears,
            department,
            location,
            educationLevel,
            workType,
            salaryRange,
            createdBy: req.user._id
        });

        await job.save();

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: job
        });
    } catch (error) {
        console.error('❌ Create Job Error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            stack: error.stack // Temporarily include stack for debugging
        });
    }
};

/**
 * @desc    Get all job postings
 * @route   GET /api/jobs
 * @access  Private
 */
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:id
 * @access  Private
 */
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }
        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * @desc    Update a job posting
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
exports.updateJob = async (req, res) => {
    try {
        const allowedFields = [
            'title', 'description', 'requiredSkills', 'experienceYears', 
            'department', 'location', 'educationLevel', 'workType', 
            'salaryRange', 'status'
        ];

        const updateObj = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateObj[field] = req.body[field];
            }
        });

        const job = await Job.findOne({ _id: req.params.id });

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Ownership check
        if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this job'
            });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateObj, {
            new: true,
            runValidators: true
        });

        if (!updatedJob) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: updatedJob
        });
    } catch (error) {
        console.error('❌ Update Job Error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Ownership check
        if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this job'
            });
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * @desc    Get dashboard aggregate stats
 * @route   GET /api/jobs/dashboard/stats
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const activeJobsCount = await Job.countDocuments({ status: 'active' });
        const totalCandidates = await Resume.countDocuments();
        const pendingScreening = await Resume.countDocuments({ status: { $in: ['pending', 'processing'] } });
        
        // Hired this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const hiredThisMonth = await Resume.countDocuments({
            pipelineStage: 'hired',
            pipelineStageChangedAt: { $gte: startOfMonth }
        });

        res.status(200).json({
            success: true,
            data: {
                activeJobs: activeJobsCount,
                totalCandidates,
                pendingScreening,
                hiredThisMonth
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get stats for a specific job
 * @route   GET /api/jobs/:id/stats
 */
exports.getJobStats = async (req, res) => {
    try {
        const jobId = req.params.id;
        const applicantCount = await Resume.countDocuments({ jobId });
        const screenedCount = await Resume.countDocuments({ jobId, status: 'completed' });
        
        // Calculate progress %
        const progressPercentage = applicantCount === 0 ? 0 : Math.round((screenedCount / applicantCount) * 100);
        
        // Top match score
        const topMatch = await Resume.findOne({ jobId, status: 'completed' })
            .sort({ 'screeningResult.matchScore': -1 })
            .select('screeningResult.matchScore candidateName avatarUrl');
            
        res.status(200).json({
            success: true,
            data: {
                applicantCount,
                screenedCount,
                progressPercentage,
                topMatch: topMatch ? {
                    score: topMatch.screeningResult?.matchScore || 0,
                    name: topMatch.candidateName,
                    avatarUrl: topMatch.avatarUrl
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all resumes for a specific job
 * @route   GET /api/jobs/:id/resumes
 */
exports.getResumesByJob = async (req, res) => {
    try {
        const { stage } = req.query; // optional filter by pipeline stage
        const filter = { jobId: req.params.id };
        if (stage) {
            filter.pipelineStage = stage;
        }

        const resumes = await Resume.find(filter)
            .select('-extractedText -filePath')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
