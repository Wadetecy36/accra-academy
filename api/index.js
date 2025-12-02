/* ============================================================= */
/*  server/server.js – HARDENED PRODUCTION VERSION               */
/* ============================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE (Critical for POST requests)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handles form data
app.use(express.static(path.join(__dirname, '../')));

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

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

// --- AI CONFIG ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using Gemini 2.5 Flash as determined earlier
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BASE_INSTRUCTIONS = `
    You are the 'Bleoo Assistant' for Accra Academy.
    Objective: Answer questions based strictly on the provided KNOWLEDGE BASE.
    If the answer is not in the knowledge base, suggest contacting 'info@accraacademy.edu.gh'.
    Keep answers concise.
`;

// --- API ENDPOINTS ---

// 1. CHAT (Public)
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

        // Save Log
        await new ChatLog({ userMessage: message, botReply: botReply }).save();

        res.json({ reply: botReply });

    } catch (error) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ error: "AI Error" });
    }
});

// 2. GET LOGS (Admin)
app.get('/api/logs', async (req, res) => {
    try {
        // Sort by timestamp descending (newest first)
        const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        console.error("Log Fetch Error:", error);
        res.status(500).json({ error: "DB Error fetching logs" });
    }
});

// 3. GET KNOWLEDGE (Admin)
app.get('/api/knowledge', async (req, res) => {
    try {
        const data = await Knowledge.find().sort({ category: 1 });
        res.json(data);
    } catch (error) {
        console.error("Knowledge Fetch Error:", error);
        res.status(500).json({ error: "DB Error fetching knowledge" });
    }
});

// 4. ADD KNOWLEDGE (Admin/CSV)
app.post('/api/knowledge', async (req, res) => {
    try {
        console.log("📝 Receiving New Fact:", req.body); // Debug Log
        const { topic, category, content } = req.body;

        if (!topic || !content) {
            return res.status(400).json({ error: "Topic and Content are required" });
        }

        const newFact = new Knowledge({ topic, category, content });
        await newFact.save();

        console.log("✅ Fact Saved!");
        res.json({ success: true, message: "Saved" });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ error: "Failed to save to DB" });
    }
});

// 5. DELETE KNOWLEDGE (Admin)
app.delete('/api/knowledge/:id', async (req, res) => {
    try {
        await Knowledge.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// Start
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
module.exports = app;