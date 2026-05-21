// User Model
// Stores recruiter and admin accounts for dashboard access

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address'],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Do not return password by default
    },
    role: {
        type: String,
        enum: ['admin', 'recruiter', 'viewer', 'candidate'],
        default: 'recruiter'
    },
    organization: {
        type: String,
        default: 'SmartHire'
    },
    avatarUrl: {
        type: String,
        default: null
    },
    preferences: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Settings'
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    bio: {
        type: String,
        default: null,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    company: {
        type: String,
        default: null
    },
    title: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },

    // ── Email Verification ────────────────────────────────────────────────────
    isVerified: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },

    // ── Password Reset ────────────────────────────────────────────────────────
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
// Note: async pre-save hooks in Mongoose 6+ should NOT call next() — just return or throw
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return; // just return; Mongoose handles the rest
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

