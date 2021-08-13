/*
Summons a medal on the page after game finish, containing play stats.
*/
medal = null;
fireworks = false;

function setMedal(rank, score, highestCombo) {
    medal = document.getElementById("rankMedal");
    var medalImg = document.getElementById("rankImg");
    var captionText = document.getElementById("message");
    medal.style.display = "block";
    medalImg.src = `/img/ranking-${rank.toUpperCase()}.png`;
    var messages = {
        "ssx": "Super perfect!",
        "ss": "Perfect!",
        "sx": "Super!",
        "s": "Awesome!",
        "a": "Well played!",
        "b": "Great!",
        "c": "Nice!",
        "d": "Meh."
    }

    if (rank == "ss" || rank == "ssx") summonFireworks();

    captionText.innerHTML = `${messages[rank]} Your highest combo was ${cleanNumber(highestCombo)} and you got ${cleanNumber(Math.floor(score))} points. ${isLoggedIn() ? "<br><br>Your score is saved on your profile!" : "<br><br>Log in to save these scores."}`;
}

function closeMedal() {
    medal.style.display = 'none';
    fireworks = false;
}

function summonFireworks() {
    fireworks = true;
    var animationEnd = Date.now() + 1000000;
    var defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000
    };

    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0 || !fireworks) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / 1000000);
        // since particles fall down, start a bit higher than random
        confettiCannon(Object.assign({}, defaults, {
            particleCount,
            origin: {
                x: randomInRange(0.1, 0.3),
                y: Math.random() - 0.2
            }
        }));
        confettiCannon(Object.assign({}, defaults, {
            particleCount,
            origin: {
                x: randomInRange(0.7, 0.9),
                y: Math.random() - 0.2
            }
        }));
    }, 500);
}