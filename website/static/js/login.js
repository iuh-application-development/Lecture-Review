document.addEventListener('DOMContentLoaded', function() {
    const email = localStorage.getItem('userEmail');
    if (email) {
        document.getElementById('email').value = email;
        localStorage.removeItem('userEmail');
    }
});

function validateForm(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let errorMessage = '';

    if (password.length < 6) {
        errorMessage += 'Password must be at least 6 characters long.\n';
    }

    if (errorMessage) {
        document.getElementById('error-message').innerText = errorMessage;
    } else {
        loginUser(email, password);
    }
}

function loginUser(email, password) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
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