function downloadUserData() {
    const email = document.cookie.split('; ').find(row => row.startsWith('email='))?.split('=')[1];
    const username = document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1];

    if (!email && !username) {
        alert('No logged-in user found. Please log in first.');
        return;
    }

    fetch('/download-data', {
        method: 'GET',
        credentials: 'same-origin'  // Ensure cookies are sent with the request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data.');
        }
        return response.json();
    })
    .then(data => {
        const userData = JSON.stringify(data, null, 2);
        const blob = new Blob([userData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_data.json';
        a.click();

        URL.revokeObjectURL(url);
    })
    .catch(error => alert(error.message));
}

function deleteUserData() {
    const email = document.cookie.split('; ').find(row => row.startsWith('email='))?.split('=')[1];
    const username = document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1];

    if (!email && !username) {
        alert('No logged-in user found. Please log in first.');
        return;
    }

    fetch('/delete-data', {
        method: 'DELETE',
        credentials: 'same-origin'  // Ensure cookies are sent with the request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete user data.');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
    })
    .catch(error => alert(error.message));
}

function updateAccount(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const currentEmail = document.cookie.split('; ').find(row => row.startsWith('email='))?.split('=')[1];
    const currentUsername = document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1];

    if (!currentEmail && !currentUsername) {
        alert('No logged-in user found. Please log in first.');
        return;
    }

    fetch('/download-data', {
        method: 'GET',
        credentials: 'same-origin'  // Ensure cookies are sent with the request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data.');
        }
        return response.json();
    })
    .then(data => {
        // Ensure that the logged-in user matches the data
        if (data.email === currentEmail || data.username === currentUsername) {
            const updatedData = {};

            // Collect changes only for the updated fields
            if (username && username !== data.username) {
                updatedData.new_username = username;
            }
            if (email && email !== data.email) {
                updatedData.new_email = email;
            }
            if (password) {
                updatedData.new_password = password;
            }

            // If no data to update, show a message and return
            if (Object.keys(updatedData).length === 0) {
                alert('No changes made.');
                return;
            }

            fetch('/update-data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.message === "User data updated successfully.") {
                    // Update email and username cookies if changed
                    if (updatedData.new_email) {
                        document.cookie = `email=${updatedData.new_email}; path=/; max-age=${60*60*24*365}`;  // Persist email cookie
                    }
                    if (updatedData.new_username) {
                        document.cookie = `username=${updatedData.new_username}; path=/; max-age=${60*60*24*365}`;  // Persist username cookie
                    }
                    alert('Account information updated successfully!');
                } else {
                    alert(responseData.message);
                }
            })
            .catch(error => {
                console.error('Error during update:', error);  // Log for debugging
                alert('Failed to update account information.');
            });
        } else {
            alert('Error: Unable to update account information.');
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);  // Log for debugging
        alert('Failed to fetch user data.');
    });
}

const toggleThemeButton = document.getElementById('toggleTheme');
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Apply the saved theme on page load
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    toggleThemeButton.textContent = 'Toggle Light Mode';
} else {
    document.body.classList.remove('dark-mode');
    toggleThemeButton.textContent = 'Toggle Dark Mode';
}

toggleThemeButton.addEventListener('click', () => {
    if (isDarkMode) {
        document.body.classList.remove('dark-mode');
        toggleThemeButton.textContent = 'Toggle Dark Mode';
    } else {
        document.body.classList.add('dark-mode');
        toggleThemeButton.textContent = 'Toggle Light Mode';
    }
    
    // Save the new theme preference in localStorage
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode.toString());
});
