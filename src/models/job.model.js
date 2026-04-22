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
    department: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        default: 'Remote'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
