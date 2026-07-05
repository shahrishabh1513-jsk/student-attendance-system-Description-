document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');

    // Clear any existing login session to ensure fresh login
    localStorage.removeItem('attendanceLoggedIn');
    localStorage.removeItem('attendanceUsername');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Demo credentials
        if (username === 'SOSIT5' && password === 'ICAIT1') {
            localStorage.setItem('attendanceLoggedIn', 'true');
            localStorage.setItem('attendanceUsername', username);

            loginAlert.style.display = 'none';

            const submitBtn = loginForm.querySelector('.login-btn');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            setTimeout(() => {
                window.location.href = 'subject.html';
            }, 1200);

        } else {
            loginAlert.style.display = 'flex';
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);

            document.getElementById('password').value = '';

            setTimeout(() => {
                loginAlert.style.display = 'none';
            }, 4000);
        }
    });

    document.getElementById('username').focus();
});