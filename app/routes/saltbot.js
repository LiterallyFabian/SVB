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

module.exports = router;