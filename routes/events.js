const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Club only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'club') {
        return res.status(403).json({ msg: 'Authorization denied, only clubs can create events' });
    }

    const { title, date, registrationLink } = req.body;

    try {
        const newEvent = new Event({
            title,
            date,
            registrationLink,
            createdBy: req.user.id
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/events
// @desc    Get events based on role/auth
// @access  Public (Approved), Private (Pending/Club's events)
router.get('/', async (req, res) => {
    try {
        // Check if auth token is present (optional auth for this specific route behavior)
        const token = req.header('Authorization');

        if (token) {
            const jwt = require('jsonwebtoken');
            try {
                const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

                if (decoded.user.role === 'faculty') {
                    // Faculty sees all events, sorted by date
                    const events = await Event.find().populate('createdBy', 'username').sort({ createdAt: -1 });
                    return res.json(events);
                } else if (decoded.user.role === 'club') {
                    // Club sees their own events
                    const events = await Event.find({ createdBy: decoded.user.id }).sort({ date: 1 });
                    return res.json(events);
                }
            } catch (err) {
                // invalid token, fallback to public
            }
        }

        // Public view: only approved events
        const events = await Event.find({ status: 'approved' }).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Club only, and only if they created it)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'club') {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    try {
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Make sure user owns the event
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await event.deleteOne();
        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/events/:id/status
// @desc    Approve or reject an event
// @access  Private (Faculty only)
router.patch('/:id/status', auth, async (req, res) => {
    if (req.user.role !== 'faculty') {
        return res.status(403).json({ msg: 'Authorization denied, faculty only' });
    }

    const { status, rejectReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    try {
        let event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        if (status === 'rejected') {
            event.rejectReason = rejectReason || '';
        } else {
            event.rejectReason = undefined;
        }

        event.status = status;
        await event.save();

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/events/:id
// @desc    Update and resubmit an event
// @access  Private (Club)
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'club') {
        return res.status(403).json({ msg: 'Authorization denied' });
    }
    const { title, date, registrationLink } = req.body;
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        if (event.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        event.title = title || event.title;
        event.date = date || event.date;
        event.registrationLink = registrationLink !== undefined ? registrationLink : event.registrationLink;
        event.status = 'pending'; // Reset to pending
        event.rejectReason = undefined;

        await event.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
