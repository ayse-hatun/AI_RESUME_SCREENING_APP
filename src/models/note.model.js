// Note schema
const mongoose=require('mongoose');

const noteSchema=new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    age: Number,
    gender: Boolean
});

const noteModel=mongoose.model('Note', noteSchema);
module.exports=noteModel;