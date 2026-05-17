// Note schema
const mongoose=require('mongoose');

const noteSchema = new mongoose.Schema({
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // To be used after auth is added
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['recruiter', 'ai', 'system'],
        default: 'recruiter'
    }
}, {
    timestamps: true
});

const noteModel=mongoose.model('Note', noteSchema);
module.exports=noteModel;