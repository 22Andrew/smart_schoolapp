(function () {
    'use strict';

    var tableBody = document.getElementById('ubiTableBody');
    var table = document.getElementById('ubiTable');
    var searchInput = document.getElementById('ubiSearchInput');
    var entriesSelect = document.getElementById('ubiEntriesSelect');
    var showingInfo = document.getElementById('ubiShowingInfo');
    var pagination = document.getElementById('ubiPagination');
    var columnsBtn = document.getElementById('ubiColumnsBtn');
    var columnsDropdown = document.getElementById('ubiColumnsDropdown');

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

    function sortValue(row, key) {
        return row[key] == null ? '' : row[key];
    }

    function getFiltered() {
        var filtered = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            filtered = filtered.filter(function (row) {
                return [
                    row.bookTitle, row.bookNumber, row.author,
                    row.issueDate, row.dueReturnDate, row.returnDate
                ].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            filtered.sort(function (a, b) {
                var av = sortValue(a, sortKey);
                var bv = sortValue(b, sortKey);
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
        return '<tr class="ugm-empty-row"><td colspan="6">' + escapeHtml(message) + '</td></tr>';
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
        for (var i = 0; i < 6; i++) {
            table.classList.toggle('ubi-col-hidden-' + i, hiddenColumns[i] === true);
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
            var rowClass = row.returned ? ' class="ubi-row-returned"' : '';
            return '<tr' + rowClass + '>'
                + '<td><span class="ubi-book-title">' + escapeHtml(row.bookTitle || '') + '</span></td>'
                + '<td>' + escapeHtml(row.bookNumber || '') + '</td>'
                + '<td>' + escapeHtml(row.author || '') + '</td>'
                + '<td>' + escapeHtml(row.issueDate || '') + '</td>'
                + '<td>' + escapeHtml(row.dueReturnDate || '') + '</td>'
                + '<td>' + escapeHtml(row.returnDate || '') + '</td>'
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
            'Book Title', 'Book Number', 'Author',
            'Issue Date', 'Due Return Date', 'Return Date'
        ];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.bookTitle || '',
                row.bookNumber || '',
                row.author || '',
                row.issueDate || '',
                row.dueReturnDate || '',
                row.returnDate || ''
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
            downloadFile('book-issued.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(data));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Book Issued');
            window.XLSX.writeFile(workbook, 'book-issued.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({
                head: [headers()],
                body: data
            });
            doc.save('book-issued.pdf');
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
        ['ubiCopyBtn', 'ubiExcelBtn', 'ubiCsvBtn', 'ubiPdfBtn', 'ubiPrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'copy';
                if (id === 'ubiExcelBtn') type = 'excel';
                else if (id === 'ubiCsvBtn') type = 'csv';
                else if (id === 'ubiPdfBtn') type = 'pdf';
                else if (id === 'ubiPrintBtn') type = 'print';
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
            columnsDropdown.querySelectorAll('.ubi-column-toggle').forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                    applyColumnVisibility();
                });
            });
        }
    }

    async function loadIssuedBooks() {
        try {
            var response = await fetch('/api/user/book/issue');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load issued books');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load issued books');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    bindEvents();
    loadIssuedBooks();
})();
