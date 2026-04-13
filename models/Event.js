const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    registrationLink: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectReason: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    reportFile: {
        type: String // We will store the path /uploads/report-xxxxx.pdf 
    },
    attendanceFile: {
        type: String // or CSV etc.
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
