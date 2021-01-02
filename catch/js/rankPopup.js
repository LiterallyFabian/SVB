medal;
// Get the image and insert it inside the modal - use its "alt" text as a caption
function setMedal(rank, score, highestCombo) {
    medal = document.getElementById("rankMedal");
    var medalImg = document.getElementById("rankImg");
    var captionText = document.getElementById("message");
    medal.style.display = "block";
    medalImg.src = `/images/ranking-${rank}.png`;
    var messages = {
        "ss": "Perfect!",
        "s": "Awesome!",
        "a": "Well played!",
        "b": "Great!",
        "c": "Nice!",
        "d": "Meh."
    }

    captionText.innerHTML = `${messages[rank]} Your highest combo was ${highestCombo} and you got ${Math.floor(score)} points. ${isLoggedIn() ? "" : "<br>Log in to save these scores."}`;
}