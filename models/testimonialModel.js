const mongoose = require('mongoose'); 

const testimonialSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter testifier title']
    },
    name: {
        type: String,
        required: [true, 'Please enter testifier name']
    },
    image :{
        type: String,
        required: [true, 'Please enter testifier image']
    },
    testimony:{
        type: String,
        required: [true, 'Please enter testimonial content']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;