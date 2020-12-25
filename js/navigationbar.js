//Inserts a navigation bar to the site and automatically logs in or check the cookie.

document.getElementById("navbar").innerHTML = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link href="/css/nav.css" rel="stylesheet" type="text/css">
<nav class="navigation" id="topnav">
    <ul>
    <a href="/index.html"><img class="navlogo" src="/images/logo.svg" alt="LOGO"></a>
    
    <li><a href="/index.html" class="active">Nyheter</a></li>
    <li><a href=#pagewrap>Lokalt</a></li>
    <li><a href=#video>Sport</a></li>
    <li><a href="/kontakt.html">Kontakt</a></li>
    <li><a v-bind:href="href">{{ navoption }}</a></li>
    <li><a href="/catch/catch.html">svt!catch</a></li>
    <a href="javascript:void(0);" class="icon" onclick="toggleNav()">
    <i class="fa fa-bars"></i>
    </ul>
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
            href: "/login.html"
        }

    },
    mounted: function trylogin() {
        this.$nextTick(function () {
            this.usercookie = getCookie("login")
            if (this.usercookie.length > 0) {
                var data = JSON.parse(this.usercookie);
                this.username = data.username;
                this.hash = data.password;
                this.vue_autologin();
            }
        })
    },

    methods: {
        async vue_autologin() {
            console.log("start login");
            await axios.post("/user/login", {
                username: this.username,
                password: this.hash
            }).then(res => {
                if (res.data[0].name != null) {
                    this.navoption = "Nytt inlägg"; //shown in navbar
                    this.href = "/post.html" //redirect option for logged in user
                }
            })
        },
    }
}





Vue.createApp(Login).mount('.navigation')
