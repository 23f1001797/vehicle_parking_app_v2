export default {
    name: 'Users',
    template: `
            <div class="container my-5">
                <div class="row justify-content-center">
                    <div class="col-lg-10 bg-light p-4 rounded-shadow-sm border">
                        <h4 class="text-center fw-semibold mb-4">Registered Users</h4>
                        <div class="table-responsive">
                            <table class="table table-striped table-hover align-middle">
                                <thead class="table-primary">
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody v-if="usersData">
                                    <tr v-for="(user, index) in usersData" :key="index">
                                        <td>{{user.id}}</td>
                                        <td>{{user.username}}</td>
                                        <td>{{user.email}}</td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr>
                                        <td colspan="3" class="text-center">No User Found</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`
    ,
    data() {
        return {
            usersData: null,
            message: ''
        }
    },
    mounted() {
        this.loadUsers()
    },
    methods: {
        loadUsers() {
            fetch('/api/user/get', {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    this.usersData = data
                })
        },
    }
}
