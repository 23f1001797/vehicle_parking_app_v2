import { Component } from 'react'
import Home from './components/Home.js'

const routes = [
    { path: '/', name: 'home_page', component: Home }
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    el: '#app',
    router,
    template: `
    <div class="container d-flex flex-column min-vh-100">
            <router-view :loggedIn = 'loggedIn' @login="handlelogin"></router-view>
    </div>
    `,
    data: {
        userID: null
    },
    components: {

    },
    mounted() {
        this.getDetails()
    },
    methods: {
        getDetails() {

        }
    }

})