/*
    Processes a beatmap file and adds all its fruit to the queue
    Also controls the audio.
*/
var beatmap;
beatmapData = [];
var fruitLines = [];
var timingLines = [];
volume = 50;
var music;
var hitsoundsNormal;
var hitsoundsSoft;
var hitsoundsDrum;
hitsounds = [];
winAudio = false;
var currentSong;
var thumbPath;
var songLength;
var musicRange;
var startAudio = new Audio('/catch/audio/confirm-selection.mp3');

function startDebug() {
    startGame(`./catch/song/debug`, "Debugging");
}

//start beatmap from ID
function startID(beatmapID) {
    var map = beatmapDatabase[beatmapID.toString()];
    beatmapData = map;
    startGame(map.path, map.title)
}

//loads stuff and then starts
function startGame(path, title) {
    startAudio.volume = document.getElementById("musicRange").value / 100;
    startAudio.play();
    $('#catchField').css('transform', `rotateX(0deg) rotateY(0deg) rotateZ(0deg)`)
    document.getElementById('catchField').style.cursor = 'none';
    currentSong = title;
    gameStarted = true;
    winAudio = new Audio('/catch/audio/rankpass.mp3');

    stopPreview();
    window.scrollTo(0, 0);
    document.title = `svt!catch | ${title}`
    fetch(`/${path}.osu`)
        .then(response => response.text())
        .then(data => {
            beatmap = data.split("\n")
        });
    thumbPath = path + ".jpg";
    music = new Audio(`/${path}.mp3`);
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
    var foundTiming = false;
    var foundObjects = false;
    var sliderMultiplier;
    var beatLength;
    var beatLengthMultiplier = 1;

    //Sets background
    document.getElementById('catchField').style.background = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('../${thumbPath}')`;
    document.getElementById('catchField').style.backgroundSize = `cover`;
    document.getElementById('catchField').style.backgroundRepeat = `no-repeat`;
    document.getElementById('catchField').style.backgroundPosition = `center center`;


    //Get lines and offset from file
    beatmap.forEach(line => {
        if (!foundTiming) {
            //set hitsounds
            if (line.includes("SampleSet: Normal") || line.includes("SampleSet: None")) hitsounds = hitsoundsNormal;
            else if (line.includes("SampleSet: Soft")) hitsounds = hitsoundsSoft;
            else if (line.includes("SampleSet: Drum")) hitsounds = hitsoundsDrum;
            else if (line.includes("SliderMultiplier")) sliderMultiplier = parseFloat(line.split(":")[1]);
            else if (line.includes("[TimingPoints]")) foundTiming = true;
        } else {
            if (!foundObjects) {
                if (line.split(",").length > 3) {
                    timingLines.push(line);
                } else {
                    if (line.includes("[HitObjects]")) foundObjects = true;
                }
            } else {
                fruitLines.push(line);
            }
        }
    });

    setTimeout(function () {
        if (hitsounds.length > 0) hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100
        });
        music.volume = musicRange.value / 100;
        music.play()
    }, 955)

    var lastFruit = null;
    //Get data from all fruit lines
    for (var i = 0; i < fruitLines.length; i++) {
        var line = fruitLines[i].split(",")
        var delay = parseInt(line[2])
        var pos = parseInt(line[0]);
        var hitsound = parseInt(line[4]);

        if (line.length > 7) {
            //Summons slider-start fruit
            summonFruit(delay, parseInt(pos, 10), 0, hitsound);
            lastFruit = {
                sliderStart: true,
                pos: pos,
                time: delay
            };
            console.log(lastFruit)

            //Get slider ending position
            var sliderPositions = line[5].split("|")
            var sliderEndPos = sliderPositions[sliderPositions.length - 1].split(":")[0]
            var dropletTiming = beatLength / 100 / sliderMultiplier * 16.8 / beatLengthMultiplier; //time between droplets
            var repeats = parseInt(line[6]); //How many times the slider will repeat
            var sliderLength = parseInt(Math.round(line[7])); //How long the slider is
            var dropletsPerRepeat = parseInt(Math.round(sliderLength / 17));
            var droplets = dropletsPerRepeat * repeats; //amount of droplets slider contains
            var diff = (pos - sliderEndPos) / droplets; //difference in x each droplet should have
            var currentDrop = 0;

            for (var i = 0; i < droplets; i++) {
                var dropPos = pos - (diff * i);
                var dropDelay = (i) * dropletTiming + 20;
                if (currentDrop == dropletsPerRepeat) {
                    summonFruit(dropDelay + delay, dropPos, 0, hitsound)
                    currentDrop = 0;
                } else summonFruit(dropDelay + delay, dropPos, 1)
                currentDrop++;
            }
            //Summons slider-end fruit
            //console.log(`bl: ${beatLength} slm: ${sliderMultiplier} tot: ${beatLength / 100 / sliderMultiplier * 17} math: ${beatLength}/100*${sliderMultiplier}*17`)
            var isHyper = false;
            if (lastFruit != null) {
                var jumpRating = Math.abs(sliderEndPos - lastFruit.pos) / ((delay + (droplets + 1) * dropletTiming) - lastFruit.time);
                if (jumpRating > 0.5) isHyper = true;
                console.log(jumpRating)
            }
            summonFruit((droplets + 1) * dropletTiming + delay, sliderEndPos, 0, hitsound, isHyper)
            lastFruit = {
                sliderStart: false,
                pos: sliderEndPos,
                time: (droplets + 1) * dropletTiming + delay
            };
            console.log(lastFruit)

        } else if (line[3] != "12") {
            //Summons a large fruit


            var isHyper = false;
            if (lastFruit != null) {
                var jumpRating = Math.abs(pos - lastFruit.pos) / (delay - lastFruit.time);
                if (jumpRating > 0.5) isHyper = true;
                console.log(jumpRating)
            }
            summonFruit(delay, pos, 0, hitsound, isHyper)
            lastFruit = {
                sliderStart: false,
                pos: pos,
                time: delay
            };
            console.log(lastFruit)
        } else {
            //Summons a spinner
            summonSpinner(delay, parseFloat(line[5]) - delay)
        }
        //Sets song length to current line
        if (line.length > 1) songLength = parseInt(line[2]);
    }

    timingLines.forEach(line => {
        var data = line.split(",");
        toggleKiai(data[7] == 1, data[0]);
        //set beatlengths
        if (typeof beatLength == "undefined") {
            beatLength = parseFloat(data[1]);
            console.log(`Default beat length set to ${beatLength} (${Math.round((1 / beatLength * 1000 * 60))} BPM)`)
        } else if (data[6] == 1) {
            setTimeout(function () {
                beatLength = parseFloat(data[1]);
                console.log("Beat length set to " + beatLength)
            }, parseFloat(data[0]) - 10)
        } else {
            setTimeout(function () {
                beatLengthMultiplier = -100 / parseFloat(data[1]);
                console.log("Beat length multiplier set to " + beatLengthMultiplier)
            }, data[0] - 10)
        }
    })
    console.log(`${timingLines.length} beatlengths queued.`)

    //Finish game 3 seconds after last object.
    var mapLength = parseInt(fruitLines[fruitLines.length - 2].split(',')[2]);
    finishGame(mapLength + 3000);

    //play win audio
    setTimeout(function () {
        winAudio.volume = document.getElementById("musicRange").value / 100;
        winAudio.play();
    }, mapLength + 2000)
}

//Audio
$(document).ready(function () {
    musicRange = document.getElementById("musicRange");
    effectsRange = document.getElementById("effectsRange");
    confettiRange = document.getElementById("confettiToggle");

    musicRange.oninput = function () {
        if (typeof music != "undefined") {
            music.volume = musicRange.value / 100;

        }

    }
    effectsRange.oninput = function () {
        if (hitsounds.length > 0) hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100

        });
    }
    confettiRange.oninput = function () {
        if (!confettiRange.checked) confetti.stop();
    }


    //load volume from cookies
    musicRange.value = getAloneCookie("catchVolumeMusic");
    effectsRange.value = getAloneCookie("catchVolumeEffects");
    document.getElementById("confettiToggle").checked = getAloneCookie("catchConfetti");
})

var saveCookie = setInterval(function () {
    setCookie("catchVolumeMusic", musicRange.value, 10000);
    setCookie("catchVolumeEffects", effectsRange.value, 10000);
    setCookie("catchConfetti", document.getElementById("confettiToggle").checked);
}, 2000);


function resetGame() {
    fruits = [];
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