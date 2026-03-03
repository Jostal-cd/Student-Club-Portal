const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    studentClass: { // Changed to studentClass as "class" is a reserved keyword in some contexts, but let's use studentClass to be safe
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
