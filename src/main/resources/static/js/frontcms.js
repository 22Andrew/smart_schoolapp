document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('fcsForm');
    const fields = {
        frontCmsEnabled: document.getElementById('fcsFrontCms'),
        sidebarEnabled: document.getElementById('fcsSidebar'),
        languageRtl: document.getElementById('fcsRtl'),
        sidebarNews: document.getElementById('fcsNews'),
        sidebarComplain: document.getElementById('fcsComplain'),
        language: document.getElementById('fcsLanguage'),
        footerText: document.getElementById('fcsFooter'),
        cookieConsent: document.getElementById('fcsCookie'),
        googleAnalytics: document.getElementById('fcsAnalytics'),
        whatsappUrl: document.getElementById('fcsWhatsapp'),
        facebookUrl: document.getElementById('fcsFacebook'),
        twitterUrl: document.getElementById('fcsTwitter'),
        youtubeUrl: document.getElementById('fcsYoutube'),
        googlePlusUrl: document.getElementById('fcsGooglePlus'),
        linkedinUrl: document.getElementById('fcsLinkedin'),
        instagramUrl: document.getElementById('fcsInstagram'),
        pinterestUrl: document.getElementById('fcsPinterest')
    };
    const themeInput = document.getElementById('fcsTheme');
    const logoInput = document.getElementById('fcsLogo');
    const faviconInput = document.getElementById('fcsFavicon');
    const logoImg = document.getElementById('fcsLogoImg');
    const faviconImg = document.getElementById('fcsFaviconImg');
    const logoFallback = document.getElementById('fcsLogoFallback');
    const faviconFallback = document.getElementById('fcsFaviconFallback');

    let palettes = {
        default: { primaryColor: '#0d9488', themeMode: 'light', skin: 'shadow' },
        yellow: { primaryColor: '#ca8a04', themeMode: 'light', skin: 'shadow' },
        darkgray: { primaryColor: '#4b5563', themeMode: 'dark', skin: 'shadow' },
        bold_blue: { primaryColor: '#2563eb', themeMode: 'light', skin: 'shadow' },
        shadow_white: { primaryColor: '#64748b', themeMode: 'light', skin: 'shadow' },
        material_pink: { primaryColor: '#db2777', themeMode: 'light', skin: 'shadow' }
    };

    function currentBackendTheme() {
        try {
            return JSON.parse(sessionStorage.getItem('app-backend-theme')) || {};
        } catch (error) {
            return {};
        }
    }

    function applyFrontTheme(name) {
        const palette = palettes[name];
        if (!palette) return;
        const current = currentBackendTheme();
        const theme = {
            themeMode: palette.themeMode || current.themeMode || 'light',
            skin: palette.skin || current.skin || 'shadow',
            sideMenuStyle: current.sideMenuStyle || 'default',
            primaryColor: palette.primaryColor,
            boxContent: current.boxContent || 'wide',
            frontCmsTheme: name
        };
        if (window.applyBackendTheme) {
            window.applyBackendTheme(false, theme);
        } else if (window.applyThemeToDocument) {
            window.applyThemeToDocument(theme);
        }
    }

    function setImage(img, fallback, src) {
        if (src) {
            img.src = src;
            img.hidden = false;
            fallback.hidden = true;
        } else {
            img.removeAttribute('src');
            img.hidden = true;
            fallback.hidden = false;
        }
    }

    function apply(data) {
        fields.frontCmsEnabled.checked = !!data.frontCmsEnabled;
        fields.sidebarEnabled.checked = !!data.sidebarEnabled;
        fields.languageRtl.checked = !!data.languageRtl;
        fields.sidebarNews.checked = !!data.sidebarNews;
        fields.sidebarComplain.checked = !!data.sidebarComplain;
        fields.language.value = data.language || 'English';
        fields.footerText.value = data.footerText || '';
        fields.cookieConsent.value = data.cookieConsent || '';
        fields.googleAnalytics.value = data.googleAnalytics || '';
        fields.whatsappUrl.value = data.whatsappUrl || '';
        fields.facebookUrl.value = data.facebookUrl || '';
        fields.twitterUrl.value = data.twitterUrl || '';
        fields.youtubeUrl.value = data.youtubeUrl || '';
        fields.googlePlusUrl.value = data.googlePlusUrl || '';
        fields.linkedinUrl.value = data.linkedinUrl || '';
        fields.instagramUrl.value = data.instagramUrl || '';
        fields.pinterestUrl.value = data.pinterestUrl || '';
        themeInput.value = data.currentTheme || 'material_pink';
        if (data.palettes) palettes = data.palettes;
        document.querySelectorAll('.fcs-theme').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.theme === themeInput.value);
        });
        setImage(logoImg, logoFallback, data.logo);
        setImage(faviconImg, faviconFallback, data.favicon);
        applyFrontTheme(themeInput.value);
    }

    document.querySelectorAll('.fcs-theme').forEach(function (btn) {
        btn.addEventListener('click', function () {
            themeInput.value = btn.dataset.theme;
            document.querySelectorAll('.fcs-theme').forEach(function (item) {
                item.classList.toggle('active', item === btn);
            });
            applyFrontTheme(btn.dataset.theme);
        });
    });

    logoInput.addEventListener('change', function () {
        const file = logoInput.files && logoInput.files[0];
        if (file) setImage(logoImg, logoFallback, URL.createObjectURL(file));
    });

    faviconInput.addEventListener('change', function () {
        const file = faviconInput.files && faviconInput.files[0];
        if (file) setImage(faviconImg, faviconFallback, URL.createObjectURL(file));
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const data = new FormData();
        data.append('frontCmsEnabled', fields.frontCmsEnabled.checked);
        data.append('sidebarEnabled', fields.sidebarEnabled.checked);
        data.append('languageRtl', fields.languageRtl.checked);
        data.append('sidebarNews', fields.sidebarNews.checked);
        data.append('sidebarComplain', fields.sidebarComplain.checked);
        data.append('language', fields.language.value);
        data.append('footerText', fields.footerText.value);
        data.append('cookieConsent', fields.cookieConsent.value);
        data.append('googleAnalytics', fields.googleAnalytics.value);
        data.append('whatsappUrl', fields.whatsappUrl.value);
        data.append('facebookUrl', fields.facebookUrl.value);
        data.append('twitterUrl', fields.twitterUrl.value);
        data.append('youtubeUrl', fields.youtubeUrl.value);
        data.append('googlePlusUrl', fields.googlePlusUrl.value);
        data.append('linkedinUrl', fields.linkedinUrl.value);
        data.append('instagramUrl', fields.instagramUrl.value);
        data.append('pinterestUrl', fields.pinterestUrl.value);
        data.append('currentTheme', themeInput.value);
        if (logoInput.files && logoInput.files[0]) data.append('logo', logoInput.files[0]);
        if (faviconInput.files && faviconInput.files[0]) data.append('favicon', faviconInput.files[0]);
        try {
            const response = await fetch('/api/frontcms', { method: 'POST', body: data });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            logoInput.value = '';
            faviconInput.value = '';
            if (result.data) apply(result.data);
            applyFrontTheme(themeInput.value);
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    fetch('/api/frontcms')
        .then(function (response) { return response.json(); })
        .then(apply)
        .catch(function () {});
});
