// Settings Routes

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, resetSettings } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
    .get(getSettings)
    .put(updateSettings);

router.post('/reset', resetSettings);

module.exports = router;
