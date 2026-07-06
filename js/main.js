document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');
    const themeToggle = document.getElementById('theme-toggle');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (username === 'SOSIT5' && password === 'ICAIT1') {
            try {
                Store.set(STORAGE_KEYS.LOGGED_IN, true);
                localStorage.setItem(STORAGE_KEYS.USERNAME, username);
            } catch (err) { /* storage unavailable — continue anyway */ }

            loginAlert.style.display = 'none';

            const submitBtn = loginForm.querySelector('.login-btn');
            submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';
            submitBtn.disabled = true;

            try { showToast('Login successful. Redirecting…', 'success'); } catch (err) { /* ignore */ }

            setTimeout(() => {
                window.location.href = 'subject.html';
            }, 900);
        } else {
            loginAlert.style.display = 'flex';
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
            document.getElementById('password').value = '';
            setTimeout(() => { loginAlert.style.display = 'none'; }, 4000);
        }
    });


    try {
        initTheme();
        attachRipple();
        Store.clearSession();

        themeToggle.addEventListener('click', () => {
            const next = toggleTheme();
            themeToggle.querySelector('i').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
        themeToggle.querySelector('i').className =
            document.documentElement.getAttribute('data-theme') === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    } catch (err) {
        console.error('Non-essential setup failed:', err);
    }

    document.getElementById('username').focus();
});