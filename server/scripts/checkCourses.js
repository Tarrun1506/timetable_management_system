const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config({ path: '../.env' });

const checkCourses = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tharanis23aim_db_user:admin123@cluster0.duwqjrw.mongodb.net/ttdb';
        await mongoose.connect(mongoURI);

        const totalCourses = await Course.countDocuments();
        console.log(`Total courses in DB: ${totalCourses}`);

        if (totalCourses > 0) {
            const departments = await Course.distinct('department');
            console.log('Available departments in courses:', departments);

            const activeCourses = await Course.countDocuments({ isActive: true });
            console.log(`Active courses: ${activeCourses}`);

            const aimlCourses = await Course.find({ department: 'AIML' });
            console.log(`Courses for 'AIML': ${aimlCourses.length}`);

            const sample = await Course.findOne();
            console.log('Sample course:', JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCourses();
