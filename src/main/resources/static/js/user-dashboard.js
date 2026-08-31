(function () {
    'use strict';

    function initSidebarToggle() {
        var hamburger = document.querySelector('.hamburger-btn');
        var sidebar = document.querySelector('.sidebar');
        if (!hamburger || !sidebar) {
            return;
        }

        hamburger.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });
    }

    function initSubmenus() {
        document.querySelectorAll('.menu-item-expandable').forEach(function (item) {
            item.addEventListener('click', function (event) {
                event.preventDefault();
                var submenuId = item.getAttribute('data-submenu');
                if (!submenuId) {
                    return;
                }
                var submenu = document.getElementById('submenu-' + submenuId);
                if (!submenu) {
                    return;
                }
                var isOpen = submenu.classList.contains('open');
                document.querySelectorAll('.submenu.open').forEach(function (openMenu) {
                    openMenu.classList.remove('open');
                });
                document.querySelectorAll('.menu-item-expandable.expanded').forEach(function (openItem) {
                    openItem.classList.remove('expanded');
                });
                if (!isOpen) {
                    submenu.classList.add('open');
                    item.classList.add('expanded');
                }
            });
        });
    }

    var PROFILE_ICONS = {
        key: '<svg class="profile-icon profile-icon-key" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2"></path><path d="M7.5 8.5a5.5 5.5 0 1 0 0 7.778"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path></svg>',
        globe: '<svg class="profile-icon profile-icon-globe" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
        logout: '<svg class="profile-icon profile-icon-logout" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
    };

    function normalizeProfileDropdownIcons(dropdown) {
        var passwordLink = dropdown.querySelector('.profile-password-link');
        if (passwordLink) {
            passwordLink.href = '/user/changepass';
            passwordLink.innerHTML = PROFILE_ICONS.key + '<span class="profile-password-label">Password</span>';
        }

        var frontSite = dropdown.querySelector('.profile-front-site-link');
        if (frontSite) {
            frontSite.innerHTML = PROFILE_ICONS.globe + '<span>Front Site</span>';
        }

        var logoutBtn = dropdown.querySelector('.profile-dropdown-footer button[type="submit"]');
        if (logoutBtn) {
            logoutBtn.classList.remove('logout-btn');
            logoutBtn.classList.add('profile-footer-link', 'profile-logout-link');
            logoutBtn.innerHTML = PROFILE_ICONS.logout + '<span>Logout</span>';
        }
    }

    function enhanceProfileDropdown() {
        var dropdown = document.getElementById('profileDropdown');
        if (!dropdown) {
            return;
        }

        if (dropdown.dataset.enhanced !== 'true') {
            var profileInfo = dropdown.querySelector('.profile-info');
            var body = dropdown.querySelector('.profile-dropdown-body');
            var passwordItem = body ? body.querySelector('.profile-dropdown-item') : null;

            if (profileInfo && passwordItem && !profileInfo.querySelector('.profile-password-link')) {
                passwordItem.classList.add('profile-password-link');
                passwordItem.href = '/user/changepass';
                if (!passwordItem.querySelector('.profile-password-label, span')) {
                    var label = document.createElement('span');
                    label.className = 'profile-password-label';
                    label.textContent = 'Password';
                    passwordItem.appendChild(label);
                }
                profileInfo.appendChild(passwordItem);
                if (body) {
                    body.remove();
                }
            }

            if (profileInfo && !profileInfo.querySelector('.profile-password-link')) {
                var passwordLink = document.createElement('a');
                passwordLink.href = '/user/changepass';
                passwordLink.className = 'profile-password-link';
                passwordLink.setAttribute('role', 'menuitem');
                passwordLink.innerHTML = PROFILE_ICONS.key + '<span class="profile-password-label">Password</span>';
                profileInfo.appendChild(passwordLink);
            }

            var footer = dropdown.querySelector('.profile-dropdown-footer');
            if (footer && !footer.querySelector('.profile-front-site-link')) {
                var frontSite = document.createElement('a');
                frontSite.href = '/';
                frontSite.className = 'profile-footer-link profile-front-site-link';
                frontSite.target = '_blank';
                frontSite.rel = 'noopener noreferrer';
                frontSite.setAttribute('role', 'menuitem');
                frontSite.innerHTML = PROFILE_ICONS.globe + '<span>Front Site</span>';
                footer.insertBefore(frontSite, footer.firstChild);
            }

            if (footer) {
                var logoutForm = footer.querySelector('form');
                if (logoutForm) {
                    logoutForm.classList.add('profile-logout-form');
                }
            }

            dropdown.querySelectorAll('.profile-avatar img').forEach(function (img) {
                img.classList.add('profile-avatar-img');
            });

            dropdown.dataset.enhanced = 'true';
        }

        normalizeProfileDropdownIcons(dropdown);
    }

    function initProfileDropdown() {
        enhanceProfileDropdown();
        var profileBtn = document.getElementById('profileBtn');
        var profileDropdown = document.getElementById('profileDropdown');
        if (!profileBtn || !profileDropdown) {
            return;
        }

        profileBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function () {
            profileDropdown.classList.remove('active');
        });

        profileDropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }

    function initProfileTabs() {
        var tabs = document.querySelectorAll('.sp-tab, .user-profile-tab');
        var panels = document.querySelectorAll('.sp-tab-content, .user-profile-tab-panel');
        if (!tabs.length || !panels.length) {
            return;
        }

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var target = tab.getAttribute('data-profile-tab');
                tabs.forEach(function (item) {
                    item.classList.toggle('active', item === tab);
                });
                panels.forEach(function (panel) {
                    panel.classList.toggle('active', panel.getAttribute('data-profile-panel') === target);
                });
            });
        });
    }

    function initActiveSubmenu() {
        document.querySelectorAll('.submenu.open').forEach(function (submenu) {
            var wrapper = submenu.closest('.menu-item-wrapper');
            if (!wrapper) {
                return;
            }
            var toggle = wrapper.querySelector('.menu-item-expandable');
            if (toggle) {
                toggle.classList.add('expanded');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initSidebarToggle();
        initSubmenus();
        initProfileDropdown();
        initProfileTabs();
        initActiveSubmenu();
        if (window.initLanguagePicker) {
            window.initLanguagePicker();
        }
    });
})();
