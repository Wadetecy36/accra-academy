const express = require('express');
const ChatLog = require('../models/chatLog');

const router = express.Router();

router.get('/', async (req, res) => {
    const { search, limit } = req.query;
    let query = search ? { $or: [{ userMessage: { $regex: search, $options: 'i' } }, { botReply: { $regex: search, $options: 'i' } }] } : {};
    res.json(await ChatLog.find(query).sort({ timestamp: -1 }).limit(parseInt(limit) || 50));
});

module.exports = router;
