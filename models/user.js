const mongoose = require('mongoose');

//AdminSchema
const adminSchema = mongoose.Schema({
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
        default: "Subscriber"
    }

});

module.exports = mongoose.model('Admin', adminSchema);