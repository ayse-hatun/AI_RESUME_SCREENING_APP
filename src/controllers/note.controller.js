const Note = require('../models/note.model');
const Resume = require('../models/resume.model');

/**
 * @desc    Add a note to a candidate
 * @route   POST /api/resumes/:resumeId/notes
 */
exports.addNote = async (req, res) => {
    try {
        const { resumeId } = req.params;
        let { content, type } = req.body;

        // 1. Validate Content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Note content is required and cannot be empty' });
        }
        content = content.trim();

        // 2. Validate Type
        const allowedTypes = ['recruiter', 'ai', 'system'];
        if (type && !allowedTypes.includes(type)) {
            return res.status(400).json({ success: false, error: `Invalid note type. Allowed: ${allowedTypes.join(', ')}` });
        }
        type = type || 'recruiter';

        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }

        const note = await Note.create({
            resumeId,
            content,
            type,
            authorId: req.user?.id
        });

        res.status(201).json({ success: true, data: note });
    } catch (error) {
        console.error('❌ Add Note Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * @desc    List all notes for a candidate
 * @route   GET /api/resumes/:resumeId/notes
 */
exports.getNotes = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const notes = await Note.find({ resumeId }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, count: notes.length, data: notes });
    } catch (error) {
        console.error('❌ Get Notes Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 */
exports.deleteNote = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        // Authorization: Only the author or an admin can delete the note
        const isAuthor = note.authorId && note.authorId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this note' });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Note deleted' });
    } catch (error) {
        console.error('❌ Delete Note Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
