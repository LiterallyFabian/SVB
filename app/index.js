console.log(`Welcome to SVT!`)
const http = require('http');
const express = require('express');
const mysql2 = require('mysql2');
const path = require('path');
const cors = require('cors')
const fs = require('fs');
const root = path.join(__dirname, '/public');
const app = express();
var route_user = require('./routes/user.js');
var route_post = require('./routes/post.js');
var route_catch = require('./routes/catch.js');
var route_auth = require('./routes/auth.js');
var route_mudae = require('./routes/mudae.js');
var route_royale = require('./routes/royale.js');
var route_saltbot = require('./routes/saltbot.js');
require('dotenv').config();

app.set('strict routing', true)
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, '')));

connection = mysql2.createConnection({
    host: process.env.mysql_host || 'localhost',
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_database
});

connection.connect(function (e) {
    if (e) {
        return console.error('error: ' + e.message);
    }

    console.log('\nConnected to the MySQL server\n');

    require('./routes/database.js').createTables();
    route_post.createPosts();
    route_catch.getMaps();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public'), {
    extensions: ['html', 'htm', "osu"]
}));


app.use('/user', route_user);
app.use('/post', route_post);
app.use('/catch', route_catch);
app.use('/auth', route_auth);
app.use('/mudae', route_mudae);
app.use('/royale', route_royale);
app.use('/saltbot', route_saltbot);

app.get('/', (req, res) => {
    return res.sendFile('/index.html')
});

app.get('/mudae/', (req, res) => {
    return res.sendFile(__dirname + '/public/mudae.html')
});

app.get('/members/', (req, res) => {
    return res.sendFile(__dirname + '/public/members.html')
});

app.get('/post/', (req, res) => {
    return res.sendFile(__dirname + '/public/post.html')
});

app.get('/sajberroyale/', (req, res) => {
    return res.sendFile(__dirname + '/public/sajberroyale.html')
});

const hostname = '192.168.56.101';
const port = 3000;

const server = http.createServer(app);


server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});