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