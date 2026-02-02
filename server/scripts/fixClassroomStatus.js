const mongoose = require('mongoose');
const Classroom = require('../models/Classroom');
require('dotenv').config({ path: '../.env' });

const fixClassroomStatus = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tharanis23aim_db_user:admin123@cluster0.duwqjrw.mongodb.net/ttdb';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        console.log('Finding classrooms with missing status...');

        const result = await Classroom.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'available' } }
        );

        console.log(`✅ Fixed status for ${result.modifiedCount} classrooms.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing classroom status:', error);
        process.exit(1);
    }
};

fixClassroomStatus();
