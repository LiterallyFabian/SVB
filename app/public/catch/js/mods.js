var activeMods = [];

$(document).ready(function () {
    //detect clicks
    $(".catch-mod").on('click', function (event) {
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
        $(`#${id}`).addClass("catch-mod-active");
        if (!forceAdd) activeMods.push(id);
    } else {
        $(`#${id}`).removeClass("catch-mod-active");
        activeMods.splice(activeMods.indexOf(id), 1);
    }

    setCookie("mods", JSON.stringify(activeMods), 100000);
}

function lockMods(lock = true) {
    $(".catch-mod,.catch-mod-locked").each(function () {
        if (lock && !activeMods.includes($(this).attr("id"))) {
            $(this).addClass("catch-mod-locked");
            $(this).removeClass("catch-mod");
        } else if (!lock) {
            $(this).addClass("catch-mod")
            $(this).removeClass("catch-mod-locked");
        }
    });
}

var mods = {
    ez: {
        id: "ez",
        name: "Easy",
        score: 0.5
    },
    ht: {
        id: "ht",
        name: "Half Time",
        score: 0.3
    },
    hr: {
        id: "hr",
        name: "Hard Rock",
        score: 1.12
    },
    dt: {
        id: "dt",
        name: "Double Time",
        score: 1.12
    },
    hd: {
        id: "hd",
        name: "Hidden",
        score: 1.06
    },
    fi: {
        id: "fi",
        name: "Fade in",
        score: 1.06
    },
    fl: {
        id: "fl",
        name: "Flashlight",
        score: 1.12
    }
}