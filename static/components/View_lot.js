export default {
    name: 'ParkingLot',
    template: `
                <div class="container my-5 w-50 mx-auto bg-light p-4 rounded shadow">
                    <div class="row justify-content-center mb-4">
                        <div class="text-center">
                            <h4 class="fw-semibold">Parking Lot: {{parkinglot.pl_name}}</h4>
                            <h6>Lot ID: {{parkinglot.id}}</h6>
                            <hr>
                            <div>
                                <span class="fw-semibold text-danger">Available spots: {{available_spots}} </span> |
                                <span class="fw-semibold text-success">Occupied spots: {{occupied_spots}} </span>
                            </div>
                        </div>
                    </div>
                    {{message}}
                    <div class="row align-items-start justify-content-center gap-3 rounded p-3 bg-light shadow border">
                        <div v-if="spots" v-for="(spot, index) in spots" :key="index" @click="() => get_spot_details(spot.spot_id)" class="spot_box" :style="{backgroundColor: spot.status === 'available' ? status_bg : 'rgb(88, 246, 96)'}">
                            {{spot.spot_id}}
                        </div>
                        <div v-else class="text-center">
                            <h5 class="text-muted"> No Spots Found </h5>
                        </div>
                        <div class="text-center my-5">
                            <button @click="add_spot" class="btn btn-primary"> Add Spot</button>
                        </div>
                        <div class="d-flex justify-content-between">
                            <router-link :to="{name: 'edit_parking_lot_page', params: {id : parkinglot.id}}" class="btn btn-info mx-2">Edit Lot</router-link>
                            <div>
                            <button class="btn btn-primary" @click="delete_lot">Delete Lot</button>
                            <button class="btn btn-outline-secondary" @click="$router.go(-1)">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>                   
                `,
    data() {
        return {
            parkinglot: null,
            spots: null,
            status_bg: "rgb(255, 167, 167)",
            message: '',
            available_spots: "",
            occupied_spots: "",
        }
    },
    mounted() {
        this.loadParkingLot()
        this.loadSpots()
    },
    methods: {
        loadParkingLot() {
            const id = this.$route.params.id
            fetch(`/api/parking_lot/get/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    console.log(data)
                    this.parkinglot = data
                })
        },
        loadSpots() {
            const lot_id = this.$route.params.id
            fetch(`/api/lots/${lot_id}/spots`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    console.log(data)
                    this.spots = data[0]
                    this.available_spots = data[2]
                    this.occupied_spots = data[1]
                })
        },
        delete_lot() {
            const lot_id = this.$route.params.id
            fetch(`/api/parking_lot/delete/${lot_id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.message = data.error
                    } else {
                        this.message = data.message
                        // this.$router.push("/admin/dashboard")
                        this.$router.go(-1);
                    }

                })
        },
        get_spot_details(s_id) {
            const l_id = this.$route.params.id
            this.$router.push({ name: 'view_spot_page', params: { lot_id: l_id, spot_id: s_id } })
        },
        add_spot() {
            const lot_id = this.$route.params.id
            fetch(`/api/parking_spot/create/${lot_id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
                .then(data => {
                    this.message = data.message
                    this.$router.go(0);
                })

        }
    }
}