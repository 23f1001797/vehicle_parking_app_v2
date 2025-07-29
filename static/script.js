import Navbar from './components/Navbar.js'
import Foot from './components/Footer.js'
import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Admin_dashboard from './components/Admin_dashboard.js'
import User_dashboard from './components/User_dashboard.js'

const routes = [
    { path: '/', name: 'home_page', component: Home },
    { path: '/login', name: 'login_page', component: Login },
    { path: '/register', name: 'register_page', component: Register },
    { path: '/admin/dashboard', name: 'admin_dashboard_page', component: Admin_dashboard },
    { path: '/user/:user_id/dashboard', name: 'user_dashboard_page', component: User_dashboard }
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    el: '#app',
    router,
    template: `
        <div class="container d-flex flex-column min-vh-100">
            <nav-bar :loggedIn = 'loggedIn' :userRole = 'userRole' :userID='userID'  @logout="handlelogout"></nav-bar>
            <div class="flex-grow-1">
            <router-view :loggedIn = 'loggedIn' @login="handlelogin"></router-view>
            </div>
            <foot></foot>
        </div>
    `,
    data: {
        loggedIn: null,
        userID: null,
        userRole: null
    },
    components: {
        'nav-bar': Navbar,
        foot: Foot
    },
    mounted() {
        if (localStorage.getItem('auth_token')) {
            this.loggedIn = true
        } else {
            this.loggedIn = false
        }
        this.getDetails()
    },
    methods: {
        getDetails() {
            fetch('/api/user_details', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    console.log("data", data)

                    if (data) {
                        this.userRole = data.role
                        this.userID = data.user_id
                    } else {
                        console.log("Error in getting user details")
                    }
                })
        },
        handlelogout() {
            localStorage.clear()
            this.loggedIn = false
            this.userRole = null
            this.userID = null
        },
        handlelogin() {
            this.loggedIn = true
            this.getDetails()
        }
    }

})