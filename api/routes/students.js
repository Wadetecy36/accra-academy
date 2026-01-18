const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Student = require('../models/student'); // Match file casing for Linux compatibility
const SecurityLog = require('../models/SecurityLog');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const mongoSanitize = require('express-mongo-sanitize');

const router = express.Router();

// Helper: Log Security Event
async function logEvent(userId, type, details, req) {
    try {
        await SecurityLog.create({
            userId,
            eventType: type,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details
        });
    } catch (e) {
        console.error("Logging failed:", e);
    }
}

// Helper: Proxy to Python API
async function pythonProxy(req, res, endpoint, options = {}) {
    const pythonUrl = process.env.PYTHON_API_URL;
    const internalSecret = process.env.INTERNAL_SECRET_KEY;

    if (!pythonUrl) return false;

    try {
        const url = new URL(endpoint, pythonUrl);
        if (req.query) {
            Object.keys(req.query).forEach(key => url.searchParams.append(key, req.query[key]));
        }

        const response = await fetch(url.toString(), {
            method: options.method || req.method,
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Secret': internalSecret,
                ...options.headers
            },
            body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        res.status(response.status).json(data);
        return true;
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(502).json({ error: "Failed to connect to SchoolSync Service" });
        return true;
    }
}

// GET /api/students - List with Search & Filtering
router.get('/', verifyAdmin, async (req, res) => {
    if (await pythonProxy(req, res, '/api/students')) return;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { search, program, hall, year } = req.query;
        let query = {};

        // Search Logic (Name, Index, Email)
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { name: regex },
                { indexNumber: regex },
                { email: regex },
                { classRoom: regex }
            ];
        }

        // Filters
        if (program) query.program = program;
        if (hall) query.hall = hall;
        if (year) query.enrollmentYear = parseInt(year);

        const students = await Student.find(query)
            .sort({ enrollmentYear: -1, name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Student.countDocuments(query);

        res.json({
            success: true,
            students,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (e) {
        res.status(500).json({ error: "Fetch error" });
    }
});

// GET /api/students/:id - Single Student Details
router.get('/:id', verifyAdmin, async (req, res) => {
    if (await pythonProxy(req, res, `/api/students/${req.params.id}`)) return;
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: "Student not found" });
        res.json({ success: true, student });
    } catch (e) {
        res.status(500).json({ error: "Error fetching details" });
    }
});

// POST /api/students - Create Student
router.post('/', verifyAdmin, async (req, res) => {
    if (await pythonProxy(req, res, '/api/students')) return;
    try {
        // Basic Validation
        const { name, program, enrollmentYear } = req.body;
        if (!name || !program || !enrollmentYear) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Default Password Generation if not provided
        const plainPassword = req.body.password || 'Student@123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(plainPassword, salt);

        const newStudent = new Student({
            ...req.body,
            password: passwordHash,
            createdBy: req.user.id
        });

        await newStudent.save();
        await logEvent(req.user.id, 'create_student', { studentId: newStudent._id, name: newStudent.name }, req);

        res.json({ success: true, student: newStudent });
    } catch (e) {
        console.error(e);
        if (e.code === 11000) return res.status(400).json({ error: "Duplicate Index Number or Email" });
        res.status(500).json({ error: "Creation failed" });
    }
});

// PUT /api/students/:id - Update Student
router.put('/:id', verifyAdmin, async (req, res) => {
    if (await pythonProxy(req, res, `/api/students/${req.params.id}`)) return;
    try {
        // Prevent password update via this route
        delete req.body.password;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) return res.status(404).json({ error: "Student not found" });

        await logEvent(req.user.id, 'update_student', { studentId: updatedStudent._id, changes: Object.keys(req.body) }, req);
        res.json({ success: true, student: updatedStudent });

    } catch (e) {
        res.status(500).json({ error: "Update failed" });
    }
});

// DELETE /api/students/:id - Delete Student
router.delete('/:id', verifyAdmin, async (req, res) => {
    if (await pythonProxy(req, res, `/api/students/${req.params.id}`)) return;
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        await logEvent(req.user.id, 'delete_student', { studentId: req.params.id, name: student.name }, req);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// POST /api/students/bulk-action - Bulk Operations
router.post('/bulk-action', verifyAdmin, async (req, res) => {
    if (await pythonProxy(req, res, '/api/students/bulk-action')) return;
    try {
        const { ids, action, payload } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No students selected" });
        }

        let result;

        if (action === 'delete') {
            result = await Student.deleteMany({ _id: { $in: ids } });
        }
        else if (action === 'move-form') {
            // Payload should be target form/year
            // Since we store enrollmentYear, we need to map "Form 1" -> Year Logic
            // But simplifying: update enrollmentYear directly if provided
            if (payload && payload.newYear) {
                result = await Student.updateMany(
                    { _id: { $in: ids } },
                    { $set: { enrollmentYear: payload.newYear } }
                );
            } else {
                return res.status(400).json({ error: "Target year required" });
            }
        }
        else if (action === 'update-hall') {
            if (payload && payload.hall) {
                result = await Student.updateMany(
                    { _id: { $in: ids } },
                    { $set: { hall: payload.hall } }
                );
            } else {
                return res.status(400).json({ error: "Target hall required" });
            }
        }
        else if (action === 'update-program') {
            if (payload && payload.program) {
                result = await Student.updateMany(
                    { _id: { $in: ids } },
                    { $set: { program: payload.program } }
                );
            } else {
                return res.status(400).json({ error: "Target program required" });
            }
        }
        else {
            return res.status(400).json({ error: "Invalid action" });
        }

        await logEvent(req.user.id, 'bulk_action', { action, count: ids.length, result }, req);
        res.json({ success: true, message: `Action completed on ${ids.length} students` });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Bulk action failed" });
    }
});

// GET /api/students/stats/dashboard - Dashboard Stats
router.get('/stats/dashboard', verifyAdmin, async (req, res) => {
    if (await pythonProxy(req, res, '/api/students/stats/dashboard')) return;
    try {
        const total = await Student.countDocuments();
        const currentYear = new Date().getFullYear();

        // Simple aggregation for now
        // Advanced aggregation from Python code would go here

        // Count just this month (naive)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await Student.countDocuments({ createdAt: { $gte: startOfMonth } });

        res.json({
            success: true,
            stats: {
                total,
                newThisMonth,
                avgAge: 16 // Placeholder until aggregation
            }
        });
    } catch (e) {
        res.status(500).json({ error: "Stats error" });
    }
});

module.exports = router;
