var activeMods = [];

$(document).ready(function () {
    //detect clicks
    $(".catch-mod").on('click', function (event) {
        var id = event.target.id;
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