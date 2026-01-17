const express = require('express');
const rateLimit = require('express-rate-limit');
const Knowledge = require('../models/knowledge');
const ChatLog = require('../models/chatLog');

const router = express.Router();

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI_INSTRUCTIONS = `You are 'Bleoo Assistant'. Answer using provided FACTS. Keep it brief. Analyze sentiment: [Positive]/[Neutral]/[Negative].`;

router.post('/', publicLimiter, async (req, res) => {
    try {
        const { message, history } = req.body;
        const facts = await Knowledge.find({});
        const context = `${AI_INSTRUCTIONS}\nFACTS:\n${facts.map(f => `[${f.topic}]: ${f.content}`).join('\n')}\nUSER Q: ${message}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
        });

        const data = await response.json();

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

module.exports = router;
