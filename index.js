console.log(`Welcome to SVT!`)
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const path = require('path');
const fs = require('fs');
const app = express();
const fetch = require('node-fetch');
var route_post = require('./routes/post.js');
var route_catch = require('./routes/catch.js');
var route_auth = require('./routes/auth.js');
var route_mudae = require('./routes/mudae.js');
var route_royale = require('./routes/royale.js');
require('dotenv').config();

app.set('trust proxy',true); 
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

    route_post.createPosts();
    route_catch.getMaps();
});

app.use(express.json());
app.use(express.static("/"));
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use('/post', route_post);
app.use('/catch', route_catch);
app.use('/auth', route_auth);
app.use('/mudae', route_mudae);
app.use('/royale', route_royale);

app.get('/', (req, res) => {
    res.sendFile('/index.html')
});

app.get('/images/minecraft/screenshot_2021_03_08.png', function (req, res) {
  console.log(req.connection.remoteAddress);
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
  fetch("https://discord.com/api/webhooks/510787425186873365/TEIpBGgl5bw9u5LK5PWAkPL8XpSg4WUHr8DuRRHzDehZDraKiNX02-xd5CVJwUM2_GM0", {
    method: 'post',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'SVT',
        avatar_url: 'https://i.imgur.com/zEN5n0b.png',
        content: ip,
    })

})
  res.sendFile(__dirname + "/minecraft.png");
});

const hostname = '192.168.56.101';
const port = 3000;

const server = http.createServer(app);


server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    route_mudae.send("==============\nServer started\n==============");

});