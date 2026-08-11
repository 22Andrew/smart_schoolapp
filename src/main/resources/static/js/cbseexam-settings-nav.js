(function () {
    function initCbseSettingsNav() {
        const nav = document.querySelector('.cbse-settings-nav');
        if (!nav) return;

        let currentPath = window.location.pathname;
        if (currentPath.endsWith('/') && currentPath.length > 1) {
            currentPath = currentPath.slice(0, -1);
        }

        let matched = null;
        let bestLength = -1;

        nav.querySelectorAll('.settings-nav-item').forEach(function (item) {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (!href || href === '#') return;

            const isExact = currentPath === href;
            const isNested = currentPath.startsWith(href + '/');
            if (!isExact && !isNested) return;

            if (href.length > bestLength) {
                matched = item;
                bestLength = href.length;
            }
        });

        if (matched) {
            matched.classList.add('active');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCbseSettingsNav);
    } else {
        initCbseSettingsNav();
    }
})();
