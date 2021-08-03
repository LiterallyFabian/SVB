/*
    Processes a beatmap file and adds all its fruit to the queue
    Also controls the audio.
*/
var beatmap;
beatmapData = [];
volume = 50;
var music;
var hitsoundsNormal;
var hitsoundsSoft;
var hitsoundsDrum;
var hitsoundCombobreak;
hitsounds = [];
winAudio = false;
var currentSong;
//timestamp of current song start
var currentStartTime;
var thumbPath;
var songLength;
var musicRange;
var startAudio = new Audio('/catch/audio/confirm-selection.mp3');

function loadDebug() {
    loadGame(`./catch/song/debug`, "Debugging");
}

//start beatmap from ID
function loadID(beatmapID) {
    var map = beatmapDatabase[beatmapID.toString()];
    beatmapData = map;
    loadGame(map.path, map.title)
}

//loads stuff and then starts
function loadGame(path, title) {
    startAudio.volume = document.getElementById("musicRange").value / 100;
    startAudio.play();
    $('#catchField').css('transform', `rotateX(0deg) rotateY(0deg) rotateZ(0deg)`)
    document.getElementById('catchField').style.cursor = 'none';
    currentSong = title;
    gameStarted = true;
    winAudio = new Audio('/catch/audio/rankpass.mp3');

    stopPreview();
    window.scrollTo(0, 0);
    document.title = `svb!catch | ${title}`
    fetch(`/${path}.osu`)
        .then(response => response.text())
        .then(data => {
            beatmap = data.split("\n")
        });
    thumbPath = path + ".jpg";

    if (music) music.pause();
    music = new Audio(`/${path}.mp3`);
    hitsoundCombobreak = new Audio(`/catch/hitsounds/combobreak.mp3`);
    hitsoundsNormal = [new Audio(`/catch/hitsounds/normal-hitnormal.mp3`), new Audio(`/catch/hitsounds/normal-hitwhistle.mp3`), new Audio(`/catch/hitsounds/normal-hitfinish.mp3`), new Audio(`/catch/hitsounds/normal-hitclap.mp3`)]
    hitsoundsSoft = [new Audio(`/catch/hitsounds/soft-hitnormal.mp3`), new Audio(`/catch/hitsounds/soft-hitwhistle.mp3`), new Audio(`/catch/hitsounds/soft-hitfinish.mp3`), new Audio(`/catch/hitsounds/soft-hitclap.mp3`)]
    hitsoundsDrum = [new Audio(`/catch/hitsounds/drum-hitnormal.mp3`), new Audio(`/catch/hitsounds/drum-hitwhistle.mp3`), new Audio(`/catch/hitsounds/drum-hitfinish.mp3`), new Audio(`/catch/hitsounds/drum-hitclap.mp3`)]
    music.onloadeddata = waitForLoad();
}

function waitForLoad() {
    if (typeof music !== "undefined" &&
        typeof beatmap !== "undefined" &&
        music.readyState == 4
    ) {
        processMap()
    } else {
        setTimeout(waitForLoad, 500);
    }
}



