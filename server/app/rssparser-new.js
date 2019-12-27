const axios = require('cachios');
let Parser = require('rss-parser');

let parser = new Parser();

const formatContent = (feed) => {
    let finalItems = [];

    for (let item of feed.items) {
        // We remove html tags from the summary or description
        let summary = item.contentSnippet || item.content || "";
        summary = summary.trim().replace(/<(?:.|\n)*?>/gm, '');

        finalItems.push({
            title: item.title,
            pubDate: Date(item.isoDate),
            tstamp: Date(item.isoDate),
            link: item.link || "",
            description: summary,
        });
    }
    // Some stinking sites (like Fake News) mess with the items, so they're not in order. I will ENFORCE this to avoid changing the entire app.
    finalItems.sort((a, b) => b.tstamp - a.tstamp);

    return {
        title: feed.title || "Untitled",
        image: feed.image ? feed.image.url : null,
        link: feed.link || null,
        // buildDate: feed.lastBuildDate || "",
        description: feed.description || "",
        items: finalItems
    };
};

// Returns the full request
const request = async (url) => {
    try {
        let response = await axios.get(url, { ttl: 300 });
        // const item = parser(response.data);
        const parsed = await parser.parseString(response.data);
        // const items = await feedparser.parse(httpOptions, feedparserOptions);
        return formatContent(parsed);
    } catch (e) {
        console.log(e)
        throw new Error(`Could not parse response from ${url}, possibly not available right now.`);
    }
}

// Tests for new items
const newTest = async(url, lastRead) => {
    let response = await request(url);
    let filteredItems = response.items.filter((item) => {
        return item.tstamp > lastRead
    });

    return {
        latest: filteredItems.length > 0 ? filteredItems[0] : null,
        newItems: filteredItems,
        count: filteredItems.length
    }
}

module.exports = { request, newTest }

/*
module.exports.checkAllForNew = async () => {
    var requestRM = new CachedRequest(urls.rationalMale)
    var requestVdh = new CachedRequest(urls.vdh)
    var contents = await Promise.all([requestRM.getContent(true), requestVdh.getContent(true)])
    return [
        { "title": contents[0].title, "new": contents[0].new },
        { "title": contents[1].title, "new": contents[1].new }
    ];
}
*/