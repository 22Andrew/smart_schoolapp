(function () {
    'use strict';

    const PLACEHOLDER_OPTION_RE = /^(select(\b|$).*)/i;
    const GROUP_SELECTOR = [
        '.form-group',
        '.form-group-modal',
        '.schsettings-field',
        '.form-field',
        '.field-group',
        '.form-col',
        '.filter-item',
        '.criteria-field',
        '[class*="form-group"]'
    ].join(',');

    function isEntriesSelect(select) {
        const className = select.className || '';
        const id = (select.id || '').toLowerCase();
        return /\b(entries-select|ugm-entries-select|staff-entries-select)\b/.test(className)
            || id.indexOf('entries') !== -1;
    }

    function isPlaceholderOption(option) {
        if (!option || option.value !== '') {
            return false;
        }
        if (option.dataset.placeholderOption === 'true') {
            return true;
        }
        const text = (option.textContent || '').trim();
        return text === '' || PLACEHOLDER_OPTION_RE.test(text);
    }

    function extractLabelText(labelEl) {
        if (!labelEl) {
            return '';
        }
        const clone = labelEl.cloneNode(true);
        clone.querySelectorAll('select, input, textarea, button, .required, .sr-only, svg').forEach(function (node) {
            node.remove();
        });
        return (clone.textContent || '')
            .replace(/\*/g, '')
            .replace(/[:：]\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function labelFromName(raw) {
        if (!raw) {
            return '';
        }
        return String(raw)
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_]+/g, ' ')
            .replace(/\b(select|filter|dropdown|combo|id)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function findLabelText(select) {
        if (select.id) {
            try {
                const escaped = (window.CSS && CSS.escape) ? CSS.escape(select.id) : select.id.replace(/"/g, '\\"');
                const byFor = document.querySelector('label[for="' + escaped + '"]');
                const fromFor = extractLabelText(byFor);
                if (fromFor) {
                    return fromFor;
                }
            } catch (error) {
                /* ignore invalid selectors */
            }
        }

        const wrapping = select.closest('label');
        const fromWrap = extractLabelText(wrapping);
        if (fromWrap) {
            return fromWrap;
        }

        const group = select.closest(GROUP_SELECTOR);
        if (group) {
            const groupLabel = group.querySelector('label');
            const fromGroup = extractLabelText(groupLabel);
            if (fromGroup) {
                return fromGroup;
            }
        }

        const previous = select.previousElementSibling;
        if (previous && (previous.tagName === 'LABEL' || previous.classList.contains('form-label') || previous.classList.contains('field-label'))) {
            const fromPrev = extractLabelText(previous);
            if (fromPrev) {
                return fromPrev;
            }
        }

        const aria = (select.getAttribute('aria-label') || '').trim();
        if (aria && !/^rows per page$/i.test(aria)) {
            return aria.replace(/^(select(\s+the)?\s+)/i, '').trim();
        }

        return labelFromName(select.getAttribute('name') || select.id || '');
    }

    function buildPlaceholder(labelText) {
        if (!labelText) {
            return 'Select';
        }
        const name = labelText.replace(/^(select(\s+the)?\s+)/i, '').trim();
        if (!name) {
            return 'Select';
        }
        return 'Select the ' + name;
    }

    function updatePlaceholderState(select) {
        if (!select || select.tagName !== 'SELECT') {
            return;
        }
        select.classList.toggle('is-placeholder', !select.value);
    }

    function applyPlaceholder(select) {
        if (!select || select.tagName !== 'SELECT' || select.multiple || select.size > 1 || isEntriesSelect(select)) {
            return;
        }
        const first = select.options[0];
        if (first && isPlaceholderOption(first)) {
            const placeholder = buildPlaceholder(findLabelText(select));
            if ((first.textContent || '').trim() !== placeholder) {
                first.textContent = placeholder;
            }
            first.hidden = true;
            first.dataset.placeholderOption = 'true';
        }
        updatePlaceholderState(select);
    }

    function enhance(root) {
        if (!root) {
            return;
        }
        if (root.tagName === 'SELECT') {
            applyPlaceholder(root);
            return;
        }
        if (root.querySelectorAll) {
            root.querySelectorAll('select').forEach(applyPlaceholder);
        }
    }

    function hookValueSetter() {
        const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
        if (!descriptor || !descriptor.set || descriptor.configurable === false) {
            return;
        }
        Object.defineProperty(HTMLSelectElement.prototype, 'value', {
            get: descriptor.get,
            set: function (value) {
                descriptor.set.call(this, value);
                updatePlaceholderState(this);
            },
            configurable: true,
            enumerable: descriptor.enumerable
        });
    }

    function hookInnerHTML() {
        const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        if (!descriptor || !descriptor.set || descriptor.configurable === false) {
            return;
        }
        Object.defineProperty(HTMLSelectElement.prototype, 'innerHTML', {
            get: descriptor.get,
            set: function (html) {
                descriptor.set.call(this, html);
                applyPlaceholder(this);
            },
            configurable: true,
            enumerable: descriptor.enumerable
        });
    }

    function init() {
        hookValueSetter();
        hookInnerHTML();
        enhance(document);
        document.addEventListener('change', function (event) {
            if (event.target && event.target.tagName === 'SELECT') {
                updatePlaceholderState(event.target);
            }
        }, true);

        if (!document.body) {
            return;
        }
        new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.target && mutation.target.tagName === 'SELECT') {
                    applyPlaceholder(mutation.target);
                }
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) {
                        return;
                    }
                    if (node.tagName === 'OPTION') {
                        applyPlaceholder(node.parentElement);
                        return;
                    }
                    enhance(node);
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
        window.addEventListener('load', function () {
            enhance(document);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
