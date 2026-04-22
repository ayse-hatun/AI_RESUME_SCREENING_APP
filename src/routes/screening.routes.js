// Screening Routes
// Defines all API endpoints for resume screening

const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config');
const {
    screenResumeHandler,
    getAllResumes,
    getResumeById,
    deleteResume
} = require('../controllers/screening.controller');

// ─── Resume Screening ──────────────────────────────────────────────────────────

// POST /api/screen-resume
// Upload resume + screen with Gemini AI + send email
// Fields (multipart/form-data):
//   file:            resume file (PDF or DOCX)
//   candidateName:   string
//   candidateEmail:  string
//   jobTitle:        string
//   jobDescription:  string
router.post('/screen-resume', upload.single('resume'), screenResumeHandler);

// ─── Resume Records CRUD ───────────────────────────────────────────────────────

// GET /api/resumes             → list all resumes (paginated)
router.get('/resumes', getAllResumes);

// GET /api/resumes/:id         → get single resume result
router.get('/resumes/:id', getResumeById);

// DELETE /api/resumes/:id      → delete resume + file
router.delete('/resumes/:id', deleteResume);

module.exports = router;
