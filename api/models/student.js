const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    indexNumber: { type: String, unique: true, required: true, trim: true, uppercase: true },
    password: { type: String, required: true },
    program: String, house: String, yearOfCompletion: Number,
    currentClass: { type: String, default: 'Alumni' },
    gpa: { type: Number, default: 0.0 },
    attendance: { type: Number, default: 0 },
    transcript: [{ semester: String, courses: [{ subject: String, grade: String, score: Number }] }],
    timestamp: { type: Date, default: Date.now }
});

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

module.exports = Student;
