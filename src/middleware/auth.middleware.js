// Auth Middleware
// Verifies JWT tokens and handles role-based access

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Protect routes - requires a valid JWT
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password -otpCode -resetPasswordToken').lean();
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User no longer exists' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }
        next();
    };
};
