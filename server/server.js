// TODO: Site navigator: add, edit, remove
// TODO: Handle errors when trying to fetch remote data.
// TODO: Store last check date and show if there are new posts.
// TODO: Update design.
// TODO: Deploy to github and heroku.
// TODO: Update site list immediately on add, edit, remove - and cancel on error

const express = require("express");
const axios = require('axios');
// const fs = require("fs");
const bodyParser = require('body-parser')

const rssParser = require('./app/rssparser').default;
const db = require('./app/db');
// Models
const siteModel = require('./app/site');
// Store these in memory for now
let sites = null;

const app = express();

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

// Middleware
app.use(bodyParser.json())

// SITES ROUTES

app.get("/sites", (req, res) => {
    if (sites) { // From memory cache
        res.send({ success: true, sites });
        return;
    }
    siteModel.find({}).then((result) => {
        sites = result; // Fill global object and store
        res.send({ success: true, sites });
    });
});

app.post('/sites', (req, res) => {
    let site = req.body.site;
    console.log(req.body);
    // console.log(req);
    if (!site) {
        res.send({success: false, error: "No site data received"});
        return;
    }
    console.log("Posting site", site);
    let model = new siteModel(site);
    model.save().then(() => {
        sites = null; // Need refresh
        console.log("Added new model");
        res.send({success: true, id: model._id});
    });
});

app.put('/sites/:id', (req, res) => {
    let site = req.body.site;
    let id = req.params.id;
    siteModel.findByIdAndUpdate(id, attributes).then(() => {
        sites = null;
        res.send({success: true});
    });
});

app.delete('/sites/:id', (req, res) => {
    let id = req.params.id;
    siteModel.findByIdAndRemove(id).then(() => {
        sites = null;
        res.send({ success: true });
    });
});

// RSS ROUTES

app.get("/rss/:id", async (req, res) => {
    let found = sites.find((site) => site._id == req.params.id);
    let url = found ? found.url : undefined;
    if (url) {
        console.log("fetching", url);
        let content = await rssParser(url);
        res.send(content);
    } else {
        res.send({success: false, error: "ID not found"});
    }
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});


// TODO: this should only happen in development
// require('./start-client.js');