const axios = require('cachios')
const promisify = require('util').promisify
const xmlParse = promisify(require('xml2js').parseString);
const formatOpts = { ignoreAttrs: true, explicitArray: false }; // Used by xmlParse

const arrayOrStringOrNothing = (input, defaultValue = "") => {
    if (!input) return defaultValue;
    if (typeof input === "string") {
        let filtered = input.replace(/<(?:.|\n)*?>/gm, '');
        // console.log(filtered.trim());
        return filtered.trim();
    } else if (typeof input === "object") { // Found this monster in my old Superkids RSS
        console.log("Input is not a string");
        console.log(JSON.stringify(input, null, 2));
        let text = "";
        for (let key in input) {
            text += input[key] + " ";
        }
        return text;
    }
};

const parseImage = (input, defaultValue = "") => {
    if (!input) return defaultValue;
    return arrayOrStringOrNothing(input.url);
};

const formatContent = async (xmlContent) => {
    // console.log(xmlContent);
    let full = await xmlParse(xmlContent, formatOpts);
    if (!full.rss) {
        throw new Error("Failed to parse xml!");
    }
    let channel = full.rss.channel;
    let finalItems = [];

    for (let item of channel.item) {
        let date;
        if (item.updated) {
            date = new Date(item.updated);
        } else {
            date = new Date(item.pubDate);
        }

        finalItems.push({
            title: arrayOrStringOrNothing(item.title, "Untitled"),
            pubDate: date,
            tstamp: date.getTime(),
            link: arrayOrStringOrNothing(item.link, "No link"),
            description: arrayOrStringOrNothing(item.description, "")
        });
    }
    // Some stinking sites (like Fake News) mess with the items, so they're not in order. I will ENFORCE this to avoid changing the entire app.
    finalItems.sort((a, b) => b.tstamp - a.tstamp);

    return {
        title: arrayOrStringOrNothing(channel.title, "Untitled"),
        image: parseImage(channel.image, null),
        link: arrayOrStringOrNothing(channel.link, null),
        buildDate: new Date(channel.lastBuildDate),
        description: arrayOrStringOrNothing(channel.description, ""),
        items: finalItems
    };
};

// Returns the full request
const request = async (url) => {
    try {
        // console.log("Heading to url " + url);
        let response = await axios.get(url, {ttl: 300});
        let formattedContent = await formatContent(response.data);
        return formattedContent;
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