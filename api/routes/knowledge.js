const express = require('express');
const Knowledge = require('../models/knowledge');

const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    res.json(await Knowledge.find());
});

router.post('/', verifyAdmin, async (req, res) => {
    await new Knowledge(req.body).save();
    res.json({ success: true });
});

router.delete('/:id', verifyAdmin, async (req, res) => {
    await Knowledge.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;
