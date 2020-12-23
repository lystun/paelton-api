const mongoose = require('mongoose'); 

const audioSchema = mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: [true, 'Please enter the audio title']
    },
    description: {
        type: String,
        required: [true, 'Please enter a short description of the audio file']
    },
    link: {
        type: String,
        required: [true, 'Please enter the audio link']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Audio = mongoose.model('Audio', audioSchema);
module.exports = Audio;