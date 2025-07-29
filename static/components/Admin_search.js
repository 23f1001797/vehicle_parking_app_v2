export default {
    name: 'Search',
    template: `
            <div class="container my-5">
                <div class="d-flex p-3 bg-light shadow-sm rounded mb-4">
                    <select class="form-select me-2 w-25" v-model="table" style="width: 60%;">
                        <option selected value="">Search by</option>
                        <option value="parkingLot">Parking Lot</option>
                        <option value="parkingSpot">Parking Spot</option>
                        <option value="users">Users</option>
                        <option value="reserveParkingSpot">Reservations</option>
                    </select>
                    <input class="form-control me-2" placeholder="search ..." aria-label="Search" v-model="search_query">
                    <button @click="() => search()" class="btn btn-success">Search</button>
                </div>
                <div class="bg-light rounded shadow-sm p-4 mb-5" v-if="users">
                    <h4 class="text-center mb-3">Users</h4>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover align-middle">
                            <thead class="table-primary">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="users" v-for="(user, index) in users" :key="index">
                                    <td>{{user.user_id}}</td>
                                    <td>{{user.username}}</td>
                                    <td>{{user.email}}</td>
                                    <td>
                                        <span v-if="user.active" class="badge text-bg-success">Yes</span>
                                        <span v-else class="badge text-bg-danger">No</span>
                                    </td>
                                </tr>
                                <tr v-else>
                                    <td colspan="4" class="text-center">No User Found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="bg-light rounded shadow-sm p-4 mb-5" v-if="parkingLot">
                    <h5 class="text-center mb-3">Parking Lots</h5>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover align-middle">
                            <thead class="table-primary">
                                <tr>
                                    <th>ID</th>
                                    <th>Prime Location</th>
                                    <th>Address</th>
                                    <th>Pincode</th>
                                    <th>Price</th>
                                    <th>Capacity</th>
                                    <th>Total Spots</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="parkingLot" v-for="(lot, index) in parkingLot" :key="index">
                                    <td>{{lot.lot_id}}</td>
                                    <td>{{lot.pl_name}}</td>
                                    <td>{{lot.address}}</td>
                                    <td>{{lot.pincode}}</td>
                                    <td>{{lot.price}}</td>
                                    <td>{{lot.capacity}}</td>
                                    <td>{{lot.spots_count}}</td>
                                    <td><router-link :to="{name: 'view_parking_lot_page', params: {id : lot.lot_id}}" class="btn btn-sm btn-info"> View </router-link></td>
                                </tr>
                                <tr v-else>
                                    <td colspan="8" class="text-center">No Lot Found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-if="parkingSpot" class="bg-light rounded shadow-sm p-4 mb-5">
                    <h4 class="text-center mb-3">Parking Spots</h4>
                    <div class="table-responsive">
                        <table class="table table-hover table-striped align-middle">
                            <thead class="table-primary">
                                <tr>
                                    <th>ID</th>
                                    <th>Lot ID</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="parkingSpot" v-for="(spot, index) in parkingSpot" :key="index">
                                    <td>{{spot.spot_id}}</td>
                                    <td>{{spot.lot_id}}</td>
                                    <td>
                                    <span v-if="spot.status" class="badge text-bg-secondary">Available</span>
                                    <span v-else class="badge text-bg-success">Occupied</span>
                                    </td>
                                </tr>
                                <tr v-else>
                                    <td colspan="3" class="text-center">No history available</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-if="reserveParkingSpot" class="bg-light rounded shadow-sm p-4 mb-5">
                    <h4 class="text-center mb-3">Reservations</h4>
                    <div class="table-responsive">
                        <table class="table table-hover table-striped align-middle">
                            <thead class="table-primary">
                                <tr>
                                    <th>ID</th>
                                    <th>Spot ID</th>
                                    <th>User ID</th>
                                    <th>Vehicle No.</th>
                                    <th>Parking Time</th>
                                    <th>Leaving Time</th>
                                    <th>Price/hr</th>
                                    <th>Cost</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="reserveParkingSpot" v-for="(r, index) in reserveParkingSpot" :key=" index">
                                    <td>{{r.reservation_id}}</td>
                                    <td>{{r.spot_id}}</td>
                                    <td>{{r.user_id}}</td>
                                    <td>{{r.vrn}}</td>
                                    <td>{{r.parking_timestamp}}</td>
                                    <td>{{r.leaving_timestamp}}</td>
                                    <td>{{r.price}}</td>
                                    <td>{{r.parking_cost}}</td>
                                    <td>
                                    <span v-if="r.status === 'unpaid'" class="badge text-bg-danger">Unpaid</span>
                                    <span v-else class="badge text-bg-success">Paid</span>
                                    </td>
                                </tr>
                                <tr v-else>
                                    <td colspan="10" class="text-center">No Reservation Found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    `,
    data() {
        return {
            table: '',
            search_query: '',
            message: '',
            users: null,
            parkingLot: null,
            parkingSpot: null,
            reserveParkingSpot: null,
        }
    },
    methods: {
        search() {
            this.users = null
            this.parkingLot = null
            this.parkingSpot = null
            this.reserveParkingSpot = null
            fetch(`/api/admin/search?table=${this.table}&query=${this.search_query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.message = data.error
                    } else {
                        console.log(data)
                        if (this.table === 'users') {
                            this.users = data
                        } else if (this.table === 'parkingLot') {
                            this.parkingLot = data
                        } else if (this.table === 'parkingSpot') {
                            this.parkingSpot = data
                        } else if (this.table === 'reserveParkingSpot') {
                            this.reserveParkingSpot = data
                        }
                    }
                })
        }
    }
}