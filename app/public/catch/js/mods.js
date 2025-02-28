var activeMods = [];

$(document).ready(function () {
    //detect clicks
    $(".osu-mod").on('click', function (event) {
        var id = event.target.id;
        if (!gameStarted)
            toggleMod(id);
    });

    //add from cookies
    var cookieData = getAloneCookie("mods");
    if (typeof cookieData == "string") activeMods = JSON.parse(cookieData);
    activeMods.forEach(mod => {
        toggleMod(mod, true);
    })
});

function toggleMod(id, forceAdd = false) {
    if (!activeMods.includes(id) || forceAdd) {
        $(`#${id}`).addClass("osu-mod-active");
        if (!forceAdd) activeMods.push(id);

        mods[id].incompatible.forEach(incompMod => {
            if (activeMods.includes(incompMod)) toggleMod(incompMod);
        })
        
    } else {
        $(`#${id}`).removeClass("osu-mod-active");
        activeMods.splice(activeMods.indexOf(id), 1);
    }

    setCookie("mods", JSON.stringify(activeMods), 100000);
}

function lockMods(lock = true) {
    $(".osu-mod,.osu-mod-locked").each(function () {
        if (lock && !activeMods.includes($(this).attr("id"))) {
            $(this).addClass("osu-mod-locked");
            $(this).removeClass("osu-mod");
        } else if (!lock) {
            $(this).addClass("osu-mod")
            $(this).removeClass("osu-mod-locked");
        }
    });
}

var mods = {
    ez: {
        id: "ez",
        name: "Easy",
        score: 0.5,
        incompatible: ["hr"]
    },
    ht: {
        id: "ht",
        name: "Half Time",
        score: 0.3,
        incompatible: ["dt"]
    },
    hr: {
        id: "hr",
        name: "Hard Rock",
        score: 1.12,
        incompatible: ["ez"]
    },
    dt: {
        id: "dt",
        name: "Double Time",
        score: 1.12,
        incompatible: ["ht"]
    },
    hd: {
        id: "hd",
        name: "Hidden",
        score: 1.06,
        incompatible: []
    },
    fi: {
        id: "fi",
        name: "Fade in",
        score: 1.06,
        incompatible: ["fl"]
    },
    fl: {
        id: "fl",
        name: "Flashlight",
        score: 1.12,
        incompatible: ["fi"]
    }
}