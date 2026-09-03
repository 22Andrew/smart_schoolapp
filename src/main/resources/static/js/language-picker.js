(function () {
    'use strict';

    let headerLanguages = [];
    let activeLanguage = null;
    let selecting = false;

    function escapeHtml(text) {
        if (text === null || text === undefined) {
            return '';
        }
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.language-picker-dropdown.active').forEach(function (dropdown) {
            dropdown.classList.remove('active');
        });
        document.querySelectorAll('.language-picker-trigger').forEach(function (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        });
    }

    function renderMenuItems(languages) {
        if (!Array.isArray(languages) || !languages.length) {
            return '';
        }
        return languages.map(function (language) {
            var code = String(language.shortCode || '').toLowerCase();
            var isActive = Boolean(language.isDefault);
            var listFlag = language.listFlagCode || (code === 'en' ? 'us' : language.countryCode || 'sl');
            return [
                '<button type="button" class="language-picker-item',
                isActive ? ' is-active' : '',
                '" data-language-id="', escapeHtml(language.id),
                '" data-language-code="', escapeHtml(code),
                '" data-country-code="', escapeHtml(language.countryCode || ''),
                '" data-language-name="', escapeHtml(language.name || ''),
                '" data-is-rtl="', language.isRtl ? 'true' : 'false',
                '" role="menuitem">',
                '<img src="https://flagcdn.com/w20/', escapeHtml(listFlag), '.png" alt="" width="20" height="14">',
                '<span>', escapeHtml(language.name || code), '</span>',
                '</button>'
            ].join('');
        }).join('');
    }

    function renderAllMenus(languages) {
        var html = renderMenuItems(languages);
        document.querySelectorAll('.language-picker-list').forEach(function (list) {
            if (html) {
                list.innerHTML = html;
            }
        });
    }

    function applyActiveLanguage(language) {
        if (!language) {
            return;
        }
        activeLanguage = language;
        var headerFlag = language.headerFlagCode || (String(language.shortCode || '').toLowerCase() === 'en' ? 'us' : language.countryCode || 'us');
        document.querySelectorAll('.language-picker-trigger img, .icon-btn-flag img, .user-flag-btn img').forEach(function (img) {
            img.src = 'https://flagcdn.com/w20/' + headerFlag + '.png';
            img.alt = language.name || 'Language';
        });
        document.querySelectorAll('.language-picker-item').forEach(function (item) {
            item.classList.toggle('is-active', item.getAttribute('data-language-code') === String(language.shortCode || '').toLowerCase());
        });
        document.documentElement.setAttribute('lang', String(language.shortCode || 'en').toLowerCase());
        document.documentElement.setAttribute('dir', language.isRtl ? 'rtl' : 'ltr');
    }

    function bindLanguagePickerDelegation() {
        if (window.__languagePickerDelegationBound) {
            return;
        }
        window.__languagePickerDelegationBound = true;

        document.addEventListener('click', function (event) {
            var item = event.target.closest('.language-picker-item');
            if (item) {
                event.preventDefault();
                event.stopPropagation();
                selectLanguage(item);
                return;
            }

            var trigger = event.target.closest('.language-picker-trigger');
            if (trigger) {
                event.preventDefault();
                event.stopPropagation();
                var wrap = trigger.closest('.language-picker-wrap');
                var dropdown = wrap ? wrap.querySelector('.language-picker-dropdown') : null;
                if (!dropdown) {
                    return;
                }
                var willOpen = !dropdown.classList.contains('active');
                closeAllDropdowns();
                if (willOpen) {
                    dropdown.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
                return;
            }

            if (!event.target.closest('.language-picker-wrap')) {
                closeAllDropdowns();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeAllDropdowns();
            }
        });
    }

    function upgradeLegacyFlagButtons() {
        document.querySelectorAll('.icon-btn-flag, .user-flag-btn').forEach(function (button) {
            if (button.closest('.language-picker-wrap')) {
                return;
            }
            var wrap = document.createElement('div');
            wrap.className = 'language-picker-wrap';
            var dropdown = document.createElement('div');
            dropdown.className = 'language-picker-dropdown';
            var menu = document.createElement('div');
            menu.className = 'language-picker-list';
            menu.setAttribute('role', 'menu');
            menu.innerHTML = renderMenuItems(headerLanguages);
            dropdown.appendChild(menu);
            button.classList.add('language-picker-trigger');
            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            button.parentNode.insertBefore(wrap, button);
            wrap.appendChild(button);
            wrap.appendChild(dropdown);
        });
    }

    async function loadLanguages() {
        try {
            var headerResponse = await fetch('/api/languages/header');
            if (headerResponse.ok) {
                var payload = await headerResponse.json();
                if (Array.isArray(payload) && payload.length) {
                    headerLanguages = payload;
                    renderAllMenus(headerLanguages);
                }
            }

            var activeResponse = await fetch('/api/languages/active');
            if (activeResponse.ok) {
                activeLanguage = await activeResponse.json();
                applyActiveLanguage(activeLanguage);
            } else if (headerLanguages.length) {
                applyActiveLanguage(headerLanguages.find(function (lang) { return lang.isDefault; }) || headerLanguages[0]);
            }
        } catch (error) {
            if (headerLanguages.length) {
                applyActiveLanguage(headerLanguages.find(function (lang) { return lang.isDefault; }) || headerLanguages[0]);
            }
        }
    }

    async function selectLanguage(item) {
        if (selecting) {
            return;
        }
        var id = item.getAttribute('data-language-id');
        if (!id) {
            return;
        }
        selecting = true;
        closeAllDropdowns();
        try {
            var response = await fetch('/api/languages/' + encodeURIComponent(id) + '/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            var data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to change language');
            }
            var langCode = item.getAttribute('data-language-code') || 'en';
            if (window.clearUiPhraseCache) {
                window.clearUiPhraseCache();
            }
            document.cookie = 'smart_school_lang=' + encodeURIComponent(langCode) + '; path=/; max-age=' + (60 * 60 * 24 * 365);
            window.location.reload();
        } catch (error) {
            selecting = false;
            if (window.Swal && typeof window.Swal.fire === 'function') {
                window.Swal.fire({
                    icon: 'error',
                    title: 'Language',
                    text: error.message || 'Failed to change language',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    }

    function initLanguagePicker() {
        bindLanguagePickerDelegation();
        upgradeLegacyFlagButtons();
        loadLanguages();
    }

    window.initLanguagePicker = initLanguagePicker;
    window.renderLanguagePickerMenus = renderAllMenus;

    bindLanguagePickerDelegation();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguagePicker);
    } else {
        initLanguagePicker();
    }
})();
