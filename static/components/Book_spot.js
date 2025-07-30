export default {
    name: 'BookSlot',
    template: `
            <div class="container my-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 bg-light p-4 rounded shadow-sm">
                        <h4 class="text-center fw-bold mb-4">Book The Parking Spot</h4>
                        <form @submit.prevent="bookspot">
                            <div class="mb-3">
                                <label for="spotID" class="form-label">Spot ID:</label>
                                <input type="text" class="form-control" id="spotID" v-model="formData.spot_id" required readonly>
                            </div>
                            <div class="mb-3">
                                <label for="lotID" class="form-label">Lot ID:</label>
                                <input type="number" class="form-control" id="lotID" v-model.number="formData.lot_id" required readonly>
                            </div>
                            <div class="mb-3">
                                <label for="pl_name" class="form-label">Prime Location Name:</label>
                                <input type="text" class="form-control" id="pl_name" v-model="formData.pl_name" required readonly>
                            </div>
                            <div class="mb-3">
                                <label for="address" class="form-label">Address:</label>
                                <input type="text" class="form-control" id="address" v-model="formData.address" required readonly>
                            </div>
                            <div class="mb-3">
                                <label for="userID" class="form-label">User ID:</label>
                                <input type="text" class="form-control" id="userID" v-model="formData.user_id" required readonly>
                            </div>
                            <div class="mb-3">
                                <label for="vrno" class="form-label">Vehical No.:</label>
                                <input type="text" class="form-control" id="vrno" v-model="formData.vrn" required>
                            </div>
                            <div class="mt-4 d-flex justify-content-between">
                                <button type="submit" class="btn btn-primary">Reserve</button>
                                <button class="btn btn-outline-secondary" @click="$router.go(-1)">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="row text-center" v-if="message">
                {{ message }}
                </div>
            </div>`,
    data() {
        return {
            formData: {
                spot_id: "",
                lot_id: "",
                pl_name: "",
                address: "",
                user_id: "",
                vrn: ''
            },
            message: ''

        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        loadData() {
            const lot_id = this.$route.params.lot_id
            fetch(`/api/${lot_id}/book`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    console.log(data)
                    this.formData = data
                })
        },
        bookspot() {
            fetch(`/api/reserve_slot/${this.formData.user_id}/create/${this.formData.spot_id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ "vrn": this.formData.vrn })
            }).then(response => response.json())
                .then(data => {
                    console.log(data)
                    if (data.error) {
                        this.message = data.error
                    } else {
                        this.message = data.message
                        // this.$router.push(`/user/${this.formData.user_id}/dashboard`)
                        this.$router.go(-1);
                    }
                })
        }
    }

}