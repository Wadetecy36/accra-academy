const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const Student = require('../models/student');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many login attempts" }
});

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post('/login',
    authLimiter,
    [
        body('indexNumber').notEmpty().withMessage('Index number is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { indexNumber, password } = req.body;
            const student = await Student.findOne({ indexNumber });
            if (!student) return res.status(404).json({ error: "Student not found" });

            const validPass = await bcrypt.compare(password, student.password);
            if (!validPass) return res.status(400).json({ error: "Invalid password" });

            const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '2h' });
            res.json({ success: true, token, user: { name: student.fullName } });
        } catch (e) { res.status(500).json({ error: "Login Error" }); }
    }
);

router.post('/admin/login',
    authLimiter,
    [
        body('password').notEmpty().withMessage('Password is required')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (req.body.password === ADMIN_PASSWORD) {
            // Include a 'system-admin' ID so that SecurityLog and createdBy fields don't fail validation
            const token = jwt.sign(
                { id: '000000000000000000000000', role: 'admin' },
                JWT_SECRET,
                { expiresIn: '6h' }
            );
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false });
        }
    }
);

module.exports = router;
