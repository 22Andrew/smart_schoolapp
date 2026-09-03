/**

 * Global backend theme engine — applies Light/Dark (and related settings) app-wide.

 * Loaded in <head> before paint to reduce theme flash.

 */

(function () {

    var STORAGE_KEY = 'app-backend-theme';
    var FRONT_CMS_THEME_KEY = 'app-front-cms-theme';

    var cachedBackendTheme = null;
    var applySeq = 0;



    function getDarkerColor(hex) {

        if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {

            return '#7c3aed';

        }

        var num = parseInt(hex.slice(1), 16);

        var r = Math.max(0, (num >> 16) - 24);

        var g = Math.max(0, ((num >> 8) & 0x00ff) - 24);

        var b = Math.max(0, (num & 0x0000ff) - 24);

        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);

    }



    function applyThemeToDocument(theme) {

        if (!theme) {

            return;

        }



        var root = document.documentElement;

        var body = document.body;

        var mode = theme.themeMode || 'dark';

        var classNames = [

            'theme-light', 'theme-dark',

            'skin-shadow', 'skin-bordered',

            'side-menu-default', 'side-menu-compact',

            'box-compact', 'box-wide',

            'front-cms-theme-default', 'front-cms-theme-yellow', 'front-cms-theme-darkgray',

            'front-cms-theme-bold_blue', 'front-cms-theme-shadow_white', 'front-cms-theme-material_pink'

        ];



        classNames.forEach(function (name) {

            root.classList.remove(name);

            if (body) {

                body.classList.remove(name);

            }

        });



        root.classList.add('theme-' + mode);

        root.classList.add('skin-' + (theme.skin || 'shadow'));

        root.classList.add('side-menu-' + (theme.sideMenuStyle || 'default'));

        root.classList.add('box-' + (theme.boxContent || 'wide'));

        var frontCmsTheme = theme.frontCmsTheme;
        if (!frontCmsTheme) {
            try {
                frontCmsTheme = sessionStorage.getItem(FRONT_CMS_THEME_KEY) || localStorage.getItem(FRONT_CMS_THEME_KEY);
            } catch (error) {
                frontCmsTheme = '';
            }
        }
        if (frontCmsTheme) {
            root.classList.add('front-cms-theme-' + frontCmsTheme);
            try {
                sessionStorage.setItem(FRONT_CMS_THEME_KEY, frontCmsTheme);
            } catch (error) {
                /* ignore */
            }
        }



        if (body) {

            body.classList.add('theme-' + mode);

            body.classList.add('skin-' + (theme.skin || 'shadow'));

            body.classList.add('side-menu-' + (theme.sideMenuStyle || 'default'));

            body.classList.add('box-' + (theme.boxContent || 'wide'));
            if (frontCmsTheme) {
                body.classList.add('front-cms-theme-' + frontCmsTheme);
            }

        }



        var primary = theme.primaryColor || '#8b5cf6';

        root.style.setProperty('--theme-primary', primary);

        root.style.setProperty('--theme-primary-dark', getDarkerColor(primary));

        root.style.setProperty('--theme-primary-soft', 'color-mix(in srgb, ' + primary + ' 12%, #ffffff)');
        root.style.setProperty('--theme-primary-border', 'color-mix(in srgb, ' + primary + ' 40%, #d1d5db)');
        root.style.setProperty(
            '--theme-primary-sidebar-bg',
            mode === 'light'
                ? 'color-mix(in srgb, ' + primary + ' 14%, #ffffff)'
                : 'color-mix(in srgb, ' + primary + ' 22%, #1e293b)'
        );
        root.style.setProperty('--theme-primary-sidebar-text', primary);
        root.style.setProperty('--theme-primary-sidebar-border', primary);
        root.style.backgroundColor = mode === 'light' ? '#ffffff' : '#0f172a';
        root.style.color = mode === 'light' ? '#111827' : '#f8fafc';

        if (frontCmsTheme) {
            root.style.setProperty('--theme-header-bg', primary);
            root.style.setProperty('--theme-sidebar-bg', primary);
            root.style.setProperty('--theme-chrome-text', '#ffffff');
            root.style.setProperty('--theme-primary-sidebar-bg', 'rgba(0, 0, 0, 0.22)');
            root.style.setProperty('--theme-primary-sidebar-text', '#ffffff');
            root.style.setProperty('--theme-primary-sidebar-border', '#ffffff');
            if (frontCmsTheme === 'darkgray') {
                root.style.backgroundColor = '#4b5563';
                root.style.color = '#ffffff';
            }
        }

        paintChrome(primary, frontCmsTheme);



        var sidebar = document.querySelector('.sidebar');

        if (sidebar) {

            if (theme.sideMenuStyle === 'compact') {

                sidebar.classList.add('collapsed');

            } else {

                sidebar.classList.remove('collapsed');

            }

        }



        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
            if (frontCmsTheme) {
                sessionStorage.setItem(FRONT_CMS_THEME_KEY, frontCmsTheme);
                localStorage.setItem(FRONT_CMS_THEME_KEY, frontCmsTheme);
            }
        } catch (error) {
            /* ignore storage errors */
        }



        try {

            window.dispatchEvent(new CustomEvent('app-theme-changed', { detail: theme }));

        } catch (error) {

            /* ignore */

        }

    }



    function paintChrome(primary, frontCmsTheme) {
        var navbar = document.querySelector('.top-navbar');
        var sidebar = document.querySelector('.sidebar');
        if (frontCmsTheme && primary) {
            if (navbar) {
                navbar.style.setProperty('background', primary, 'important');
                navbar.style.setProperty('background-color', primary, 'important');
                navbar.style.setProperty('color', '#ffffff', 'important');
            }
            if (sidebar) {
                sidebar.style.setProperty('background', primary, 'important');
                sidebar.style.setProperty('background-color', primary, 'important');
                sidebar.style.setProperty('color', '#ffffff', 'important');
            }
        } else {
            if (navbar) {
                navbar.style.removeProperty('background');
                navbar.style.removeProperty('background-color');
                navbar.style.removeProperty('color');
            }
            if (sidebar) {
                sidebar.style.removeProperty('background');
                sidebar.style.removeProperty('background-color');
                sidebar.style.removeProperty('color');
            }
        }
    }

    async function fetchBackendTheme(forceRefresh) {

        if (forceRefresh) {

            cachedBackendTheme = null;

        }

        if (cachedBackendTheme) {

            return cachedBackendTheme;

        }



        try {

            var response = await fetch('/api/schsettings/backend-theme');

            if (!response.ok) {

                return null;

            }

            var fetched = await response.json();
            if (cachedBackendTheme && cachedBackendTheme.frontCmsTheme && !forceRefresh) {
                fetched = Object.assign({}, fetched, {
                    frontCmsTheme: cachedBackendTheme.frontCmsTheme,
                    primaryColor: cachedBackendTheme.primaryColor || fetched.primaryColor,
                    themeMode: cachedBackendTheme.themeMode || fetched.themeMode
                });
            }
            cachedBackendTheme = fetched;
            return cachedBackendTheme;

        } catch (error) {

            return null;

        }

    }



    window.applyThemeToDocument = applyThemeToDocument;

    window.applyBackendTheme = async function (forceRefresh, previewSettings) {
        var seq = ++applySeq;
        if (previewSettings) {
            cachedBackendTheme = Object.assign({}, cachedBackendTheme || {}, previewSettings);
            applyThemeToDocument(cachedBackendTheme);
            return cachedBackendTheme;
        }

        var theme = await fetchBackendTheme(forceRefresh);
        if (seq !== applySeq) {
            return cachedBackendTheme;
        }
        if (!theme) {
            applyThemeToDocument({
                themeMode: 'dark',
                skin: 'shadow',
                sideMenuStyle: 'default',
                primaryColor: '#8b5cf6',
                boxContent: 'wide'
            });
            return;
        }
        applyThemeToDocument(theme);
        return theme;
    };



    /* Apply cached theme immediately (before first paint) */
    try {
        var raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
        if (raw) {
            applyThemeToDocument(JSON.parse(raw));
        }
    } catch (error) {
        /* ignore invalid cache */
    }

    ensureTableToolbarScript();
    ensureCurrencyScript();

    document.addEventListener('DOMContentLoaded', function () {
        ensureThemeOverridesStylesheet();
        window.applyBackendTheme();
        ensureTableToolbarScript();
        ensureCurrencyScript();
    });



    function ensureThemeOverridesStylesheet() {
        var link = document.getElementById('app-theme-overrides');
        if (!link) {
            link = document.createElement('link');
            link.id = 'app-theme-overrides';
            link.rel = 'stylesheet';
            link.href = '/css/app-theme-overrides.css';
        }
        document.head.appendChild(link);
        ensureProfileDocumentsStylesheet();
        ensureProfileTimelineStylesheet();
        ensureProfileBehaviourStylesheet();
    }

    function ensureProfileBehaviourStylesheet() {
        if (!document.getElementById('student-profile-page')) {
            return;
        }
        var link = document.getElementById('user-profile-behaviour-css');
        if (!link) {
            link = document.createElement('link');
            link.id = 'user-profile-behaviour-css';
            link.rel = 'stylesheet';
            link.href = '/css/user-profile-behaviour.css';
        }
        document.head.appendChild(link);
    }

    function ensureProfileDocumentsStylesheet() {
        if (!document.getElementById('student-profile-page')) {
            return;
        }
        var link = document.getElementById('user-profile-documents-css');
        if (!link) {
            link = document.createElement('link');
            link.id = 'user-profile-documents-css';
            link.rel = 'stylesheet';
            link.href = '/css/user-profile-documents.css';
        }
        document.head.appendChild(link);
    }

    function ensureProfileTimelineStylesheet() {
        if (!document.getElementById('student-profile-page')) {
            return;
        }
        var link = document.getElementById('user-profile-timeline-css');
        if (!link) {
            link = document.createElement('link');
            link.id = 'user-profile-timeline-css';
            link.rel = 'stylesheet';
            link.href = '/css/user-profile-timeline.css';
        }
        document.head.appendChild(link);
    }



    function ensureTableToolbarScript() {

        if (document.getElementById('app-table-toolbar')) {

            return;

        }

        var script = document.createElement('script');

        script.id = 'app-table-toolbar';

        script.src = '/js/table-toolbar.js';

        script.async = false;

        (document.head || document.documentElement).appendChild(script);

    }

    function ensureCurrencyScript() {

        if (document.getElementById('app-currency-init')) {

            return;

        }

        var script = document.createElement('script');

        script.id = 'app-currency-init';

        script.src = '/js/currency-init.js';

        script.async = false;

        (document.head || document.documentElement).appendChild(script);

    }



    /* Sync theme when changed in another tab */

    window.addEventListener('storage', function (event) {

        if (event.key === STORAGE_KEY && event.newValue) {

            try {

                cachedBackendTheme = JSON.parse(event.newValue);

                applyThemeToDocument(cachedBackendTheme);

            } catch (error) {

                /* ignore */

            }

        }

    });

})();


