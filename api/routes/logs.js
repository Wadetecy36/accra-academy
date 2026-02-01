const express = require('express');
const ChatLog = require('../models/chatLog');

const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyAdmin, async (req, res) => {
    const { search, limit } = req.query;
    let query = {};
    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query = {
            $or: [
                { userMessage: { $regex: escapedSearch, $options: 'i' } },
                { botReply: { $regex: escapedSearch, $options: 'i' } }
            ]
        };
    }
    res.json(await ChatLog.find(query).sort({ timestamp: -1 }).limit(parseInt(limit) || 50));
});

module.exports = router;
