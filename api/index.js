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

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// --- OPTIMIZED DB CONNECTION (Fixes Vercel Slowness) ---
const MONGO_URI = process.env.MONGO_URI;
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(MONGO_URI, { bufferCommands: false });
        isConnected = db.connections[0].readyState;
        console.log("✅ MongoDB Connected (Cached)");
    } catch (error) {
        console.error("❌ DB Error:", error);
    }
};

// --- SCHEMAS ---
const ChatLogSchema = new mongoose.Schema({
    userMessage: String,
    botReply: String,
    timestamp: { type: Date, default: Date.now }
});
const ChatLog = mongoose.model('ChatLog', ChatLogSchema);

const KnowledgeSchema = new mongoose.Schema({
    topic: String,
    content: String,
    category: String
});
const Knowledge = mongoose.model('Knowledge', KnowledgeSchema);

const StudentSchema = new mongoose.Schema({
    fullName: String,
    indexNumber: { type: String, unique: true },
    program: String,
    house: String,
    year: String,
    timestamp: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', StudentSchema);

// --- AI CONFIG ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BASE_INSTRUCTIONS = `
    You are the 'Bleoo Assistant' for Accra Academy.
    Objective: Answer questions based strictly on the provided KNOWLEDGE BASE.
    If the answer is not in the knowledge base, suggest contacting 'info@accraacademy.edu.gh'.
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

// 2. NEWS FEED (Google RSS)
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
        res.status(500).json({ error: "News Feed Error" });
    }
});

// 3. ADMIN: LOGIN
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    // Hardcoded password for now - Change 'bleoo1931' to whatever you want
    if (password === 'bleoo1931') {
        res.json({ success: true, token: 'admin-session-valid' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid Password' });
    }
});

// 4. ADMIN: LOGS & KNOWLEDGE
app.get('/api/logs', async (req, res) => {
    await connectDB();
    const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
});

app.get('/api/knowledge', async (req, res) => {
    await connectDB();
    const data = await Knowledge.find().sort({ category: 1 });
    res.json(data);
});

app.post('/api/knowledge', async (req, res) => {
    await connectDB();
    const { topic, category, content } = req.body;
    await new Knowledge({ topic, category, content }).save();
    res.json({ success: true });
});

app.delete('/api/knowledge/:id', async (req, res) => {
    await connectDB();
    await Knowledge.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// 5. STUDENT PORTAL
app.post('/api/students', async (req, res) => {
    await connectDB();
    try {
        await new Student(req.body).save();
        res.json({ success: true });
    } catch (err) {
        // Code 11000 = Duplicate Key (Index Number)
        if (err.code === 11000) res.status(400).json({ error: "Index Number already exists" });
        else res.status(500).json({ error: "Registration Failed" });
    }
});

app.get('/api/students', async (req, res) => {
    await connectDB();
    const students = await Student.find().sort({ timestamp: -1 });
    res.json(students);
});

app.delete('/api/students/:id', async (req, res) => {
    await connectDB();
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Start Server (Compatible with Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
module.exports = app;