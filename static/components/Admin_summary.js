export default {
    name: 'Summary',
    template: `
      <div class="container p-5">
        <div class="rounded border my-5 p-4 bg-light shadow-sm mb-5">
            <div class="row justify-content-center mb-5">
                <div class="col-lg-8 col-md-10 col-ms-12">
                    <h5 class="text-center mb-4">Revenue from Parking Lots</h5>
                    <div class="bg-light p-3 rounded shadow-sm">
                        <table class="table table-striped table-hover align-middle">
                            <thead class="table-dard">
                                <tr>
                                    <th>Lot ID</th>
                                    <th>Prime Location Name</th>
                                    <th>Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(lot, index) in revenue" :key="index">
                                    <td>{{lot.lot_id}}</td>
                                    <td>{{lot.pl_name}}</td>
                                    <td>{{lot.total_revenue}}</td>
                                </tr>
                                <tr v-else>
                                    <td colspan="3" class="text-center">No Revenue Data Available</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-8 col-md-10 col-sm-12 text-center">
                    <h5 class="mb-4">Revenue Distribution</h5>
                    <div class="bg-light p-3 rounded shadow-sm">
                        <canvas id="revenueChart"
                            style="max-width: 100%; height: auto; display: block; margin: 0 auto;"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-5 p-4 border rounded shadow-sm bg-light">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-md-10 col-sm-12 text-center">
                    <h5 class="mb-4">Available V/S Occupied Parking Spots in Lots</h5>
                    <div class="bg-light p-3 rounded shadow-sm">
                        <canvas id="availabilityChart" style="max-width: 100%; height: auto;">
                        </canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            revenueChart: null,
            availabilityChart: null,
            revenue: '',
        };
    },
    mounted() {
        this.fetchRevenueData();
        this.fetchAvailabilityData();
    },
    methods: {
        async fetchRevenueData() {
            try {
                const response = await fetch('/api/admin/summary/revenue', {
                    method: 'GET',
                    headers: {
                        "Authentication-Token": localStorage.getItem("auth_token")
                    }
                });
                const data = await response.json();
                this.revenue = data
                const labels = data.map(item => item.parking_lot_name);
                const revenues = data.map(item => item.total_revenue);
                this.updateRevenueChart(labels, revenues);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        updateRevenueChart(labels, data) {
            const ctx = document.getElementById('revenueChart').getContext('2d');
            if (this.revenueChart) this.revenueChart.destroy();
            this.revenueChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue From Each Parking Lot',
                        data: data,
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)',
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
                                label: tooltipItem => `Revenue: ${tooltipItem.raw}`
                            }
                        }
                    }
                }
            });
        },
        async fetchAvailabilityData() {
            try {
                const response = await fetch('/api/admin/summary/availability', {
                    method: 'GET',
                    headers: {
                        "Authentication-Token": localStorage.getItem("auth_token")
                    }
                });
                const data = await response.json();
                const labels = data.map(item => item.pl_name);
                const availableSpots = data.map(item => item.available_spots);
                const occupiedSpots = data.map(item => item.occupied_spots);
                this.updateAvailabilityChart(labels, availableSpots, occupiedSpots);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        updateAvailabilityChart(labels, availableSpots, occupiedSpots) {
            const ctx = document.getElementById('availabilityChart').getContext('2d');
            if (this.availabilityChart) this.availabilityChart.destroy();
            this.availabilityChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Available',
                        data: availableSpots,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    },
                    {
                        label: 'Occupied',
                        data: occupiedSpots,
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)'
                        ],
                        borderColor: [
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
                                label: function (tooltipItem) {
                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;  // Show dataset label in tooltip
                                }
                            }
                        }
                    }
                }
            });
        }
    }
};
