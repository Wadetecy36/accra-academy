/* ============================================================= */
/*  server/seed_students.js – CREATE FAKE STUDENTS               */
/* ============================================================= */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

const Student = require('./models/student');

const createStudents = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to DB");

        // Clear old students
        await Student.deleteMany({});

        // Hash password (default: 'bleoo123')
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('bleoo123', salt);

        const students = [
            {
                indexNumber: "2025001",
                password: hashedPassword,
                name: "Kwame Mensah",
                classRoom: "SHS 2 Science B",
                hall: "Alema Hall",
                program: "General Science",
                enrollmentYear: 2024,
                academicHistory: [
                    { form: "First Form", year: 2024, gpa: 3.8, remarks: "Excellent start" }
                ]
            },
            {
                indexNumber: "2025002",
                password: hashedPassword,
                name: "Daniel Ofori",
                classRoom: "SHS 3 Arts A",
                hall: "Halm Addo Hall",
                program: "General Arts",
                enrollmentYear: 2023,
                academicHistory: [
                    { form: "First Form", year: 2023, gpa: 3.5 },
                    { form: "Second Form", year: 2024, gpa: 3.6 }
                ]
            }
        ];

        await Student.insertMany(students);
        console.log("🎉 Students Created! Login with ID: 2025001 / Pass: bleoo123");
        mongoose.connection.close();
    } catch (error) {
        console.error(error);
    }
};

createStudents();