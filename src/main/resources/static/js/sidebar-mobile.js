/**
 * Sidebar toggle: overlay drawer on phone/tablet, collapse width on desktop.
 */
(function () {
    'use strict';

    var MOBILE_MAX = 992;

    function isMobileSidebar() {
        return window.matchMedia('(max-width: ' + MOBILE_MAX + 'px)').matches;
    }

    function setBackdrop(open) {
        document.body.classList.toggle('sidebar-backdrop-open', open);
        document.body.classList.toggle('sidebar-scroll-lock', open);
    }

    function closeMobileSidebar(sidebar) {
        if (!sidebar) {
            return;
        }
        sidebar.classList.remove('mobile-open');
        setBackdrop(false);
    }

    function syncDesktopFromMobile(sidebar) {
        if (!sidebar || isMobileSidebar()) {
            return;
        }
        sidebar.classList.remove('mobile-open');
        setBackdrop(false);
    }

    function initMobileSidebar() {
        var hamburger = document.querySelector('.hamburger-btn');
        var sidebar = document.querySelector('.sidebar');
        if (!hamburger || !sidebar) {
            return;
        }

        hamburger.addEventListener('click', function (event) {
            event.stopPropagation();
            if (isMobileSidebar()) {
                var willOpen = !sidebar.classList.contains('mobile-open');
                sidebar.classList.remove('collapsed');
                sidebar.classList.toggle('mobile-open', willOpen);
                setBackdrop(willOpen);
            } else {
                closeMobileSidebar(sidebar);
                sidebar.classList.toggle('collapsed');
            }
        });

        document.addEventListener('click', function (event) {
            if (!isMobileSidebar() || !sidebar.classList.contains('mobile-open')) {
                return;
            }
            if (sidebar.contains(event.target) || hamburger.contains(event.target)) {
                return;
            }
            closeMobileSidebar(sidebar);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMobileSidebar(sidebar);
            }
        });

        sidebar.addEventListener('click', function (event) {
            if (!isMobileSidebar()) {
                return;
            }
            var link = event.target.closest('a.menu-item, a.submenu-item, a.sub-submenu-item');
            if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
                closeMobileSidebar(sidebar);
            }
        });

        window.addEventListener('resize', function () {
            syncDesktopFromMobile(sidebar);
        });

        syncDesktopFromMobile(sidebar);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileSidebar);
    } else {
        initMobileSidebar();
    }
})();
