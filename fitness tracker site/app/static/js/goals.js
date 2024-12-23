document.addEventListener('DOMContentLoaded', () => {
    const goalType = document.getElementById('goalType');
    const goalTitle = document.getElementById('goalTitle');
    const goalDescription = document.getElementById('goalDescription');
    const goalDeadline = document.getElementById('goalDeadline');
    const saveGoalBtn = document.getElementById('saveGoalBtn');
    const userGoalsList = document.getElementById('userGoalsList');

    // Fetch goals for the logged-in user on page load
    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/user_goals', { method: 'GET' });
            const data = await response.json();
            const goals = data.goals || [];  // Ensure it falls back to an empty array if no goals found
            userGoalsList.innerHTML = '';
            goals.forEach(goal => {
                const li = document.createElement('li');
                li.textContent = `${goal.title} - ${goal.description} - Deadline: ${goal.deadline}`;
                userGoalsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    // Save a new goal
    saveGoalBtn.addEventListener('click', async () => {
        const goalData = {
            type: goalType.value,
            title: goalTitle.value.trim(),
            description: goalDescription.value.trim(),
            deadline: goalDeadline.value,
        };

        if (!goalData.title || !goalData.deadline) {
            alert('Please fill in all fields before saving.');
            return;
        }

        try {
            const response = await fetch('/api/user_goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goalData),
            });

            if (response.ok) {
                alert('Goal saved successfully!');
                fetchGoals(); // Refresh the goals list
            } else {
                alert('Failed to save goal.');
            }
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    });

    fetchGoals(); // Load goals on page load
});
