const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    studentName: { type: String, required: true },
    studentClass: { type: String, required: true },
    div: { type: String },
    rollNo: { type: String, required: true },
    email: { type: String, required: true },
    mobileNo: { type: String, required: true },
    paymentId: { type: String }, // Optional transaction ID
    registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);
