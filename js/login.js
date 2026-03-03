document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        errorMsg.style.display = 'none';

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and role
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('username', data.username);

                // Redirect based on role
                if (data.role === 'club') {
                    window.location.href = '/html/dashboard-club.html';
                } else if (data.role === 'faculty') {
                    window.location.href = '/html/dashboard-faculty.html';
                }
            } else {
                errorMsg.textContent = data.msg || 'Login failed';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Server error. Is the backend running?';
            errorMsg.style.display = 'block';
        } finally {
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    });
});
