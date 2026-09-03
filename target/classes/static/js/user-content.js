(function () {
    'use strict';

    var tableBody = document.getElementById('uclTableBody');
    var table = document.getElementById('uclTable');
    var searchInput = document.getElementById('uclSearchInput');
    var entriesSelect = document.getElementById('uclEntriesSelect');
    var showingInfo = document.getElementById('uclShowingInfo');
    var pagination = document.getElementById('uclPagination');
    var columnsBtn = document.getElementById('uclColumnsBtn');
    var columnsDropdown = document.getElementById('uclColumnsDropdown');
    var modal = document.getElementById('uclModal');
    var overlay = document.getElementById('uclModalOverlay');
    var closeBtn = document.getElementById('uclModalClose');

    var rows = [];
    var currentPage = 1;
    var pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 100;
    var tableFilter = '';
    var sortKey = '';
    var sortDir = 'asc';
    var hiddenColumns = {};

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function sortValue(row, key) {
        return row[key] == null ? '' : row[key];
    }

    function getFiltered() {
        var filtered = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            filtered = filtered.filter(function (row) {
                return [
                    row.title, row.shareDate, row.validUntil, row.sharedBy
                ].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            filtered.sort(function (a, b) {
                var as = String(sortValue(a, sortKey)).toLowerCase();
                var bs = String(sortValue(b, sortKey)).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }

    function emptyStateHtml(message) {
        return '<tr class="ugm-empty-row"><td colspan="5">' + escapeHtml(message) + '</td></tr>';
    }

    function viewBtn(id) {
        return '<button type="button" class="uhw-view-btn" data-id="' + escapeHtml(String(id)) + '" title="View">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>'
            + '<circle cx="12" cy="12" r="3"></circle></svg></button>';
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        var html = '<button type="button" class="ugm-page-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (var page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="ugm-page-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="ugm-page-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function applyColumnVisibility() {
        if (!table) return;
        for (var i = 0; i < 5; i++) {
            table.classList.toggle('ucl-col-hidden-' + i, hiddenColumns[i] === true);
        }
    }

    function renderTable() {
        if (!tableBody) return;
        var filtered = getFiltered();
        var total = filtered.length;
        var totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = emptyStateHtml('No data available in table');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            applyColumnVisibility();
            return;
        }

        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td>' + escapeHtml(row.shareDate || '') + '</td>'
                + '<td>' + escapeHtml(row.validUntil || '') + '</td>'
                + '<td>' + escapeHtml(row.sharedBy || '') + '</td>'
                + '<td class="ugm-col-center action-cell">' + viewBtn(row.id) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
        applyColumnVisibility();
    }

    function headers() {
        return ['Title', 'Share Date', 'Valid Upto', 'Shared By'];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.title || '',
                row.shareDate || '',
                row.validUntil || '',
                row.sharedBy || ''
            ];
        });
    }

    function downloadFile(filename, content, mimeType) {
        var blob = new Blob([content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportTable(type) {
        var data = exportRows();
        if (!data.length) return;

        if (type === 'copy') {
            var tsv = [headers().join('\t')].concat(data.map(function (row) {
                return row.join('\t');
            })).join('\n');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(tsv).catch(function () {});
            }
            return;
        }
        if (type === 'print') {
            window.print();
            return;
        }
        if (type === 'csv') {
            var csv = [headers().join(',')].concat(data.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('content-list.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(data));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Content List');
            window.XLSX.writeFile(workbook, 'content-list.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({
                head: [headers()],
                body: data
            });
            doc.save('content-list.pdf');
        }
    }

    function fileUrl(file) {
        if (!file) return '';
        if (String(file.uploadType || '').toUpperCase() === 'YOUTUBE' && file.youtubeUrl) {
            return file.youtubeUrl;
        }
        return file.filePath || '';
    }

    function fileLabel(file) {
        return file.fileName || file.title || file.youtubeUrl || 'Open file';
    }

    function openModal(row) {
        if (!modal) return;
        document.getElementById('uclDetailTitle').textContent = row.title || '';
        document.getElementById('uclDetailShareDate').textContent = row.shareDate || '';
        document.getElementById('uclDetailValidUntil').textContent = row.validUntil || '';
        document.getElementById('uclDetailSharedBy').textContent = row.sharedBy || '-';
        document.getElementById('uclDetailDescription').textContent = row.description || '-';
        var filesEl = document.getElementById('uclDetailFiles');
        var files = Array.isArray(row.files) ? row.files : [];
        if (!files.length) {
            filesEl.textContent = 'No file attached';
        } else {
            filesEl.innerHTML = files.map(function (file) {
                var url = fileUrl(file);
                if (!url) {
                    return '<div>' + escapeHtml(fileLabel(file)) + '</div>';
                }
                return '<a class="ucl-file-link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener">'
                    + escapeHtml(fileLabel(file)) + '</a>';
            }).join('');
        }
        modal.hidden = false;
    }

    function closeModal() {
        if (modal) modal.hidden = true;
    }

    function bindEvents() {
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                tableFilter = searchInput.value;
                currentPage = 1;
                renderTable();
            });
        }
        if (entriesSelect) {
            entriesSelect.addEventListener('change', function () {
                pageSize = parseInt(entriesSelect.value, 10) || 100;
                currentPage = 1;
                renderTable();
            });
        }
        if (table) {
            table.querySelectorAll('th[data-sort]').forEach(function (th) {
                th.addEventListener('click', function () {
                    var key = th.getAttribute('data-sort');
                    if (sortKey === key) {
                        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortKey = key;
                        sortDir = 'asc';
                    }
                    renderTable();
                });
            });
            table.addEventListener('click', function (event) {
                var btn = event.target.closest('.uhw-view-btn');
                if (!btn) return;
                var id = Number(btn.getAttribute('data-id'));
                var row = rows.find(function (item) { return Number(item.id) === id; });
                if (row) openModal(row);
            });
        }
        if (pagination) {
            pagination.addEventListener('click', function (event) {
                var btn = event.target.closest('.ugm-page-btn');
                if (!btn || btn.disabled) return;
                if (btn.dataset.nav === 'prev') currentPage -= 1;
                else if (btn.dataset.nav === 'next') currentPage += 1;
                else if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
                renderTable();
            });
        }
        ['uclCopyBtn', 'uclExcelBtn', 'uclCsvBtn', 'uclPdfBtn', 'uclPrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'copy';
                if (id === 'uclExcelBtn') type = 'excel';
                else if (id === 'uclCsvBtn') type = 'csv';
                else if (id === 'uclPdfBtn') type = 'pdf';
                else if (id === 'uclPrintBtn') type = 'print';
                exportTable(type);
            });
        });
        if (columnsBtn && columnsDropdown) {
            columnsBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                columnsDropdown.classList.toggle('active');
            });
            document.addEventListener('click', function (event) {
                if (!columnsDropdown.contains(event.target) && event.target !== columnsBtn) {
                    columnsDropdown.classList.remove('active');
                }
            });
            columnsDropdown.querySelectorAll('.ucl-column-toggle').forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                    applyColumnVisibility();
                });
            });
        }
        if (overlay) overlay.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeModal();
        });
    }

    async function loadContents() {
        try {
            var response = await fetch('/api/user/content');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load content list');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load content list');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    bindEvents();
    loadContents();
})();
