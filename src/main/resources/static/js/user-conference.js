(function () {
    'use strict';

    var tableBody = document.getElementById('ucfTableBody');
    var table = document.getElementById('ucfLiveClassesTable');
    var searchInput = document.getElementById('ucfSearchInput');
    var entriesSelect = document.getElementById('ucfEntriesSelect');
    var showingInfo = document.getElementById('ucfShowingInfo');
    var pagination = document.getElementById('ucfPagination');
    var columnsBtn = document.getElementById('ucfColumnsBtn');
    var columnsDropdown = document.getElementById('ucfColumnsDropdown');

    var liveClasses = [];
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

    function statusClass(status) {
        var value = String(status || '').toLowerCase();
        if (value === 'started' || value === 'finished' || value === 'completed') return 'status-finished';
        if (value === 'cancelled') return 'status-cancelled';
        return '';
    }

    function sortValue(row, key) {
        switch (key) {
            case 'classTitle': return row.classTitle || '';
            case 'dateTime': return row.dateTime || '';
            case 'durationMinutes': return row.durationMinutes || 0;
            case 'classLabel': return row.classLabel || '';
            case 'classHost': return row.classHost || '';
            case 'description': return row.description || '';
            case 'status': return row.status || '';
            default: return '';
        }
    }

    function getFiltered() {
        var rows = liveClasses.slice();
        var filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                var haystack = [
                    row.classTitle,
                    row.dateTime,
                    row.durationMinutes,
                    row.classLabel,
                    row.classHost,
                    row.description,
                    row.status
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
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

        return rows;
    }

    function emptyStateHtml(message) {
        return '<tr class="ugm-empty-row"><td colspan="8">' + escapeHtml(message) + '</td></tr>';
    }

    function joinButtonHtml(row) {
        var id = escapeHtml(String(row.id));
        return ''
            + '<button type="button" class="ugm-join-btn" data-join="' + id + '" title="Join">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polygon points="23 7 16 12 23 17 23 7"></polygon>'
            + '<rect x="1" y="5" width="15" height="14" rx="2"></rect>'
            + '</svg></button>';
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
        var pageRows = filtered.slice(start, end);

        tableBody.innerHTML = pageRows.map(function (row) {
            var status = row.status || 'Awaited';
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.classTitle || '') + '</td>'
                + '<td>' + escapeHtml(row.dateTime || '') + '</td>'
                + '<td class="ugm-col-center">' + escapeHtml(row.durationMinutes == null ? '' : row.durationMinutes) + '</td>'
                + '<td>' + escapeHtml(row.classLabel || '') + '</td>'
                + '<td>' + escapeHtml(row.classHost || '') + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td class="ugm-col-center"><span class="ugm-status ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
                + '<td class="ugm-col-center action-cell">' + joinButtonHtml(row) + '</td>'
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
        for (var i = 0; i < 8; i++) {
            table.classList.toggle('ugm-col-hidden-' + i, hiddenColumns[i] === true);
        }
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.classTitle || '',
                row.dateTime || '',
                row.durationMinutes == null ? '' : row.durationMinutes,
                row.classLabel || '',
                row.classHost || '',
                row.description || '',
                row.status || ''
            ];
        });
    }

    function headers() {
        return ['Class Title', 'Date Time', 'Class Duration (Minutes)', 'Class', 'Class Host', 'Description', 'Status'];
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
        var rows = exportRows();
        if (!rows.length) {
            return;
        }

        if (type === 'copy') {
            var tsv = [headers().join('\t')].concat(rows.map(function (row) {
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
            var csv = [headers().join(',')].concat(rows.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('live-classes.csv', csv, 'text/csv');
            return;
        }

        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(rows));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Classes');
            window.XLSX.writeFile(workbook, 'live-classes.xlsx');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({
                head: [headers()],
                body: rows
            });
            doc.save('live-classes.pdf');
        }
    }

    function joinClass(id) {
        var row = liveClasses.find(function (item) {
            return String(item.id) === String(id);
        });
        if (row && row.meetingUrl) {
            window.open(row.meetingUrl, '_blank');
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

        if (tableBody) {
            tableBody.addEventListener('click', function (event) {
                var joinBtn = event.target.closest('[data-join]');
                if (joinBtn) {
                    joinClass(joinBtn.getAttribute('data-join'));
                }
            });
        }

        ['ucfCopyBtn', 'ucfExcelBtn', 'ucfCsvBtn', 'ucfPdfBtn', 'ucfPrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'copy';
                if (id === 'ucfExcelBtn') type = 'excel';
                else if (id === 'ucfCsvBtn') type = 'csv';
                else if (id === 'ucfPdfBtn') type = 'pdf';
                else if (id === 'ucfPrintBtn') type = 'print';
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
            columnsDropdown.querySelectorAll('.ucf-column-toggle').forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                    applyColumnVisibility();
                });
            });
        }
    }

    async function loadLiveClasses() {
        try {
            var response = await fetch('/api/user/conference');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load live classes');
            }
            var data = await response.json();
            liveClasses = data.liveClasses || [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load live classes');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    bindEvents();
    loadLiveClasses();
})();
