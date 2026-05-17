const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const upload = require('../config/multer.config');

const { 
    getActiveJobs, 
    getPublicJob, 
    submitApplication 
} = require('../controllers/public.controller');

// Rate limiter for public applications (10 per 15 mins)
const applyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many applications from this IP, please try again after 15 minutes' }
});

// Multer error handling wrapper
const uploadResume = (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, error: 'File size too large. Max 5MB allowed.' });
            }
            return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

// GET /api/public/jobs - List all active jobs
router.get('/jobs', getActiveJobs);

// GET /api/public/jobs/:id - Get job details for a candidate
router.get('/jobs/:id', getPublicJob);

// POST /api/public/apply - Public endpoint for candidate resume upload
router.post('/apply', uploadResume, submitApplication);

module.exports = router;
