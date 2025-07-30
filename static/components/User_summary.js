export default {
    name: 'UserSummary',
    template: `
                <div class="container">
                    <div class="rounded border my-5 p-4 bg-light shadow-sm">
                        <div class="row justify-content-center">
                            <div class="col-md-10 col-sm-12">
                                <h5 class="mb-4 text-center">Reservation Summary</h5>
                                <table class="table table-hover table-striped align-middle">
                                    <thead class="table-dard">
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Date</th>
                                            <th>Prime Location Name</th>
                                            <th>Address</th>
                                            <th>Parking Time</th>
                                            <th>Leaving Time</th>
                                            <th>Duration</th>
                                            <th>Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(data, index) in duration_data" :key="index">
                                            <td>{{index+1}}</td>
                                            <td>{{data.date}}</td>
                                            <td>{{data.pl_name}}</td>
                                            <td>{{data.address}}</td>
                                            <td>{{data.parking_timestamp}}</td>
                                            <td>{{data.leaving_timestamp}}</td>
                                            <td>{{data.duration}}</td>
                                            <td>{{data.cost}}</td>
                                        </tr>
                                        <tr v-else>
                                            <td colspan="8" class="text-center">No Duration Data Availabe</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="my-5 p-4 border rounded shadow-sm bg-light">
                        <div class="row justify-content-center">
                            <div class="col-lg-8 col-md-10 col-sm-12 text-center">
                                <h5 class="mb-4">Your Parking Summary</h5>
                                <div class="bg-light p-3 rounded shadow-sm">
                                    <canvas id="summaryChart" style="max-width: 100%; height: auto;"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    `,
    data() {
        return {
            summaryChart: null,
            duration_data: null
        };
    },
    mounted() {
        this.load_duration_data();
        this.fetchSummaryData();
    },
    methods: {
        async fetchSummaryData() {
            try {
                console.log('hi')
                const user_id = this.$route.params.user_id; // Get the user_id from the route parameters
                console.log(user_id)
                const response = await fetch(`/api/user/${user_id}/summary/summary_data`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                console.log('inin')
                const data = await response.json();
                console.log("summary:", data);
                const labels = data.map(item => item.lot_name);
                const count = data.map(item => item.times_used);
                this.updateSummaryChart(labels, count);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        updateSummaryChart(labels, count) {
            const ctx = document.getElementById('summaryChart').getContext('2d');
            if (this.summaryChart) this.summaryChart.destroy();
            this.summaryChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue From Each Parking Lot',
                        data: count,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: tooltipItem => `Count: ${tooltipItem.raw}`
                            }
                        }
                    }
                }
            });
        },
        load_duration_data() {
            const user_id = this.$route.params.user_id
            console.log('in the function')
            fetch(`/api/user/${user_id}/summary/duration_data`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => response.json())
                .then(data => {
                    console.log(data)
                    if (data.error) {
                        this.message = data.error
                    } else {
                        this.duration_data = data
                    }
                })
        }
    }
};