const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('MongoDB connected');

    // Clear existing users
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
        { username: 'gdsc_club', password: hashedPassword, role: 'club' },
        { username: 'stuco_club', password: hashedPassword, role: 'club' },
        { username: 'rotaract_club', password: hashedPassword, role: 'club' },
        { username: 'projectcell_club', password: hashedPassword, role: 'club' },
        { username: 'faculty_admin', password: hashedPassword, role: 'faculty' },
    ];

    await User.insertMany(users);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Club Accounts (password: password123)');
    console.log('  gdsc_club');
    console.log('  stuco_club');
    console.log('  rotaract_club');
    console.log('  projectcell_club');
    console.log('\nFaculty Account (password: password123)');
    console.log('  faculty_admin\n');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
