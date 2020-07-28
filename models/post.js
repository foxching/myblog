const mongoose = require('mongoose');

//Article Schema
const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    },
    content: {
        type: String,
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    comments: [],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },

});

module.exports = mongoose.model('Post', postSchema);