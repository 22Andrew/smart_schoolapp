/**
 * Global active currency engine — applies the currency selected on /admin/currency app-wide.
 */
(function () {
    var STORAGE_KEY = 'app-active-currency';
    var DEFAULT_CONFIG = {
        shortCode: 'USD',
        symbol: '$',
        name: 'USD',
        conversionRate: '1',
        baseShortCode: 'USD',
        baseConversionRate: '1',
        currencyFormat: '12,345,678.00'
    };

    var config = null;
    var ready = false;
    var refreshPromise = null;

    function loadCachedConfig() {
        try {
            var raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
            if (raw) {
                config = JSON.parse(raw);
            }
        } catch (error) {
            config = null;
        }
        if (!config) {
            config = Object.assign({}, DEFAULT_CONFIG);
        }
    }

    function saveCachedConfig() {
        try {
            var raw = JSON.stringify(config);
            sessionStorage.setItem(STORAGE_KEY, raw);
            localStorage.setItem(STORAGE_KEY, raw);
        } catch (error) {
            /* ignore */
        }
    }

    function convertFromBase(value) {
        var num = Number(value);
        if (Number.isNaN(num)) {
            return 0;
        }
        var rate = Number(config.conversionRate || 1);
        var baseRate = Number(config.baseConversionRate || 1);
        if (!baseRate || Number.isNaN(baseRate)) {
            baseRate = 1;
        }
        if (!rate || Number.isNaN(rate)) {
            rate = 1;
        }
        return num * rate / baseRate;
    }

    function formatIndianNumber(intPart) {
        var digits = String(intPart).replace(/\D/g, '');
        if (digits.length <= 3) {
            return digits;
        }
        var last = digits.slice(-3);
        var rest = digits.slice(0, -3);
        var groups = [];
        while (rest.length > 2) {
            groups.unshift(rest.slice(-2));
            rest = rest.slice(0, -2);
        }
        if (rest.length) {
            groups.unshift(rest);
        }
        return groups.join(',') + ',' + last;
    }

    function formatNumber(value) {
        var num = convertFromBase(value);
        if (Number.isNaN(num)) {
            num = 0;
        }
        var fixed = num.toFixed(2);
        var parts = fixed.split('.');
        var intPart = parts[0];
        var dec = parts[1];
        var pattern = config.currencyFormat || DEFAULT_CONFIG.currencyFormat;

        if (pattern === '1,23,45,678.00') {
            return formatIndianNumber(intPart) + '.' + dec;
        }
        if (pattern === '12345678.00') {
            return intPart + '.' + dec;
        }
        if (pattern === '12.345.678,00') {
            return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec;
        }
        return Number(num).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatCurrency(value) {
        return String(config.symbol || '$') + formatNumber(value);
    }

    function getSymbol() {
        return String(config.symbol || '$');
    }

    function currencySuffix() {
        return ' (' + getSymbol() + ')';
    }

    function withCurrency(text) {
        if (text == null) {
            return '';
        }
        var symbol = getSymbol();
        return String(text)
            .replace(/\(\$\)/g, '(' + symbol + ')')
            .replace(/\(\s*\$\s*\)/g, '(' + symbol + ')');
    }

    var LABEL_SELECTOR = 'label, th, td, span, p, h1, h2, h3, h4, h5, h6, option, button, a, legend, dt, dd';

    function shouldSkipCurrencyNode(node) {
        if (!node || !node.parentElement) {
            return true;
        }
        var parent = node.parentElement;
        if (parent.closest('script, style, noscript, textarea, code, pre')) {
            return true;
        }
        if (parent.classList && (parent.classList.contains('icon-btn') || parent.classList.contains('sidebar-menu'))) {
            return false;
        }
        return false;
    }

    function replaceCurrencyMarkers(text) {
        if (!text || text.indexOf('$') === -1) {
            return text;
        }
        return withCurrency(text);
    }

    function applyCurrencyLabels(root) {
        var scope = root || document;
        if (!scope || !scope.querySelectorAll) {
            return;
        }

        scope.querySelectorAll(LABEL_SELECTOR).forEach(function (element) {
            if (element.childElementCount === 0) {
                var text = element.textContent;
                var next = replaceCurrencyMarkers(text);
                if (next !== text) {
                    element.textContent = next;
                }
                return;
            }

            element.childNodes.forEach(function (node) {
                if (node.nodeType === Node.TEXT_NODE && !shouldSkipCurrencyNode(node)) {
                    var original = node.textContent;
                    var updated = replaceCurrencyMarkers(original);
                    if (updated !== original) {
                        node.textContent = updated;
                    }
                }
            });
        });

        scope.querySelectorAll('[data-currency-label]').forEach(function (element) {
            var base = element.getAttribute('data-currency-label');
            if (base) {
                element.textContent = withCurrency(base);
            }
        });

        scope.querySelectorAll('[placeholder*="($)"]').forEach(function (element) {
            element.placeholder = withCurrency(element.placeholder);
        });

        scope.querySelectorAll('[title*="($)"]').forEach(function (element) {
            element.title = withCurrency(element.title);
        });
    }

    function scheduleLabelRefresh() {
        applyCurrencyLabels(document);
        setTimeout(function () {
            applyCurrencyLabels(document);
        }, 0);
        setTimeout(function () {
            applyCurrencyLabels(document);
        }, 150);
    }

    var labelObserverTimer = null;

    function observeDynamicLabels() {
        if (!document.body || !window.MutationObserver) {
            return;
        }
        var observer = new MutationObserver(function () {
            clearTimeout(labelObserverTimer);
            labelObserverTimer = setTimeout(function () {
                applyCurrencyLabels(document);
            }, 60);
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function paintNavbar() {
        document.querySelectorAll('.icon-btn[title="Currency"], .icon-btn[title^="Currency:"]').forEach(function (btn) {
            btn.title = 'Currency: ' + (config.shortCode || 'USD') + ' (' + (config.symbol || '$') + ')';
        });
    }

    function publishGlobals() {
        window.AppCurrency = {
            getConfig: function () { return Object.assign({}, config); },
            getSymbol: getSymbol,
            currencySuffix: currencySuffix,
            withCurrency: withCurrency,
            convertFromBase: convertFromBase,
            formatNumber: formatNumber,
            formatCurrency: formatCurrency,
            formatMoney: formatNumber,
            applyCurrencyLabels: applyCurrencyLabels,
            refresh: refreshActiveCurrency,
            isReady: function () { return ready; }
        };
        window.formatCurrency = formatCurrency;
        window.formatMoney = formatNumber;
        window.formatAmount = formatCurrency;
        window.money = formatCurrency;
        window.withCurrencyLabel = withCurrency;
    }

    function applyConfig(next) {
        config = Object.assign({}, DEFAULT_CONFIG, next || {});
        saveCachedConfig();
        publishGlobals();
        paintNavbar();
        scheduleLabelRefresh();
        ready = true;
        document.dispatchEvent(new CustomEvent('app-currency-changed', { detail: config }));
    }

    async function refreshActiveCurrency(force) {
        if (refreshPromise && !force) {
            return refreshPromise;
        }
        refreshPromise = fetch('/api/currencies/active', { credentials: 'same-origin' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load active currency');
                }
                return response.json();
            })
            .then(function (data) {
                applyConfig(data);
                return config;
            })
            .catch(function () {
                if (!config) {
                    applyConfig(DEFAULT_CONFIG);
                }
                return config;
            })
            .finally(function () {
                refreshPromise = null;
            });
        return refreshPromise;
    }

    loadCachedConfig();
    publishGlobals();
    paintNavbar();
    refreshActiveCurrency(false);

    document.addEventListener('DOMContentLoaded', function () {
        paintNavbar();
        scheduleLabelRefresh();
        observeDynamicLabels();
        if (!ready) {
            refreshActiveCurrency(false);
        }
    });

    document.addEventListener('app-currency-changed', scheduleLabelRefresh);

    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEY && event.newValue) {
            try {
                applyConfig(JSON.parse(event.newValue));
            } catch (error) {
                /* ignore */
            }
        }
    });

    window.refreshActiveCurrency = refreshActiveCurrency;
})();
