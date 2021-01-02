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

//converts 1000 to 1,000 etc
function cleanNumber(num){
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}