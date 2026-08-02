/**
 * main.js — Login page logic
 */
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');
    const themeToggle = document.getElementById('theme-toggle');

    // Wire up the Sign In handler FIRST, before anything that touches
    // localStorage or does cosmetic setup — that way login still works
    // even if a non-essential step below fails for some reason.
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const roleInput = loginForm.querySelector('input[name="role"]:checked');
        const role = roleInput ? roleInput.value : 'staff';
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (role === 'student') {
            try { showToast('This portal is for faculty attendance marking. Please switch the Role above to Staff.', 'info'); } catch (err) { /* ignore */ }
            return;
        }

        if (username === 'Rishabh Shah' && password === '1504') {
            // Persisting the session is best-effort: even if storage is
            // blocked in this browser/context, the redirect must still happen.
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
                window.location.href = 'dashboard.html';
            }, 900);
        } else {
            loginAlert.style.display = 'flex';
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
            document.getElementById('password').value = '';
            setTimeout(() => { loginAlert.style.display = 'none'; }, 4000);
        }
    });

    // Cosmetic/non-essential setup — wrapped so a failure here can never
    // block the Sign In handler registered above.
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

        const googleBtn = document.getElementById('social-google');
        const forgotLink = document.getElementById('forgot-link');
        const forgotBtn = document.getElementById('forgot-btn');
        const showPasswordCheckbox = document.getElementById('show-password');
        const passwordInput = document.getElementById('password');

        if (googleBtn) googleBtn.addEventListener('click', () => showToast('Google sign-in isn\u2019t connected yet — please use your faculty username and password.', 'info'));

        const explainForgot = (e) => {
            if (e) e.preventDefault();
            showToast('Please contact your system administrator to reset your login.', 'info');
        };
        if (forgotLink) forgotLink.addEventListener('click', explainForgot);
        if (forgotBtn) forgotBtn.addEventListener('click', explainForgot);

        if (showPasswordCheckbox && passwordInput) {
            showPasswordCheckbox.addEventListener('change', () => {
                passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
            });
        }
    } catch (err) {
        console.error('Non-essential setup failed:', err);
    }

    document.getElementById('username').focus();
});