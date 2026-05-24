// Job Model
// Stores job postings that resumes are screened against

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    requiredSkills: [{
        type: String,
        trim: true
    }],
    experienceYears: {
        type: Number,
        default: 0
    },
    educationLevel: {
        type: String,
        default: 'Any'
    },
    department: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        default: 'Remote'
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'closed', 'expired', 'analyzing', 'deactivated'],
        default: 'active'
    },
    workType: {
        type: String,
        enum: ['remote', 'hybrid', 'in-office'],
        default: 'remote'
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    salaryRange: {
        min: {
            type: Number,
            min: [0, 'Salary min cannot be negative']
        },
        max: {
            type: Number,
            min: [0, 'Salary max cannot be negative']
        },
        currency: { type: String, default: 'USD' }
    },
    // Auto-Rejection Rules
    autoRejectionEnabled: {
        type: Boolean,
        default: false
    },
    autoRejectionThreshold: {
        type: Number,
        min: [40, 'Auto Rejection Threshold must be at least 40'],
        max: 100,
        default: 40
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for backward compatibility
jobSchema.virtual('isActive')
    .get(function() {
        return this.status === 'active';
    })
    .set(function(value) {
        this.status = value ? 'active' : 'closed';
    });

// Virtual for applicant count
jobSchema.virtual('applicantCount', {
    ref: 'Resume',
    localField: '_id',
    foreignField: 'jobId',
    count: true
});

// Removed problematic pre-save hook

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
