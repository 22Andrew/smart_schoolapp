document.addEventListener('DOMContentLoaded', function () {
    const storeForm = document.getElementById('itemStoreForm');
    const storeIdInput = document.getElementById('storeId');
    const saveBtn = document.getElementById('saveStoreBtn');
    const nameInput = document.getElementById('storeName');
    const codeInput = document.getElementById('storeCode');
    const descriptionInput = document.getElementById('storeDescription');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('itemStoreTable');
    const tableBody = document.getElementById('itemStoreTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');

    let rows = [];
    let currentPage = 1;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        if (value == null || String(value).trim() === '') return '';
        return String(value);
    }

    function pageSize() {
        return parseInt(entriesSelect && entriesSelect.value ? entriesSelect.value : '50', 10) || 50;
    }

    function filteredRows() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!keyword) return rows.slice();
        return rows.filter(function (row) {
            return [row.name, row.code, row.description].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function visibleColumnCount() {
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        if (!toggles.length) return 4;
        let count = 0;
        toggles.forEach(function (toggle) {
            if (toggle.checked) count++;
        });
        return Math.max(1, count);
    }

    function applyColumnVisibility() {
        if (!table) return;
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        toggles.forEach(function (toggle) {
            const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
            const headerCells = table.querySelectorAll('thead th');
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = toggle.checked ? '' : 'none';
            }
        });
        table.querySelectorAll('tbody tr').forEach(function (row) {
            const emptyCell = row.querySelector('.empty-state-cell');
            if (emptyCell) {
                emptyCell.colSpan = visibleColumnCount();
                return;
            }
            const cells = row.querySelectorAll('td');
            toggles.forEach(function (toggle) {
                const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = toggle.checked ? '' : 'none';
                }
            });
        });
    }

    function emptyRowHtml() {
        return ''
            + '<tr><td colspan="' + visibleColumnCount() + '" class="empty-state-cell">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</td></tr>';
    }

    function actionButtons(id) {
        return ''
            + '<div class="action-buttons">'
            + '<button type="button" class="btn-action btn-edit" data-id="' + escapeHtml(id) + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" data-id="' + escapeHtml(id) + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>'
            + '</div>';
    }

    function renderPagination(total, pages) {
        if (!pagination) return;
        if (!total) {
            pagination.innerHTML = ''
                + '<button type="button" class="pagination-btn" disabled>&lt;</button>'
                + '<button type="button" class="pagination-btn active">1</button>'
                + '<button type="button" class="pagination-btn" disabled>&gt;</button>';
            return;
        }
        let html = '<button type="button" class="pagination-btn" data-page="' + (currentPage - 1) + '"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let page = 1; page <= pages; page++) {
            html += '<button type="button" class="pagination-btn' + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="' + (currentPage + 1) + '"'
            + (currentPage >= pages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        if (!tableBody) return;
        const data = filteredRows();
        const size = pageSize();
        const pages = Math.max(1, Math.ceil(data.length / size));
        if (currentPage > pages) currentPage = pages;
        const startIndex = data.length ? (currentPage - 1) * size : 0;
        const pageRows = data.slice(startIndex, startIndex + size);
        const start = data.length ? startIndex + 1 : 0;
        const end = startIndex + pageRows.length;

        if (!pageRows.length) {
            tableBody.innerHTML = emptyRowHtml();
        } else {
            tableBody.innerHTML = pageRows.map(function (row) {
                return ''
                    + '<tr data-id="' + escapeHtml(row.id) + '">'
                    + '<td>' + escapeHtml(display(row.name)) + '</td>'
                    + '<td>' + escapeHtml(display(row.code)) + '</td>'
                    + '<td>' + escapeHtml(display(row.description)) + '</td>'
                    + '<td>' + actionButtons(row.id) + '</td>'
                    + '</tr>';
            }).join('');
        }

        if (showingInfo) {
            showingInfo.textContent = data.length
                ? 'Showing ' + start + ' to ' + end + ' of ' + data.length + ' entries'
                : 'Showing 0 to 0 of 0 entries';
        }
        renderPagination(data.length, pages);
        applyColumnVisibility();
    }

    function resetForm() {
        if (!storeForm) return;
        storeForm.reset();
        storeIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    async function loadStores() {
        try {
            const response = await fetch('/api/inventory/item-stores');
            if (!response.ok) throw new Error('Failed to load item stores');
            const data = await response.json();
            rows = Array.isArray(data) ? data : [];
            renderTable();
        } catch (error) {
            console.error(error);
            rows = [];
            renderTable();
        }
    }

    if (storeForm) {
        storeForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const payload = {
                name: nameInput.value.trim(),
                code: codeInput.value.trim(),
                description: descriptionInput.value.trim()
            };
            if (!payload.name) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Item Store Name is required.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            const id = storeIdInput.value;
            const url = id
                ? '/api/inventory/item-stores/' + encodeURIComponent(id)
                : '/api/inventory/item-stores';
            const method = id ? 'PUT' : 'POST';
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to save item store');
                }
                resetForm();
                await loadStores();
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: data.message || 'Item store saved successfully!',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save item store.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const row = rows.find(function (item) { return String(item.id) === String(id); });
                if (!row) return;
                storeIdInput.value = row.id;
                saveBtn.textContent = 'Update';
                nameInput.value = row.name || '';
                codeInput.value = row.code || '';
                descriptionInput.value = row.description || '';
                nameInput.focus();
                return;
            }
            if (!deleteBtn) return;
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Item Store?',
                text: 'This store will be removed from inventory.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/inventory/item-stores/' + encodeURIComponent(id), { method: 'DELETE' });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to delete item store');
                }
                if (storeIdInput.value === String(id)) resetForm();
                await loadStores();
                Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete item store.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const page = parseInt(btn.getAttribute('data-page'), 10);
            if (!page || page === currentPage) return;
            currentPage = page;
            renderTable();
        });
    }

    function exportRows() {
        const headers = ['Item Store Name', 'Item Store Code', 'Description'];
        return [headers.join('\t')].concat(filteredRows().map(function (row) {
            return [row.name, row.code, row.description].join('\t');
        })).join('\n');
    }

    function downloadCsv(filename) {
        const csv = exportRows().split('\n').map(function (line) {
            return line.split('\t').map(function (value) {
                return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    ['copyBtn', 'excelBtn', 'csvBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'printBtn' || id === 'pdfBtn') {
                window.print();
                return;
            }
            const text = exportRows();
            if (id === 'copyBtn') {
                navigator.clipboard.writeText(text).then(function () {
                    Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
                });
                return;
            }
            downloadCsv(id === 'excelBtn' ? 'item-store-list.xls' : 'item-store-list.csv');
        });
    });

    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function (e) {
            if (!columnVisibilityDropdown.contains(e.target) && !columnVisibilityBtn.contains(e.target)) {
                columnVisibilityDropdown.classList.remove('active');
            }
        });
        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (toggle) {
            toggle.addEventListener('change', applyColumnVisibility);
        });
    }

    loadStores();
});
