const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @route   POST api/registrations
// @desc    Register for an event
// @access  Public
router.post('/', async (req, res) => {
    const { name, phone, studentClass, rollNo, eventId } = req.body;

    try {
        // Check if event exists and is approved
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        if (event.status !== 'approved') {
            return res.status(400).json({ msg: 'Cannot register for an unapproved event' });
        }

        const newRegistration = new Registration({
            name,
            phone,
            studentClass,
            rollNo,
            eventId
        });

        const registration = await newRegistration.save();
        res.json(registration);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
