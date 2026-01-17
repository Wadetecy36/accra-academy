/* ============================================================= */
/*  server/seed_students.js – CREATE FAKE STUDENTS               */
/* ============================================================= */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    class: String,
    house: String,
    program: String,
    gpa: Number,
    attendance: String,
    feesOwed: Number,
    grades: Array // List of subjects and scores
});

const Student = mongoose.model('Student', StudentSchema);

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
                studentId: "2025001",
                password: hashedPassword,
                name: "Kwame Mensah",
                class: "SHS 2 Science B",
                house: "Alema",
                program: "General Science",
                gpa: 3.8,
                attendance: "98%",
                feesOwed: 0,
                grades: [
                    { subject: "Elective Maths", grade: "A1" },
                    { subject: "Physics", grade: "B2" },
                    { subject: "Chemistry", grade: "A1" },
                    { subject: "Biology", grade: "A1" }
                ]
            },
            {
                studentId: "2025002",
                password: hashedPassword,
                name: "Daniel Ofori",
                class: "SHS 3 Arts A",
                house: "Halm-Addo",
                program: "General Arts",
                gpa: 3.5,
                attendance: "92%",
                feesOwed: 150,
                grades: [
                    { subject: "Government", grade: "A1" },
                    { subject: "Literature", grade: "B3" },
                    { subject: "History", grade: "A1" },
                    { subject: "Economics", grade: "B2" }
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