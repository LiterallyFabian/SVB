 var beatmap;
 var fruitLines = [];
 var timingLines = [];
 volume = 50;
 var music;
 var hitsoundsNormal;
 var hitsoundsSoft;
 var hitsoundsDrum;
 hitsounds = [];


 function startDebug() {
     startGame("./catch/song/debug.osu", "./catch/song/debug.jpg", "./catch/song/debug.mp3");
 }

 //loads stuff and then starts
 function startGame(map, thumbnail, audio) {

     fetch(`/${map}`)
         .then(response => response.text())
         .then(data => {
             beatmap = data.split("\n")
         });
     music = new Audio(`/${audio}`);
     hitsoundsNormal = [new Audio(`/catch/hitsounds/normal-hitnormal.wav`), new Audio(`/catch/hitsounds/normal-hitwhistle.wav`), new Audio(`/catch/hitsounds/normal-hitfinish.wav`), new Audio(`/catch/hitsounds/normal-hitclap.wav`)]
     hitsoundsSoft = [new Audio(`/catch/hitsounds/soft-hitnormal.wav`), new Audio(`/catch/hitsounds/soft-hitwhistle.wav`), new Audio(`/catch/hitsounds/soft-hitfinish.wav`), new Audio(`/catch/hitsounds/soft-hitclap.wav`)]
     hitsoundsDrum = [new Audio(`/catch/hitsounds/drum-hitnormal.wav`), new Audio(`/catch/hitsounds/drum-hitwhistle.wav`), new Audio(`/catch/hitsounds/drum-hitfinish.wav`), new Audio(`/catch/hitsounds/drum-hitclap.wav`)]
     waitForLoad();

     function waitForLoad() {
         if (typeof music !== "undefined" &&
             typeof beatmap !== "undefined" &&
             typeof hitsoundsNormal !== "undefined" &&
             typeof hitsoundsSoft !== "undefined" &&
             typeof hitsoundsDrum !== "undefined" &&
             music.readyState == 4 &&
             checkHitsounds(hitsoundsNormal) &&
             checkHitsounds(hitsoundsSoft) &&
             checkHitsounds(hitsoundsDrum)
         ) {
             processMap(thumbnail)
         } else {
             setTimeout(waitForLoad, 500);
         }
     }
 }

 function checkHitsounds(hs) {
     if (typeof hs == "undefined") return false;
     hs.forEach(h => {
         if (h.readyState != 4) return false;
     })
     return true;
 }


 function processMap(thumbnail) {
     var foundTiming = false;
     var foundObjects = false;
     document.getElementById('catchField').style.background = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('../${thumbnail}')`;
     document.getElementById('catchField').style.backgroundSize = `cover`;
     document.getElementById('catchField').style.backgroundRepeat = `no-repeat`;
     document.getElementById('catchField').style.backgroundPosition = `center center`;


     //Get lines and offset from file
     beatmap.forEach(line => {
         if (!foundTiming) {
             //set hitsounds
             //normal whistle finish clap
             if (line.includes("SampleSet: Normal") || line.includes("SampleSet: None")) hitsounds = hitsoundsNormal;
             else if (line.includes("SampleSet: Soft")) hitsounds = hitsoundsSoft;
             else if (line.includes("SampleSet: Drum")) hitsounds = hitsoundsDrum;
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
         music.volume = volume / 100;
         music.play()
     }, 955)


     //Get data from all fruit lines
     fruitLines.forEach(line => {
         line = line.split(",")
         var pos = parseInt(line[0]);
         var delay = parseInt(line[2]);
         var hitsound = parseInt(line[4]);
         var sliderpositions = line[5].split(",")

         //slider
         if (line.length > 7) {
             var repeats = parseInt(line[6]);
             summonFruit(delay, parseInt(pos, 10), 0, hitsound);

             var diff = parseInt(Math.floor(Math.random() * 7) + 3);
             if (Math.random() > 0.5) diff = diff * -1;
             var sliderLength = parseInt(Math.round(line[7]));
             var size = parseInt(Math.round(sliderLength / 15) * repeats);
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
                 summonFruit(dropDelay, dropPos, 1)

             }
             summonFruit(delay + (size + 1) * 40, pos + (where * diff), 0, hitsound)
         } else if (line[3] != "12") //large fruit
         {
             summonFruit(delay, pos, 0, hitsound)
         } else { //spinner
             summonSpinner(delay, parseFloat(line[5]))
         }


     })
     timingLines.forEach(line => {
         var data = line.split(",");
         toggleKiai(data[7] == 1, data[0]);
     })

 }