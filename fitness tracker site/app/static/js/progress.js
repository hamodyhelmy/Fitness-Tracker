document.addEventListener('DOMContentLoaded', () => {
    // Elements for Progress Summary
    const totalWorkouts = document.getElementById('totalWorkouts');
    const totalCalories = document.getElementById('totalCalories');
    const goalProgress = document.getElementById('goalProgress');
    const activityLog = document.getElementById('activityLog');

    // Fetch Progress Summary from API based on period
    const fetchProgressSummary = (period) => {
        fetch(`/api/progress_summary?period=${period}`)
            .then(response => response.json())
            .then(data => {
                if (!data) throw new Error("No progress summary data received.");
                totalWorkouts.innerHTML = `Total Workouts Completed: <strong>${data.total_workouts}</strong>`;
                totalCalories.innerHTML = `Total Calories Burned: <strong>${data.total_calories} kcal</strong>`;
                goalProgress.innerHTML = `Goal Progress: <strong>${data.goal_progress}%</strong>`;
            })
            .catch(err => console.error("Error fetching progress summary:", err));
    };

    // Fetch Activity Log from API based on period
    const fetchActivityLog = (period) => {
        fetch(`/api/recent_activities?period=${period}`)
            .then(response => response.json())
            .then(activities => {
                if (!activities || !activities.length) throw new Error("No recent activities found.");
                activityLog.innerHTML = '';  // Clear previous activities
                activities.forEach(activity => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${activity.date}</td>
                        <td>${activity.type}</td>
                        <td>${activity.duration}</td>
                        <td>${activity.calories} kcal</td>
                    `;
                    activityLog.appendChild(row);
                });
            })
            .catch(err => console.error("Error fetching activity log:", err));
    };

    // Initialize Chart.js
    const ctx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Workouts Completed',
                data: [],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                tension: 0.3
            }, {
                label: 'Calories Burned',
                data: [],
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });

    // Fetch and Update Chart Data based on period
    const updateChart = (period) => {
        fetch(`/api/chart_data?period=${period}`)
            .then(response => response.json())
            .then(data => {
                if (!data.labels || !data.workouts || !data.calories) throw new Error("Incomplete chart data.");
                progressChart.data.labels = data.labels;
                progressChart.data.datasets[0].data = data.workouts;
                progressChart.data.datasets[1].data = data.calories;
                progressChart.update();
            })
            .catch(err => console.error("Error fetching chart data:", err));
    };

    // Function to update all sections based on the selected period
    const updateData = (period) => {
        // Fetch the progress summary, activity log, and chart data based on the selected period
        fetchProgressSummary(period);
        fetchActivityLog(period);
        updateChart(period);
    };

    // Initial data load for 'weekly' period
    updateData('weekly');

    // Event listener for time period change
    document.getElementById('timePeriod').addEventListener('change', (e) => {
        const selectedPeriod = e.target.value;
        updateData(selectedPeriod);
    });
});
