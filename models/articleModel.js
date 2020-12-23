const mongoose = require('mongoose'); 

const articleSchema = mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: [true, 'Please enter article title']
    },
    image :{
        type: String,
        required: [true, 'Please enter article image']
    },
    content:{
        type: String,
        required: [true, 'Please enter article content']
    },
    author:{
        type: String,
        required: [true, 'Please enter article author']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Article = mongoose.model('Article', articleSchema);
module.exports = Article;