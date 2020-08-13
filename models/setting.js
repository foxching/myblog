const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    post_limit: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Setting', settingSchema);