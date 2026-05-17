// Screening Routes
// Defines all API endpoints for resume screening

const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config');

// Import handlers from controller
const {
    screenResumeHandler,
    bulkScreenResumeHandler,
    getAllResumes,
    getResumeById,
    deleteResume,
    updatePipelineStage,
    getResumeStatus,
    retryResume
} = require('../controllers/screening.controller');
const { protect } = require('../middleware/auth.middleware');

// ─── Resume Screening ──────────────────────────────────────────────────────────

// Apply protection to all screening routes
router.use(protect);

// POST /api/screen-resume
router.post('/screen-resume', upload.single('resume'), screenResumeHandler);

// POST /api/bulk-screen-resume (New Bulk Feature)
router.post('/bulk-screen-resume', upload.array('resumes', 10), bulkScreenResumeHandler);

// ─── Resume Records CRUD ───────────────────────────────────────────────────────

// GET /api/resumes             → list all resumes (paginated)
router.get('/resumes', getAllResumes);

// GET /api/resumes/:id         → get single resume result
router.get('/resumes/:id', getResumeById);

// DELETE /api/resumes/:id      → delete resume + file
router.delete('/resumes/:id', deleteResume);

// PATCH /api/resumes/:id/stage → update pipeline stage
router.patch('/resumes/:id/stage', updatePipelineStage);

// GET /api/resumes/:id/status  → poll processing status
router.get('/resumes/:id/status', getResumeStatus);

// POST /api/resumes/:id/retry  → retry failed resume
router.post('/resumes/:id/retry', retryResume);

module.exports = router;
