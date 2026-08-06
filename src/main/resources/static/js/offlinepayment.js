document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('offlinePaymentsTable');
    const tableBody = document.getElementById('offlinePaymentsTableBody');
    const showingInfo = document.querySelector('.showing-info');

    let rows = [];
    let currentPage = 1;
    let pageSize = 100;
    let sortKey = 'id';
    let sortAsc = false;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        const num = Number(value);
        if (Number.isNaN(num)) return '0.00';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function statusBadge(status) {
        const value = String(status || 'PENDING').toUpperCase();
        const label = value.charAt(0) + value.slice(1).toLowerCase();
        const cls = value === 'APPROVED' ? 'approved' : 'pending';
        return '<span class="status-badge ' + cls + '">' + escapeHtml(label) + '</span>';
    }

    function getFilteredRows() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let filtered = rows.slice();
        if (term) {
            filtered = filtered.filter(function (item) {
                const haystack = [
                    item.requestId,
                    item.admissionNo,
                    item.studentName,
                    item.classLabel,
                    item.paymentDateDisplay,
                    item.submitDateDisplay,
                    item.amount,
                    item.status,
                    item.statusDateDisplay,
                    item.paymentId
                ].join(' ').toLowerCase();
                return haystack.indexOf(term) !== -1;
            });
        }

        filtered.sort(function (a, b) {
            let av = a[sortKey];
            let bv = b[sortKey];
            if (sortKey === 'amount' || sortKey === 'id' || sortKey === 'requestId') {
                av = Number(av) || 0;
                bv = Number(bv) || 0;
            } else {
                av = av == null ? '' : String(av).toLowerCase();
                bv = bv == null ? '' : String(bv).toLowerCase();
            }
            if (av < bv) return sortAsc ? -1 : 1;
            if (av > bv) return sortAsc ? 1 : -1;
            return 0;
        });
        return filtered;
    }

    function renderPagination(total, totalPages) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"' +
            (currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= totalPages; i++) {
            html += '<button type="button" class="pagination-btn' +
                (i === currentPage ? ' active' : '') +
                '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"' +
            (currentPage >= totalPages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
        if (showingInfo) {
            if (!total) {
                showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            } else {
                const from = (currentPage - 1) * pageSize + 1;
                const to = Math.min(currentPage * pageSize, total);
                showingInfo.textContent = 'Showing ' + from + ' to ' + to + ' of ' + total + ' entries';
            }
        }
    }

    function renderRows() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const pageRows = filtered.slice(start, start + pageSize);

        if (!pageRows.length) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="11" style="text-align:center;color:#94a3b8;">No offline bank payments found</td></tr>';
            renderPagination(0, 1);
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item) {
            const canApprove = String(item.status || '').toUpperCase() !== 'APPROVED';
            return '<tr data-id="' + escapeHtml(item.id) + '">' +
                '<td>' + escapeHtml(item.requestId) + '</td>' +
                '<td>' + escapeHtml(item.admissionNo || '') + '</td>' +
                '<td>' + escapeHtml(item.studentName || '') + '</td>' +
                '<td>' + escapeHtml(item.classLabel || '') + '</td>' +
                '<td>' + escapeHtml(item.paymentDateDisplay || '') + '</td>' +
                '<td>' + escapeHtml(item.submitDateDisplay || '') + '</td>' +
                '<td>' + formatMoney(item.amount) + '</td>' +
                '<td>' + statusBadge(item.status) + '</td>' +
                '<td>' + escapeHtml(item.statusDateDisplay || '') + '</td>' +
                '<td>' + escapeHtml(item.paymentId || '') + '</td>' +
                '<td>' +
                    '<div class="action-menu">' +
                        '<button type="button" class="btn-action-menu" title="Actions" aria-label="Actions">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<line x1="3" y1="6" x2="21" y2="6"></line>' +
                                '<line x1="3" y1="12" x2="21" y2="12"></line>' +
                                '<line x1="3" y1="18" x2="21" y2="18"></line>' +
                            '</svg>' +
                        '</button>' +
                        '<div class="action-dropdown">' +
                            (canApprove
                                ? '<button type="button" class="btn-approve" data-id="' + escapeHtml(item.id) + '">Approve</button>'
                                : '<button type="button" disabled>Approved</button>') +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '</tr>';
        }).join('');

        renderPagination(total, totalPages);
    }

    async function loadPayments() {
        const response = await fetch('/api/offline-payments');
        if (!response.ok) throw new Error('Failed to load offline bank payments');
        rows = await response.json();
        currentPage = 1;
        renderRows();
    }

    async function approvePayment(id) {
        const confirm = await Swal.fire({
            icon: 'question',
            title: 'Approve payment?',
            text: 'This will mark the offline bank payment as approved.',
            showCancelButton: true,
            confirmButtonText: 'Approve',
            confirmButtonColor: '#8b5cf6'
        });
        if (!confirm.isConfirmed) return;

        const response = await fetch('/api/offline-payments/' + encodeURIComponent(id) + '/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
            throw new Error(data.message || 'Failed to approve payment');
        }
        Swal.fire({
            icon: 'success',
            title: 'Approved',
            text: 'Payment approved successfully.',
            timer: 1600,
            showConfirmButton: false
        });
        await loadPayments();
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderRows();
        });
    }

    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 100;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 100;
            currentPage = 1;
            renderRows();
        });
    }

    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFilteredRows();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (btn.getAttribute('data-nav') === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (btn.getAttribute('data-page')) currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            renderRows();
        });
    }

    if (table) {
        table.querySelectorAll('thead th').forEach(function (th, index) {
            const keys = ['id', 'admissionNo', 'studentName', 'classLabel', 'paymentDateDisplay', 'submitDateDisplay', 'amount', 'status', 'statusDateDisplay', 'paymentId', null];
            const key = keys[index];
            if (!key) return;
            th.style.cursor = 'pointer';
            th.addEventListener('click', function () {
                if (sortKey === key) sortAsc = !sortAsc;
                else {
                    sortKey = key;
                    sortAsc = true;
                }
                renderRows();
            });
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const menuBtn = e.target.closest('.btn-action-menu');
            if (menuBtn) {
                e.stopPropagation();
                const dropdown = menuBtn.parentElement.querySelector('.action-dropdown');
                document.querySelectorAll('.action-dropdown.open').forEach(function (el) {
                    if (el !== dropdown) el.classList.remove('open');
                });
                if (dropdown) dropdown.classList.toggle('open');
                return;
            }

            const approveBtn = e.target.closest('.btn-approve');
            if (approveBtn) {
                e.stopPropagation();
                approvePayment(approveBtn.getAttribute('data-id')).catch(function (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to approve payment',
                        confirmButtonColor: '#8b5cf6'
                    });
                });
            }
        });
    }

    document.addEventListener('click', function () {
        document.querySelectorAll('.action-dropdown.open').forEach(function (el) {
            el.classList.remove('open');
        });
    });

    function getExportRows() {
        const headers = ['Request ID', 'Admission No', 'Name', 'Class', 'Payment Date', 'Submit Date', 'Amount ($)', 'Status', 'Status Date', 'Payment ID'];
        const data = getFilteredRows().map(function (item) {
            return [
                item.requestId || '',
                item.admissionNo || '',
                item.studentName || '',
                item.classLabel || '',
                item.paymentDateDisplay || '',
                item.submitDateDisplay || '',
                formatMoney(item.amount),
                item.status || '',
                item.statusDateDisplay || '',
                item.paymentId || ''
            ];
        });
        return { headers: headers, data: data };
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getExportRows();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied!', text: 'Table data copied to clipboard', timer: 2000, showConfirmButton: false });
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getExportRows();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Offline Payments');
            XLSX.writeFile(wb, 'Offline_Bank_Payments_' + new Date().toISOString().split('T')[0] + '.xlsx');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getExportRows();
            const lines = [result.headers.join(',')].concat(result.data.map(function (row) {
                return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(',');
            }));
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Offline_Bank_Payments.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    ['pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', function () { window.print(); });
    });

    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function () {
            columnVisibilityDropdown.classList.remove('active');
        });
        columnVisibilityDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const columnIndex = parseInt(checkbox.getAttribute('data-column'), 10);
                if (!table) return;
                table.querySelectorAll('tr').forEach(function (row) {
                    const cell = row.children[columnIndex];
                    if (cell) cell.style.display = checkbox.checked ? '' : 'none';
                });
            });
        });
    }

    loadPayments().catch(function (error) {
        console.error(error);
        tableBody.innerHTML = '<tr class="no-data-row"><td colspan="11" style="text-align:center;color:#94a3b8;">Failed to load offline bank payments</td></tr>';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load offline bank payments.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
