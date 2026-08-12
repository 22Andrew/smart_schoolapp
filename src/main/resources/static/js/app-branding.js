(function () {
    let cachedBranding = null;

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

    document.addEventListener('DOMContentLoaded', function () {
        window.applyAppBranding();
    });
})();
