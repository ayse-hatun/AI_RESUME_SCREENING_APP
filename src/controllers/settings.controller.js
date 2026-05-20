// Settings Controller

const Settings = require('../models/settings.model');

/**
 * @desc    Get user settings
 * @route   GET /api/settings
 * @access  Private
 */
exports.getSettings = async (req, res) => {
    try {
        // Find or create default settings for the user
        let settings = await Settings.findOne({ userId: req.user._id });
        if (!settings) {
            settings = await Settings.create({ userId: req.user._id });
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/settings
 * @access  Private
 */
exports.updateSettings = async (req, res) => {
    try {
        const allowedFields = [
            'aiSensitivity', 
            'minimumScoreThreshold', 
            'autoRejectLowMatches', 
            'theme', 
            'accentColor', 
            'skillWeights',
            'notifyOnUpload',
            'weeklySummary'
        ];

        const sanitizedUpdate = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                sanitizedUpdate[field] = req.body[field];
            }
        });

        const settings = await Settings.findOneAndUpdate(
            { userId: req.user._id },
            sanitizedUpdate,
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Reset settings to default
 * @route   POST /api/settings/reset
 * @access  Private
 */
exports.resetSettings = async (req, res) => {
    try {
        // Atomic reset using findOneAndReplace with upsert
        // This ensures the user is never without a settings document
        const newSettings = await Settings.findOneAndReplace(
            { userId: req.user._id },
            { userId: req.user._id },
            { upsert: true, new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: newSettings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
