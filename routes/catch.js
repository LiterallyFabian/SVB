var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require('glob');
var jimp = require("jimp");
const MP3Cutter = require('mp3-cutter');
var beatmaplist;

//Gets all beatmaps
router.post('/getmaps', (req, res) => {
    connection.query("SELECT * FROM beatmaps ORDER BY title", function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

//Gets a beatmap from ID
router.post('/getmap', (req, res) => {
    var ID = req.body.ID;
    connection.query(`SELECT * FROM posts WHERE id = '${ID}'`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

function getMaps() {
    connection.query("SELECT * FROM beatmaps", function (err, result) {
        if (err) throw err;
        beatmaplist = result;
        addBeatmaps();
    })
}

function addBeatmaps() {
    glob("catch/song/*.osu", {}, function (er, files) {
        var i = 0;
        files.forEach(beatmapPath => {
            //Add to MySQL 
            if (beatmapPath != "catch/song/debug.osu" && !beatmaplist.some(i => i.path.includes(beatmapPath.replace(".osu", "")))) {
                //array with every line from the beatmap
                var beatmap = fs.readFileSync(beatmapPath, 'utf8').split('\n');

                var beatmapData = {
                    approachrate: 9,
                    circlesize: 5
                };
                var foundTiming = false;
                var foundObjects = false;
                var hitobjects = [];

                //Set metadata
                beatmap.forEach(line => {
                    if (!foundObjects) {
                        if (line.startsWith("Title:")) beatmapData.title = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("Artist:")) beatmapData.artist = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("SampleSet:")) beatmapData.sampleset = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("Version:")) {
                            beatmapData.difficulty = line.substring(line.indexOf(":") + 1).trim();
                            beatmapData.id = (beatmapData.title + beatmapData.difficulty).hashCode();
                            if (beatmapData.id < 0) beatmapData.id *= -1;
                        } else if (line.startsWith("Creator:")) beatmapData.creator = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("PreviewTime:")) beatmapData.previewtime = line.substring(line.indexOf(":") + 1);
                        else if (line.startsWith("Tags:")) beatmapData.tags = line.substring(line.indexOf(":") + 1).replace("\r", "");
                        else if (line.startsWith("BeatmapID:")) beatmapData.id = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("ApproachRate:")) beatmapData.approachrate = line.substring(line.indexOf(":") + 1);
                        else if (line.startsWith("CircleSize:")) beatmapData.circlesize = line.substring(line.indexOf(":") + 1);

                        //found objects
                        else if (line.includes("[HitObjects]")) foundObjects = true;

                        //found timing points for BPM
                        if (foundTiming) {
                            beatmapData.bpm = 1 / line.split(",")[1] * 1000 * 60;
                            foundTiming = false;
                        }
                        if (line.includes("[TimingPoints]")) foundTiming = true;

                    } else {
                        if (line.split(",").length > 1) {
                            beatmapData.length = parseInt(line.split(",")[2] / 1000);
                            hitobjects.push(line);
                        }
                    }
                })

                //Create thumbnail & preview audio if needed
                createThumbnail(beatmapPath);
                createPreview(beatmapPath, beatmapData.previewtime);
                beatmapData.stars = calculateDifficulty(hitobjects);

                beatmapData.path = beatmapPath.replace(".osu", "");
                console.log(beatmapData);
                connection.query(`INSERT INTO beatmaps SET ?`, beatmapData, function (err, result) {
                    if (err) throw err;
                    console.log(`Map entry ${beatmapData.title} created! ${++i}/${files.length-1}`);
                });
            }

        })
    })
}

function createThumbnail(path) {
    var thumbnail = path.replace("osu", "jpg");
    var icon = thumbnail.replace("song/", "song/icon/");

    fs.access(icon, fs.F_OK, (err) => {
        if (err) {
            jimp.read(thumbnail, function (err, img) {
                if (err) throw err;
                img.resize(250, jimp.AUTO) // resize
                    .quality(85) // set JPEG quality
                    .write(icon); // save
                console.log(`Resized thumbnail at "${icon}"`)
            });
        }
    })
}

function createPreview(path, previewTime) {
    var audio = path.replace("osu", "mp3");
    var preview = audio.replace("song/", "song/preview/");

    fs.access(preview, fs.F_OK, (err) => {
        if (err) {
            MP3Cutter.cut({
                src: audio,
                target: preview,
                start: previewTime / 1000,
                end: previewTime / 1000 + 10
            });
            console.log(`Trying to cut "${preview}"`)
        }
    })
}

function calculateDifficulty(hitobjects) {
    var stars = 0;
    var lastPos = 320;
    var lastHit = 0;
    hitobjects.forEach(line => {
        var fruit = line.split(',');
        var thisPos = fruit[0];
        var thisHit = fruit[2];

        var distance = Math.abs(lastPos - thisPos);
        var time = thisHit - lastHit;

        //add star rating depending on distance & time
        //only modify star rating if time < 1s and distance > 10
        if (time < 1000 && distance > 10) {
            if (time > 0)
                stars += distance / time;
        }

        lastPos = thisPos;
        lastHit = thisHit;
    })
    return stars / hitobjects.length * 13;
}

//gets an unique int-hash from a string. just to give all maps a consistent ID even if they don't have one included
String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

module.exports = router;
module.exports.getMaps = getMaps;