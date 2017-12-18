const axios = require('cachios')
const promisify = require('util').promisify
const xmlParse = promisify(require('xml2js').parseString);
const formatOpts = { ignoreAttrs: true, explicitArray: false }; // Used by xmlParse

const arrayOrStringOrNothing = (input, defaultValue = "") => {
    if (!input) return defaultValue;
    if (typeof input === "string") {
        return input.replace(/<(?:.|\n)*?>/gm, '');
    } else if (typeof input === "object") { // Found this monster in my old Superkids RSS
        // console.log("Input is not a string");
        // console.log(JSON.stringify(input, null, 2));
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
    let channel = full.rss.channel;
    let finalItems = [];

    for (let item of channel.item) {
        finalItems.push({
            title: arrayOrStringOrNothing(item.title, "Untitled"),
            pubDate: new Date(item.pubDate),
            link: arrayOrStringOrNothing(item.link, "No link"),
            description: arrayOrStringOrNothing(item.description, "")
        });
    }

    return {
        title: arrayOrStringOrNothing(channel.title, "Untitled"),
        image: parseImage(channel.image, null),
        link: arrayOrStringOrNothing(channel.link, null),
        buildDate: new Date(channel.lastBuildDate),
        description: arrayOrStringOrNothing(channel.description, ""),
        items: finalItems
    };
};

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