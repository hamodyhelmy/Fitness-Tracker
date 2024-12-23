function signupUser() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const telephone = document.getElementById('signupTelephone').value.trim();
    const country = document.getElementById('signupCountry').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!username || !email || !telephone || !country || !password) {
        alert('All fields are required!');
        return;
    }

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, telephone, country, password }),
    })
    .then(response => response.json().then(data => ({ status: response.ok, message: data })))
    .then(({ status, message }) => {
        if (status) {
            alert(message.message);
            window.location.href = '/login'; // Redirect to login page after successful signup
        } else {
            alert(`Error: ${message.message}`);
        }
    })
    .catch(error => {
        alert('An error occurred during signup. Please try again.');
        console.error(error);
    });
}
