const https = require('https');

async function getApiNews() {
    if (!process.env.NEWS_API_KEY) {
        console.warn("NEWS_API_KEY not found in environment. Skipping NewsAPI source.");
        return [];
    }

    return new Promise((resolve) => {
        const url = `https://newsapi.org/v2/everything?q=Accra+Academy&apiKey=${process.env.NEWS_API_KEY}&language=en&sortBy=publishedAt&pageSize=10`;

        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.status !== 'ok') {
                        console.error("NewsAPI Error:", parsed.message);
                        return resolve([]);
                    }
                    const articles = parsed.articles.map(a => ({
                        title: a.title,
                        link: a.url,
                        pubDate: a.publishedAt,
                        source: a.source.name,
                        snippet: a.description || ""
                    }));
                    resolve(articles);
                } catch (e) {
                    console.error("NewsAPI Parse Error:", e.message);
                    resolve([]);
                }
            });
        });

        req.on('error', (err) => {
            console.error("NewsAPI Network Error:", err.message);
            resolve([]);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            resolve([]);
        });
    });
}

module.exports = { getApiNews };

