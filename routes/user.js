var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');

//login
router.post('/login', (req, res) => {
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
            var login = {
                status: true
            }
            res.cookie("login", user, {
                expires: new Date(Date.now() + 3600000 * 24 * 7)
            });
            res.cookie("isLoggedin", login, {
                expires: new Date(Date.now() + 3600000 * 24 * 7)
            });
            res.send(result);
        } else {
            res.send("No such user<br>" + username);
        }
    });
});


//register new user
router.post('/register', (req, res) => {

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

module.exports = router;