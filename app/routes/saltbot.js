var express = require('express');
var router = express.Router();

//adds user stats to profile 
router.post("/update", (req, res) => {
    var token = req.body.token;
    var id = req.body.id;
    var command = req.body.command;
    if (token == process.env.salttoken) {
        connection.query(`INSERT INTO saltbot (id,command,date) VALUES (${id},${connection.escape(command)},NOW());`, function (err, result) {
            if (err) throw err;
            return res.status(200)
        });
    } else {
        return res.status(403);
    }
});

//update server count
router.post("/server", (req, res) => {
    var token = req.body.token;
    var servers = req.body.servers;
    var members = req.body.members || null;
    var time = req.body.timestamp;
    if (token == process.env.salttoken) {
        connection.query(`INSERT INTO saltbot_servers (members,servers,date) VALUES (${members},${servers},${time ? `"${time}"` : "NOW()"});`, function (err, result) {
            if (err) throw err;
            return res.status(200)
        });
    } else {
        return res.status(403);
    }
});

router.get("/get/:token/:mode", (req, res) => {
    var token = req.params.token;
    var mode = req.params.mode;
    var table = "saltbot";
    if (mode == "server") table = "saltbot_servers"
    else if (mode == "command") table = "saltbot"

    if (token == process.env.salttoken) {
        connection.query(`SELECT * FROM ${table} ORDER BY DATE DESC`, function (err, result) {
            if (err) throw err;
            return res.status(200).send(result);
        });
    } else {
        return res.status(403);
    }
});

module.exports = router;