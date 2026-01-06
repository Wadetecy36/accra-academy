const express = require('express');
const Announcement = require('../models/announcement');

const router = express.Router();

router.get('/', async (req, res) => {
    res.json(await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 }) || { text: "" });
});

router.post('/', async (req, res) => {
    await Announcement.updateMany({}, { isActive: false });
    await new Announcement({ text: req.body.text }).save();
    res.json({ success: true });
});

router.delete('/', async (req, res) => {
    await Announcement.updateMany({}, { isActive: false });
    res.json({ success: true });
});

module.exports = router;
