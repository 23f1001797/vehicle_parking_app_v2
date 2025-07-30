export default {
    name: 'EditLot',
    template: `
        <div class="container my-5">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6 bg-light p-4 rounded shadow-sm">
                    <h4 class="text-center mb-4">Edit Parking Lot</h4>
                    <form @submit.prevent="save">
                        <div class="mb-3">
                            <label for="name" class="form-label">Parking Lot Name:</label>
                            <input type="text" class="form-control" id="name" v-model="formData.pl_name" required>

                        </div>
                        <div class="mb-3">
                            <label for="price" class="form-label">Price(per hour):</label>
                            <input type="number" class="form-control" id="price" v-model.number="formData.price" required>
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
                            <input type="number" class="form-control" id="spots_count" v-model.number="formData.spots_count"
                                required readonly>
                        </div>
                        <button type="submit" class="btn btn-primary">Save</button>
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
                price: '',
                address: '',
                pincode: '',
                spots_count: ''
            },
            message: ''
        }
    },
    mounted() {
        this.loadParkingLot()
    },
    methods: {
        loadParkingLot() {
            const id = this.$route.params.id
            fetch(`/api/parking_lot/get/${id}`, {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    this.formData = data
                })
        },
        save() {
            const id = this.$route.params.id
            fetch(`/api/parking_lot/update/${id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.formData)
            }).then(response => response.json())
                .then(data => {
                    // this.$router.push({ name: 'view_parking_lot_page', params: { id: id } })
                    this.$router.go(-1);
                })
        }
    }
}