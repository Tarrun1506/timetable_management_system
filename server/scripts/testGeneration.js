const mongoose = require('mongoose');
const OptimizationEngine = require('../algorithms/OptimizationEngine');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
const logger = require('../utils/logger');
require('dotenv').config({ path: '../.env' });

const testGeneration = async () => {
    try {
        // Suppress JSON logger for clean output
        logger.info = () => { };
        logger.warn = (msg) => console.log('WARN:', msg);
        logger.error = (msg) => console.log('ERROR:', msg);

        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tharanis23aim_db_user:admin123@cluster0.duwqjrw.mongodb.net/ttdb';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const department = 'AIML';
        const settings = {
            algorithm: 'genetic',
            populationSize: 20, // Reduced for faster test
            maxGenerations: 50, // Reduced for faster test
            crossoverRate: 0.8,
            mutationRate: 0.15,
            optimizationGoals: ['minimize_conflicts']
        };

        console.log('Fetching data...');
        const teachers = await Teacher.find({ status: 'active' });
        const classrooms = await Classroom.find({ status: 'available' });
        const courses = await Course.find({ department: department, isActive: true }).populate('assignedTeachers.teacherId');

        console.log(`Data loaded: ${teachers.length} teachers, ${classrooms.length} classrooms, ${courses.length} courses`);

        if (teachers.length === 0 || classrooms.length === 0 || courses.length === 0) {
            console.error('Missing data! Checking details:');
            console.log('Teachers:', teachers.length);
            console.log('Classrooms:', classrooms.length);
            console.log('Courses:', courses.length);
            process.exit(1);
        }

        const optimizationEngine = new OptimizationEngine();
        console.log('Starting optimization...');

        const result = await optimizationEngine.optimize(
            teachers,
            classrooms,
            courses,
            settings,
            (progress, step, generation, fitness) => {
                const fit = fitness ? fitness.toFixed(3) : 'N/A';
                console.log(`PROGRESS: ${progress.toFixed(1)}% - ${step} (Gen: ${generation}, Fitness: ${fit})`);
            }
        );

        console.log('Optimization Result:', JSON.stringify({
            success: result.success,
            reason: result.reason,
            metrics: result.metrics
        }, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing generation:', error);
        process.exit(1);
    }
};

testGeneration();
