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

    //putin walk
    //makes catcher wide
    if (id == 2517397) {
        $(catcher).animate({
            width: catcher.width * 2.5
        }, 1500);

        //my love / new beginnings
        //changes catcher to Yuzu
    } else if (id == 397535 || id == 2116202) {
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
                    console.log("Hi")
                }, delay)
                delay += 60 / 128 * 8 * 1000;
            })
        }, 60106);

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

        //mopemope
        //MAKE IT STOP
    } else if (id == 2533406) {
        setTimeout(function () {
            setCatcher("nnyl");
            setBackground("song/mopemope/rrrrr1.jpg")
        }, 45579)

        setTimeout(function () {
            setCatcher("lynn", "nnyl");
            setBackground("song/mopemope/glitch.png")
        }, 50979)

        setTimeout(function () {
            setCatcher("nnyl");
            setBackground("song/mopemope/invert.png")
            $("#catchField").animate({
                opacity: 0.7
            }, 20000);
        }, 56379)

        setTimeout(function () {
            setCatcher("kanna", "nnyl")
            setBackground("song/mopemope/oooooooooowhite.png")
        }, 62979)

        setTimeout(function () {
            setCatcher("nnyl", "kanna");
        }, 64979)

        setTimeout(function () {
            $("#catchField").css("z-index", "999");
            $("#topnav").addClass("fall-away");
        }, 70179)

        setTimeout(function () {
            setBackground("song/mopemope/rrrrr3.png")
        }, 79779)

        setTimeout(function () {
            setBackground("song/mopemope/glitch.png")
            $("#catchField").css("opacity", "1");
            setCatcher("lynn", "nnyl");
        }, 98979)

        setTimeout(function () {
            setBackground("song/mopemope/rrrrr2.png")
            setCatcher("nnyl");
            $("#catchField").css("animation", "rotation 1s cubic-bezier(0, 0, 1, -0.36)");
        }, 109404)
    }
}

function setCatcher(catcher, from = "lynn") {
    $(".catch-catcher").each(function () {
        $(this).attr("src", $(this).attr("src").replace(from, catcher));
    });
}