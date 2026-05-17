const express = require('express');
const router = express.Router();
const { addNote, getNotes, deleteNote } = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/resumes/:resumeId/notes')
    .post(addNote)
    .get(getNotes);

router.delete('/notes/:id', deleteNote);

module.exports = router;
