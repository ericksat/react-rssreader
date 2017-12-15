const express = require("express");
const axios = require('axios');
const fs = require("fs");

const rssParser = require('./rssparser').default;

const app = express();

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

const siteList = [
    {
        _id: 1,
        title: "Rational Male",
        url: "https://therationalmale.com/feed/"
    },
    {
        _id: 2,
        title: "VDH",
        url: "http://victorhanson.com/wordpress/feed/"
    },
];

app.get("/sites", (req, res) => {
    res.send({success: true, sites: siteList});
});

app.get("/rss/:url", async (req, res) => {
    let url = req.params.url;
    console.log("fetching", url);
    let content = await rssParser(url);
    res.send(content);
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});


// TODO: this should only happen in development
require('./start-client.js');