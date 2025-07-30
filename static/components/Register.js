export default {
    name: 'Register',
    template: `
            <div class="container my-5">
                <div class="row justify-content-center">
                    <div class="col-sm-10 col-md-6 col-lg-4">
                        <div class="border bg-light rounded p-4 shadow-sm">
                            <h2 class="text-center my-3">Registration Form</h2>
                            <form @submit.prevent="registerUser">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username:</label>
                                    <input type="text" class="form-control" id="username" v-model="formData.username"
                                        placeholder="enter your Username" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email:</label>
                                    <input type="email" class="form-control" id="email" v-model="formData.email"
                                        placeholder="enter your email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="pwd" class="form-label">Password:</label>
                                    <input type="password" class="form-control" id="pwd" v-model="formData.password"
                                        placeholder="enter your password" required>
                                </div>
                                <div class="mb-3">
                                    <label for="confirm_password" class="form-label">Confirm Password:</label>
                                    <input type="password" class="form-control" id="confirm_password" v-model="formData.confirm_password"
                                        placeholder="enter your password" required>
                                </div>
                                <div class="d-grid mt-4">
                                    <button type="submit" class="btn btn-primary">Register</button>
                                </div>
                            </form>
                            <div class="text-center mt-3">
                                Already have an account? <router-link to="/login" class="text-decoration-none">login
                                    here</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `,
    data() {     //in case of component, data is a function that returns an object
        return {
            formData: {
                email: '',
                username: '',
                password: '',
                confirm_password: ''
            },
            message: ''
        }
    },
    methods: {
        registerUser() {
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.formData)
            }).then(response => response.json())
                .then(data => {
                    if (data['message'] === 'User created successfully') {
                        this.$router.push("/login")
                    } else {
                        this.message = data.error
                    }
                })
        }
    }
}