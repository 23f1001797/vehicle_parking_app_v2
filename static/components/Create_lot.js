export default {
    name: 'CreateLot',
    template: `
        <div class="container my-5">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6 bg-light p-4 rounded shadow-sm border">
                    <h5 class="text-center mb-4">Create Parking Lot</h5>
                    <form @submit.prevent="createLot">
                        <div class="mb-3">
                            <label for="name" class="form-label">Primary Location Name:</label>
                            <input type="text" class="form-control" id="name" v-model="formData.pl_name" required>
                        </div>
                        <div class="mb-3">
                            <label for="price" class="form-label">Price(per hour):</label>
                            <input type="number" class="form-control" id="price" v-model="formData.price" required>
                        </div>
                        <div class="mb-3">
                            <label for="address" class="form-label">Address:</label>
                            <input type="text" class="form-control" id="address" v-model="formData.address" required>
                        </div>
                        <div class="mb-3">
                            <label for="pincode" class="form-label">Pincode:</label>
                            <input type="text" class="form-control" id="pincode" v-model="formData.pincode" required>
                        </div>
                        <div class="mb-3">
                            <label for="spots_count" class="form-label">Number of Spots:</label>
                            <input type="number" class="form-control" id="spots_count" v-model="formData.capacity"
                                required>
                        </div>
                            <button type="submit" class="btn btn-primary">Create</button>
                            <button class="btn btn-outline-secondary" @click="$router.go(-1)">Cancel</button>
                    </form>
                </div>
            </div>
            {{ message }}
        </div>`,
    data() {
        return {
            formData: {
                pl_name: '',
                price: 0,
                address: '',
                pincode: '',
                capacity: 0
            },
            message: ''
        }
    },
    methods: {
        createLot() {
            fetch('/api/parking_lot/create', {
                method: 'POST',
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
                        // this.$router.push("/admin/dashboard")
                        this.$router.go(-1);
                    }

                })
        }
    }
}