const express = require('express');
const rateLimit = require('express-rate-limit');
const { getRssNews } = require('../sources/rss');
const { getApiNews } = require('../sources/newsApi');

const router = express.Router();

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.get('/', publicLimiter, async (req, res) => {
    try {
        // Fetch from all sources concurrently
        const results = await Promise.allSettled([
            getRssNews(),
            getApiNews()
        ]);

        // Merge results and filter out failures
        const news = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value)
            .filter(n => n.pubDate) // Ensure date exists for sorting
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
            .slice(0, 20); // Keep top 20

        res.json(news);
    } catch (e) {
        console.error("Global News Error:", e);
        res.status(500).json({ error: "Failed to aggregate news" });
    }
});

module.exports = router;

