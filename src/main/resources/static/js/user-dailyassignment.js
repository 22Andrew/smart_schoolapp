(function () {
    'use strict';

    var tableBody = document.getElementById('udaTableBody');
    var table = document.getElementById('udaTable');
    var searchInput = document.getElementById('udaSearchInput');
    var entriesSelect = document.getElementById('udaEntriesSelect');
    var showingInfo = document.getElementById('udaShowingInfo');
    var pagination = document.getElementById('udaPagination');
    var columnsBtn = document.getElementById('udaColumnsBtn');
    var columnsDropdown = document.getElementById('udaColumnsDropdown');

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
        return row[key] || '';
    }

    function getFiltered() {
        var filtered = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            filtered = filtered.filter(function (row) {
                return [
                    row.subject, row.title, row.assignmentDate, row.submissionDate,
                    row.evaluationDate, row.evaluatedBy
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
            return;
        }

        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.subject || '') + '</td>'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td>' + escapeHtml(row.assignmentDate || '') + '</td>'
                + '<td>' + escapeHtml(row.submissionDate || '') + '</td>'
                + '<td>' + escapeHtml(row.evaluationDate || '') + '</td>'
                + '<td>' + escapeHtml(row.evaluatedBy || '') + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
        applyColumnVisibility();
    }

    function applyColumnVisibility() {
        if (!table) return;
        for (var i = 0; i < 6; i++) {
            table.classList.toggle('ugm-col-hidden-' + i, hiddenColumns[i] === true);
        }
    }

    function headers() {
        return ['Subject', 'Title', 'Date', 'Submission Date', 'Evaluation Date', 'Evaluated By'];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.subject || '',
                row.title || '',
                row.assignmentDate || '',
                row.submissionDate || '',
                row.evaluationDate || '',
                row.evaluatedBy || ''
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
            downloadFile('daily-assignment.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(data));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Assignment');
            window.XLSX.writeFile(workbook, 'daily-assignment.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({
                head: [headers()],
                body: data
            });
            doc.save('daily-assignment.pdf');
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
        ['udaCopyBtn', 'udaExcelBtn', 'udaCsvBtn', 'udaPdfBtn', 'udaPrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'copy';
                if (id === 'udaExcelBtn') type = 'excel';
                else if (id === 'udaCsvBtn') type = 'csv';
                else if (id === 'udaPdfBtn') type = 'pdf';
                else if (id === 'udaPrintBtn') type = 'print';
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
            columnsDropdown.querySelectorAll('.uda-column-toggle').forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                    applyColumnVisibility();
                });
            });
        }
    }

    async function loadAssignments() {
        try {
            var response = await fetch('/api/user/dailyassignment');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load daily assignments');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load daily assignments');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    bindEvents();
    loadAssignments();
})();
