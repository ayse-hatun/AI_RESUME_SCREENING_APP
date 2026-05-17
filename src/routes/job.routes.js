// Job Routes
// Defines API endpoints for job management

const express = require('express');
const router = express.Router();
const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    getDashboardStats,
    getJobStats,
    getResumesByJob
} = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes start with /api/jobs (handled in app.js)
router.use(protect);

// Dashboard Stats (Must be before /:id)
router.get('/dashboard/stats', getDashboardStats);

// Create and Read All
router.route('/')
    .post(createJob)
    .get(getAllJobs);

// Job Specific Stats and Resumes
router.get('/:id/stats', getJobStats);
router.get('/:id/resumes', getResumesByJob);

// Read, Update, and Delete by ID
router.route('/:id')
    .get(getJobById)
    .put(updateJob)
    .delete(deleteJob);

module.exports = router;
