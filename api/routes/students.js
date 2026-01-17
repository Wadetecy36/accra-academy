const express = require('express');
const bcrypt = require('bcryptjs');
const Student = require('../models/student');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { fullName, indexNumber, password, program, house, yearOfCompletion } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newStudent = new Student({ fullName, indexNumber, password: hashPassword, program, house, yearOfCompletion });
        await newStudent.save();
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.code === 11000 ? "Duplicate Index Number" : "Error creating student" }); }
});

router.get('/', verifyAdmin, async (req, res) => {
    res.json(await Student.find().select('fullName indexNumber program house yearOfCompletion').sort({ timestamp: -1 }));
});

router.delete('/:id', verifyAdmin, async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        res.json(student);
    } catch (e) { res.status(500).json({ error: "Fetch Error" }); }
});

module.exports = router;
