const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
require('dotenv').config({ path: '../.env' });

const fastFixCourseFields = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tharanis23aim_db_user:admin123@cluster0.duwqjrw.mongodb.net/ttdb';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const courses = await mongoose.connection.collection('courses').find({}).toArray();
        const teachers = await Teacher.find({ status: 'active' });

        // Group teachers by department for easier assignment
        const teachersByDept = {};
        teachers.forEach(t => {
            const dept = t.department || 'General';
            if (!teachersByDept[dept]) teachersByDept[dept] = [];
            teachersByDept[dept].push(t._id.toString());
        });

        console.log(`Processing ${courses.length} courses...`);
        const operations = [];

        for (const course of courses) {
            const update = {};
            let isModified = false;

            // Fix Department
            // Handle "AIDS (4)" -> "AIDS" and map abbreviations
            let dept = course.department;
            if (course.Department) {
                dept = course.Department.split('(')[0].trim();
            }

            // Map known abbreviations to Standard names
            const deptMap = {
                'AIML-2': 'AIML',
                'AUTO': 'AUTOMOBILE',
                'CHEM': 'CHEMICAL',
                'MECH': 'MECHANICAL',
                'CIVIL': 'CIVIL',
                'CSE': 'CSE',
                'ECE': 'ECE',
                'EEE': 'EEE',
                'EIE': 'EIE',
                'IT': 'IT',
                'FT': 'FT',
                'CSD': 'CSD',
                'AIDS': 'AIDS'
            };

            const mappedDept = deptMap[dept] || dept;
            if (mappedDept !== course.department) {
                update.department = mappedDept;
                isModified = true;
                dept = mappedDept; // Update for teacher lookup
            }

            if (!dept) {
                dept = 'CSE'; // Fallback
                update.department = dept;
                isModified = true;
            }

            // Fix Semester
            let sem = course.semester;
            if (course.Semester) {
                const semMap = {
                    'SEM_I': 1, 'SEM_II': 2, 'SEM_III': 3, 'SEM_IV': 4,
                    'SEM_V': 5, 'SEM_VI': 6, 'SEM_VII': 7, 'SEM_VIII': 8
                };
                const mappedSem = semMap[course.Semester] || 1;
                if (mappedSem !== course.semester) {
                    sem = mappedSem;
                    update.semester = sem;
                    isModified = true;
                }
            }

            // Fix Name/Code
            if (course.course_title && course.course_title !== course.name) {
                update.name = course.course_title;
                isModified = true;
            }
            if (course.course_code && course.course_code !== course.code) {
                update.code = course.course_code;
                isModified = true;
            }

            // Fix Year
            if (!course.year) {
                update.year = Math.ceil(sem / 2) || 1;
                isModified = true;
            }

            // Fix other fields
            if (!course.id && !update.id) {
                update.id = course.course_code || `COURSE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                isModified = true;
            }
            if (!course.program) {
                update.program = 'B.Tech';
                isModified = true;
            }
            if (course.isActive === undefined) {
                update.isActive = true;
                isModified = true;
            }
            if (!course.totalHoursPerWeek) {
                const L = course.L || 3;
                const T = course.T || 0;
                const P = course.P || 0;
                update.totalHoursPerWeek = L + T + (P * 2);
                isModified = true;
            }
            if (!course.sessions) {
                update.sessions = {
                    theory: { type: 'Theory', duration: 60, sessionsPerWeek: course.L || 3 },
                    practical: { type: 'Practical', duration: 120, sessionsPerWeek: course.P > 0 ? 1 : 0 },
                    tutorial: { type: 'Tutorial', duration: 60, sessionsPerWeek: course.T > 0 ? 1 : 0 }
                };
                isModified = true;
            }
            if (!course.enrolledStudents) {
                update.enrolledStudents = 60;
                isModified = true;
            }

            // Assign Teachers if missing
            if ((!course.assignedTeachers || course.assignedTeachers.length === 0) && teachers.length > 0) {
                // Try to find teachers in the same department
                let availableTeachers = teachersByDept[dept];
                if (!availableTeachers || availableTeachers.length === 0) {
                    // If no teachers in that dept, use any teachers
                    availableTeachers = teachersByDept['CSE'] || teachersByDept['IT'] || Object.values(teachersByDept).flat();
                }

                if (availableTeachers && availableTeachers.length > 0) {
                    // Pick 1 random teacher
                    const randomTeacherId = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
                    update.assignedTeachers = [{
                        teacherId: randomTeacherId,
                        sessionTypes: ['Theory', 'Practical', 'Tutorial'],
                        isPrimary: true,
                        canTeachAlone: true
                    }];
                    isModified = true;
                }
            }

            if (isModified) {
                operations.push({
                    updateOne: {
                        filter: { _id: course._id },
                        update: { $set: update }
                    }
                });
            }
        }

        if (operations.length > 0) {
            console.log(`Writing ${operations.length} updates...`);
            const result = await mongoose.connection.collection('courses').bulkWrite(operations);
            console.log(`✅ Bulk write result: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
        } else {
            console.log('No updates needed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error in fast migration:', error);
        process.exit(1);
    }
};

fastFixCourseFields();
