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