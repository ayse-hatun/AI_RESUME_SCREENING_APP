// App Configuration
// Express application setup with all middleware and routes

const express = require('express');
const cors = require('cors');
const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());                        // Allow cross-origin requests
app.use(express.json());                // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // Parse form data

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🤖 AI Resume Screening API is running',
        version: '1.0.0',
        endpoints: {
            screenResume:  'POST   /api/screen-resume',
            listResumes:   'GET    /api/resumes',
            getResume:     'GET    /api/resumes/:id',
            deleteResume:  'DELETE /api/resumes/:id'
        }
    });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
const screeningRoutes = require('./routes/screening.routes');
app.use('/api', screeningRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('🔥 Unhandled Error:', err.message);

    // Multer errors (file upload issues)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File too large. Maximum size is 5MB.'
        });
    }
    if (err.message && err.message.includes('Only PDF and DOCX')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

module.exports = app;
