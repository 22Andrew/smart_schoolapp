(function () {
    'use strict';

    var SKIP_TAGS = {
        SCRIPT: true,
        STYLE: true,
        NOSCRIPT: true,
        SVG: true,
        CODE: true,
        PRE: true,
        TEXTAREA: true
    };

    var PHRASE_CACHE_PREFIX = 'smart_school_phrases_';

    var LEAF_SELECTORS = [
        'label',
        'button',
        'a',
        'th',
        'td',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'legend',
        'option',
        'span',
        'p',
        'li',
        'dt',
        'dd',
        'small',
        'strong',
        'em',
        'caption',
        '.page-title',
        '.card-title',
        '.modal-title',
        '.form-label',
        '.btn',
        '.submenu-item',
        '.menu-item > span',
        '.sidebar-session-label',
        '.sidebar-quick-links-title',
        '.session-label',
        '.admin-card-title',
        '.admin-present-title',
        '.admin-student-label',
        '.stat-title',
        '.chart-title',
        '.accountant-mini-stat-title',
        '.receptionist-mini-stat-title',
        '.profile-footer-link span',
        '.profile-password-label',
        '.staff-showing-info',
        '.breadcrumb-item',
        '.nav-tabs .nav-link',
        '.badge',
        '.alert',
        '.dropdown-item',
        '.swal2-title',
        '.swal2-html-container',
        '[data-lang-key]'
    ].join(',');

    var phraseMap = {};
    var observerStarted = false;

    function normalizeText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function activeLangCode() {
        return String(window.__ACTIVE_LANG__ || 'en').toLowerCase();
    }

    function cacheKey() {
        var version = window.__PHRASE_VERSION__ || 0;
        return PHRASE_CACHE_PREFIX + activeLangCode() + '_' + version;
    }

    function readCache() {
        try {
            var raw = sessionStorage.getItem(cacheKey());
            if (!raw) {
                return null;
            }
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function writeCache(phrases) {
        try {
            sessionStorage.setItem(cacheKey(), JSON.stringify(phrases));
        } catch (error) {
            /* ignore quota errors */
        }
    }

    function clearPhraseCaches() {
        try {
            Object.keys(sessionStorage).forEach(function (key) {
                if (key.indexOf(PHRASE_CACHE_PREFIX) === 0) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            /* ignore */
        }
    }

    window.clearUiPhraseCache = clearPhraseCaches;

    function shouldSkipElement(element) {
        if (!element || element.nodeType !== 1) {
            return true;
        }
        if (SKIP_TAGS[element.tagName]) {
            return true;
        }
        if (element.closest('[data-no-translate]')) {
            return true;
        }
        if (element.closest('.language-picker-wrap')) {
            return true;
        }
        if (element.isContentEditable) {
            return true;
        }
        return false;
    }

    function isLeafTextElement(element) {
        if (shouldSkipElement(element)) {
            return false;
        }
        if (element.children.length > 0) {
            var hasSignificantChild = false;
            for (var i = 0; i < element.children.length; i++) {
                var child = element.children[i];
                if (!SKIP_TAGS[child.tagName] && normalizeText(child.textContent)) {
                    hasSignificantChild = true;
                    break;
                }
            }
            if (hasSignificantChild) {
                return false;
            }
        }
        var text = normalizeText(element.textContent);
        return text.length >= 2 && /[A-Za-z]/.test(text);
    }

    function translateValue(text, phrases) {
        var key = normalizeText(text);
        if (!key) {
            return null;
        }
        if (phrases[key]) {
            return phrases[key];
        }
        var lower = key.toLowerCase();
        if (phrases[lower]) {
            return phrases[lower];
        }
        for (var candidate in phrases) {
            if (candidate.toLowerCase() === lower) {
                return phrases[candidate];
            }
        }
        if (key.endsWith(':')) {
            return translateValue(key.slice(0, -1), phrases);
        }
        return null;
    }

    function applyToAttributes(phrases) {
        document.querySelectorAll('[title]').forEach(function (element) {
            if (shouldSkipElement(element)) {
                return;
            }
            var title = element.getAttribute('title');
            var translated = translateValue(title, phrases);
            if (translated) {
                element.setAttribute('title', translated);
            }
        });

        document.querySelectorAll('[aria-label]').forEach(function (element) {
            if (shouldSkipElement(element)) {
                return;
            }
            var label = element.getAttribute('aria-label');
            var translated = translateValue(label, phrases);
            if (translated) {
                element.setAttribute('aria-label', translated);
            }
        });

        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (element) {
            if (shouldSkipElement(element)) {
                return;
            }
            var placeholder = element.getAttribute('placeholder');
            var translated = translateValue(placeholder, phrases);
            if (translated) {
                element.setAttribute('placeholder', translated);
            }
        });
    }

    function applyPhrases(phrases, root) {
        if (!phrases || typeof phrases !== 'object' || !Object.keys(phrases).length) {
            return;
        }
        phraseMap = phrases;
        var scope = root && root.querySelectorAll ? root : document;

    scope.querySelectorAll(LEAF_SELECTORS).forEach(function (element) {
            if (!isLeafTextElement(element)) {
                return;
            }
            var key = element.getAttribute('data-lang-key') || normalizeText(element.textContent);
            var translated = translateValue(key, phrases);
            if (!translated && key) {
                translated = phrases[key.toLowerCase()] || phrases[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()];
            }
            if (translated) {
                element.textContent = translated;
            }
        });

        if (!root || root === document) {
            applyToAttributes(phrases);
            translateDocumentTitle(phrases);
        }
    }

    function translateDocumentTitle(phrases) {
        var title = normalizeText(document.title);
        if (!title) {
            return;
        }
        var parts = title.split(' - ');
        if (parts.length === 2) {
            var left = translateValue(parts[0], phrases);
            var right = translateValue(parts[1], phrases);
            if (left || right) {
                document.title = (left || parts[0]) + ' - ' + (right || parts[1]);
                return;
            }
        }
        var translated = translateValue(title, phrases);
        if (translated) {
            document.title = translated;
        }
    }

    function applyDocumentLanguage() {
        var code = activeLangCode();
        document.documentElement.setAttribute('lang', code);
        document.documentElement.setAttribute('dir', window.__ACTIVE_RTL__ ? 'rtl' : 'ltr');
        document.body.classList.toggle('lang-rtl', Boolean(window.__ACTIVE_RTL__));
    }

    async function fetchPhrases() {
        try {
            var response = await fetch('/api/languages/phrases');
            if (!response.ok) {
                return null;
            }
            var payload = await response.json();
            if (payload.phraseCount) {
                window.__PHRASE_VERSION__ = payload.phraseCount;
            }
            return payload.phrases || payload;
        } catch (error) {
            return null;
        }
    }

    async function resolvePhrases() {
        if (activeLangCode() === 'en') {
            return {};
        }
        var cached = readCache();
        if (cached && Object.keys(cached).length) {
            return cached;
        }
        var fetched = await fetchPhrases();
        if (fetched && Object.keys(fetched).length) {
            writeCache(fetched);
        }
        return fetched || {};
    }

    function patchSweetAlert() {
        if (!window.Swal || window.Swal.__i18nPatched) {
            return;
        }
        var originalFire = window.Swal.fire.bind(window.Swal);
        window.Swal.fire = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
                var opts = Object.assign({}, args[0]);
                if (opts.title) {
                    opts.title = window.t(opts.title);
                }
                if (opts.text) {
                    opts.text = window.t(opts.text);
                }
                if (opts.confirmButtonText) {
                    opts.confirmButtonText = window.t(opts.confirmButtonText);
                }
                if (opts.cancelButtonText) {
                    opts.cancelButtonText = window.t(opts.cancelButtonText);
                }
                args[0] = opts;
            } else if (typeof args[0] === 'string') {
                args[0] = window.t(args[0]);
                if (typeof args[1] === 'string') {
                    args[1] = window.t(args[1]);
                }
            }
            return originalFire.apply(window.Swal, args).then(function (result) {
                setTimeout(function () {
                    applyPhrases(phraseMap, document.querySelector('.swal2-container'));
                }, 0);
                return result;
            });
        };
        window.Swal.__i18nPatched = true;
    }

    function startMutationObserver() {
        if (observerStarted || !window.MutationObserver) {
            return;
        }
        var observeRoot = document.querySelector('.main-content');
        if (!observeRoot) {
            return;
        }
        observerStarted = true;
        var timer = null;
        var observer = new MutationObserver(function (mutations) {
            if (!phraseMap || !Object.keys(phraseMap).length) {
                return;
            }
            var shouldApply = mutations.some(function (mutation) {
                if (mutation.target && mutation.target.closest && mutation.target.closest('.sidebar')) {
                    return false;
                }
                return mutation.type === 'childList' || mutation.type === 'characterData';
            });
            if (!shouldApply) {
                return;
            }
            clearTimeout(timer);
            timer = setTimeout(function () {
                applyPhrases(phraseMap, observeRoot);
            }, 120);
        });
        observer.observe(observeRoot, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    window.t = function (text) {
        var key = normalizeText(text);
        if (!key) {
            return '';
        }
        return phraseMap[key] || key;
    };

    window.applyUiLanguage = applyPhrases;

    async function loadUiLanguage() {
        applyDocumentLanguage();
        if (activeLangCode() === 'en') {
            return;
        }

        var sidebar = document.querySelector('.sidebar');
        if (window.__UI_PHRASES__ && Object.keys(window.__UI_PHRASES__).length) {
            phraseMap = window.__UI_PHRASES__;
            if (sidebar) {
                applyPhrases(window.__UI_PHRASES__, sidebar);
            }
        }

        var phrases = await resolvePhrases();
        applyPhrases(phrases);
        patchSweetAlert();
        startMutationObserver();
    }

    window.loadUiLanguage = loadUiLanguage;

    if (window.__UI_PHRASES__ && document.querySelector('.sidebar')) {
        applyPhrases(window.__UI_PHRASES__, document.querySelector('.sidebar'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadUiLanguage);
    } else {
        loadUiLanguage();
    }
})();
