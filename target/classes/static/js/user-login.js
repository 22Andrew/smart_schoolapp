document.addEventListener('DOMContentLoaded', function () {
    const roleButtons = document.querySelectorAll('.user-role-selection .role-btn');
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');

    const roleCredentials = {
        student: {
            username: 'std1',
            password: '110001'
        },
        parent: {
            username: 'parent1',
            password: '110001'
        }
    };

    roleButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            roleButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });
            button.classList.add('active');

            const role = button.getAttribute('data-role');
            if (!roleCredentials[role] || !usernameInput || !passwordInput) {
                return;
            }

            usernameInput.value = roleCredentials[role].username;
            passwordInput.value = roleCredentials[role].password;

            usernameInput.style.backgroundColor = '#f0fdf4';
            passwordInput.style.backgroundColor = '#f0fdf4';
            window.setTimeout(function () {
                usernameInput.style.backgroundColor = '';
                passwordInput.style.backgroundColor = '';
            }, 1000);
        });
    });

    const activeButton = document.querySelector('.user-role-selection .role-btn.active');
    if (activeButton) {
        activeButton.click();
    }
});
