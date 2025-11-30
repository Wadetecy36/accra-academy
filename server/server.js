/* ============================================================= */
/*  server/server.js – MASTER BACKEND (AI + NEWS + PORTAL)       */
/* ============================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();
const bcrypt = require('bcryptjs'); // For secure password hashing

// Fix for node-fetch (ESM import in CommonJS)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// Serve frontend static files (from root folder)
app.use(express.static(path.join(__dirname, '../')));

// --- 1. DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- 2. SCHEMAS ---

// Chat Log Schema
const ChatLogSchema = new mongoose.Schema({
    userMessage: String,
    botReply: String,
    timestamp: { type: Date, default: Date.now }
});
const ChatLog = mongoose.model('ChatLog', ChatLogSchema);

// Knowledge Base Schema
const KnowledgeSchema = new mongoose.Schema({
    topic: String,
    content: String,
    category: String
});
const Knowledge = mongoose.model('Knowledge', KnowledgeSchema);

// Student Schema (Portal)
const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true }, // e.g., AA2025001
    password: { type: String, required: true },
    name: String,
    class: String, // "3 Science 1"
    house: String,
    program: String,
    gpa: { type: Number, default: 0.0 },
    attendance: { type: String, default: "100%" },
    feesOwed: { type: Number, default: 0 },
    grades: { type: Array, default: [] }
});
const Student = mongoose.model('Student', StudentSchema);

// --- 3. AI CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BASE_INSTRUCTIONS = `
    You are the 'Bleoo Assistant' for Accra Academy.
    Objective: Answer based on the KNOWLEDGE BASE provided below.
    If unknown, suggest contacting info@accraacademy.edu.gh.
    Keep answers concise.
`;

// --- 4. API ROUTES ---

// === A. CHATBOT (RAG Architecture) ===
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Fetch Knowledge
        const facts = await Knowledge.find({});
        const knowledgeBaseString = facts.map(f => `[${f.topic}]: ${f.content}`).join('\n');

        const contextString = `
            ${BASE_INSTRUCTIONS}
            === KNOWLEDGE BASE ===
            ${knowledgeBaseString}
            ======================
            HISTORY: ${history.map(m => `${m.sender}: ${m.text}`).join('\n')}
            QUESTION: ${message}
        `;

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: contextString }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const botReply = data.candidates[0].content.parts[0].text;

        // Async Log Save
        new ChatLog({ userMessage: message, botReply: botReply }).save();

        res.json({ reply: botReply });

    } catch (error) {
        console.error("⚠️ Chat Error:", error.message);
        res.status(500).json({ error: "AI Service Unavailable" });
    }
});

// === B. NEWS (Google RSS Proxy) ===
app.get('/api/news', async (req, res) => {
    try {
        const FEED_URL = 'https://news.google.com/rss/search?q=Accra+Academy&hl=en-GH&gl=GH&ceid=GH:en';
        const feed = await parser.parseURL(FEED_URL);

        const newsItems = feed.items.slice(0, 10).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: item.source || "News Source",
            snippet: item.contentSnippet || "Click to read full story."
        }));
        res.json(newsItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// === C. ADMIN PANEL ENDPOINTS ===

// Get Knowledge
app.get('/api/knowledge', async (req, res) => {
    try {
        const data = await Knowledge.find().sort({ category: 1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "DB Error" });
    }
});

// Add Knowledge
app.post('/api/knowledge', async (req, res) => {
    try {
        const { topic, category, content } = req.body;
        await new Knowledge({ topic, category, content }).save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Save failed" });
    }
});

// Delete Knowledge
app.delete('/api/knowledge/:id', async (req, res) => {
    try {
        await Knowledge.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// Get Chat Logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Log Error" });
    }
});

// Admin Login (Hardcoded for simplicity - Use Env Var in Production)
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === "bleoo1931") {
        res.json({ success: true, token: "admin_secure_token_xyz" });
    } else {
        res.status(401).json({ success: false, error: "Invalid Password" });
    }
});

// === D. STUDENT PORTAL (Authentication) ===

// Student Login
app.post('/api/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;

        // 1. Find Student
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(400).json({ error: "Student ID not found" });

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // 3. Return Data (Exclude password)
        const { password: _, ...studentData } = student.toObject();
        res.json({ success: true, student: studentData });

    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Admin: Enroll New Student
app.post('/api/students', async (req, res) => {
    try {
        const { name, studentId, className, house, program, password } = req.body;

        const existing = await Student.findOne({ studentId });
        if (existing) return res.status(400).json({ error: "Student ID already exists" });

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStudent = new Student({
            name,
            studentId,
            class: className,
            house,
            program: program || "General Arts",
            password: hashedPassword
        });

        await newStudent.save();
        res.json({ success: true, message: "Student Enrolled" });

    } catch (error) {
        console.error("Enrollment Error:", error);
        res.status(500).json({ error: "Enrollment failed" });
    }
});

// Admin: Get All Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find({}, '-password'); // Exclude passwords
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// --- SERVER START ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
module.exports = app;