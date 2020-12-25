var beatmap;
audioLeadIn = 0;
var fruitLines = [];
fetch('/catch/song/ben10.osu')
    .then(response => response.text())
    .then(data => {
        beatmap = data.split("\n")
    });
var music = new Audio('/catch/song/ben10.mp3');
setTimeout(processMap, 1000)

function processMap() {
    var foundObjects = false;
    music.play();

    //Get lines and offset from file
    beatmap.forEach(line => {
        if (!foundObjects) {
            if (line.includes("AudioLeadIn")) audioLeadIn = line.split(":")[1];
            else if (line.includes("[HitObjects]")) foundObjects = true;
        } else {
            fruitLines.push(line);
        }
    });
    //Get data from all fruit lines
    fruitLines.forEach(line => {
        line = line.split(",")
        var pos = parseInt(line[0]);
        var delay = parseInt(line[2]);

        //slider
        if (line.length > 7) {
            var repeats = parseInt(line[6]);
            summonFruit(delay, parseInt(pos, 10), true);

            var diff = parseInt(Math.floor(Math.random() * 5) + 3);
            if (Math.random() > 0.5) diff = diff * -1;
            var sliderLength = parseInt(Math.round(line[7]));
            var size = parseInt(Math.round(sliderLength / 19.5) * repeats);
            var where = 0;
            var left = false;
            if (diff < 0) left = false;

            for (var loop = 0; loop < size; loop++) {
                var position = pos + parseFloat((where * diff));
                if (position > 640 || position < 20) {
                    left = !left;
                    position = pos + (where * diff);

                }
                if (left) where++;
                else where--;

                var dropPos = position;
                var dropDelay = (loop) * 40 + delay;
                summonFruit(dropDelay, dropPos, false)

            }
            summonFruit(delay + (size + 1) * 40, pos + (where * diff), true)
        } else if (line[3] != "12") //large fruit
        {
            summonFruit(delay, pos, true)
        }


    })

}