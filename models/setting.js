const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    blogTitle: {
        type: String,
        default: "My Blog"
    },
    defaultRole: {
        type: String,
        default: "subscriber"
    },
    post_limit: {
        type: String,
        required: true
    },
    dateFormat: {
        type: String,
    },
    timeFormat: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);