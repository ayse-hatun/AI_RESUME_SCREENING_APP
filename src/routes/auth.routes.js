// Auth Routes

const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, forgotPassword, resetPassword, getMe, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');
const rateLimit = require('express-rate-limit');

// Separate rate limits for login vs. registration.
// Override via AUTH_RATE_LIMIT_LOGIN / AUTH_RATE_LIMIT_REGISTER env vars (raise in dev if needed).
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_LOGIN, 10) || 10, // stricter – brute-force target
    message: { success: false, error: 'Too many login attempts, please try again in 15 minutes' }
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_REGISTER, 10) || 15, // slightly more lenient
    message: { success: false, error: 'Too many registration attempts, please try again in 15 minutes' }
});

router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