function processMap() {
    resetGame();
    var songTime = new Date();
    currentStartTime = songTime;
    beatmap = parseBeatmap(beatmap);


    //Sets background
    document.getElementById('catchField').style.background = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('../${thumbPath}')`;
    document.getElementById('catchField').style.backgroundSize = `cover`;
    document.getElementById('catchField').style.backgroundRepeat = `no-repeat`;
    document.getElementById('catchField').style.backgroundPosition = `center center`;

    //Set volume & play music
    hitsounds = beatmap.hitsounds;
    setTimeout(function () {
        hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100
        });
        hitsoundCombobreak.volume = effectsRange.value / 100;
        music.volume = musicRange.value / 100;
        music.play();
        startEggs(beatmapData.id);
    }, 955)

    //get all fruits
    var fruits = parseFruits(beatmap);

    //summon all fruits
    for (let i = 0; i < fruits.length; i++) {
        setTimeout(function () {
            var thisObj = fruits[i];
            var nextObj = fruits[i + 1];
            var hyper = false;
            if (nextObj && thisObj.fruit.size == 0 && nextObj.fruit.size == 0) {
                var distance = Math.abs(nextObj.fruit.x - thisObj.fruit.x);
                var time = nextObj.delay - thisObj.delay;
                var difficulty = distance / time;
                if (difficulty > 1 && distance > 100) hyper = true;
            }
            summonedFruits.push(new fruit(thisObj.fruit.x, thisObj.fruit.size, thisObj.fruit.hitsound, hyper))
        }, fruits[i].delay)
    }

    //Finish game 3 seconds after last object.
    finishGame(fruits[fruits.length - 2].delay + 3000, currentStartTime);

    //play win audio
    setTimeout(function () {
        if (currentStartTime == songTime) {
            winAudio.volume = document.getElementById("musicRange").value / 100;
            winAudio.play();
        }
    }, fruits[fruits.length - 2].delay + 2000)
}

//Save settings
$(document).ready(function () {
    musicRange = document.getElementById("musicRange");
    effectsRange = document.getElementById("effectsRange");

    musicRange.oninput = function () {
        if (typeof music != "undefined") {
            music.volume = musicRange.value / 100;
        }
        setCookie("catchVolumeMusic", musicRange.value, 10000);
    }
    effectsRange.oninput = function () {
        if (hitsounds.length > 0) hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100
        });
        setCookie("catchVolumeEffects", effectsRange.value, 10000);

    }


    //load volume from cookies
    musicRange.value = getAloneCookie("catchVolumeMusic");
    effectsRange.value = getAloneCookie("catchVolumeEffects");
})

function resetGame() {
    fruitHasSpawned = false;
    allFruits = [];
    summonedFruits = [];
    fruitLines = [];
    timingLines = [];
    score = 0;
    misses = 0;
    catches = 0;
    kiai = false;
    combo = 0;
    highestCombo = 0;
    bananaShower = false;
    missedFruits = 0;
    catchedFruits = 0;
    missedScore = 0;
    catchedScore = 0;
}

function parseBeatmap(beatmap) {
    var foundTiming, foundObjects = false;
    var result = {
        hitsounds: hitsoundsNormal,
        sliderMultiplier: 1,
        fruitLines: [],
        timingPoints: [],
        timingLines: [],
        beatLength: 0
    }

    beatmap.forEach(line => {
        if (!foundTiming) {
            //set hitsounds
            if (line.includes("SampleSet: Soft")) result.hitsounds = hitsoundsSoft;
            else if (line.includes("SampleSet: Drum")) result.hitsounds = hitsoundsDrum;
            else if (line.includes("SliderMultiplier")) result.sliderMultiplier = parseFloat(line.split(":")[1]);
            else if (line.includes("[TimingPoints]")) foundTiming = true;
        } else {
            if (!foundObjects) {
                if (line.split(",").length > 3) {
                    result.timingLines.push(line);
                } else {
                    if (line.includes("[HitObjects]")) foundObjects = true;
                }
            } else {
                result.fruitLines.push(line);
            }
        }
    });
    var timingData = parseTiming(result.timingLines);
    result.timingPoints = timingData.timing;
    result.defaultBeatLength = timingData.def;
    return result;
}

function parseTiming(timingLines) {
    var timingPoints = [];
    var lastBeatLength;
    var defaultBeatLength = -1;
    timingLines.forEach(line => {
        var data = line.split(",");
        var time = data[0] - 5;
        var beatLength = parseInt(data[1]);
        var meter = data[2];
        var sampleSet = data[3];
        var sampleIndex = data[4];
        var volume = data[5];
        var uninherited = data[6] == 1;
        var effects = data[7];

        toggleKiai(effects == 1, time, currentStartTime);

        //set beatlengths
        if (uninherited) {
            timingPoints.push({
                value: beatLength,
                delay: time - 1
            });
            lastBeatLength = beatLength
            if (defaultBeatLength == -1) {
                defaultBeatLength = beatLength;
                console.log(`Default beat length set to ${beatLength} (${Math.round(1 / beatLength * 1000 * 60)} BPM)`)
            }

        } else {
            timingPoints.push({
                value: lastBeatLength / (-100 / beatLength),
                delay: time - 1
            });
        }
    });
    if (defaultBeatLength == -1) {
        defaultBeatLength = 500;
        console.error(`Default beat length could not be found!`, timingLines);
    }
    return {
        def: defaultBeatLength,
        timing: timingPoints
    };
}

function parseFruits(beatmap) {
    var allFruits = [];
    var sliderMultiplier = beatmap.sliderMultiplier;
    var beatLength = beatmap.defaultBeatLength;

    beatmap.fruitLines.forEach(line => {
        line = line.split(",");
        var pos = parseInt(line[0]); //x
        var delay = parseInt(line[2]);
        var defaultHitsound = parseInt(line[4]);

        if (!fruitHasSpawned) {
            fruitHasSpawned = true;
            resetGame();
        }


        //this line is a SLIDER
        if (line.length > 7) {
            var overrideHitsounds = line.length > 8;
            var sliderHitsounds = overrideHitsounds ? line[8].split("|") : [];
            var currentHitsound = 0;

            //Queue slider-start fruit
            allFruits.push({
                delay: delay,
                fruit: {
                    x: pos,
                    size: 0,
                    hitsound: overrideHitsounds ? sliderHitsounds[currentHitsound++] : defaultHitsound
                }
            })

            //Update beatLength
            var timing = beatmap.timingPoints.filter(obj => {
                return obj.delay < delay
            });
            if (timing[0]) beatLength = timing[timing.length - 1].value;

            //Get slider ending position
            var sliderPositions = line[5].split("|")
            var sliderEndPos = sliderPositions[sliderPositions.length - 1].split(":")[0]
            var repeats = parseInt(line[6]); //How many times the slider will repeat
            var sliderLength = line[7] / (sliderMultiplier * 100) * beatLength * repeats; //How long the slider is in milliseconds
            var dropletsPerRepeat = line[7] / 20;
            var droplets = dropletsPerRepeat * repeats; //amount of droplets slider contains
            var dropletDelay = sliderLength / droplets;
            var diff = (pos - sliderEndPos) / droplets; //difference in x each droplet should have

            var currentDrop = 0;
            for (var i = 0; i < droplets; i++) {
                var dropPos = pos - (diff * i);
                if (currentDrop == dropletsPerRepeat) {
                    allFruits.push({
                        delay: delay + dropletDelay * i,
                        fruit: {
                            x: dropPos,
                            size: 0,
                            hitsound: overrideHitsounds ? sliderHitsounds[currentHitsound++] : defaultHitsound
                        }
                    })
                    currentDrop = 0;
                } else
                    allFruits.push({
                        delay: delay + dropletDelay * i,
                        fruit: {
                            x: dropPos,
                            size: 1,
                            hitsound: 0
                        }
                    })
                currentDrop++;
            }
            //Queues slider-end fruit
            //console.log(`bl: ${beatLength} slm: ${sliderMultiplier} tot: ${beatLength / 100 / sliderMultiplier * 17} math: ${beatLength}/100*${sliderMultiplier}*17`)
            allFruits.push({
                delay: delay + droplets * dropletDelay,
                fruit: {
                    x: sliderEndPos,
                    size: 0,
                    hitsound: overrideHitsounds ? sliderHitsounds[currentHitsound++] : defaultHitsound
                }
            })

        } else if (line[3] != "12") {
            //Queue a large fruit
            allFruits.push({
                delay: delay,
                fruit: {
                    x: pos,
                    size: 0,
                    hitsound: defaultHitsound
                }
            })
        } else {
            //Summons a spinner
            summonSpinner(delay, parseFloat(line[5]))
        }
        //Sets song length to current line
        if (line.length > 1) songLength = parseInt(line[2]);
    })

    return allFruits;
}