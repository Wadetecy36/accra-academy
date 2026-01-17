require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust Proxy for Render/Vercel/Heroku
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Global Rate Limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI not found in environment variables. Server cannot start.");
        // We don't process.exit(1) here to allow the server to run for static files,
        // but API routes requiring DB will fail.
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ DB Error:", error);
    }
};

// Connect to the database when the server starts
connectDB();

// --- ROUTES ---
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const knowledgeRoutes = require('./routes/knowledge');
const logRoutes = require('./routes/logs');
const announcementRoutes = require('./routes/announcement');
const newsRoutes = require('./routes/news');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/chat', chatRoutes);


// Serve static frontend
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Fallback for SPA / normal pages
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

module.exports = app;

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
