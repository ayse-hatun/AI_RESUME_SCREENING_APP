// Settings Model
// Stores user-specific preferences for the AI and dashboard

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        unique: true,
        sparse: true
    },
    aiSensitivity: {
        type: Number,
        min: 0,
        max: 100,
        default: 85
    },
    minimumScoreThreshold: {
        type: Number,
        min: 0,
        max: 100,
        default: 72
    },
    autoRejectLowMatches: {
        type: Boolean,
        default: false
    },
    theme: {
        type: String,
        enum: ['executive-dark', 'high-contrast', 'midnight-blue'],
        default: 'executive-dark'
    },
    accentColor: {
        type: String,
        enum: ['indigo', 'emerald', 'rose'],
        default: 'indigo'
    },
    notifyOnUpload: {
        type: Boolean,
        default: true
    },
    weeklySummary: {
        type: Boolean,
        default: true
    },
    skillWeights: {
        coreTechnical: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
        experience: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        education: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
        location: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
