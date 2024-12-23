document.addEventListener('DOMContentLoaded', function () {
    const activityList = document.getElementById('activityList');
    const addBtn = document.getElementById('addBtn');

    // Fetch user activities from the backend
    async function loadActivities() {
        const response = await fetch('/get_activities');
        if (response.ok) {
            const activities = await response.json();
            activities.forEach(activity => {
                addActivity(activity.name, activity.category, activity.progress);
            });
        } else {
            console.error('Failed to fetch activities.');
        }
    }

    // Handle adding new activity
    addBtn.addEventListener('click', function () {
        const activityInput = document.getElementById('activityInput').value;
        const categorySelect = document.getElementById('categorySelect').value;
        if (activityInput) {
            addActivity(activityInput, categorySelect);
            document.getElementById('activityInput').value = '';
        }
    });

    // Function to add activity to the list
    function addActivity(name, category, progress = 0) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <p><strong>${name}</strong> - ${category}</p>
                <input type="range" min="0" max="100" value="${progress}" class="progressInput" disabled>
                <button class="editBtn">Edit Progress</button>
                <button class="saveBtn" disabled>Save Progress</button>
                <p class="progressValue">Progress: ${progress}%</p>
                <p class="motivationQuote" style="display: none;"></p>
            </div>`;
        activityList.appendChild(li);

        const progressInput = li.querySelector('.progressInput');
        const progressValue = li.querySelector('.progressValue');
        const editBtn = li.querySelector('.editBtn');
        const saveBtn = li.querySelector('.saveBtn');
        const motivationQuote = li.querySelector('.motivationQuote');

        // Enable editing progress
        editBtn.addEventListener('click', function () {
            progressInput.disabled = false;
            saveBtn.disabled = false;
            editBtn.disabled = true;
        });

        // Update progress text on input change
        progressInput.addEventListener('input', function () {
            progressValue.textContent = `Progress: ${progressInput.value}%`;
        });

        // Save progress and add motivational quote
        saveBtn.addEventListener('click', async function () {
            const progress = progressInput.value;
            saveProgress(name, category, progress);

            // Add motivational quote
            const quote = getMotivationalQuote(progress);
            motivationQuote.textContent = quote;
            motivationQuote.style.display = 'block';

            // Reset buttons
            progressInput.disabled = true;
            saveBtn.disabled = true;
            editBtn.disabled = false;
        });
    }

    // Function to save progress to the backend
    async function saveProgress(name, category, progress) {
        const response = await fetch('/save_progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, progress })
        });
        if (response.ok) {
            alert('Progress saved successfully!');
        } else {
            alert('Failed to save progress.');
        }
    }

    // Function to generate motivational quotes
    function getMotivationalQuote(progress) {
        if (progress < 25) {
            return "Every step forward is progress. Keep going!";
        } else if (progress < 50) {
            return "You're doing great! Keep pushing forward!";
        } else if (progress < 75) {
            return "You're more than halfway there. Stay strong!";
        } else if (progress < 100) {
            return "Almost there! You've got this!";
        } else {
            return "Amazing! You've achieved your goal!";
        }
    }

    // Load activities when the page loads
    loadActivities();
});
