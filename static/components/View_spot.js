export default {
    name: 'Spot',
    template: `
            <div class="container">
                <div class="row">
                    <div v-if="formData" class="col-md-6 bg-light border rounded p-4 shadow-sm mt-5 mx-auto">
                        <h4 class="text-center">Parking Spot Details</h4>
                        <div class="mb-3">
                            <label for="spot_id" class="form-label">Spot ID:</label>
                            <input type="text" class="form-control" id="spot_id" v-model="formData.spot_id" required readonly>
                        </div>
                        <div class="mb-3">
                            <label for="customer_id" class="form-label">Customer ID:</label>
                            <input type="text" class="form-control" id="customer_id" v-model.number="formData.user_id" required
                                readonly>
                        </div>
                        <div class="mb-3">
                            <label for="vehical_no" class="form-label">Vehical No.:</label>
                            <input type="text" class="form-control" id="vehical_no" v-model="formData.vrn" required readonly>
                        </div>
                        <div class="mb-3">
                            <label for="time_of_parking" class="form-label">Parking Timestamp:</label>
                            <input type="date" class="form-control" id="time_of_parking" v-model="formData.parking_timestamp"
                                required readonly>
                        </div>
                        <div class="mb-3">
                            <label for="parking_date" class="form-label">Parking Date:</label>
                            <input type="text" class="form-control" id="parking_date" v-model.number="formData.parking_timestamp"
                                required readonly>
                        </div>
                        <div class="text-center">
                            <a href="javascript:history.back()" class="btn btn-outline-secondary">Close</a>
                        </div>
                    </div>
                    <div class="col-md-6 bg-light border rounded p-4 shadow-sm mt-5 mx-auto" v-if="spotData">
                        <h4 class="text-center">Parking Spot Details</h4>
                        <div class="mb-3">
                            <label for="id" class="form-label">ID:</label>
                            <input type="text" class="form-control" id="id" v-model="spotData.spot_id" required readonly>
                        </div>
                        <div class="mb-3">
                            <label for="status" class="form-label">Status:</label>
                            <input type="text" class="form-control" id="status" v-model="spotData.status" required readonly>
                        </div>
                        <div class="d-flex justify-content-between">
                            <a href="javascript:history.back()" class="btn btn-outline-secondary">Close</a>
                            <button @click="remove" class="btn btn-primary">delete</button>
                        </div>
                    </div>
                </div>
                <div class="row text-center" v-if="message">
                    {{ message }}
                </div>
            </div>
        `,
    data() {
        return {
            formData: null,
            spotData: null,
            message: null
        }
    },
    mounted() {
        this.loadSpotDetails()
    },
    methods: {
        loadSpotDetails() {
            const lot_id = this.$route.params.lot_id
            const spot_id = this.$route.params.spot_id
            fetch(`/api/lots/${lot_id}/spots/${spot_id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    console.log("Spot Details:")
                    console.log(data)
                    if (data.status) {
                        this.spotData = data
                    } else if (data.vrn) {
                        this.formData = data
                    } else {
                        this.message = data.message
                    }
                })

        },
        remove() {
            const spot_id = this.$route.params.spot_id
            fetch(`/api/parking_spot/delete/${spot_id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    console.log("deleted spot")
                    this.$router.push({
                        name: 'view_parking_lot_page',
                        params: {
                            id: this.$route.params.lot_id
                        }
                    })
                })
        }
    }
}