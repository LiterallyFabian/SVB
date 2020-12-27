console.log(`Welcome to SVT!`)
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const path = require('path');
const fs = require('fs');
const app = express();
var route_post = require('./routes/post.js');
var route_user = require('./routes/user.js');
var route_catch = require('./routes/catch.js');
app.use(express.static(path.join(__dirname, '')));

connection = mysql2.createConnection({
    host: 'localhost',
    user: 'fabian',
    password: 'priya',
    database: 'svt'
});

connection.connect(function (e) {
    if (e) {
        return console.error('error: ' + e.message);
    }

    console.log('\nConnected to the MySQL server\n');

    route_post.createPosts();
    route_catch.clearDatabase();
});

app.use(express.json());
app.use(express.static("/"));
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use('/post', route_post);
app.use('/user', route_user);
app.use('/catch', route_catch);

app.get('/', (req, res) => {
    res.sendFile('index.html')
});

const hostname = '192.168.56.101';
const port = 3000;

const server = http.createServer(app);


server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});