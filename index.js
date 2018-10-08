const dbUrl = getConfig().mongoUrl;
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect(dbUrl, {
    useNewUrlParser: true
});

const Users = mongoose.model(getConfig().schemaName, getConfig().schema);

app.listen(getConfig().port, () => {
    log('');
    log('Node app is running on port:');
    log(`http://localhost:${getConfig().port}`);
    log('');
});

app.get('/', function (req, res) {
    res.send("It's alive.");
});

app.get(`/${getConfig().schemaName}`, function (req, res) {
    Users.find().then(result => {
        res.json(result)
    });
});
app.get(`/${getConfig().schemaName}/:id`, function (req, res) {
    let id = Number(req.params.id)

    Users.findOne({
        id
    }).then(result => {
        res.json(result)
    });
});

app.post(`/${getConfig().schemaName}`, function (req, res) {
    let user = new Users(req.body);
    user.save().then(result => res.json(req.body));
});

function log(message) {
    const debug = true;
    if (debug)
        return console.log(message)

    return false;
}

function getConfig() {
    let config = clearRequireCacheAndReturnNewData('./Config') || {};
    config.mongoUrl = process.env.MONGO_URL || config.mongoUrl || 'mongodb://user:user@ds123124.mlab.com:23124/easy-rest'
    config.schemaName = process.env.SCHEMA_NAME || config.schemaName || 'users'
    config.schema = process.env.SCHEMA || config.schema || {
        id: Number,
        login: String,
        password: String
    };
    config.port = process.env.PORT || config.port || 5000
    return config;
}

function clearRequireCacheAndReturnNewData(modulePath) {
    let toReturn
    try {
        delete require.cache[require.resolve(modulePath)]
        toReturn = require(modulePath)
    } catch (e) {}
    return toReturn
}