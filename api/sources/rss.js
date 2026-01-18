const Parser = require('rss-parser');

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*'
    }
});

const RSS_FEEDS = [
    {
        name: 'Google News',
        url: 'https://news.google.com/rss/search?q=Accra+Academy&hl=en-GH&gl=GH&ceid=GH:en'
    },
    {
        name: 'Joy Online',
        url: 'https://www.myjoyonline.com/feed/'
    },
    {
        name: 'Citi Newsroom',
        url: 'https://citinewsroom.com/feed/'
    }
];

async function getRssNews() {
    const feeds = await Promise.allSettled(
        RSS_FEEDS.map(feed =>
            parser.parseURL(feed.url).then(data =>
                data.items.map(i => ({
                    title: i.title,
                    link: i.link,
                    pubDate: i.pubDate || i.isoDate,
                    source: feed.name,
                    snippet: i.contentSnippet || i.content || ""
                }))
            )
        )
    );

    return feeds
        .filter(f => f.status === 'fulfilled')
        .flatMap(f => f.value);
}

module.exports = { getRssNews };
