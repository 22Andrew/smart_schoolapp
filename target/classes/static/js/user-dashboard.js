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

    function initProfileDropdown() {
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

    document.addEventListener('DOMContentLoaded', function () {
        initSidebarToggle();
        initSubmenus();
        initProfileDropdown();
    });
})();
