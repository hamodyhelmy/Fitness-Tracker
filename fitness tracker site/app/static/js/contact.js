document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    // Validate Email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Clear Form Fields
    function clearForm() {
        nameInput.value = '';
        emailInput.value = '';
        messageInput.value = '';
    }

    // Display Alert
    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.textContent = message;
        alert.style.padding = '10px';
        alert.style.marginTop = '10px';
        alert.style.borderRadius = '5px';
        alert.style.textAlign = 'center';
        alert.style.color = type === 'success' ? 'green' : 'red';
        alert.style.border = `1px solid ${type === 'success' ? 'green' : 'red'}`;
        form.parentElement.insertBefore(alert, form);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Form Submission Event
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // Validate Inputs
        if (!name || !email || !message) {
            showAlert('error', 'All fields are required.');
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('error', 'Please enter a valid email address.');
            return;
        }

        // Simulate sending the form (AJAX or other logic can be added here)
        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                name: name,
                email: email,
                message: message,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    showAlert('success', 'Your message has been sent successfully!');
                    clearForm();
                } else {
                    showAlert('error', 'Failed to send your message. Please try again.');
                }
            })
            .catch(() => {
                showAlert('error', 'An error occurred. Please try again.');
            });
    });

    // Field Focus and Blur Effects
    [nameInput, emailInput, messageInput].forEach((input) => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#4caf50';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '';
        });
    });
});
