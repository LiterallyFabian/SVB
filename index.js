console.log(`Welcome to SVT!`)
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const path = require('path');
const fs = require('fs');
const app = express();
var post = require('./routes/post.js');
var user = require('./routes/user.js');
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

    post.createPosts();
});

app.use(express.json());
app.use(express.static("/"));
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use('/post', post);
app.use('/user', user);

app.get('/', (req, res) => {
    res.sendFile('index.html')
});

const hostname = '192.168.56.101';
const port = 3000;

const server = http.createServer(app);


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});