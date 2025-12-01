/* ============================================================= */
/*  api/index.js – VERCEL SERVERLESS BACKEND                     */
/* ============================================================= */

const Parser = require('rss-parser'); // <--- ADD THIS
const parser = new Parser();          // <--- ADD THIS

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
// Note: 'node-fetch' import remains the same
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());
// This points up one folder (..) to find index.html
app.use(express.static(path.join(__dirname, '../')));


// --- DATABASE CONNECTION (Optimized for Serverless) ---
const MONGO_URI = process.env.MONGO_URI;
let isConnected = false; // Cache connection

const connectToDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log("✅ MongoDB Atlas Connected");
    } catch (err) {
        console.error("❌ DB Error:", err);
    }
};

// --- SCHEMAS ---
const ChatLogSchema = new mongoose.Schema({
    userMessage: String,
    botReply: String,
    timestamp: { type: Date, default: Date.now }
});
// Check if model exists before compiling (Fixes "OverwriteModelError")
const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', ChatLogSchema);

const KnowledgeSchema = new mongoose.Schema({
    topic: String,
    content: String,
    category: String
});
const Knowledge = mongoose.models.Knowledge || mongoose.model('Knowledge', KnowledgeSchema);

// --- AI CONFIG ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BASE_INSTRUCTIONS = `
    You are the 'Bleoo Assistant' for Accra Academy.
    Objective: Answer questions based strictly on the provided KNOWLEDGE BASE.
    If the answer is not in the knowledge base, suggest contacting 'info@accraacademy.edu.gh'.
    Keep answers concise.
`;

// --- ADMIN SECURITY ---
// 👇 CHANGE YOUR PASSWORD HERE
const ADMIN_PASSWORD = "1931";

// LOGIN ENDPOINT (The frontend calls this)
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        // Return a success token
        res.json({ success: true, token: "bleoo_secure_session_" + Date.now() });
    } else {
        res.status(401).json({ success: false, error: "Wrong Password" });
    }
});

// --- API ENDPOINTS ---

// 1. CHAT
app.post('/api/chat', async (req, res) => {
    await connectToDB();
    try {
        const { message, history } = req.body;

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

        await new ChatLog({ userMessage: message, botReply: botReply }).save();
        res.json({ reply: botReply });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: "Service unavailable." });
    }
});

// 2. ADMIN LOGS
app.get('/api/logs', async (req, res) => {
    await connectToDB();
    try {
        const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "DB Error" });
    }
});

// 3. KNOWLEDGE GET
app.get('/api/knowledge', async (req, res) => {
    await connectToDB();
    try {
        const data = await Knowledge.find().sort({ category: 1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "DB Error" });
    }
});

// 4. KNOWLEDGE ADD
app.post('/api/knowledge', async (req, res) => {
    await connectToDB();
    try {
        const { topic, category, content } = req.body;
        await new Knowledge({ topic, category, content }).save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Save failed" });
    }
});

// 5. KNOWLEDGE DELETE
app.delete('/api/knowledge/:id', async (req, res) => {
    await connectToDB();
    try {
        await Knowledge.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- NEWS ENDPOINT ---
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

// DEFAULT HANDLER (For Testing)
app.get('/api', (req, res) => {
    res.send("Accra Academy API is Running 🟢");
});

// Debug Endpoint
app.get('/api/debug', (req, res) => {
    res.json({ status: "Online", message: "Vercel + Express is working!" });
});

// EXPORT APP (Critical for Vercel)
module.exports = app;


// 2. Start the Server for Local Development (Laptop)
// This condition checks: "Is this file being run directly by the terminal?"
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on http://localhost:${PORT}`);
        console.log(`📂 Serving static files from: ${path.join(__dirname, '../')}`);
    });
}