export default {
    name: 'Dashboard',
    template: `
        <div class="container">
            <div class="row">
                <div class="text-end my-2">
                    <button @click="csv_export()" class="btn btn-success btn-sm">Download CSV</button>
                </div>
            </div>

            <div class="row mb-3">
                <div class="p-4 bg-light shadow-sm my-4">
                    <div class="container">
                        <div class="row align-items-center text-center">
                            <div class="col-md-4 mb-3 mb-md-0 text-md-end">
                                <h6 class="mb-0">Search parking location/pincode:</h6>
                            </div>
                            <form @submit.prevent="search" class="col-md-8 d-flex">
                                <input type="search" class="form-control me-2" placeholder="Search ..." aria-label="Search" v-model="search_query">
                                <button type = "submit" class="btn btn-success">Search</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div v-if="showResults">
                    <div class="container my-5 p-4 bg-light rounded shadow-sm border">
                        <h5 class="text-center fw-semibold mb-4">Parking Lots Found @ {{search_query}}</h5>
                        <div class="table-responsive">
                            <table class="table table-bordered table-hover table-striped align-middle text-center">
                                <thead class="table-primary">
                                    <tr>
                                        <th>Sr. No.</th>
                                        <th>Lot ID</th>
                                        <th>Parking Location Name</th>
                                        <th>Address</th>
                                        <th>Available Spots </th>
                                        <th>Price(per hour)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody v-if="lots">
                                    <tr v-for="(l, index) in lots" :key="index">
                                        <td>{{index+1}}</td>
                                        <td>{{l.lot_id}}</td>
                                        <td>{{l.pl_name}}</td>
                                        <td>{{l.address}}, {{l.pincode}}</td>
                                        <td>{{l.availability}}</td>
                                        <td>₹{{l.price}}</td>
                                        <td><router-link :to="{name: 'book_spot_page', params: { lot_id: l.lot_id}}" class="btn btn-info">Book</router-link></td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr>
                                        <td colspan="7" class="text-center text-muted">No Lots found</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center my-5">
                    <p class="fw-bold fst-italic fs-6 text-muted">Please search to get Lot details @ location you want to park.
                    </p>
                </div>
            </div>

        
            <div class="row my-5">
                <div class="text-center rounded mb-5 p-4 shadow-sm bg-light">
                    <h5 class="fw-bold">Recent Parking History</h5>
                </div>
                <div v-if="reservations">
                    <div class="container my-2 p-4 bg-light rounded shadow-sm border">
                        <table class="table table-bordered table-hover table-striped align-middle text-center">
                            <thead class="table-primary">
                                <tr>
                                    <th scope="col">Sr. No.</th>
                                    <th scope="col">Lot ID</th>
                                    <th scope="col">Spot ID</th>
                                    <th scope="col">Location</th>
                                    <th scope="col">Vehical No. </th>
                                    <th scope="col">Parking Timestamp</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(r, index) in reservations" :key="index">
                                    <td>{{index+1}}</td>
                                    <td>{{r.lot_id}}</td>
                                    <td>{{r.spot_id}}</td>
                                    <td>{{r.address}}</td>
                                    <td>{{r.vrn}}</td>
                                    <td>{{r.parking_timestamp}}</td>
                                    <td><router-link :to="{name: 'release_spot_page', params: { reservation_id: r.reservation_id}}" class="btn btn-info">Release</router-link></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else class="text-center my-5">
                    <p class="fw-bold fst-italic fs-6 text-muted"> No Parking History. </p>
                </div>
            </div>
        </div>`,
    data() {
        return {
            reservations: null,
            lots: null,
            message: '',
            search_query: '',
            showResults: false
        }
    }
    , mounted() {
        this.loadReservations()
    },
    methods: {
        loadReservations() {
            const user_id = this.$route.params.user_id
            fetch(`/api/${user_id}/history`, {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.message = data.error
                    } else {
                        this.reservations = data
                    }
                })
        },
        search() {
            fetch(`/api/search?query=${this.search_query}`, {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.message = data.error;
                    } else {
                        this.lots = data;
                    }
                    this.showResults = true;
                })
        },
        csv_export() {
            fetch('/api/export', {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    let check_csv = setInterval(() => {
                        fetch(`/api/csv_result/${data.id}`)
                            .then(response => {
                                if (response.ok) {
                                    window.location.href = `/api/csv_result/${data.id}`
                                    clearInterval(check_csv)
                                } else { console.log("response not ready") }
                            })
                    }, 2000)
                })
        }
    }
}