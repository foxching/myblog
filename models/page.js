const mongoose = require('mongoose');

//Article Schema
const pageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    content: {
        type: String,
    },
    sorting: { type: Number }

});

module.exports = mongoose.model('Page', pageSchema);