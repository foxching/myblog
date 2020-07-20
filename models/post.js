const mongoose = require('mongoose');

//Article Schema
const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
    },
    category: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
    },
    comments: []
});

module.exports = mongoose.model('Post', postSchema);