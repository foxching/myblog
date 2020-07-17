const mongoose = require('mongoose');

//setting Schema
const settingSchema = mongoose.Schema({
    post_limit: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('Setting', settingSchema);