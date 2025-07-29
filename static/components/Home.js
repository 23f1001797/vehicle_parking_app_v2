export default {
    name: 'Home',
    template: `
                <div class="container text-light text-center p-4 rounded shadow-sm"
                    style="background-color: #0000006f; margin-top: 100px;">
                    <div>
                        <h1 class="display-4 mb-3 text-light">Welcome to ParC</h1>
                        <p class="lead">Your 4-Wheeler Parking Companion</p>
                    </div>
                    <div class="mt-4 w-75 mx-auto fs-5">
                        <p>
                            Finding a safe and convenient parking spot shouldn't be a hassle. <b>ParC</b> simplifies
                            vehicle parking by allowing users to book and manage 4-wheeler parking spots different parking lots - all in
                            one easy-to-use platform.
                        </p>
                        <p>
                            Designed with simplicity, efficiency, and local management in mind.
                        </p>
                        <p class="fw-semibold">
                            Start exploring now - because your spot is just a few clicks away!
                        </p>
                    </div>
                    <div>
                        <router-link to="/register" class="btn btn-primary my-4">Register</router-link>
                    </div>
                </div>
    `,
    data() {
        return {
            message: 'Welcome to Your Vue.js App'
        }
    },
    methods: {
        greet() {
            alert(this.message)
        }
    }
}