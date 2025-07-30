export default {
    name: 'Navbar',
    props: ['loggedIn', 'userRole', 'userID'],
    template: `
                <nav class="navbar navbar-expand-lg bg-body-tertiary shadow-sm sticky-top">
                    <div class="container-fluid">
                        <a href="" class="navbar-brand mx-5"><strong>ParC</strong></a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul v-if="loggedIn && userRole === 'admin'" class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <router-link to="/admin/dashboard" class="nav-link">Home</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/admin/users" class="nav-link">Users</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/admin/search" class="nav-link">Search</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/admin/summary" class="nav-link">Summary</router-link>
                                </li>
                            </ul>
                            <ul v-if="loggedIn && userRole === 'user'" class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <router-link :to="{name: 'user_dashboard_page', params: {user_id: userID}}" class="nav-link">Home</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link :to="{name: 'user_summary_page', params: {user_id: userID}}" class="nav-link">Summary</router-link>
                                </li>
                            </ul>
                            <ul v-if="loggedIn && userRole === 'user'" class="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li class="nav-item mx-3">
                                    <router-link :to="{name: 'user_profile', params: {user_id: userID}}" class="nav-link"><i
                                            class="fa-solid fa-user"></i></router-link>
                                </li>
                                <li class="nav-item mx-3">
                                    <button class="nav-link" @click="logoutUser">LogOut</button>
                                </li>
                            </ul>
                            <ul v-if="loggedIn && userRole === 'admin'" class="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li class="nav-item mx-3">
                                    <router-link :to="{name: 'admin_profile', params: {user_id: userID}}" class="nav-link"><i
                                            class="fa-solid fa-user"></i></router-link>
                                </li>
                                <li class="nav-item mx-3">
                                    <button class="nav-link" @click="logoutUser">LogOut</button>
                                </li>
                            </ul>
                            <ul v-if="!loggedIn" class="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li class="nav-item mx-3">
                                    <router-link to="/register" class="btn btn-warning  my-2">Register</router-link>
                                </li>
                                <li class="nav-item mx-3">
                                    <router-link to="/login" class="btn btn-info my-2">Login</router-link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
    `,

    methods: {
        logoutUser() {
            localStorage.clear()
            this.$emit('logout')
            this.$router.push("/login")
        }
    }
}