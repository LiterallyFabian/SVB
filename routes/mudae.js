var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const glob = require('glob');
const schedule = require('node-schedule');

router.post('/claimkakera', (req, res) => {
    var id = req.body.discordid;
    var username = req.body.username;
    var avatar = req.body.avatar;
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`${username} (ID: ${id}) claimed kakera.`);

    connection.query(`INSERT INTO mudae VALUES (${id}, "${username}", "${avatar}", true, 60, 100, "${date}") ON DUPLICATE KEY UPDATE reactPower = reactPower - reactCost, username = "${username}", avatar = "${avatar}", lastAction = "${date}";`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

router.post('/claimcharacter', (req, res) => {
    var id = req.body.discordid;
    var username = req.body.username;
    var avatar = req.body.avatar;
    var claimed = req.body.claimed;
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`${username} (ID: ${id}) claimed ${claimed}.`);

    connection.query(`INSERT INTO mudae VALUES (${id}, "${username}", "${avatar}", false, 100, 100, "${date}") ON DUPLICATE KEY UPDATE hasClaim = false, username = "${username}", avatar = "${avatar}", lastAction = "${date}";`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

router.post('/resetclaim', (req, res) => {
    var id = req.body.discordid;
    var username = req.body.username;
    var avatar = req.body.avatar;
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`${username} (ID: ${id}) used rt.`);

    connection.query(`INSERT INTO mudae VALUES (${id}, "${username}", "${avatar}", true, 100, 100, "${date}") ON DUPLICATE KEY UPDATE hasClaim = true, username = "${username}", avatar = "${avatar}";`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

router.post('/dailykakera', (req, res) => {
    var id = req.body.discordid;
    var username = req.body.username;
    var avatar = req.body.avatar;
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`${username} (ID: ${id}) used dk.`);

    connection.query(`INSERT INTO mudae VALUES (${id}, "${username}", "${avatar}", true, 100, 100, "${date}") ON DUPLICATE KEY UPDATE reactPower = 100, username = "${username}", avatar = "${avatar}";`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

router.post('/updatetu', (req, res) => {
    var id = req.body.discordid;
    var username = req.body.username;
    var avatar = req.body.avatar;
    var hasClaim = req.body.hasClaim;
    var reactCost = req.body.reactCost;
    var reactPower = req.body.reactPower;
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`${username} (ID: ${id}) updated their stats.`);

    connection.query(`INSERT INTO mudae VALUES (${id}, "${username}", "${avatar}", ${hasClaim}, ${reactPower}, ${reactCost}, "${date}") ON DUPLICATE KEY UPDATE username = "${username}", avatar = "${avatar}", hasClaim = ${hasClaim}, reactCost = ${reactCost}, reactPower = ${reactPower};`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

//Reset claim for everyone at xx:20
var j = schedule.scheduleJob('0 20 * * * *', function () {

    console.log(`Oh man oh man, where are all the rolls?`);

    connection.query(`UPDATE mudae SET hasClaim = true;`, function (err, result) {
        if (err) throw err;
    });
});

//Add 1 react power to everyone every 3 min
var j = schedule.scheduleJob('*/3 * * * *', function () {
    console.log("kaka");
    connection.query(`UPDATE mudae SET reactPower = reactPower + 1 WHERE reactPower < 100;`, function (err, result) {
        if (err) throw err;
    });
});

//Gets all users
router.post('/users', (req, res) => {
    connection.query("SELECT * FROM mudae", function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

module.exports = router;