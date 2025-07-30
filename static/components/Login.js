export default {
    name: 'Login',
    props: ['loggedIn'],
    template: `
                <div class="row justify-content-center">
                    <div class="col-sm-10 col-md-6 col-lg-4">
                        <div class="bg-light p-4 mt-5 border rounded shadow-sm">
                            <h3 class="text-center mb-4">Login Form</h3>
                            <p class="text-danger mx-2 mt-2">{{ message }}</p>
                            <form @submit.prevent="loginUser">
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="enter your email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="password" v-model="formData.password" placeholder="enter your password" required>
                                </div>
                                <div class="d-grid mt-4">
                                    <button type="submit" class="btn btn-primary">Login</button>
                                </div>
                            </form>
                            <div class="text-center mt-3">
                                Don't have an account?  <router-link to="/register" class="text-decoration-none">Register
                                    here</router-link>
                            </div>
                        </div>
                    </div>
                </div>
    `,
    data() {
        return {
            formData: {
                email: null,
                password: null
            },
            message: null
        }
    },
    methods: {
        loginUser() {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.formData)
            }).then(response => response.json())
                .then(data => {
                    if (Object.keys(data).includes("auth-token")) {
                        localStorage.setItem("auth_token", data["auth-token"])
                        this.$emit('login')
                        if (data.roles.includes("admin")) {
                            this.$router.push("/admin/dashboard")
                        } else {
                            this.$router.push(`user/${data.user_id}/dashboard`)
                        }
                    }
                    else {
                        this.message = data.error
                    }
                })
        }
    }
}

