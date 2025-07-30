export default {
    name: 'Profile',
    template: `
                <div class="container my-5">
                    <div class="row justify-content-center">
                        <div class="col-md-6 col-lg-5 bg-light p-4 rounded shadow-sm">
                            <h4 class="text-center mb-4">Profile</h4>
                            <form @submit.prevent="save_changes">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="username" v-model="formData.username"
                                        required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" v-model="formData.email" required>
                                </div>
                                <div class="d-flex mb-3">
                                    <div class="me-2">
                                        <label for="password" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="password" v-model="formData.password" >
                                    </div>
                                    <div>
                                        <label for="confirm_password" class="form-label">Confirm Password</label>
                                        <input type="password" class="form-control" id="confirm_password" v-model="formData.confirm_password" >
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <button type="submit" class="btn btn-success">Save Changes</button>
                                    <button class="btn btn-outline-secondary" @click="$router.go(-1)">Cancel</button>
                                </div>
                                </form>
                        </div>
                    </div>
                </div>
    `,
    data() {
        return {
            formData: {
                username: null,
                email: null,
                password: null,
                confirm_password: null
            },
            message: ''
        };
    },
    mounted() {
        this.loadUser();
    },
    methods: {
        loadUser() {
            const user_id = this.$route.params.user_id
            fetch(`/api/user/get/${user_id}`, {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.message = data.error;
                    } else {
                        this.formData = data
                    }
                });
        },
        save_changes() {
            const user_id = this.$route.params.user_id
            fetch(`/api/user/update/${user_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.formData)
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.message = data.error
                    } else {
                        this.message = data.message
                        this.$router.go(0);
                    }
                })
        }
    }
}
