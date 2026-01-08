document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('login-form');
            const loginAlert = document.getElementById('login-alert');
            
            // Clear any existing login session to ensure fresh login
            localStorage.removeItem('attendanceLoggedIn');
            localStorage.removeItem('attendanceUsername');
            
            // Handle form submission
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;
                
                // Check credentials (using "ICAIT1" as per your code)
                if (username === 'SOSIT5' && password === 'ICAIT1') {
                    // Store login state in localStorage
                    localStorage.setItem('attendanceLoggedIn', 'true');
                    localStorage.setItem('attendanceUsername', username);
                    
                    // Show success message
                    loginAlert.style.display = 'none';
                    
                    // Change button to show loading
                    const submitBtn = loginForm.querySelector('.login-btn');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                    submitBtn.disabled = true;
                    
                    // Simulate login process
                    setTimeout(() => {
                        // Success - redirect to subject selection page
                        window.location.href = "subject.html";
                    }, 1500);
                    
                } else {
                    // Show error message
                    loginAlert.style.display = 'flex';
                    
                    // Shake animation for error
                    loginForm.classList.add('shake');
                    setTimeout(() => {
                        loginForm.classList.remove('shake');
                    }, 500);
                    
                    // Clear password field
                    document.getElementById('password').value = '';
                    
                    // Auto-hide alert after 4 seconds
                    setTimeout(() => {
                        loginAlert.style.display = 'none';
                    }, 4000);
                }
            });
            
            // Add shake animation CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .shake {
                    animation: shake 0.5s ease-in-out;
                }
            `;
            document.head.appendChild(style);
            
            // Focus on username field when page loads
            document.getElementById('username').focus();
        });