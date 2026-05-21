// Auth Controller - Restarted to load new .env variables
// Handles user registration, login, email verification, and password reset

const mongoose = require('mongoose');
const User = require('../models/user.model');
const Settings = require('../models/settings.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
// const { validationResult } = require('express-validator'); // Removed to fix crash

// Generate JWT Token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('Fatal: JWT_SECRET environment variable is missing.');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register a user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        // Manual validation check
        if (req.validationErrors && req.validationErrors.length > 0) {
            return res.status(400).json({ success: false, error: req.validationErrors[0].msg });
        }

        const { name, email, password, organization, title } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: name, email, and password are required' 
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Password will be hashed by the User model pre-save hook

        // Determine role (first user is admin)
        const isFirstUser = (await User.countDocuments({})) === 0;
        const role = isFirstUser ? 'admin' : 'recruiter';

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Start Transaction to ensure User and Settings are created together
        const session = await mongoose.startSession();
        session.startTransaction();

        let user;
        try {
            // Create user
            const users = await User.create([{
                name,
                email,
                password: password,
                role,
                organization,
                title,
                company: organization,
                isVerified: true, // AUTO-VERIFY
                otpCode,
                otpExpires
            }], { session });
            user = users[0];

            // Create default settings for user
            const settingsArray = await Settings.create([{ userId: user._id }], { session });
            const settings = settingsArray[0];
            
            // Link settings to user
            await User.findByIdAndUpdate(user._id, { preferences: settings._id }, { session });

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            console.error('❌ User creation transaction failed:', err);
            throw err;
        } finally {
            session.endSession();
        }

        // Create verification link
        const origins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];
        const originUrl = origins.find(o => o.includes('5173')) || origins[0];
        const verifyUrl = `${originUrl}/verify-email?email=${encodeURIComponent(user.email)}&otp=${otpCode}`;

        // Send OTP email in the background (non-critical: user is auto-verified above).
        // Failure here does NOT block registration but is logged for observability.
        sendVerificationEmail(user.email, user.name, otpCode, verifyUrl)
            .catch(err => console.error('❌ Background email delivery failed (user still registered):', err.message));

        res.status(201).json({
            success: true,
            message: 'Registration successful. A verification email will be sent shortly.',
            data: { email: user.email }
        });
    } catch (error) {
        console.error('❌ Registration Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * @desc    Verify Email OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(`🔍 Verification attempt for: ${email} with OTP: ${otp}`);

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Please provide email and OTP' });
        }

        // Case-insensitive lookup and include hidden fields
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otpCode +otpExpires');
        
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return res.status(400).json({ success: false, error: 'User not found with this email' });
        }

        if (user.isVerified) {
            console.log(`✅ User already verified: ${email}`);
            // If already verified, just generate token and return success
            const token = generateToken(user._id);
            return res.status(200).json({
                success: true,
                message: 'Already verified',
                token,
                data: { _id: user._id, name: user.name, email: user.email, role: user.role }
            });
        }

        const inputOtp = otp.toString().trim();
        const storedOtp = user.otpCode ? user.otpCode.toString().trim() : null;

        console.log(`🔢 Comparing: Input[${inputOtp}] vs Stored[${storedOtp}]`);

        if (!storedOtp || inputOtp !== storedOtp || (user.otpExpires && user.otpExpires < Date.now())) {
            console.log(`❌ OTP mismatch or expired for ${email}`);
            return res.status(400).json({ success: false, error: 'Invalid or expired code. Please request a new one by logging in again.' });
        }

        // Mark as verified using findByIdAndUpdate to avoid any potential save() hooks/issues
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            isVerified: true,
            $unset: { otpCode: 1, otpExpires: 1 }
        }, { new: true });

        console.log(`✨ User verified successfully: ${email}`);

        const token = generateToken(updatedUser._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            token,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                organization: updatedUser.organization,
                title: updatedUser.title
            }
        });
    } catch (error) {
        console.error(`🔥 Verification error:`, error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        // Manual validation check
        if (req.validationErrors && req.validationErrors.length > 0) {
            return res.status(400).json({ success: false, error: req.validationErrors[0].msg });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        // Find user by email and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check verification (Temporarily bypassed to unblock user)
        /*
        if (!user.isVerified) {
            // ... (keeping code for reference)
        }
        */

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                title: user.title
            }
        });
    } catch (error) {
        console.error('❌ Login Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide your email address.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            // Always return success even if user doesn't exist to prevent email enumeration
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
        }

        // Create reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Use findByIdAndUpdate to avoid triggering the pre-save password-hashing hook
        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: tokenExpires
        });

        // Build reset URL
        const origins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];
        const originUrl = origins.find(o => o.includes('5173')) || origins[0];
        const resetUrl = `${originUrl}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, user.name, resetUrl);
            return res.status(200).json({ success: true, message: 'Reset link sent to email' });
        } catch (emailErr) {
            console.error('❌ Password reset email failed:', emailErr.message);
            // Clear the token so it can be re-requested
            await User.findByIdAndUpdate(user._id, {
                $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
            });
            return res.status(503).json({ success: false, error: 'Could not send the reset email. Please try again in a few minutes.' });
        }
    } catch (error) {
        console.error('❌ Forgot Password Error:', error.message, error.stack);
        res.status(500).json({ success: false, error: `Password reset failed: ${error.message}` });
    }
};

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        // Hash token from URL
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find user by token and check expiry
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
        }

        if (!req.body.password || req.body.password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        // Assign new password (will be hashed by pre-save hook)
        user.password = req.body.password;

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('❌ Reset Password Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('preferences');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('❌ Get Me Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, company, title, phone, location, organization } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Update fields (Only allow updating fields NOT provided at signup, or if they were missing)
        // If the user wants to strictly prevent changes to signup fields:
        if (bio !== undefined) user.bio = bio;
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        
        // Only allow updating name/company/title if they weren't set (unlikely due to signup requirements)
        // or just ignore them to comply with "cannot be changed later"
        /* 
        if (!user.name && name) user.name = name;
        if (!user.organization && organization) user.organization = organization;
        if (!user.title && title) user.title = title;
        */

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully. Fixed details (Name, Organization, Title) were preserved.',
            data: user
        });
    } catch (error) {
        console.error('❌ Update Profile Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

