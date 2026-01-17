const express = require('express');
const Parser = require('rss-parser');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
});

router.get('/', publicLimiter, async (req, res) => {
    try {
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=Accra+Academy&hl=en-GH&gl=GH&ceid=GH:en');

        // Sort by date (Newest First)
        const sortedItems = feed.items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        res.json(sortedItems.slice(0, 10).map(i => ({ title: i.title, link: i.link, pubDate: i.pubDate, source: i.source?.trim() || "News", snippet: i.contentSnippet })));
    } catch (e) {
        console.error("News Fetch Error:", e);
        res.status(500).json({ error: "News Error" });
    }
});

module.exports = router;
