document.addEventListener('DOMContentLoaded', function () {
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const searchBtn = document.getElementById('searchBtn');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');

    const dailyCollectionModal = document.getElementById('dailyCollectionModal');
    const collectionDateLabel = document.getElementById('collectionDateLabel');
    const detailTableBody = document.getElementById('detailTableBody');
    const grandTotalCell = document.getElementById('grandTotalCell');
    const modalSearchInput = document.getElementById('modalSearchInput');
    const modalEntriesSelect = document.getElementById('modalEntriesSelect');
    const modalShowingInfo = document.getElementById('modalShowingInfo');
    const modalPagination = document.getElementById('modalPagination');

    let rows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    let modalRows = [];
    let modalPage = 1;
    let modalPageSize = parseInt(modalEntriesSelect && modalEntriesSelect.value, 10) || 10;
    let modalFilter = '';
    let modalSortKey = '';
    let modalSortDir = 'asc';
    let modalGrandTotal = 0;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        if (window.AppCurrency) return window.AppCurrency.formatCurrency(value);
        return '$' + Number(value || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function isoToInputDate(iso) {
        return iso || '';
    }

    function inputDateToDisplay(iso) {
        if (!iso) return '';
        const parts = iso.split('-');
        if (parts.length !== 3) return iso;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function setDefaultDates() {
        if (dateFrom) dateFrom.value = '2026-03-08';
        if (dateTo) dateTo.value = '2026-08-23';
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                const haystack = [row.displayDate, row.totalTransactions, row.amount].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            list.sort(function (a, b) {
                let av = a[sortKey];
                let bv = b[sortKey];
                if (sortKey === 'amount' || sortKey === 'totalTransactions') {
                    av = Number(av || 0);
                    bv = Number(bv || 0);
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                av = String(av || '').toLowerCase();
                bv = String(bv || '').toLowerCase();
                if (av < bv) return sortDir === 'asc' ? -1 : 1;
                if (av > bv) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function eyeButtonHtml(date) {
        return ''
            + '<button type="button" class="btn-action btn-view" data-date="' + escapeHtml(date) + '" title="View">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>'
            + '<circle cx="12" cy="12" r="3"></circle>'
            + '</svg></button>';
    }

    function renderPagination(container, current, totalPages, total, onNavigate) {
        if (!container) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (current <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === current ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (current >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        container.innerHTML = html;
        container.onclick = function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const nav = btn.getAttribute('data-nav');
            if (nav === 'prev') onNavigate(Math.max(1, current - 1));
            else if (nav === 'next') onNavigate(current + 1);
            else if (btn.dataset.page) onNavigate(parseInt(btn.dataset.page, 10));
        };
    }

    function renderTable() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = ''
                + '<tr class="empty-row"><td colspan="4">'
                + '<div class="empty-state"><p class="empty-message">No data available in table</p>'
                + '<p class="empty-hint">Select date range and click Search.</p></div>'
                + '</td></tr>';
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(pagination, 1, 1, 0, function () {});
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.displayDate) + '</td>'
                + '<td>' + escapeHtml(String(row.totalTransactions || 0)) + '</td>'
                + '<td>' + escapeHtml(formatMoney(row.amount)) + '</td>'
                + '<td class="action-cell">' + eyeButtonHtml(row.date) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(pagination, currentPage, totalPages, total, function (page) {
            currentPage = page;
            renderTable();
        });
    }

    async function loadReport() {
        const fromValue = dateFrom ? dateFrom.value : '';
        const toValue = dateTo ? dateTo.value : '';
        const params = new URLSearchParams();
        if (fromValue) params.set('dateFrom', inputDateToDisplay(fromValue));
        if (toValue) params.set('dateTo', inputDateToDisplay(toValue));

        const response = await fetch('/api/multibranch/reports/daily-collection?' + params.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load report');
        }
        rows = await response.json();
        currentPage = 1;
        renderTable();
    }

    function getFilteredModalRows() {
        let list = modalRows.slice();
        const filter = modalFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return Object.values(row).join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (modalSortKey) {
            list.sort(function (a, b) {
                let av = a[modalSortKey];
                let bv = b[modalSortKey];
                if (modalSortKey === 'fine' || modalSortKey === 'amount' || modalSortKey === 'total') {
                    av = Number(av || 0);
                    bv = Number(bv || 0);
                    return modalSortDir === 'asc' ? av - bv : bv - av;
                }
                av = String(av || '').toLowerCase();
                bv = String(bv || '').toLowerCase();
                if (av < bv) return modalSortDir === 'asc' ? -1 : 1;
                if (av > bv) return modalSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function renderModalTable() {
        const filtered = getFilteredModalRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / modalPageSize) || 1);
        if (modalPage > totalPages) modalPage = totalPages;

        if (!total) {
            detailTableBody.innerHTML = '<tr class="empty-row"><td colspan="11">No collection records found.</td></tr>';
            if (modalShowingInfo) modalShowingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            if (grandTotalCell) grandTotalCell.textContent = formatMoney(0);
            renderPagination(modalPagination, 1, 1, 0, function () {});
            return;
        }

        const start = (modalPage - 1) * modalPageSize;
        const end = Math.min(start + modalPageSize, total);
        const pageRows = filtered.slice(start, end);

        detailTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.branch) + '</td>'
                + '<td>' + escapeHtml(row.admissionNo) + '</td>'
                + '<td>' + escapeHtml(row.name) + '</td>'
                + '<td>' + escapeHtml(row.fatherName) + '</td>'
                + '<td>' + escapeHtml(row.className) + '</td>'
                + '<td>' + escapeHtml(row.paymentMode) + '</td>'
                + '<td>' + escapeHtml(row.paymentId) + '</td>'
                + '<td>' + escapeHtml(row.collectedBy) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.fine)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.amount)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.total)) + '</td>'
                + '</tr>';
        }).join('');

        if (modalShowingInfo) {
            modalShowingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        if (grandTotalCell) {
            grandTotalCell.textContent = formatMoney(modalGrandTotal);
        }
        renderPagination(modalPagination, modalPage, totalPages, total, function (page) {
            modalPage = page;
            renderModalTable();
        });
    }

    async function openDetailModal(date) {
        const response = await fetch('/api/multibranch/reports/daily-collection/' + encodeURIComponent(date) + '/details');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load collection details');
        }
        const data = await response.json();
        modalRows = data.transactions || [];
        modalGrandTotal = data.grandTotal || 0;
        modalPage = 1;
        modalFilter = '';
        if (modalSearchInput) modalSearchInput.value = '';
        if (collectionDateLabel) collectionDateLabel.textContent = data.collectionDate || inputDateToDisplay(date);
        if (dailyCollectionModal) dailyCollectionModal.hidden = false;
        renderModalTable();
    }

    function closeDetailModal() {
        if (dailyCollectionModal) dailyCollectionModal.hidden = true;
    }

    document.querySelectorAll('[data-close-detail]').forEach(function (el) {
        el.addEventListener('click', closeDetailModal);
    });

    document.querySelectorAll('#reportTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else {
                sortKey = key;
                sortDir = 'asc';
            }
            renderTable();
        });
    });

    document.querySelectorAll('#detailTable thead th[data-modal-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-modal-sort');
            if (modalSortKey === key) modalSortDir = modalSortDir === 'asc' ? 'desc' : 'asc';
            else {
                modalSortKey = key;
                modalSortDir = 'asc';
            }
            renderModalTable();
        });
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            loadReport().catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to load report.',
                    confirmButtonColor: '#8b5cf6'
                });
            });
        });
    }

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            tableFilter = tableSearchInput.value;
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

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-view');
            if (!btn) return;
            openDetailModal(btn.dataset.date).catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to load collection details.',
                    confirmButtonColor: '#8b5cf6'
                });
            });
        });
    }

    if (modalSearchInput) {
        modalSearchInput.addEventListener('input', function () {
            modalFilter = modalSearchInput.value;
            modalPage = 1;
            renderModalTable();
        });
    }

    if (modalEntriesSelect) {
        modalEntriesSelect.addEventListener('change', function () {
            modalPageSize = parseInt(modalEntriesSelect.value, 10) || 10;
            modalPage = 1;
            renderModalTable();
        });
    }

    function exportCsv(dataRows, headers, filename) {
        const rows = [headers];
        dataRows.forEach(function (row) {
            rows.push(headers.map(function (header) { return row[header.key] == null ? '' : row[header.key]; }));
        });
        const csv = rows.map(function (row) {
            return row.map(function (cell) {
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');
    const modalExcelBtn = document.getElementById('modalExcelBtn');
    const modalCsvBtn = document.getElementById('modalCsvBtn');
    const modalPdfBtn = document.getElementById('modalPdfBtn');
    const modalPrintBtn = document.getElementById('modalPrintBtn');

    if (excelBtn) excelBtn.addEventListener('click', function () { window.print(); });
    if (csvBtn) csvBtn.addEventListener('click', function () { window.print(); });
    if (pdfBtn) pdfBtn.addEventListener('click', function () { window.print(); });
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    if (modalExcelBtn) modalExcelBtn.addEventListener('click', function () { window.print(); });
    if (modalCsvBtn) modalCsvBtn.addEventListener('click', function () { window.print(); });
    if (modalPdfBtn) modalPdfBtn.addEventListener('click', function () { window.print(); });
    if (modalPrintBtn) modalPrintBtn.addEventListener('click', function () { window.print(); });

    setDefaultDates();
    loadReport().catch(function (error) {
        console.error(error);
    });
});
