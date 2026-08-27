(function () {
    'use strict';

    var tableBody = document.getElementById('ublTableBody');
    var table = document.getElementById('ublTable');
    var searchInput = document.getElementById('ublSearchInput');
    var entriesSelect = document.getElementById('ublEntriesSelect');
    var showingInfo = document.getElementById('ublShowingInfo');
    var pagination = document.getElementById('ublPagination');
    var columnsBtn = document.getElementById('ublColumnsBtn');
    var columnsDropdown = document.getElementById('ublColumnsDropdown');

    var rows = [];
    var currentPage = 1;
    var pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    var tableFilter = '';
    var sortKey = '';
    var sortDir = 'asc';
    var hiddenColumns = {};

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatPrice(row) {
        if (row.bookPriceDisplay) {
            return row.bookPriceDisplay;
        }
        if (row.bookPrice == null || row.bookPrice === '') {
            return '';
        }
        var value = Number(row.bookPrice);
        if (Number.isNaN(value)) {
            return escapeHtml(row.bookPrice);
        }
        return '$' + value.toFixed(2);
    }

    function sortValue(row, key) {
        if (key === 'qty') {
            return Number(row.qty) || 0;
        }
        if (key === 'bookPrice') {
            return Number(row.bookPrice) || 0;
        }
        return row[key] == null ? '' : row[key];
    }

    function getFiltered() {
        var filtered = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            filtered = filtered.filter(function (row) {
                return [
                    row.bookTitle, row.publisher, row.author, row.subject,
                    row.rackNumber, row.qty, row.bookPriceDisplay, row.postDate
                ].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            filtered.sort(function (a, b) {
                var av = sortValue(a, sortKey);
                var bv = sortValue(b, sortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                var as = String(av).toLowerCase();
                var bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }

    function emptyStateHtml(message) {
        return '<tr class="ugm-empty-row"><td colspan="8">' + escapeHtml(message) + '</td></tr>';
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
        for (var i = 0; i < 8; i++) {
            table.classList.toggle('ubl-col-hidden-' + i, hiddenColumns[i] === true);
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
            return '<tr>'
                + '<td><span class="ubl-book-title">' + escapeHtml(row.bookTitle || '') + '</span></td>'
                + '<td>' + escapeHtml(row.publisher || '') + '</td>'
                + '<td>' + escapeHtml(row.author || '') + '</td>'
                + '<td>' + escapeHtml(row.subject || '') + '</td>'
                + '<td>' + escapeHtml(row.rackNumber || '') + '</td>'
                + '<td>' + escapeHtml(row.qty == null ? '' : row.qty) + '</td>'
                + '<td>' + escapeHtml(formatPrice(row)) + '</td>'
                + '<td>' + escapeHtml(row.postDate || '') + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
        applyColumnVisibility();
    }

    function headers() {
        return [
            'Book Title', 'Publisher', 'Author', 'Subject',
            'Rack Number', 'Qty', 'Book Price', 'Post Date'
        ];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.bookTitle || '',
                row.publisher || '',
                row.author || '',
                row.subject || '',
                row.rackNumber || '',
                row.qty == null ? '' : row.qty,
                formatPrice(row),
                row.postDate || ''
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
            downloadFile('book-list.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(data));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Book');
            window.XLSX.writeFile(workbook, 'book-list.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({
                head: [headers()],
                body: data
            });
            doc.save('book-list.pdf');
        }
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
                pageSize = parseInt(entriesSelect.value, 10) || 50;
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
        ['ublCopyBtn', 'ublExcelBtn', 'ublCsvBtn', 'ublPdfBtn', 'ublPrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'copy';
                if (id === 'ublExcelBtn') type = 'excel';
                else if (id === 'ublCsvBtn') type = 'csv';
                else if (id === 'ublPdfBtn') type = 'pdf';
                else if (id === 'ublPrintBtn') type = 'print';
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
            columnsDropdown.querySelectorAll('.ubl-column-toggle').forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                    applyColumnVisibility();
                });
            });
        }
    }

    async function loadBooks() {
        try {
            var response = await fetch('/api/user/book');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load books');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load books');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    bindEvents();
    loadBooks();
})();
