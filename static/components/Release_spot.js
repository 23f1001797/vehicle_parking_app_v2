export default {
    name: 'ReleaseSpot',
    template: `
            <div class="container my-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 bg-light p-4 rounded shadow-sm">
                        <h4 class="text-center fw-semibold mb-4">Release The Parking Spot</h4>
                        <form @submit.prevent="release">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="spotID" class="form-label">Spot ID:</label>
                                <input type="text" class="form-control" id="spotID" v-model="formData.spot_id" required readonly>
                            </div>
                            <div class="col-md-6">
                                <label for="lotID" class="form-label">Lot ID:</label>
                                <input type="text" class="form-control" id="lotID" v-model="formData.lot_id" required readonly>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="price" class="form-label">Lot Price/hr:</label>
                                <input type="text" class="form-control" id="price" v-model="formData.price" required readonly>
                            </div>
                            <div class="col-md-6">
                                <label for="vrno" class="form-label">Vehical No.:</label>
                                <input type="text" class="form-control" id="vrno" v-model="formData.vrn" required readonly>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="parkingtime" class="form-label">Parking Timestamp:</label>
                                <input type="text" class="form-control" id="parkingtime" v-model="formData.parking_timestamp" required readonly>
                            </div>
                            <div class="col-md-6">
                                <label for="releasingtime" class="form-label">Releasing Timestamp:</label>
                                <input type="text" class="form-control" id="releasingtime" v-model="formData.leaving_timestamp" required readonly>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="duration" class="form-label">Duration:</label>
                                <input type="text" class="form-control" id="duration" v-model="formData.duration" required readonly>
                            </div>
                            <div class="col-md-6">
                                <label for="totalcost" class="form-label">Total Cost:</label>
                                <input type="text" class="form-control" id="totalcost" v-model="formData.parking_cost" required readonly>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <button type="submit" class="btn btn-primary">Release</button>
                            <button class="btn btn-outline-secondary" @click="$router.go(-1)">Cancel</button>
                        </div>
                        </form>
                        <div class="row text-center" v-if="message">
                        {{ message }}
                        </div>
                    </div>
                </div>
            </div>`,
    data() {
        return {
            formData: {
                reservation_id: "",
                lot_id: "",
                price: "",
                spot_id: "",
                user_id: "",
                vrn: '',
                parking_timestamp: '',
                leaving_timestamp: '',
                duration: '',
                status: '',
                pl_name: '',
                parking_cost: ''
            },
            message: ''

        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        loadData() {
            const reserve_id = this.$route.params.reservation_id
            fetch(`/api/reservation/${reserve_id}/get`, {
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
        release() {
            const reserve_id = this.$route.params.reservation_id
            fetch(`/api/reservation/${reserve_id}/release`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
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