const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
require('dotenv').config({ path: '../.env' });

const diagnoseAndFix = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tharanis23aim_db_user:admin123@cluster0.duwqjrw.mongodb.net/ttdb';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // ====================================================
        // 1. FIX TEACHERS
        // ====================================================
        console.log('--- Checking Teachers ---');
        const teachers = await Teacher.find({});
        console.log(`Found ${teachers.length} teachers.`);

        const teacherUpdates = [];
        for (const teacher of teachers) {
            let update = {};
            let isModified = false;

            // Ensure availability object exists
            if (!teacher.availability || Object.keys(teacher.availability).length === 0) {
                update.availability = {
                    monday: { available: true, startTime: '09:00', endTime: '17:00' },
                    tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
                    wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
                    thursday: { available: true, startTime: '09:00', endTime: '17:00' },
                    friday: { available: true, startTime: '09:00', endTime: '17:00' },
                    saturday: { available: false },
                    sunday: { available: false }
                };
                isModified = true;
            }

            // Ensure subjects array
            if (!teacher.subjects || !Array.isArray(teacher.subjects)) {
                update.subjects = ['General'];
                isModified = true;
            }

            if (isModified) {
                teacherUpdates.push({
                    updateOne: {
                        filter: { _id: teacher._id },
                        update: { $set: update }
                    }
                });
            }
        }

        if (teacherUpdates.length > 0) {
            console.log(`Fixing ${teacherUpdates.length} teachers...`);
            await Teacher.bulkWrite(teacherUpdates);
        } else {
            console.log('Teachers look OK.');
        }

        // ====================================================
        // 2. FIX COURSES
        // ====================================================
        console.log('--- Checking Courses ---');
        const courses = await Course.find({});
        const activeTeachers = await Teacher.find({ status: 'active' });

        // Map teachers by department and ID for quick lookup
        const teachersByDept = {};
        const teacherIds = new Set(activeTeachers.map(t => t.id || t._id.toString()));

        activeTeachers.forEach(t => {
            const dept = t.department || 'General';
            if (!teachersByDept[dept]) teachersByDept[dept] = [];
            teachersByDept[dept].push(t);
        });

        const fallbackTeachers = activeTeachers.length > 0 ? activeTeachers : null;

        const courseUpdates = [];
        let assignedTeacherFixCount = 0;

        for (const course of courses) {
            let update = {};
            let isModified = false;
            let currentTeachers = course.assignedTeachers || [];

            // Filter out non-existent teachers
            const validTeachers = currentTeachers.filter(at => teacherIds.has(at.teacherId));

            if (validTeachers.length !== currentTeachers.length) {
                // We lost some teachers, need to re-assign or update
                currentTeachers = validTeachers;
                isModified = true;
            }

            // If no valid teachers, assign new ones
            if (currentTeachers.length === 0) {
                if (fallbackTeachers) {
                    // Try to find same department, else random
                    const deptTeachers = teachersByDept[course.department] || fallbackTeachers;
                    if (deptTeachers.length > 0) {
                        const randomTeacher = deptTeachers[Math.floor(Math.random() * deptTeachers.length)];

                        currentTeachers = [{
                            teacherId: randomTeacher.id || randomTeacher._id.toString(),
                            sessionTypes: ['Theory', 'Practical', 'Tutorial'],
                            isPrimary: true,
                            canTeachAlone: true
                        }];

                        // Also update teacher's subjects to include this course name if not present
                        // (We won't update teacher doc here for simplicity, but it's good practice)

                        assignedTeacherFixCount++;
                        isModified = true;
                    }
                }
            }

            if (isModified) {
                update.assignedTeachers = currentTeachers;
                courseUpdates.push({
                    updateOne: {
                        filter: { _id: course._id },
                        update: { $set: update }
                    }
                });
            }
        }

        if (courseUpdates.length > 0) {
            console.log(`Fixing ${courseUpdates.length} courses (empty/invalid teachers)...`);
            await Course.bulkWrite(courseUpdates);
        } else {
            console.log('Courses teacher assignments look OK.');
        }

        // ====================================================
        // 3. FIX CLASSROOMS
        // ====================================================
        console.log('--- Checking Classrooms ---');
        const classrooms = await Classroom.find({});
        const classroomUpdates = [];

        for (const room of classrooms) {
            let update = {};
            let isModified = false;

            if (!room.status) {
                update.status = 'available';
                isModified = true;
            }
            if (!room.capacity || room.capacity < 1) {
                update.capacity = 30; // Default
                isModified = true;
            }

            if (isModified) {
                classroomUpdates.push({
                    updateOne: {
                        filter: { _id: room._id },
                        update: { $set: update }
                    }
                });
            }
        }

        if (classroomUpdates.length > 0) {
            console.log(`Fixing ${classroomUpdates.length} classrooms...`);
            await Classroom.bulkWrite(classroomUpdates);
        } else {
            console.log('Classrooms look OK.');
        }


        // ====================================================
        // 4. VERIFY AIML DATA specifically
        // ====================================================
        console.log('--- Verifying AIML Data ---');
        const aimlCourses = await Course.find({ department: 'AIML', isActive: true });
        console.log(`AIML Courses: ${aimlCourses.length}`);

        if (aimlCourses.length > 0) {
            const firstCourse = aimlCourses[0];
            const teacherId = firstCourse.assignedTeachers[0]?.teacherId;
            const teacher = await Teacher.findOne({ id: teacherId }) || await Teacher.findById(teacherId);

            console.log('Sample AIML Course Teacher Check:');
            console.log(`Course: ${firstCourse.name}, TeacherID: ${teacherId}`);
            console.log(`Teacher Found: ${teacher ? 'YES' : 'NO'}`);
            if (teacher) {
                console.log(`Teacher Name: ${teacher.name}, Status: ${teacher.status}`);
            }
        }

        console.log('Diagnostic and fix completed.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error in diagnostic:', error);
        process.exit(1);
    }
};

diagnoseAndFix();
