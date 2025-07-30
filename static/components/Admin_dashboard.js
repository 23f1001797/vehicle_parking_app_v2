export default {
    name: 'Admin',
    template: `
        <div class="container my-5 shadow-sm p-4 rounded bg-white">

            <div class="row">
                <div class="text-end my-2">
                    <button @click="csv_export()" class="btn btn-success btn-sm">Download CSV</button>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col text-center py-3 rounded border shadow-sm" style="background-color: floralwhite;">
                    <h5 class="fw-semibold mb-0">Parking Lots</h5>
                </div>
            </div>
            <div class="row align-items-start justify-content-center gap-3">
                <div v-if="parkinglots" class="card border-0" style="width: 15rem;" v-for="(lot, index) in parkinglots" :key="index">
                    <router-link :to="{name: 'view_parking_lot_page', params: {id : lot.id}}" class="text-decoration-none text-dark">
                        <div class="card-body">
                            <h5 class="text-center fw-semibold">{{ lot.pl_name }}</h5>
                            <hr>
                            <p class="card-text mb-1"><strong>Price/hr: </strong> ₹{{ lot.price }}</p>
                            <p class="card-text mb-1"><strong>Address: </strong> {{ lot.address }}</p>
                            <p class="card-text mb-1"><strong>Pincode: </strong> {{ lot.pincode }}</p>
                            <p class="card-text mb-1"><strong>Capacity: </strong> {{ lot.capacity }}</p>
                            <p class="card-text"><strong>Current spot count: </strong> {{ lot.spots_count }}</p>
                        </div>
                    </router-link>
                </div>
            </div>
            
            <div>
            {{ message }}
            </div>
            <div class="text-center">
                <router-link to="/admin/parking_lot/create" class="btn btn-success"> Add Lot</router-link>
            </div>
        </div>`,
    data() {
        return {
            parkinglots: '',
            message: ''
        }
    },
    mounted() {
        this.loadParkingLots()
    },
    methods: {
        loadParkingLots() {
            fetch('/api/parking_lot/get', {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.message = data.error
                    } else {
                        this.parkinglots = data
                    }
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