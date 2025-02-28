/*

Collection of common methods used in most or all pages.

*/


//Gets cookies saved in users browser
function getCookie(cname) {
    var name = cname + "=j:";
    var ca = decodeURIComponent(document.cookie).split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getAloneCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

//(unsafe)
function isLoggedIn() {
    this.usercookie = getCookie("auth")
    return this.usercookie.length > 0;
}

//returns id and access token from cookie
function getAuth() {
    var cookie = getCookie("auth");
    if (cookie.length > 0) {
        return {
            id: JSON.parse(cookie).id,
            access_token: JSON.parse(cookie).access_token
        };
    } else {
        return {
            id: "",
            access_token: ""
        };
    }
}

//converts 1000 to 1,000 etc
function cleanNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//converts 184 to 3:04 etc
function secondsToDisplay(duration) {
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function setTheme(theme) {
    document.getElementsByTagName('html')[0].className = theme;
    setCookie("sitetheme", theme, 100000);

}

$(document).ready(function () {
    var theme = getAloneCookie("sitetheme");

    if (theme)
        setTheme(theme)
    else
        setTheme("theme_dark")
})

//add zeroes to number
function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}