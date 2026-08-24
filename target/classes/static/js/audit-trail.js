document.addEventListener('DOMContentLoaded', function () {
    const tableHead = document.getElementById('auditTrailTableHead');
    const tableBody = document.getElementById('auditTrailTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const clearAuditBtn = document.getElementById('clearAuditBtn');

    let rows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = 'dateTime';
    let sortDir = 'desc';

    const columns = [
        { key: 'message', label: 'Message' },
        { key: 'username', label: 'Users' },
        { key: 'ipAddress', label: 'IP Address' },
        { key: 'action', label: 'Action' },
        { key: 'platform', label: 'Platform' },
        { key: 'agent', label: 'Agent' },
        { key: 'dateTime', label: 'Date Time' }
    ];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function renderHead() {
        if (!tableHead) return;
        tableHead.innerHTML = '<tr>' + columns.map(function (col) {
            return '<th data-sort="' + escapeHtml(col.key) + '">'
                + escapeHtml(col.label)
                + ' <span class="sort-icon">↑↓</span></th>';
        }).join('') + '</tr>';

        tableHead.querySelectorAll('th[data-sort]').forEach(function (th) {
            th.addEventListener('click', function () {
                const key = th.getAttribute('data-sort');
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

    function cellValue(row, col) {
        const value = row[col.key];
        return value == null ? '' : value;
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return columns.map(function (col) {
                    return cellValue(row, col);
                }).join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            list.sort(function (a, b) {
                const av = a[sortKey];
                const bv = b[sortKey];
                if (av == null && bv == null) return 0;
                if (av == null) return 1;
                if (bv == null) return -1;
                const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return list;
    }

    function renderPagination(el, page, totalPages) {
        if (!el) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (page <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let i = 1; i <= totalPages; i += 1) {
            html += '<button type="button" class="pagination-btn'
                + (i === page ? ' active' : '')
                + '" data-nav-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (page >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        el.innerHTML = html;
    }

    function renderEmptyState() {
        return '<tr class="empty-row"><td colspan="7">'
            + '<div class="empty-state">'
            + '<p class="empty-message">No data available in table</p>'
            + '<div class="empty-illustration" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<p class="empty-hint">← Add new record or search with different criteria.</p>'
            + '</div></td></tr>';
    }

    function renderTable() {
        if (!tableBody) return;
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        if (!pageRows.length) {
            tableBody.innerHTML = renderEmptyState();
        } else {
            tableBody.innerHTML = pageRows.map(function (row) {
                const cells = columns.map(function (col) {
                    return '<td>' + escapeHtml(String(cellValue(row, col))) + '</td>';
                }).join('');
                return '<tr>' + cells + '</tr>';
            }).join('');
        }

        if (showingInfo) {
            showingInfo.textContent = total
                ? 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries'
                : 'Showing 0 to 0 of 0 entries';
        }
        renderPagination(pagination, currentPage, totalPages);
    }

    async function loadRecords() {
        const response = await fetch('/api/audit-trail');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load audit trail records');
        }
        rows = await response.json();
        currentPage = 1;
        renderTable();
    }

    async function clearRecords() {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Clear Audit Trail?',
            text: 'This will permanently delete all audit trail records.',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#8b5cf6'
        });
        if (!result.isConfirmed) return;

        const response = await fetch('/api/audit-trail', { method: 'DELETE' });
        const payload = await response.json().catch(function () { return {}; });
        if (!response.ok || !payload.success) {
            throw new Error(payload.message || 'Failed to clear audit trail records');
        }

        rows = [];
        renderTable();
        Swal.fire({
            icon: 'success',
            title: 'Cleared',
            text: payload.message || 'Audit trail records cleared successfully.',
            timer: 1600,
            showConfirmButton: false
        });
    }

    function exportRows(format) {
        const filtered = getFilteredRows();
        if (!filtered.length) {
            showError('No data to export.');
            return;
        }
        const headers = columns.map(function (col) { return col.label; });
        const data = filtered.map(function (row) {
            return columns.map(function (col) {
                return cellValue(row, col);
            });
        });

        if (format === 'copy') {
            const text = [headers.join('\t')].concat(data.map(function (row) {
                return row.join('\t');
            })).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied', timer: 1200, showConfirmButton: false });
            }).catch(function () {
                showError('Unable to copy data.');
            });
            return;
        }

        if (format === 'csv') {
            const csv = [headers.join(',')].concat(data.map(function (row) {
                return row.map(function (value) {
                    const text = String(value == null ? '' : value).replace(/"/g, '""');
                    return '"' + text + '"';
                }).join(',');
            })).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'audit-trail.csv';
            link.click();
            URL.revokeObjectURL(link.href);
            return;
        }

        if (format === 'excel' && window.XLSX) {
            const sheetData = [headers].concat(data);
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Trail');
            XLSX.writeFile(workbook, 'audit-trail.xlsx');
            return;
        }

        if (format === 'print' || format === 'pdf') {
            window.print();
        }
    }

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

    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            else if (btn.dataset.navPage) currentPage = parseInt(btn.dataset.navPage, 10);
            renderTable();
        });
    }

    if (clearAuditBtn) {
        clearAuditBtn.addEventListener('click', function () {
            clearRecords().catch(function (error) {
                showError(error.message);
            });
        });
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () { exportRows('copy'); });
    document.getElementById('excelBtn')?.addEventListener('click', function () { exportRows('excel'); });
    document.getElementById('csvBtn')?.addEventListener('click', function () { exportRows('csv'); });
    document.getElementById('pdfBtn')?.addEventListener('click', function () { exportRows('pdf'); });
    document.getElementById('printBtn')?.addEventListener('click', function () { exportRows('print'); });

    renderHead();
    loadRecords().catch(function (error) {
        showError(error.message);
    });
});
