//Inserts a navigation bar to the site and automatically logs in or check the cookie.

document.getElementById("navbar").innerHTML = `
<nav class="navigation">
    <ul>
    <a href="/index.html"><img class="navlogo" src="/images/logo.svg" alt="LOGO"></a>
    <li><a href="/index.html">Nyheter</a></li>
    <li><a href=#pagewrap>Lokalt</a></li>
    <li><a href=#video>Sport</a></li>
    <li><a href="/kontakt.html">Kontakt</a></li>
    <li><a v-bind:href="href">{{ navoption }}</a></li>
    </ul>
</nav>
`

const Login = {
    data() {
        return {
            navoption: "Logga in",
            href: "login.html"
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
            await axios.post("/login", {
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
