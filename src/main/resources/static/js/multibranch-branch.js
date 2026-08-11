document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('branchesTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const addBranchBtn = document.getElementById('addBranchBtn');
    const branchModal = document.getElementById('branchModal');
    const branchForm = document.getElementById('branchForm');
    const branchModalTitle = document.getElementById('branchModalTitle');
    const branchId = document.getElementById('branchId');
    const envatoPurchaseCode = document.getElementById('envatoPurchaseCode');
    const branchHostname = document.getElementById('branchHostname');
    const branchDatabaseName = document.getElementById('branchDatabaseName');
    const branchDbUsername = document.getElementById('branchDbUsername');
    const branchDbPassword = document.getElementById('branchDbPassword');

    let branches = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 100;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function emptyStateHtml() {
        return ''
            + '<tr class="empty-row"><td colspan="3">'
            + '<div class="empty-state"><p class="empty-message">No data available in table</p></div>'
            + '</td></tr>';
    }

    function sortValue(row, key) {
        switch (key) {
            case 'name': return row.name || '';
            case 'url': return row.url || '';
            default: return '';
        }
    }

    function getFiltered() {
        let rows = branches.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [row.name, row.url].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
                const av = sortValue(a, sortKey);
                const bv = sortValue(b, sortKey);
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function actionButtonsHtml(row) {
        const id = escapeHtml(String(row.id));
        return ''
            + '<button type="button" class="btn-action btn-edit" data-id="' + id + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" data-id="' + id + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';

        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }

        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = emptyStateHtml();
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.name || '') + '</td>'
                + '<td>' + escapeHtml(row.url || '') + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(row) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    async function loadBranches() {
        const response = await fetch('/api/multibranch/branches');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load branches');
        }
        branches = await response.json();
        renderTable();
    }

    function openModal(mode, row) {
        if (mode === 'edit' && row) {
            branchModalTitle.textContent = 'Edit Branch';
            branchId.value = row.id;
            envatoPurchaseCode.value = row.envatoPurchaseCode || '';
            branchHostname.value = row.hostname || '';
            branchDatabaseName.value = row.databaseName || row.name || '';
            branchDbUsername.value = row.dbUsername || '';
            branchDbPassword.value = '';
            branchDbPassword.required = false;
        } else {
            branchModalTitle.textContent = 'Add New Branch';
            branchId.value = '';
            envatoPurchaseCode.value = '';
            branchHostname.value = '';
            branchDatabaseName.value = '';
            branchDbUsername.value = '';
            branchDbPassword.value = '';
            branchDbPassword.required = true;
        }
        branchModal.hidden = false;
    }

    function closeModal() {
        branchModal.hidden = true;
        branchForm.reset();
        branchId.value = '';
        if (branchDbPassword) {
            branchDbPassword.required = true;
        }
    }

    document.querySelectorAll('[data-close-branch]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    if (addBranchBtn) {
        addBranchBtn.addEventListener('click', function () {
            openModal('add');
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
            pageSize = parseInt(entriesSelect.value, 10) || 100;
            currentPage = 1;
            renderTable();
        });
    }

    document.querySelectorAll('#branchesTable thead th[data-sort]').forEach(function (th) {
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

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;

            const nav = btn.getAttribute('data-nav');
            if (nav === 'prev') {
                currentPage = Math.max(1, currentPage - 1);
            } else if (nav === 'next') {
                currentPage += 1;
            } else if (btn.dataset.page) {
                currentPage = parseInt(btn.dataset.page, 10);
            }
            renderTable();
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const row = branches.find(function (item) {
                    return String(item.id) === String(editBtn.dataset.id);
                });
                if (row) openModal('edit', row);
                return;
            }

            const deleteBtn = e.target.closest('.btn-delete');
            if (!deleteBtn) return;

            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete branch?',
                text: 'This cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await fetch('/api/multibranch/branches/' + encodeURIComponent(deleteBtn.dataset.id), {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || 'Failed to delete branch');
                }
                await loadBranches();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    timer: 1400,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete branch.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (branchForm) {
        branchForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const id = branchId.value.trim();
            const purchaseCode = envatoPurchaseCode.value.trim();
            const hostname = branchHostname.value.trim();
            const databaseName = branchDatabaseName.value.trim();
            const dbUsername = branchDbUsername.value.trim();
            const dbPassword = branchDbPassword.value.trim();

            if (!purchaseCode) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Purchase Code Required',
                    text: 'Please enter the Envato purchase code.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (!hostname) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Hostname Required',
                    text: 'Please enter a hostname.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (!databaseName) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Database Name Required',
                    text: 'Please enter a database name.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (!dbUsername) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Username Required',
                    text: 'Please enter a database username.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (!id && !dbPassword) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Password Required',
                    text: 'Please enter a database password.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const payload = {
                envatoPurchaseCode: purchaseCode,
                hostname: hostname,
                databaseName: databaseName,
                dbUsername: dbUsername,
                dbPassword: dbPassword
            };

            try {
                const response = await fetch(id
                    ? '/api/multibranch/branches/' + encodeURIComponent(id)
                    : '/api/multibranch/branches', {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || 'Failed to save branch');
                }
                closeModal();
                await loadBranches();
                Swal.fire({
                    icon: 'success',
                    title: id ? 'Updated' : 'Verified & Saved',
                    text: id ? 'Branch updated successfully.' : 'Branch verified and saved to database.',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save branch.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    function exportCsv() {
        const filtered = getFiltered();
        const rows = [['Branch', 'URL']];
        filtered.forEach(function (row) {
            rows.push([row.name || '', row.url || '']);
        });
        const csv = rows.map(function (row) {
            return row.map(function (cell) {
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'branches.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    if (excelBtn) excelBtn.addEventListener('click', exportCsv);
    if (csvBtn) csvBtn.addEventListener('click', exportCsv);
    if (pdfBtn) pdfBtn.addEventListener('click', function () { window.print(); });
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    loadBranches().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load branches.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
