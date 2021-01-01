//Inserts a navigation bar to the site and automatically logs in or check the cookie.

document.getElementById("navbar").innerHTML = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link href="/css/nav.css" rel="stylesheet" type="text/css">
<nav class="navigation" id="topnav">
    <ul>
    <a href="/"><img class="navlogo" src="/images/logo.svg" alt="LOGO"></a>
    
    <li><a href="/" class="active">Nyheter</a></li>
    <li><a href=#pagewrap>Lokalt</a></li>
    <li><a href=#video>Sport</a></li>
    <li><a href="/catch">svt!catch</a></li>
    <li><a href="/kontakt.html">Kontakt</a></li>
    <li><a v-bind:href="href">{{ navoption }}</a></li>
    <li><a v-bind:href="profilehref" v-if="loggedIn">{{ username }}</a></li>
    <a href="javascript:void(0);" class="icon" onclick="toggleNav()">
    <i class="fa fa-bars"></i>
</nav>
`

function toggleNav() {
    var x = document.getElementById("topnav");
    if (x.className === "navigation") {
        x.className += " responsive";
    } else {
        x.className = "navigation";
    }
}

const Login = {
    data() {
        return {
            navoption: "Logga in",
            username: "",
            //dev: https://discord.com/api/oauth2/authorize?client_id=793179363029549057&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth&response_type=code&scope=identify
            //prod: https://discord.com/api/oauth2/authorize?client_id=793179363029549057&redirect_uri=https%3A%2F%2Fsvt.sajber.me%2Fauth&response_type=code&scope=identify
            href: "https://discord.com/api/oauth2/authorize?client_id=793179363029549057&redirect_uri=https%3A%2F%2Fsvt.sajber.me%2Fauth&response_type=code&scope=identify",
            profilehref: "",
            loggedIn: false
        }

    },
    mounted: function trylogin() {
        this.$nextTick(function () {
            this.usercookie = getCookie("auth")
            if (this.usercookie.length > 0) {
                var data = JSON.parse(this.usercookie);
                this.access_token = data.access_token;
                this.id = data.id;
                this.vue_autologin();
            } else {
                console.log("No access token found, can not log in automatically.")
            }
        })
    },

    methods: {
        async vue_autologin() {
            console.log("Tries to login from saved access token...");
            await axios.post("/auth/verify", {
                access_token: this.access_token,
                id: this.id
            }).then(res => {
                if (res.data[0].name != null) {
                    this.navoption = "Skapa artikel"; //shown in navbar
                    this.href = "/post.html" //redirect option for logged in user
                    this.profilehref = "/profile.html?user=" + res.data[0].id
                    this.loggedIn = true;
                    this.username = res.data[0].name + "#" + res.data[0].discriminator;
                }
            })
        },
    }
}

Vue.createApp(Login).mount('.navigation')

