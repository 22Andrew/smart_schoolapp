(function () {
    let cachedBranding = null;
    let cachedLoginBackground = null;

    async function fetchBranding(forceRefresh) {
        if (forceRefresh) {
            cachedBranding = null;
        }
        if (cachedBranding) {
            return cachedBranding;
        }

        try {
            const response = await fetch('/api/schsettings/branding');
            if (!response.ok) {
                return null;
            }
            cachedBranding = await response.json();
            return cachedBranding;
        } catch (error) {
            console.warn('Failed to load app branding', error);
            return null;
        }
    }

    function setLogoImage(container, url, alt, className, size) {
        if (!container || !url) {
            return;
        }

        container.innerHTML = '';
        const img = document.createElement('img');
        img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        img.alt = alt || 'School logo';
        if (className) {
            img.className = className;
        }
        if (size) {
            img.width = size;
            img.height = size;
        }
        container.appendChild(img);
    }

    window.applyAppBranding = async function (forceRefresh) {
        const branding = await fetchBranding(forceRefresh);
        if (!branding) {
            return;
        }

        const schoolName = branding.schoolName || 'Smart School';
        const navbarLogo = branding.adminSmallLogo || branding.adminLogo;
        const loginLogo = branding.adminLogo || branding.adminSmallLogo;

        document.querySelectorAll('.brand-badge').forEach(function (el) {
            el.textContent = schoolName;
        });
        document.querySelectorAll('.school-name').forEach(function (el) {
            el.textContent = schoolName;
        });

        if (branding.session) {
            document.querySelectorAll('.session-value, .sidebar-session-value').forEach(function (el) {
                el.textContent = branding.session;
            });
        }

        document.querySelectorAll('.top-navbar .logo-icon').forEach(function (el) {
            if (navbarLogo) {
                setLogoImage(el, navbarLogo, schoolName, 'navbar-logo-img', 35);
            }
        });

        document.querySelectorAll('.login-left .logo-icon, .logo-section .logo-icon').forEach(function (el) {
            if (loginLogo) {
                setLogoImage(el, loginLogo, schoolName, 'login-logo-img', 50);
            }
        });

        document.querySelectorAll('.logo-text').forEach(function (el) {
            el.textContent = schoolName.toUpperCase();
        });

        if (branding.appLogo) {
            let favicon = document.querySelector('link[rel="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = branding.appLogo;
        }

        if (branding.printLogo) {
            document.documentElement.style.setProperty('--brand-print-logo', 'url("' + branding.printLogo + '")');
        }
        if (branding.adminLogo) {
            document.documentElement.style.setProperty('--brand-admin-logo', 'url("' + branding.adminLogo + '")');
        }
        if (branding.appLogo) {
            document.documentElement.style.setProperty('--brand-app-logo', 'url("' + branding.appLogo + '")');
        }

        if (document.title && document.title.includes('Smart School') && schoolName !== 'Smart School') {
            document.title = document.title.replace(/Smart School/g, schoolName);
        }
    };

    async function fetchLoginBackground(forceRefresh) {
        if (forceRefresh) {
            cachedLoginBackground = null;
        }
        if (cachedLoginBackground) {
            return cachedLoginBackground;
        }

        try {
            const response = await fetch('/api/schsettings/login-background');
            if (!response.ok) {
                return null;
            }
            cachedLoginBackground = await response.json();
            return cachedLoginBackground;
        } catch (error) {
            console.warn('Failed to load login background', error);
            return null;
        }
    }

    function applyBackgroundToPanel(selector, url) {
        const panel = document.querySelector(selector);
        if (!panel || !url) {
            return;
        }
        panel.style.backgroundImage = 'url("' + url + '?t=' + Date.now() + '")';
        panel.style.backgroundSize = 'cover';
        panel.style.backgroundPosition = 'center';
        panel.style.backgroundRepeat = 'no-repeat';
    }

    window.applyLoginBackground = async function (forceRefresh) {
        const data = await fetchLoginBackground(forceRefresh);
        if (!data) {
            return;
        }

        applyBackgroundToPanel('.login-right', data.adminPanelBackground);
        applyBackgroundToPanel('.user-login-right', data.userPanelBackground);
    };

    let cachedBackendTheme = null;

    async function fetchBackendTheme(forceRefresh) {
        if (forceRefresh) {
            cachedBackendTheme = null;
        }
        if (cachedBackendTheme) {
            return cachedBackendTheme;
        }

        try {
            const response = await fetch('/api/schsettings/backend-theme');
            if (!response.ok) {
                return null;
            }
            cachedBackendTheme = await response.json();
            return cachedBackendTheme;
        } catch (error) {
            console.warn('Failed to load backend theme', error);
            return null;
        }
    }

    function getDarkerColor(hex) {
        if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return '#7c3aed';
        }
        const num = parseInt(hex.slice(1), 16);
        const r = Math.max(0, (num >> 16) - 24);
        const g = Math.max(0, ((num >> 8) & 0x00ff) - 24);
        const b = Math.max(0, (num & 0x0000ff) - 24);
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    window.applyBackendTheme = async function (forceRefresh, previewSettings) {
        const theme = previewSettings || await fetchBackendTheme(forceRefresh);
        if (!theme) {
            document.documentElement.classList.add('theme-dark');
            document.body.classList.add('theme-dark');
            return;
        }

        applyThemeToDocument(theme);
    };

    function applyThemeToDocument(theme) {
        try {
            sessionStorage.setItem('app-backend-theme', JSON.stringify(theme));
        } catch (error) {
            /* ignore storage errors */
        }

        const root = document.documentElement;
        const body = document.body;
        const classNames = [
            'theme-light', 'theme-dark',
            'skin-shadow', 'skin-bordered',
            'side-menu-default', 'side-menu-compact',
            'box-compact', 'box-wide'
        ];

        classNames.forEach(name => {
            root.classList.remove(name);
            body.classList.remove(name);
        });

        root.classList.add('theme-' + (theme.themeMode || 'dark'));
        root.classList.add('skin-' + (theme.skin || 'shadow'));
        root.classList.add('side-menu-' + (theme.sideMenuStyle || 'default'));
        root.classList.add('box-' + (theme.boxContent || 'wide'));

        body.classList.add('theme-' + (theme.themeMode || 'dark'));
        body.classList.add('skin-' + (theme.skin || 'shadow'));
        body.classList.add('side-menu-' + (theme.sideMenuStyle || 'default'));
        body.classList.add('box-' + (theme.boxContent || 'wide'));

        const primary = theme.primaryColor || '#8b5cf6';
        const mode = theme.themeMode || 'dark';
        root.style.setProperty('--theme-primary', primary);
        root.style.setProperty('--theme-primary-dark', getDarkerColor(primary));
        root.style.setProperty('--theme-primary-soft', `color-mix(in srgb, ${primary} 12%, #ffffff)`);
        root.style.setProperty('--theme-primary-border', `color-mix(in srgb, ${primary} 40%, #d1d5db)`);
        root.style.backgroundColor = mode === 'light' ? '#ffffff' : '#0f172a';
        root.style.color = mode === 'light' ? '#111827' : '#f8fafc';

        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (theme.sideMenuStyle === 'compact') {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        window.applyAppBranding();
        window.applyLoginBackground();
        window.applyBackendTheme();
    });
})();
