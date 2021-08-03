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
        $(".catch-catcher").each(function () {
            $(this).attr("src", $(this).attr("src").replace("lynn", "yuzu"));
        });

        //padoru / cinderella cage
        //adds a snowstorm
    } else if (id == 2742205 || id == 244224) {
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
        $(".catch-catcher").each(function () {
            $(this).attr("src", $(this).attr("src").replace("lynn", "kanna"));
        });
    }

}