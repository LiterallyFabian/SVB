var skins = [{
    name: "Default (osu!catch)",
    id: "osu",
    status: "checked",
    hasDrop: false
}, {
    name: "osu!",
    id: "circle",
    status: "",
    hasDrop: false
}, {
    name: "Kanna Kamui'",
    id: "kanna",
    status: "",
    hasDrop: true
}, {
    name: "American",
    id: "american",
    status: "",
    hasDrop: false
}, {
    name: "Flowers",
    id: "flower",
    status: "",
    hasDrop: false
}, {
    name: "Hunie",
    id: "hunie",
    status: "",
    hasDrop: false
}, {
    name: "Sarah",
    id: "sarah",
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
                <label for="${skin.id}">${skin.name}</label>
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