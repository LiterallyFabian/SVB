/*
    Processes a beatmap file and adds all its fruit to the queue
    Also controls the audio.
*/
var beatmap;
var fruitLines = [];
var timingLines = [];
volume = 50;
var music;
var hitsoundsNormal;
var hitsoundsSoft;
var hitsoundsDrum;
hitsounds = [];
var thumbPath;
var songLength;
var musicRange;

function startDebug() {
    startGame(`./catch/song/debug`, "Debugging");
}

//loads stuff and then starts
function startGame(path, title) {
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
    document.getElementById('catchField').style.background = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('../${thumbPath}')`;
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


    //Get data from all fruit lines
    fruitLines.forEach(line => {
        line = line.split(",")
        var delay = parseInt(line[2]);

        setTimeout(function () { //processes and summons line when it's ready
            var pos = parseInt(line[0]);
            var hitsound = parseInt(line[4]);

            if (line.length > 7) {
                //Summons slider-start fruit
                summonFruit(0, parseInt(pos, 10), 0, hitsound);

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
                        summonFruit(dropDelay, dropPos, 0, hitsound)
                        currentDrop = 0;
                    } else summonFruit(dropDelay, dropPos, 1)
                    currentDrop++;
                }
                //Summons slider-end fruit
                //console.log(`bl: ${beatLength} slm: ${sliderMultiplier} tot: ${beatLength / 100 / sliderMultiplier * 17} math: ${beatLength}/100*${sliderMultiplier}*17`)
                summonFruit((droplets + 1) * dropletTiming, pos - (diff * droplets), 0, hitsound)

            } else if (line[3] != "12") {
                //Summons a large fruit
                summonFruit(0, pos, 0, hitsound)
            } else {
                //Summons a spinner
                summonSpinner(0, parseFloat(line[5]) - delay)
            }
            //Sets song length to current line
            if (line.length > 1) songLength = parseInt(line[2]);

        }, delay)
    })
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
    finishGame(parseInt(fruitLines[fruitLines.length - 2].split(',')[2]) + 3000);
}

//Audio

$(document).ready(function () {
    musicRange = document.getElementById("musicRange");
    var effectsRange = document.getElementById("effectsRange");

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

    //load volume from cookies
    musicRange.value = getAloneCookie("catchVolumeMusic");
    effectsRange.value = getAloneCookie("catchVolumeEffects");
})

var saveCookie = setInterval(function () {
    setCookie("catchVolumeMusic", musicRange.value, 10000);
    setCookie("catchVolumeEffects", effectsRange.value, 10000);
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
}