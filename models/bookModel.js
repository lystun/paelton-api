const mongoose = require('mongoose'); 

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: [true, 'Please enter the book title']
    },
    author: {
        type: String,
        required: [true, 'Please upload the book author']
    },
    description: {
        type: String,
        required: [true, 'Please enter a short description of the book']
    },
    link: {
        type: String,
        required: [true, 'Please enter the book link']
    },
    image: {
        type: String,
        required: [true, 'Please enter the book cover image']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Book = mongoose.model('Book', bookSchema);
module.exports = Book;