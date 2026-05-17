// App Configuration
// Express application setup with all middleware and routes

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const app = express();

// Set global timeout (2 minutes for bulk uploads)
const serverTimeout = 120000;
app.use((req, res, next) => {
    res.setTimeout(serverTimeout, () => {
        console.log('⏰ Request has timed out.');
        res.status(408).send('Request Timeout');
    });
    next();
});

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());                      // Set security HTTP headers
// app.use(mongoSanitize());               // Temporarily disabled for Express 5 compatibility
// app.use(hpp());                         // Temporarily disabled for Express 5 compatibility

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: 'Too many requests from this IP, please try again in 15 minutes' }
});
app.use('/api/', limiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow localhost in dev + the deployed Vercel URL in production (set FRONTEND_URL in Render env vars)
const allowedOrigins = [
    /^https?:\/\/localhost(:\d+)?$/,     // Any localhost port (dev)
    process.env.FRONTEND_URL,             // e.g. https://your-app.vercel.app
    /^https:\/\/.*\.vercel\.app$/        // Any Vercel preview deployment
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        if (isAllowed) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
}));

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));                // Parse JSON request bodies (max 1mb)
app.use(express.urlencoded({ extended: true, limit: '1mb' }));  // Parse form data

// ─── Static Files ─────────────────────────────────────────────────────────────
// Serve uploaded resumes — NOTE: on Render free tier this is ephemeral.
// For persistent storage, migrate to S3/Cloudinary.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🤖 AI Resume Screening API is running',
        version: '1.0.0',
        endpoints: {
            screenResume:  'POST   /api/screen-resume',
            listResumes:   'GET    /api/resumes',
            jobs:          'GET    /api/jobs (CRUD supported)'
        }
    });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
const screeningRoutes = require('./routes/screening.routes');
const jobRoutes = require('./routes/job.routes');
const noteRoutes = require('./routes/note.routes');
const authRoutes = require('./routes/auth.routes');
const settingsRoutes = require('./routes/settings.routes');
const { protect } = require('./middleware/auth.middleware');

app.use('/api/auth', authRoutes);
app.use('/api/public', require('./routes/public.routes'));
app.use('/api', protect, screeningRoutes); // Note: screening routes includes /resumes which we want protected. We may need to split public upload if candidate does it, but for now recruiters upload it.
app.use('/api/jobs', protect, jobRoutes);
app.use('/api/notes', protect, noteRoutes);
app.use('/api/settings', protect, settingsRoutes);


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
