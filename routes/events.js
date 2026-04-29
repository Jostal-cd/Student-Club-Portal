const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File upload support for event reports lives here.
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Club only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'club') {
        return res.status(403).json({ msg: 'Authorization denied, only clubs can create events' });
    }
    const { title, date, registrationLink } = req.body;
    try {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0,0,0,0));
        const endOfDay = new Date(targetDate.setHours(23,59,59,999));
        
        const countOnDate = await Event.countDocuments({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (countOnDate >= 3) {
            return res.status(400).json({ msg: 'Maximum 3 events are permitted on a single day. Please choose another date.' });
        }

        const newEvent = new Event({ title, date, registrationLink, createdBy: req.user.id });
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
        const token = req.header('Authorization');
        if (token) {
            const jwt = require('jsonwebtoken');
            try {
                const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret');
                if (decoded.user.role === 'faculty' || decoded.user.role === 'admin') {
                    const events = await Event.find().populate('createdBy', 'username').sort({ createdAt: -1 });
                    return res.json(events);
                } else if (decoded.user.role === 'club') {
                    const events = await Event.find({ createdBy: decoded.user.id }).sort({ date: 1 });
                    return res.json(events);
                }
            } catch (err) {
            }
        }
        const events = await Event.find({ status: 'approved', isVisible: true }).sort({ date: 1 });
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

        if (status === 'rejected') event.rejectReason = rejectReason || '';
        else event.rejectReason = undefined;

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
        event.status = 'pending';
        event.rejectReason = undefined;
        await event.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/events/:id/visibility
// @desc    Show or hide an event
// @access  Private (Admin only)
router.patch('/:id/visibility', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Authorization denied, admin only' });
    }
    const { isVisible } = req.body;
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        event.isVisible = isVisible;
        await event.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/events/:id/upload-report
// @desc    Upload report or attendance file for an event
// @access  Private (Club/Faculty/Admin)
router.post('/:id/upload-report', auth, upload.single('reportFile'), async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        
        if (req.file) {
            event.reportFile = '/uploads/' + req.file.filename;
            await event.save();
            res.json({ msg: 'File uploaded successfully', reportFile: event.reportFile });
        } else {
            res.status(400).json({ msg: 'No file provided' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/events/:id/register
// @desc    Register a student for an event
// @access  Public
router.post('/:id/register', async (req, res) => {
    const { studentName, studentClass, div, rollNo, email, mobileNo, paymentId } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event || event.status !== 'approved') {
            return res.status(400).json({ msg: 'Registration closed or event not found' });
        }

        const newReg = new Registration({
            event: req.params.id,
            studentName,
            studentClass,
            div,
            rollNo,
            email,
            mobileNo,
            paymentId
        });

        await newReg.save();
        res.json({ msg: 'Successfully registered for ' + event.title });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/events/:id/registrations
// @desc    Get all registrations for an event
// @access  Private
router.get('/:id/registrations', auth, async (req, res) => {
    try {
        const registrations = await Registration.find({ event: req.params.id }).sort({ registeredAt: -1 });
        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
