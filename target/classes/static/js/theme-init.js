/**

 * Global backend theme engine — applies Light/Dark (and related settings) app-wide.

 * Loaded in <head> before paint to reduce theme flash.

 */

(function () {

    var STORAGE_KEY = 'app-backend-theme';

    var cachedBackendTheme = null;



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

            'box-compact', 'box-wide'

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



        if (body) {

            body.classList.add('theme-' + mode);

            body.classList.add('skin-' + (theme.skin || 'shadow'));

            body.classList.add('side-menu-' + (theme.sideMenuStyle || 'default'));

            body.classList.add('box-' + (theme.boxContent || 'wide'));

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

        } catch (error) {

            /* ignore storage errors */

        }



        try {

            window.dispatchEvent(new CustomEvent('app-theme-changed', { detail: theme }));

        } catch (error) {

            /* ignore */

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

            cachedBackendTheme = await response.json();

            return cachedBackendTheme;

        } catch (error) {

            return null;

        }

    }



    window.applyThemeToDocument = applyThemeToDocument;



    window.applyBackendTheme = async function (forceRefresh, previewSettings) {

        var theme = previewSettings || await fetchBackendTheme(forceRefresh);

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

    };



    /* Apply cached theme immediately (before first paint) */

    try {

        var raw = sessionStorage.getItem(STORAGE_KEY);

        if (raw) {

            applyThemeToDocument(JSON.parse(raw));

        }

    } catch (error) {

        /* ignore invalid cache */

    }



    document.addEventListener('DOMContentLoaded', function () {

        window.applyBackendTheme();

    });



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


