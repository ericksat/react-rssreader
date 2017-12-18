var axios = require('cachios')
const promisify = require('util').promisify
var xmlParse = promisify(require('xml2js').parseString);

const formatContent = async (xmlContent) => {
    // console.log(xmlContent);
    let full = await xmlParse(xmlContent)
    let channel = full.rss.channel[0];
    let finalItems = [];

    for (let item of channel.item) {
        let description = "";
        if (item.description) {
             if (item.description[0]) description = item.description[0];
             else description = item.description;
        }

        finalItems.push({
            title: item.title[0] || "Untitled",
            pubDate: new Date(item.pubDate),
            link: item.link[0] || "No link",
            description
        })
    }
    var formatted = {
        title: channel.title[0] || "Untitled",
        image: channel.image? channel.image[0].url[0] : undefined,
        link: channel.link ? channel.link[0] : undefined,
        buildDate: new Date(channel.lastBuildDate),
        description: channel.description[0] || "",
        items: finalItems
    }

    return formatted;
}

const request = async (url) => {
    try {
        let response = await axios.get(url, {ttl: 300});
        let formattedContent = await formatContent(response.data);
        return formattedContent;
    } catch (e) {
        console.log(e)
        throw e;
    }
}

module.exports = {
    default: request,
}

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