/* ============================================================= */
/*  api/index.js – VERCEL PATCHED (News Headers + Native Fetch)  */
/* ============================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Parser = require('rss-parser');

// FIX 1: Remove 'node-fetch' import. Node 18+ on Vercel has native fetch.
// const fetch = ... (Deleted to prevent conflicts)

const app = express();

// FIX 2: Add Headers to Parser so Google doesn't block Vercel
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
});

// --- CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET || 'bleoo_dev_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate Limiters
const publicLimiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, message: { error: "Too many login attempts" } });

// --- DATABASE CONNECTION ---
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        // Optimized connection for Serverless (prevents timeouts)
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ DB Error:", error);
    }
};

// --- SCHEMAS ---
// Using mongoose.models checks prevents "OverwriteModelError" in hot-reloading
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

const Knowledge = mongoose.models.Knowledge || mongoose.model('Knowledge', new mongoose.Schema({
    topic: String, content: String, category: String
}));

const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', new mongoose.Schema({
    userMessage: String, botReply: String, sentiment: String, timestamp: { type: Date, default: Date.now }
}));

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', new mongoose.Schema({
    text: String, isActive: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now }
}));

// --- AUTH HELPER ---
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access Denied" });
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).json({ error: "Invalid Token" }); }
};

// =================================================================
// 🚀 API ROUTES
// =================================================================

// --- A. STUDENT PORTAL ---
app.post('/api/auth/login', authLimiter, async (req, res) => {
    await connectDB();
    try {
        const { indexNumber, password } = req.body;
        const student = await Student.findOne({ indexNumber });
        if (!student) return res.status(404).json({ error: "Student not found" });

        const validPass = await bcrypt.compare(password, student.password);
        if (!validPass) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, token, user: { name: student.fullName } });
    } catch (e) { res.status(500).json({ error: "Login Error" }); }
});

app.get('/api/student/profile', verifyToken, async (req, res) => {
    await connectDB();
    try {
        const student = await Student.findById(req.user.id).select('-password');
        res.json(student);
    } catch (e) { res.status(500).json({ error: "Fetch Error" }); }
});

// --- B. ADMIN COMMAND CENTER ---
app.post('/api/admin/login', authLimiter, (req, res) => {
    // Directly checks Vercel Environment Variable
    if (req.body.password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '6h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false });
    }
});

app.post('/api/students', async (req, res) => {
    await connectDB();
    try {
        const { fullName, indexNumber, password, program, house, yearOfCompletion } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newStudent = new Student({ fullName, indexNumber, password: hashPassword, program, house, yearOfCompletion });
        await newStudent.save();
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.code === 11000 ? "Duplicate Index Number" : "Error creating student" }); }
});

app.get('/api/students', async (req, res) => {
    await connectDB();
    res.json(await Student.find().select('fullName indexNumber program house yearOfCompletion').sort({ timestamp: -1 }));
});

app.delete('/api/students/:id', async (req, res) => {
    await connectDB();
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.get('/api/knowledge', async (req, res) => { await connectDB(); res.json(await Knowledge.find()); });
app.post('/api/knowledge', async (req, res) => { await connectDB(); await new Knowledge(req.body).save(); res.json({ success: true }); });
app.delete('/api/knowledge/:id', async (req, res) => { await connectDB(); await Knowledge.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/logs', async (req, res) => {
    await connectDB();
    const { search, limit } = req.query;
    let query = search ? { $or: [{ userMessage: { $regex: search, $options: 'i' } }, { botReply: { $regex: search, $options: 'i' } }] } : {};
    res.json(await ChatLog.find(query).sort({ timestamp: -1 }).limit(parseInt(limit) || 50));
});

app.get('/api/announcement', async (req, res) => { await connectDB(); res.json(await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 }) || { text: "" }); });
app.post('/api/announcement', async (req, res) => { await connectDB(); await Announcement.updateMany({}, { isActive: false }); await new Announcement({ text: req.body.text }).save(); res.json({ success: true }); });
app.delete('/api/announcement', async (req, res) => { await connectDB(); await Announcement.updateMany({}, { isActive: false }); res.json({ success: true }); });

// --- C. PUBLIC SERVICES ---

// 1. News (Fixed Headers)
app.get('/api/news', publicLimiter, async (req, res) => {
    try {
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=Accra+Academy&hl=en-GH&gl=GH&ceid=GH:en');
        res.json(feed.items.slice(0, 10).map(i => ({ title: i.title, link: i.link, pubDate: i.pubDate, source: i.source?.trim() || "News", snippet: i.contentSnippet })));
    } catch (e) { 
        console.error("News Fetch Error:", e);
        res.status(500).json({ error: "News Error" }); 
    }
});

// 2. Chatbot (Native Fetch for Vercel)
const AI_INSTRUCTIONS = `You are 'Bleoo Assistant'. Answer using provided FACTS. Keep it brief. Analyze sentiment: [Positive]/[Neutral]/[Negative].`;

app.post('/api/chat', publicLimiter, async (req, res) => {
    await connectDB();
    try {
        const { message, history } = req.body;
        const facts = await Knowledge.find({});
        const context = `${AI_INSTRUCTIONS}\nFACTS:\n${facts.map(f => `[${f.topic}]: ${f.content}`).join('\n')}\nUSER Q: ${message}`;

        // Uses global fetch (Node 18+)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
        });
        
        const data = await response.json();
        
        // Better error logging for Vercel
        if (data.error) {
            console.error("Gemini API Error:", JSON.stringify(data.error));
            return res.status(500).json({ reply: "I am having trouble connecting to my brain." });
        }

        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "System Error";

        let sentiment = "Neutral";
        if(reply.includes('[Positive]')) { sentiment="Positive"; reply=reply.replace('[Positive]',''); }
        else if(reply.includes('[Negative]')) { sentiment="Negative"; reply=reply.replace('[Negative]',''); }
        else if(reply.includes('[Neutral]')) { sentiment="Neutral"; reply=reply.replace('[Neutral]',''); }

        await new ChatLog({ userMessage: message, botReply: reply, sentiment }).save();
        res.json({ reply: reply.trim() });
    } catch (e) { 
        console.error("Chat Server Error:", e);
        res.status(500).json({ reply: "Connection Error." }); 
    }
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// LOCAL DEV START
if (require.main === module) {
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on http://localhost:${PORT}`);
    });
}

module.exports = app;