console.log(`Welcome to SVT!`)
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, '')));
// Setup database connection parameter
let connection = mysql2.createConnection({
    host: 'localhost',
    user: 'fabian',
    password: 'priya',
    database: 'svt'
});

// Connect with the database
connection.connect(function (e) {
    if (e) {

        // Show error messaage on failure
        return console.error('error: ' + e.message);
    }

    // Show success message if connected
    console.log('\nConnected to the MySQL server\n');

    if (e) throw e;
    connection.query("SELECT * FROM users", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});



app.use(express.json());
app.use(express.static("/"));
app.use(bodyParser.urlencoded({
    extended: false
}))

app.get('/', (req, res) => {
    res.sendFile('/home/fabian/svt/index.html')
});

//login
app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    connection.query(`SELECT * FROM users WHERE name = '${username}' AND hash = '${password}'`, function (err, result) {
        if (err) throw err;
        console.log(`Trying to login user ${username}`);
        if (result.length > 0) {
            var user = {
                username: username,
                password: password
            }
            res.cookie("login", user, {
                expires: new Date(Date.now() + 3600000 * 24 * 7)
            });
            res.send(result);
        } else {
            res.send("No such user<br>" + username);
        }
    });
});


//register new user
app.post('/register', (req, res) => {
    console.log('registerstart');

    var username = req.body.username;
    var password = req.body.password;
    var note = req.body.message;
    connection.query(`SELECT * FROM users WHERE name = '${username}'`, function (err, result) {
        if (result.length == 0) {
            console.log(`Creating user ${username}, hash ${password}`);
            connection.query(`INSERT INTO users VALUES ('${username}', '${password}')`, function (err2, result2) {
                if (err2) throw err2;
                res.send(result);
            });
        } else {
            res.send(result);
        }
    });
});


const hostname = '192.168.56.101';
const port = 3000;

const server = http.createServer(app);


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});