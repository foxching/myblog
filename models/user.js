const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: "subscriber"
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);