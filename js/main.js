document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    // Clear any existing login session to ensure fresh login on page load
    // This prevents auto-login from previous sessions
    const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
    if (isLoggedIn === 'true') {
        // If somehow already logged in, clear it for fresh experience
        localStorage.removeItem('attendanceLoggedIn');
        localStorage.removeItem('attendanceUsername');
    }
    
    // Set current date and time in header if elements exist (for pages that include this)
    updateDateTimeIfNeeded();
    setInterval(updateDateTimeIfNeeded, 60000);
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Demo credentials validation
            // Username: SOSIT5, Password: ICAIT1
            if (username === 'SOSIT5' && password === 'ICAIT1') {
                // Store login state in localStorage
                localStorage.setItem('attendanceLoggedIn', 'true');
                localStorage.setItem('attendanceUsername', username);
                
                // Hide alert if visible
                if (loginAlert) {
                    loginAlert.style.display = 'none';
                }
                
                // Show loading state on button
                const submitBtn = loginForm.querySelector('.btn-glow');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
                submitBtn.disabled = true;
                
                // Add success animation to login card
                const loginCard = document.querySelector('.login-card');
                if (loginCard) {
                    loginCard.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        loginCard.style.transform = 'scale(1)';
                    }, 150);
                }
                
                // Redirect to subject selection page after short delay
                setTimeout(() => {
                    window.location.href = "subject.html";
                }, 800);
                
            } else {
                // Show error message with animation
                if (loginAlert) {
                    loginAlert.style.display = 'flex';
                    loginAlert.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        loginAlert.style.animation = '';
                    }, 500);
                }
                
                // Add shake animation to form
                loginForm.classList.add('shake-animation');
                setTimeout(() => {
                    loginForm.classList.remove('shake-animation');
                }, 500);
                
                // Clear password field for security
                passwordInput.value = '';
                
                // Highlight the inputs with error border
                usernameInput.style.borderColor = '#ef4444';
                passwordInput.style.borderColor = '#ef4444';
                setTimeout(() => {
                    usernameInput.style.borderColor = '';
                    passwordInput.style.borderColor = '';
                }, 2000);
                
                // Auto-hide alert after 3 seconds
                setTimeout(() => {
                    if (loginAlert) {
                        loginAlert.style.display = 'none';
                    }
                }, 3000);
                
                // Focus back on username field
                usernameInput.focus();
            }
        });
    }
    
    // Add keyboard support for Enter key
    if (usernameInput && passwordInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }
        });
        
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
    
    // Function to update date and time on pages that have these elements
    function updateDateTimeIfNeeded() {
        const dateElement = document.getElementById('current-date');
        const timeElement = document.getElementById('current-time');
        
        if (dateElement || timeElement) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('en-US', options);
            }
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
        }
    }
    
    // Focus on username field when page loads
    if (usernameInput) {
        usernameInput.focus();
    }
});

// Add shake animation CSS dynamically if not already in stylesheet
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .shake-animation {
        animation: shake 0.5s ease-in-out;
    }
`;
if (!document.querySelector('#shake-style')) {
    shakeStyle.id = 'shake-style';
    document.head.appendChild(shakeStyle);
}