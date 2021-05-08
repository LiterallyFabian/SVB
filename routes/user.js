var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');

//update users global & map stats after match
router.post("/updatecatch", (req, res) => {
    var rank = req.body.rank;
    var bananasCatched = req.body.bananasCatched;
    var bananasSeen = req.body.bananasSeen;
    var misses = req.body.misses;
    var catches = req.body.catches;
    var score = req.body.score;
    var highestCombo = req.body.highestCombo;
    var title = req.body.title;

    var userid = req.body.userid;
    var mapid = req.body.mapid.toString();

    if (!userid) return false;
    connection.query(`SELECT * FROM users WHERE id = '${userid}'`, function (err2, result) {
        var data = JSON.parse(result[0].catchScores);
        data.bananasSeen += bananasSeen;
        data.bananasCatched += bananasCatched;
        if (data.score == null) data.score = 0;
        data.score += score;
        if (data.highestCombo == null) data.highestCombo = 0;
        if (highestCombo > data.highestCombo) data.highestCombo = highestCombo;


        var ranks = data.ranks ? data.ranks : {};
        ranks[mapid] = ranks[mapid] ? ranks[mapid] : {}

        //add a rank count
        switch (rank) {
            case 'ss':
                data.ss++;
                break;
            case 's':
                data.s++;
                break;
            case 'a':
                data.a++;
                break;
            case 'b':
                data.b++;
                break;
            case 'c':
                data.c++;
                break;
            case 'd':
                data.d++;
                break;
        }
        //add rank badge (always highest badge)
        var found = false;
        ['ss', 's', 'a', 'b', 'c', 'd'].forEach(r => {

            if (r == ranks[mapid].rank) found = true;
            if (r == rank && !found) {
                ranks[mapid].rank = rank;
                found = true;
            }
        })

        //add stats if they are better
        if (typeof ranks[mapid].score == "undefined" || score > ranks[mapid].score) {
            ranks[mapid].title = title;
            ranks[mapid].score = score;
            ranks[mapid].combo = highestCombo;
            ranks[mapid].bananasCatched = bananasCatched;
            ranks[mapid].bananasSeen = bananasSeen;
            ranks[mapid].misses = misses;
            ranks[mapid].catches = catches;
            ranks[mapid].time = Date.now();
        }

        data.ranks = ranks;
        connection.query(`UPDATE users SET catchScores = '${JSON.stringify(data)}' WHERE id = '${userid}'`, function (err2, result) {
            if (err2) throw err2;
            console.log(`Added rank ${rank} to user ${userid} from map ${title}`)
        });
    });
});

module.exports = router;