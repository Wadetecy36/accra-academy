/* ============================================================= */
/*  server/server.js – PRODUCTION MASTER (SECURE + SMART)        */
/* ============================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Parser = require('rss-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

// --- 1. SECURITY: RATE LIMITING ---
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Allow 50 chats per 15 mins per IP
    message: { error: "Rate limit exceeded. Please wait." }
});

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// --- DATABASE CONNECTION ---
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

// Chat Log (With Auto-Delete & Sentiment)
const ChatLogSchema = new mongoose.Schema({
    userMessage: String,
    botReply: String,
    sentiment: { type: String, default: 'Neutral' },
    timestamp: { type: Date, default: Date.now }
});
// TTL Index: Delete logs after 30 days (2592000 seconds)
ChatLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
const ChatLog = mongoose.model('ChatLog', ChatLogSchema);

const Knowledge = mongoose.model('Knowledge', new mongoose.Schema({
    topic: String, content: String, category: String
}));

// Student (With Validation)
const Student = mongoose.model('Student', new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    indexNumber: { type: String, unique: true, required: true, trim: true },
    program: String,
    house: String,
    year: String,
    timestamp: { type: Date, default: Date.now }
}));

const Announcement = mongoose.model('Announcement', new mongoose.Schema({
    text: String, isActive: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now }
}));

// --- AI CONFIG ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BASE_INSTRUCTIONS = `
    You are the 'Bleoo Assistant' for Accra Academy.
    Objective: Answer based strictly on the KNOWLEDGE BASE.

    IMPORTANT: Analyze user sentiment. Start response with a tag: [Positive], [Neutral], or [Negative].
    Example: "[Positive] That is great news! The anthem is..."
    Keep answers concise.
`;

// --- API ENDPOINTS ---

// 1. CHAT (Smart)
app.post('/api/chat', chatLimiter, async (req, res) => {
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

        let rawText = data.candidates[0].content.parts[0].text;

        // Extract Sentiment
        let sentiment = "Neutral";
        const sentimentMatch = rawText.match(/^\[(Positive|Negative|Neutral)\]/i);
        if (sentimentMatch) {
            sentiment = sentimentMatch[1];
            rawText = rawText.replace(/^\[.*?\]\s*/, '');
        }

        await new ChatLog({ userMessage: message, botReply: rawText, sentiment }).save();
        res.json({ reply: rawText });

    } catch (error) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ error: "AI Service Disrupted" });
    }
});

// 2. LOGS (Searchable)
app.get('/api/logs', async (req, res) => {
    await connectDB();
    try {
        const { search, limit } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { userMessage: { $regex: search, $options: 'i' } },
                    { botReply: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const logs = await ChatLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit) || 50);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "DB Error" });
    }
});

// 3. ADMIN / KNOWLEDGE / STUDENTS (Standard)
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) res.json({ success: true, token: 'admin-ok' });
    else res.status(401).json({ success: false });
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

app.post('/api/students', async (req, res) => {
    await connectDB();
    try {
        await new Student(req.body).save();
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.code === 11000 ? "Duplicate Index Number" : "Error" }); }
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

// 4. NEWS & ANNOUNCEMENTS
app.get('/api/news', async (req, res) => {
    try {
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=Accra+Academy&hl=en-GH&gl=GH&ceid=GH:en');
        const news = feed.items.slice(0, 10).map(i => ({
            title: i.title, link: i.link, pubDate: i.pubDate, source: i.source, snippet: i.contentSnippet
        }));
        res.json(news);
    } catch (e) { res.status(500).json({ error: "News Error" }); }
});

app.get('/api/announcement', async (req, res) => {
    await connectDB();
    const latest = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(latest || { text: "" });
});

app.post('/api/announcement', async (req, res) => {
    await connectDB();
    await Announcement.updateMany({}, { isActive: false });
    await new Announcement({ text: req.body.text }).save();
    res.json({ success: true });
});

app.delete('/api/announcement', async (req, res) => {
    await connectDB();
    await Announcement.updateMany({}, { isActive: false });
    res.json({ success: true });
});

// START
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}
module.exports = app;