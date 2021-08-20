var skins = [{
    name: "Default (osu!catch)",
    id: "osu",
    description: "Play with the classic fruits",
    status: "checked",
    hasDrop: false
}, {
    name: "osu!",
    id: "circle",
    description: "Catch the circles!",
    status: "",
    hasDrop: false
}, {
    name: "Flowers",
    id: "flower",
    description: "Catch some pretty flowers",
    status: "",
    hasDrop: false
}, {
    name: "Kanna Kamui'",
    id: "kanna",
    description: "Play with some basic but pretty circles",
    status: "",
    hasDrop: true
}, {
    name: "American",
    id: "american",
    description: "Why not catch some fast food?",
    status: "",
    hasDrop: false
}, {
    name: "Hunie",
    id: "hunie",
    description: "A different art style won't hurt",
    status: "",
    hasDrop: false
}, {
    name: "Sarah",
    id: "sarah",
    description: "SUGOIIIIII ~",
    status: "",
    hasDrop: false
}]

$(document).ready(function () {
    fillSkins();

    //try set selection
    var currentSkin = getAloneCookie("catchSkin");
    if (typeof currentSkin == "string") $(`#${currentSkin}`).prop("checked", true);

    //listen for skin changes
    $('input:radio[name=skin]').change(function () {
        setCookie("catchSkin", this.value, 100000);
    });
})

function fillSkins() {
    skins.forEach(skin => {
        $("#gallery").append(`
        <div class="skin-container">
            <div class="skin-label">
                <input type="radio" class="skin-selector" id="${skin.id}" name="skin" value="${skin.id}" ${skin.status}>
                <label for="${skin.id}" title="${skin.description}">${skin.name}</label>
            </div>
            <img src="img/hitobjects/${skin.id}-1.png">
            <img src="img/hitobjects/${skin.id}-2.png">
            <img src="img/hitobjects/${skin.id}-3.png">
            <img src="img/hitobjects/${skin.id}-4.png">
            <img src="img/hitobjects/${skin.id}-shower.png">
        </div>
        `)
    })
}