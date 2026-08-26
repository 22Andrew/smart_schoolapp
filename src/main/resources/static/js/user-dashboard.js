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
    });
})();
