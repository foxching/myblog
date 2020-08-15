const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    title: {
        type: String,
        default: "My Blog"
    },
    user_role: {
        type: String,
        required: true
    },
    post_limit: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Setting', settingSchema);