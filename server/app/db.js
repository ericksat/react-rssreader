const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')
if (!process.env.MONGODB_URI) {
    throw Error("Mongodb uri is missing!")
}

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', (e) => {
    console.error('Mongo connection error. Probably server down.', e.message);
    process.exit();
});
db.once('open', function () {
    console.log("Opened connection to " + process.env.MONGODB_URI);
});

module.exports = {
    mongoose,
    isValid: ObjectID.isValid,
}