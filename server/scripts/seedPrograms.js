const mongoose = require('mongoose');
const Program = require('../models/Program');
require('dotenv').config({ path: '../.env' });

const seedPrograms = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tharanis23aim_db_user:admin123@cluster0.duwqjrw.mongodb.net/ttdb';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const programData = [
            { name: 'AIDS', code: 'ADR' },
            { name: 'AIML', code: 'ALR' },
            { name: 'AUTOMOBILE', code: 'AUR' },
            { name: 'CHEMICAL', code: 'CHR' },
            { name: 'CIVIL', code: 'CVR' },
            { name: 'CSE', code: 'CSR' },
            { name: 'CSD', code: 'CDR' },
            { name: 'ECE', code: 'ECR' },
            { name: 'EEE', code: 'EER' },
            { name: 'EIE', code: 'EIR' },
            { name: 'FT', code: 'FTR' },
            { name: 'IT', code: 'ITR' },
            { name: 'MECHANICAL', code: 'MTR' }
        ];

        console.log('Clearing existing programs...');
        await Program.deleteMany({});

        console.log('Seeding new programs...');
        const programsToInsert = programData.map(p => ({
            id: `PROG-${p.code}`,
            name: `B.Tech ${p.name}`,
            code: p.code,
            school: p.name, // Mapping department name to school
            type: 'Bachelor',
            duration: 4,
            totalSemesters: 8,
            status: 'Active',
            description: `Bachelor of Technology in ${p.name}`
        }));

        await Program.insertMany(programsToInsert);

        console.log('✅ Programs seeded successfully!');
        console.log(`Inserted ${programsToInsert.length} programs.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding programs:', error);
        process.exit(1);
    }
};

seedPrograms();
