const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

// Seed script for demo users and local development logins.
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-club-portal')
    .then(async () => {
        console.log('MongoDB connected for seeding...');
        await User.deleteMany({});
        console.log('Old users cleared.');

        const createHash = async (password) => {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        };

        const passwordHash = await createHash('password123');

        const users = [
            { username: 'admin', password: passwordHash, role: 'admin' },
            { username: 'cs_faculty', password: passwordHash, role: 'faculty' },
            { username: 'gdsc_club', password: passwordHash, role: 'club', clubName: 'GDSC' },
            { username: 'stucco_club', password: passwordHash, role: 'club', clubName: 'STUCCo' },
            { username: 'club_faculty', password: passwordHash, role: 'faculty' },
            { username: 'stuco_club', password: passwordHash, role: 'club', clubName: 'STUCO' },
            { username: 'rotaract_club', password: passwordHash, role: 'club', clubName: 'Rotaract' },
            { username: 'project_cell_club', password: passwordHash, role: 'club', clubName: 'Project Cell' }
        ];

        for (let u of users) {
            const newUser = new User(u);
            await newUser.save();
        }

        console.log('Successfully seeded database with correctly hashed passwords.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error seeding DB:', err);
        process.exit(1);
    });
 