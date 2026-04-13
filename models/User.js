const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['club', 'faculty', 'admin', 'student', 'faculty_in_charge', 'club_coordinator'],
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    clubName: {
        type: String
    },
    department: {
        type: String
    }
});

module.exports = mongoose.model('User', userSchema);
