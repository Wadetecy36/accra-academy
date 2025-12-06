/* ============================================================= */
/*  server/server.js – HARDENED PRODUCTION VERSION               */
/* ============================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const Parser = require('rss-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// --- DATABASE CACHING (Vercel Fix) ---
const MONGO_URI = process.env.MONGO_URI;
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(MONGO_URI, { bufferCommands: false });
        isConnected = db.connections[0].readyState;
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ DB Error:", error);
    }
};

// --- SCHEMAS ---
const ChatLog = mongoose.model('ChatLog', new mongoose.Schema({
    userMessage: String,
    botReply: String,
    timestamp: { type: Date, default: Date.now }
}));

const Knowledge = mongoose.model('Knowledge', new mongoose.Schema({
    topic: String,
    content: String,
    category: String
}));

const Student = mongoose.model('Student', new mongoose.Schema({
    fullName: String,
    indexNumber: { type: String, unique: true },
    program: String,
    house: String,
    year: String,
    timestamp: { type: Date, default: Date.now }
}));

// --- AI CONFIG ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BASE_INSTRUCTIONS = `
    You are the 'Bleoo Assistant' for Accra Academy.
    Objective: Answer based strictly on the provided KNOWLEDGE BASE.
    If unknown, suggest 'info@accraacademy.edu.gh'.
    Keep answers concise.
`;

// --- API ENDPOINTS ---

// 1. CHAT (RAG)
app.post('/api/chat', async (req, res) => {
    await connectDB();
    try {
        const { message, history } = req.body;
        const facts = await Knowledge.find({});
        const knowledgeBaseString = facts.map(f => `[${f.topic}]: ${f.content}`).join('\n');

        const contextString = `
            ${BASE_INSTRUCTIONS}
            === KNOWLEDGE BASE ===
            ${knowledgeBaseString}
            ======================
            HISTORY: ${history ? history.map(m => `${m.sender}: ${m.text}`).join('\n') : ''}
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
        await new ChatLog({ userMessage: message, botReply: botReply }).save();

        res.json({ reply: botReply });
    } catch (error) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ error: "AI Service Disrupted" });
    }
});

// 2. NEWS
app.get('/api/news', async (req, res) => {
    try {
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=Accra+Academy&hl=en-GH&gl=GH&ceid=GH:en');
        const news = feed.items.slice(0, 10).map(i => ({
            title: i.title, link: i.link, pubDate: i.pubDate, source: i.source, snippet: i.contentSnippet
        }));
        res.json(news);
    } catch (e) { res.status(500).json({ error: "News Error" }); }
});

// 3. ADMIN & KNOWLEDGE
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === 'bleoo1931') res.json({ success: true, token: 'admin-ok' });
    else res.status(401).json({ success: false });
});

app.get('/api/logs', async (req, res) => {
    await connectDB();
    res.json(await ChatLog.find().sort({ timestamp: -1 }).limit(1000));
});

app.get('/api/knowledge', async (req, res) => {
    await connectDB();
    res.json(await Knowledge.find().sort({ category: 1 }));
});

app.post('/api/knowledge', async (req, res) => {
    await connectDB();
    await new Knowledge(req.body).save();
    res.json({ success: true });
});

app.delete('/api/knowledge/:id', async (req, res) => {
    await connectDB();
    await Knowledge.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// 4. STUDENTS
app.post('/api/students', async (req, res) => {
    await connectDB();
    try {
        await new Student(req.body).save();
        res.json({ success: true });
    } catch (e) { res.status(e.code === 11000 ? 400 : 500).json({ error: e.code === 11000 ? "Duplicate Index Number" : "Error" }); }
});

app.get('/api/students', async (req, res) => {
    await connectDB();
    res.json(await Student.find().sort({ timestamp: -1 }));
});

app.delete('/api/students/:id', async (req, res) => {
    await connectDB();
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- ANNOUNCEMENT SYSTEM ---
const AnnouncementSchema = new mongoose.Schema({
    text: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// 1. Get Latest Active Announcement (Public)
app.get('/api/announcement', async (req, res) => {
    await connectDB();
    // Get the most recent active one
    const latest = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(latest || { text: "" }); // Return empty if none
});

// 2. Post New Announcement (Admin)
app.post('/api/announcement', async (req, res) => {
    await connectDB();
    // Optional: Turn off all old ones first so only one shows
    await Announcement.updateMany({}, { isActive: false });

    await new Announcement({ text: req.body.text }).save();
    res.json({ success: true });
});

// 3. Clear Announcements (Admin)
app.delete('/api/announcement', async (req, res) => {
    await connectDB();
    await Announcement.updateMany({}, { isActive: false });
    res.json({ success: true });
});

// START
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
module.exports = app;
