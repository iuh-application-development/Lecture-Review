function validateForm(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    let errorMessage = '';

    if (password.length < 6) {
        errorMessage += 'Password must be at least 6 characters long.\n';
    }

    if (password !== confirmPassword) {
        errorMessage += 'Passwords do not match.\n';
    }

    if (errorMessage) {
        document.getElementById('error-message').innerText = errorMessage;
    } else {
        registerUser(email, password, firstName, lastName, gender);
    }
}

function registerUser(email, password, firstName, lastName, gender) {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password, first_name: firstName, last_name: lastName, gender: gender })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            document.getElementById('error-message').innerText = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}