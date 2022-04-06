/*
It's not like I am able to stop you, 
but it'll be a lot more interesting 
if you play the maps yourself instead 
of looking at the code :')

Yup, this file contains beatmap easter eggs. 
And descriptions to all of them. 
You've been warned.
*/

function startEggs(id) {

    //my love / new beginnings
    //changes catcher to Yuzu
    if (id == 397535 || id == 2116202) {
        setCatcher("yuzu");

        //padoru / cinderella cage / carol of circles
        //adds a snowstorm
    } else if (id == 2742205 || id == 244224 || id == 2258912) {
        $.getScript('/js/snowstorm.js', function () {
            snowStorm.start();
        });

        //goodbye moonmen
        //makes navbar items fall off in drop
    } else if (id == 2827907) {
        setTimeout(function () {
            var delay = 500;
            $(".navigation ul li a").each(function () {
                let obj = this;
                setTimeout(function () {
                    $(obj).addClass("fall-away")
                }, delay)
                delay += 60 / 128 * 8 * 1000 * delayModifier;
            })
        }, 60106 * delayModifier);

        //Dango Dango Drum and Bass / Dango Daikazoku
        //adds a dango to the fruit pool
    } else if (id == 190045 || id == 2143472879) {
        fruitImages.push(document.getElementById('dango'));


        //aozora no rhapsody / ai no supreme / ishukan communication
        //changes catcher to kanna
    } else if (id == 1643753 || id == 3099518 || id == 1258912) {
        setCatcher("kanna");

        //sound cinema
        //makes everything black
    } else if (id == 1821081) {
        $("#catchbody").css("background-color", "black")
        canvas = document.getElementById("catchField");
        canvas.requestFullscreen()

        //bad apple
        //replaces all fruits to apples
    } else if (id == 1754722) {
        fruitImages = [document.getElementById('fruit2')];

        //all chikatto songs
        //changes catcher to Chika
    } else if (id == 2015394 || id == 2070968 || id == 1982162) {
        setCatcher("chika");

        //ddlc
        //changes title on catch
    } else if (id == 1513428) {
        $("#nav-catch").text("just!monika");

    } else if (id == 1006821) {
        playVideo('song/assets/world.execute(me).webm');


        //mopemope
        //MAKE IT STOP
    } else if (id == 2533406) {
        setTimeout(function () {
            setTimeout(function () {
                setCatcher("nnyl");
                setBackground("song/assets/rrrrr1.jpg")
            }, 45579 * delayModifier)

            setTimeout(function () {
                setCatcher("lynn", "nnyl");
                setBackground("song/assets/glitch.png")
            }, 50979 * delayModifier)

            setTimeout(function () {
                setCatcher("nnyl");
                setBackground("song/assets/invert.png")
                $("#catchField").animate({
                    opacity: 0.7
                }, 20000 * delayModifier);
            }, 56379 * delayModifier)

            setTimeout(function () {
                setCatcher("kanna", "nnyl")
                setBackground("song/assets/oooooooooowhite.png")
            }, 62979 * delayModifier)

            setTimeout(function () {
                setCatcher("nnyl", "kanna");
            }, 64979 * delayModifier)

            setTimeout(function () {
                $("#catchField").css("z-index", "999");
                $("#topnav").addClass("fall-away");
            }, 70179 * delayModifier)

            setTimeout(function () {
                var delay = 600 * delayModifier;
                var i = 0;
                $(".beatmapCard .thumbnail").each(function () {
                    let obj = this;
                    setTimeout(function () {
                        if (++i < 31)
                            setBackground($(obj)[0].src)
                    }, delay)
                    delay += 600 * delayModifier;
                })
            }, 79779 * delayModifier)

            setTimeout(function () {
                setBackground("song/assets/glitch.png")
                $("#catchField").css("opacity", "1");
                setCatcher("lynn", "nnyl");
            }, 98979 * delayModifier)

            setTimeout(function () {
                setBackground("song/assets/rrrrr2.png")
                setCatcher("nnyl");
                $("#catchField").css("animation", `rotation ${delayModifier}s cubic-bezier(0, 0, 1, -0.36)`);
            }, 109404 * delayModifier)
        }, fruitDropTime);
    }
}

function setCatcher(catcher, from = "lynn") {
    $(".catch-catcher").each(function () {
        $(this).attr("src", $(this).attr("src").replace(from, catcher));
    });
}

function playVideo(path) {
    var videoObj = $('<video />', {
        id: 'beatmap_video',
        src: path,
        type: 'video/webm',
        controls: true,
        class: "hide"
    });
    videoObj.appendTo($('.song_gallery'));

    var video = document.getElementById('beatmap_video');
    video.playbackRate = dtModifier;

    video.muted = true;
    setTimeout(function () {
        video.play();
        video.addEventListener('play', () => {
            function step() {
                context.drawImage(video, 0, 0, canvas.width, canvas.height)
                requestAnimationFrame(step)
                context.globalCompositeOperation = 'destination-over';
            }

            requestAnimationFrame(step);
        });
    }, fruitDropTime);
}