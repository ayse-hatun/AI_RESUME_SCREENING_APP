// Resume Model
// Stores uploaded resumes and their AI screening results

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    // Candidate Information
    candidateName: {
        type: String,
        required: [true, 'Candidate name is required'],
        trim: true
    },
    candidateEmail: {
        type: String,
        required: [true, 'Candidate email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },

    // Job they applied for
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        default: null
    },
    jobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    jobDescription: {
        type: String,
        required: [true, 'Job description is required']
    },

    // Uploaded File
    fileName: {
        type: String,           // Original filename
        required: true
    },
    filePath: {
        type: String,           // Path on server
        required: true
    },
    fileType: {
        type: String,           // 'pdf', 'docx', or 'txt'
        enum: ['pdf', 'docx', 'txt']
    },

    // Extracted Resume Text
    extractedText: {
        type: String,
        default: ''
    },

    // AI Screening Result (from Gemini)
    screeningResult: {
        matchScore: { type: Number, min: 0, max: 100 },
        verdict: { type: String },
        summary: { type: String },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        skills: {
            matched: [{ type: String }],
            missing: [{ type: String }]
        },
        experienceMatch: { type: String },
        recommendation: { type: String }
    },

    // Email Delivery Status
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date,
        default: null
    },

    // Processing Status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    errorMessage: {
        type: String,
        default: null
    },

    // Pipeline Stage
    pipelineStage: {
        type: String,
        enum: ['applied', 'screened', 'shortlisted', 'rejected', 'hired'],
        default: 'applied'
    },
    pipelineStageChangedAt: {
        type: Date,
        default: Date.now
    },
    shortlistedAt: {
        type: Date,
        default: null
    },

    // Extracted Candidate Profile (Structured Data)
    avatarUrl: {
        type: String,
        default: null
    },
    candidateProfile: {
        location: String,
        totalExperienceYears: Number,
        expectedSalary: String,
        noticePeriod: String,
        university: String,
        availability: String
    },
    skillProficiency: [{
        skill: String,
        level: String,
        percentage: Number
    }],
    employmentHistory: [{
        company: String,
        role: String,
        duration: String,
        description: String
    }],

    // AI Annotation / Note
    aiNote: {
        type: String,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    cacheHash: {
        type: String,
        index: true,
        default: null
    }

}, {
    timestamps: true    // createdAt, updatedAt
});

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
