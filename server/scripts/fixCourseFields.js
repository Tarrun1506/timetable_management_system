const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config({ path: '../.env' });

const fixCourseFields = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tharanis23aim_db_user:admin123@cluster0.duwqjrw.mongodb.net/ttdb';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Check if we need to migrate by finding one record with old fields
        const sample = await mongoose.connection.collection('courses').findOne({ Department: { $exists: true } });
        if (!sample) {
            console.log('No courses found with old field names (Department). checking for course_title...');
            const sample2 = await mongoose.connection.collection('courses').findOne({ course_title: { $exists: true } });
            if (!sample2) {
                console.log('No legacy data found. Exiting.');
                process.exit(0);
            }
        }

        console.log('Found legacy data. Starting migration...');
        const courses = await mongoose.connection.collection('courses').find({}).toArray();
        let count = 0;

        for (const course of courses) {
            const update = {};
            let needsUpdate = false;

            // Map Department -> department
            if (course.Department && !course.department) {
                // "AIDS (4)" -> "AIDS"
                let dept = course.Department.split('(')[0].trim();
                update.department = dept;
                needsUpdate = true;
            }

            // Map Semester -> semester
            if (course.Semester && !course.semester) {
                // "SEM_I" -> 1, "SEM_II" -> 2
                const semMap = {
                    'SEM_I': 1, 'SEM_II': 2, 'SEM_III': 3, 'SEM_IV': 4,
                    'SEM_V': 5, 'SEM_VI': 6, 'SEM_VII': 7, 'SEM_VIII': 8
                };
                update.semester = semMap[course.Semester] || 1; // Default to 1 if unknown
                needsUpdate = true;
            }

            // Map course_title -> name
            if (course.course_title && !course.name) {
                update.name = course.course_title;
                needsUpdate = true;
            }

            // Map course_code -> code
            if (course.course_code && !course.code) {
                update.code = course.course_code;
                needsUpdate = true;
            }

            // Fix Year if missing (derive from Semester?)
            if (!course.year && update.semester) {
                update.year = Math.ceil(update.semester / 2);
                needsUpdate = true;
            } else if (!course.year && course.semester) {
                update.year = Math.ceil(course.semester / 2);
                needsUpdate = true;
            }

            // Ensure other required fields have defaults if missing
            if (!course.id) {
                update.id = course.course_code || `COURSE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                needsUpdate = true;
            }

            if (!course.program) {
                update.program = 'B.Tech'; // Default
                needsUpdate = true;
            }

            if (!course.credits) {
                update.credits = course.credit || 3;
                needsUpdate = true;
            }

            if (!course.sessions) {
                update.sessions = {
                    theory: { type: 'Theory', duration: 60, sessionsPerWeek: course.L || 3 },
                    practical: { type: 'Practical', duration: 120, sessionsPerWeek: course.P > 0 ? 1 : 0 },
                    tutorial: { type: 'Tutorial', duration: 60, sessionsPerWeek: course.T > 0 ? 1 : 0 }
                };
                needsUpdate = true;
            }

            if (!course.totalHoursPerWeek) {
                // Estimate: L + T + P*2
                const L = course.L || 3;
                const T = course.T || 0;
                const P = course.P || 0;
                update.totalHoursPerWeek = L + T + (P * 2);
                needsUpdate = true;
            }

            if (!course.enrolledStudents) {
                update.enrolledStudents = 60;
                needsUpdate = true;
            }

            if (course.isActive === undefined) {
                update.isActive = true;
                needsUpdate = true;
            }

            // Fix assignedTeachers if empty or misformatted
            // The sample showed "assignedTeachers": []
            // We can't fix data that isn't there, but we can ensure structure.

            if (needsUpdate) {
                // Remove old fields to clean up? Or just add new ones. 
                // Let's unset old ones to avoid confusion, but maybe safer to keep for now.
                // We'll just set the new ones.
                await mongoose.connection.collection('courses').updateOne(
                    { _id: course._id },
                    { $set: update }
                );
                count++;
            }
        }

        console.log(`✅ Migrated ${count} courses.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing course fields:', error);
        process.exit(1);
    }
};

fixCourseFields();
