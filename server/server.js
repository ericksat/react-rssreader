// TODO: I think updateLastVisit should return to lastRead, and return true or false to its parent (storage)
// TODO: Find out why App:updateSites is called on page load.

// TODO: Don't clear sessionStorage on each app mount when we're good to go.
// TODO: When we're ready, increase the polling times to something more sensible.
// TODO: Remove "minimum time didn't pass yet" console message

// TODO: Code refactoring - component children-parent structure, based on what React promotes. Don't do unmount-remount (use hide/show), but avoid DOM otherwise.

// ### NOTE: Deployment to Heroku is done through the package.json scripts. Look in there, but basically it runs npm install + npm build from the client. ###

const express = require("express");
const axios = require('axios');
// const fs = require("fs");
const bodyParser = require('body-parser')
const path = require('path');
const Base64 = require('js-base64').Base64;

const rssParser = require('./app/rssparser').request;
const rssTest = require('./app/rssparser').newTest;
const db = require('./app/db');
// Models
const siteModel = require('./app/site');

const app = express();

app.set("port", process.env.PORT || 3001);

// console.log(process.env.NODE_ENV);
// process.env.NODE_ENV = "production";

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/../client/build")));
}

// Middleware
app.use(bodyParser.json())

// SITES ROUTES
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/../client/build/index.html'));
})

app.get("/sites", (req, res) => {
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
        console.log("Added new model");
        res.send({success: true, id: model._id});
    });
});

app.put('/sites/:id', (req, res) => {
    let attributes = req.body.site;
    let id = req.params.id;
    siteModel.findByIdAndUpdate(id, attributes).then(() => {
        res.send({success: true});
    });
});

app.delete('/sites/:id', (req, res) => {
    setTimeout(() => {
    let id = req.params.id;
    siteModel.findByIdAndRemove(id).then(() => {
        res.send({ success: true });
    });
    }, 2000);
});

// RSS ROUTES

app.get("/rss/:base64", async (req, res) => {
    try {
        // console.log("Looking for", req.params.id)
        // let found = await siteModel.findById(req.params.id);
        // console.log(found);
        // if (!found || !found.url) throw new Error("ID Not found!");
        // console.log("fetching", found.url);
        let url = Base64.decode(req.params.base64);
        let channel = await rssParser(url);
        res.send({ success: true, channel });
    } catch (e) {
        res.send({ success: false, error: e.message });
    }
});

app.get("/rss-items/:base64", async(req, res) => {
    try {
        let url = Base64.decode(req.params.base64);
        let lastRead = req.query.lastRead;
        let info = await rssTest(url, lastRead);

        res.send({success: true, url, lastRead, ...info})
    } catch (e) {
        res.send({success: false, error: e.message});
    }
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});


// TODO: this should only happen in development
// require('./start-client.js');