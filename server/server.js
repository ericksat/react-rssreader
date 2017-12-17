// TODO: Improve RSSParser to keep less data, less arrays. Only send the minimum to client (it's being done on the client right now.)
// TODO: Code refactoring - component children-parent structure, based on what React promotes. Don't do unmount-remount (use hide/show), but avoid DOM otherwise.
// TODO: Store last check date and show if there are new posts.
// TODO: Update design.
// TODO: Deploy to github and heroku.


const express = require("express");
const axios = require('axios');
// const fs = require("fs");
const bodyParser = require('body-parser')

const rssParser = require('./app/rssparser').default;
const db = require('./app/db');
// Models
const siteModel = require('./app/site');

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

app.get("/rss/:id", async (req, res) => {
    try {
        // console.log("Looking for", req.params.id)
        let found = await siteModel.findById(req.params.id);
        // console.log(found);
        if (!found || !found.url) throw new Error("ID Not found!");
        // console.log("fetching", found.url);
        let content = await rssParser(found.url);
        res.send(content);
    } catch (e) {
        res.send({ success: false, error: "ID not found" });
    }
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});


// TODO: this should only happen in development
// require('./start-client.js');