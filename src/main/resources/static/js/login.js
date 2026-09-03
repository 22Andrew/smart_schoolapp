// Role Selection Handler
document.addEventListener('DOMContentLoaded', function() {
    const roleButtons = document.querySelectorAll('.role-btn');
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    // Role credentials mapping
    const roleCredentials = {
        'super-admin': {
            username: 'superadmin@gmail.com',
            password: 'Superadmin1'
        },
        'admin': {
            username: 'admin@gmail.com',
            password: 'Admin123'
        },
        'teacher': {
            username: 'teacher@gmail.com',
            password: 'Teacher123'
        },
        'accountant': {
            username: 'accountant@gmail.com',
            password: 'Accountant123'
        },
        'receptionist': {
            username: 'receptionist@gmail.com',
            password: 'Receptionist123'
        },
        'librarian': {
            username: 'librarian@gmail.com',
            password: 'Librarian123'
        }
    };
    
    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            roleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the role value
            const role = this.getAttribute('data-role');
            console.log('Selected role:', role);
            
            // Auto-fill credentials for the selected role
            if (roleCredentials[role]) {
                usernameInput.value = roleCredentials[role].username;
                passwordInput.value = roleCredentials[role].password;
                
                // Add a subtle animation to indicate auto-fill
                usernameInput.style.backgroundColor = '#f0fdf4';
                passwordInput.style.backgroundColor = '#f0fdf4';
                
                setTimeout(() => {
                    usernameInput.style.backgroundColor = '';
                    passwordInput.style.backgroundColor = '';
                }, 1000);
            }
        });
    });
});
