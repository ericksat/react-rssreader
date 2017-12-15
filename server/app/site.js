const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let schema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
    url: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
});

var Site = mongoose.model("Site", schema)

module.exports = Site;