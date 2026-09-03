/**
 * App-wide list toolbar: page sizes 10/20/50/75/100, column visibility,
 * and overflow so export/column icons stay reachable.
 */
(function () {
    var PAGE_SIZES = [10, 20, 50, 75, 100];
    var colvisSeq = 0;

    function toInt(value) {
        var n = parseInt(value, 10);
        return isNaN(n) ? null : n;
    }

    function mapToAllowedSize(value) {
        var n = toInt(value);
        if (n == null) return 10;
        if (PAGE_SIZES.indexOf(n) !== -1) return n;
        if (n === 25) return 20;
        if (n > 100) return 100;
        var closest = PAGE_SIZES[0];
        var diff = Math.abs(n - closest);
        PAGE_SIZES.forEach(function (size) {
            var nextDiff = Math.abs(n - size);
            if (nextDiff < diff) {
                closest = size;
                diff = nextDiff;
            }
        });
        return closest;
    }

    function isPageSizeSelect(select) {
        if (!select || select.tagName !== 'SELECT') return false;
        if (select.dataset.appPageSizes === '1') return true;
        if (select.multiple) return false;
        var className = select.className || '';
        var id = select.id || '';
        if (/(^|\s)(entries-select|staff-entries-select|page-size-select)(\s|$)/.test(className)) return true;
        if (/entries/i.test(id) || /pageSize/i.test(id) || id === 'pageSizeSelect') return true;
        if (!select.closest('.table-actions, .table-controls, [class*="table-controls"], .table-footer')) return false;
        var options = select.options;
        if (!options || options.length < 2 || options.length > 8) return false;
        var numeric = true;
        var values = [];
        for (var i = 0; i < options.length; i++) {
            var raw = String(options[i].value || '').trim();
            if (!/^\d+$/.test(raw)) {
                numeric = false;
                break;
            }
            values.push(parseInt(raw, 10));
        }
        if (!numeric) return false;
        return values.every(function (n) { return n >= 5 && n <= 1000; });
    }

    function normalizePageSizeSelect(select) {
        if (!select || !isPageSizeSelect(select)) return;
        var current = mapToAllowedSize(select.value);
        var html = PAGE_SIZES.map(function (size) {
            return '<option value="' + size + '"' + (size === current ? ' selected' : '') + '>' + size + '</option>';
        }).join('');
        if (select.dataset.appPageSizes === '1' && select.options.length === PAGE_SIZES.length) {
            var same = true;
            for (var i = 0; i < PAGE_SIZES.length; i++) {
                if (String(select.options[i].value) !== String(PAGE_SIZES[i])) {
                    same = false;
                    break;
                }
            }
            if (same) {
                if (String(select.value) !== String(current)) select.value = String(current);
                return;
            }
        }
        var previous = select.value;
        select.innerHTML = html;
        select.value = String(current);
        select.dataset.appPageSizes = '1';
        if (String(previous) !== String(current)) {
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    function normalizeAllPageSizeSelects(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var selects = scope.querySelectorAll('select');
        for (var i = 0; i < selects.length; i++) {
            normalizePageSizeSelect(selects[i]);
        }
        if (root && root.tagName === 'SELECT') normalizePageSizeSelect(root);
    }

    function headerLabel(th, index) {
        var clone = th.cloneNode(true);
        clone.querySelectorAll('.sort-icon, svg, button, input').forEach(function (el) {
            el.remove();
        });
        var text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
        return text || ('Column ' + (index + 1));
    }

    function findRelatedTable(toolbar) {
        var controls = toolbar.closest('.table-controls, [class*="table-controls"]') || toolbar;
        var parent = controls.parentElement;
        var next = controls.nextElementSibling;
        while (next) {
            if (next.tagName === 'TABLE') return next;
            if (next.querySelector) {
                var nested = next.querySelector('table');
                if (nested) return nested;
            }
            next = next.nextElementSibling;
        }
        if (parent) {
            var tables = parent.querySelectorAll('table');
            for (var i = 0; i < tables.length; i++) {
                if (controls.compareDocumentPosition(tables[i]) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    return tables[i];
                }
            }
            if (tables.length === 1) return tables[0];
        }
        var panel = toolbar.closest(
            '.table-section, .house-list-panel, .list-panel, [class*="-list-panel"], [class*="-panel"], main, .main-content'
        ) || document;
        return panel.querySelector('table.data-table, table');
    }

    function applyColumnState(table, visible) {
        if (!table || !visible) return;
        var rows = table.querySelectorAll('tr');
        for (var r = 0; r < rows.length; r++) {
            var cells = rows[r].children;
            for (var c = 0; c < cells.length && c < visible.length; c++) {
                if (cells[c].hasAttribute('colspan')) continue;
                cells[c].style.display = visible[c] === false ? 'none' : '';
            }
        }
    }

    function readVisibility(dropdown, columnCount) {
        var visible = [];
        var toggles = dropdown.querySelectorAll('input[data-column]');
        for (var i = 0; i < columnCount; i++) visible[i] = true;
        for (var t = 0; t < toggles.length; t++) {
            var index = toInt(toggles[t].getAttribute('data-column'));
            if (index != null) visible[index] = toggles[t].checked;
        }
        return visible;
    }

    function rebuildDropdown(dropdown, table) {
        if (!table) return;
        var headers = table.querySelectorAll('thead th');
        if (!headers.length) headers = table.querySelectorAll('tr:first-child th, tr:first-child td');
        var content = dropdown.querySelector('.dropdown-content');
        if (!content || !headers.length) return;
        var previous = {};
        content.querySelectorAll('input[data-column]').forEach(function (input) {
            previous[input.getAttribute('data-column')] = input.checked;
        });
        var html = '';
        for (var i = 0; i < headers.length; i++) {
            var checked = previous[String(i)];
            if (checked === undefined) checked = true;
            html += '<label class="column-toggle-item">'
                + '<input type="checkbox" class="column-toggle" data-column="' + i + '"' + (checked ? ' checked' : '') + '>'
                + '<span>' + headerLabel(headers[i], i).replace(/</g, '&lt;') + '</span>'
                + '</label>';
        }
        content.innerHTML = html;
        applyColumnState(table, readVisibility(dropdown, headers.length));
    }

    function hasColumnVisibility(toolbar) {
        return !!(
            toolbar.querySelector(
                '.column-visibility-dropdown, .column-visibility-wrap, [title="Column Visibility"], [title="Columns"], [id*="columnVisibility"], [id*="ColumnBtn"], [id*="columnBtn"]'
            )
        );
    }

    function closeAllColumnDropdowns(except) {
        document.querySelectorAll('.column-visibility-dropdown.active, .app-colvis-dropdown.active').forEach(function (el) {
            if (el !== except) el.classList.remove('active');
        });
    }

    function enhanceToolbar(toolbar) {
        if (!toolbar || toolbar.dataset.appColvis === '1') return;
        if (hasColumnVisibility(toolbar)) {
            toolbar.dataset.appColvis = '1';
            return;
        }
        var table = findRelatedTable(toolbar);
        if (!table) return;

        colvisSeq += 1;
        var wrap = document.createElement('div');
        wrap.className = 'column-visibility-wrap app-colvis-wrap';
        wrap.innerHTML = ''
            + '<button type="button" class="icon-action-btn app-colvis-btn" title="Column Visibility" aria-label="Column Visibility">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<rect x="3" y="3" width="7" height="7"></rect>'
            + '<rect x="14" y="3" width="7" height="7"></rect>'
            + '<rect x="14" y="14" width="7" height="7"></rect>'
            + '<rect x="3" y="14" width="7" height="7"></rect>'
            + '</svg></button>'
            + '<div class="column-visibility-dropdown app-colvis-dropdown">'
            + '<div class="dropdown-header"><span>Toggle Columns</span></div>'
            + '<div class="dropdown-content"></div>'
            + '</div>';

        toolbar.dataset.appColvis = '1';
        toolbar.classList.add('has-app-colvis');
        toolbar.appendChild(wrap);

        var button = wrap.querySelector('.app-colvis-btn');
        var dropdown = wrap.querySelector('.app-colvis-dropdown');
        rebuildDropdown(dropdown, table);

        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var opening = !dropdown.classList.contains('active');
            closeAllColumnDropdowns(dropdown);
            if (opening) {
                rebuildDropdown(dropdown, findRelatedTable(toolbar) || table);
                dropdown.classList.add('active');
            } else {
                dropdown.classList.remove('active');
            }
        });
        dropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        dropdown.addEventListener('change', function (e) {
            var input = e.target.closest('input[data-column]');
            if (!input) return;
            var currentTable = findRelatedTable(toolbar) || table;
            var count = currentTable.querySelectorAll('thead th').length
                || currentTable.querySelectorAll('tr:first-child th, tr:first-child td').length;
            applyColumnState(currentTable, readVisibility(dropdown, count));
        });

        var observer = new MutationObserver(function () {
            var currentTable = findRelatedTable(toolbar) || table;
            applyColumnState(currentTable, readVisibility(dropdown,
                currentTable.querySelectorAll('thead th').length
                || currentTable.querySelectorAll('tr:first-child th, tr:first-child td').length));
        });
        observer.observe(table, { childList: true, subtree: true });
    }

    function enhanceAllToolbars(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var nodes = [];
        scope.querySelectorAll('.table-actions, .entries-select, .staff-entries-select, .page-size-select').forEach(function (el) {
            var toolbar = el.classList && el.classList.contains('table-actions')
                ? el
                : (el.closest('.table-actions') || el.parentElement);
            if (toolbar && nodes.indexOf(toolbar) === -1) nodes.push(toolbar);
        });
        if (root && root.classList && root.classList.contains('table-actions') && nodes.indexOf(root) === -1) {
            nodes.push(root);
        }
        nodes.forEach(enhanceToolbar);
    }

    function onNodeAdded(node) {
        if (!node || node.nodeType !== 1) return;
        if (node.tagName === 'SELECT') normalizePageSizeSelect(node);
        if (node.querySelectorAll) normalizeAllPageSizeSelects(node);
        if (node.classList && node.classList.contains('table-actions')) enhanceToolbar(node);
        if (node.querySelectorAll) enhanceAllToolbars(node);
    }

    document.addEventListener('click', function () {
        closeAllColumnDropdowns();
    });

    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var added = mutations[i].addedNodes;
            for (var n = 0; n < added.length; n++) onNodeAdded(added[n]);
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    function boot() {
        normalizeAllPageSizeSelects(document);
        enhanceAllToolbars(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
