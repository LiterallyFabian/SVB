/*
Summons a medal on the page after game finish, containing play stats.
*/
medal = null;
function setMedal(rank, score, highestCombo) {
    medal = document.getElementById("rankMedal");
    var medalImg = document.getElementById("rankImg");
    var captionText = document.getElementById("message");
    medal.style.display = "block";
    medalImg.src = `/img/ranking-${rank.toUpperCase()}.png`;
    var messages = {
        "ss": "Perfect!",
        "s": "Awesome!",
        "a": "Well played!",
        "b": "Great!",
        "c": "Nice!",
        "d": "Meh."
    }

    captionText.innerHTML = `${messages[rank]} Your highest combo was ${cleanNumber(highestCombo)} and you got ${cleanNumber(Math.floor(score))} points. ${isLoggedIn() ? "<br><br>Your score is saved on your profile!" : "<br><br>Log in to save these scores."}`;
}