document.addEventListener('DOMContentLoaded', function () {
    const itemForm = document.getElementById('addItemForm');
    const itemIdInput = document.getElementById('itemId');
    const saveBtn = document.getElementById('saveItemBtn');
    const nameInput = document.getElementById('itemName');
    const categorySelect = document.getElementById('itemCategoryId');
    const unitInput = document.getElementById('itemUnit');
    const descriptionInput = document.getElementById('itemDescription');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('itemTable');
    const tableBody = document.getElementById('itemTableBody');
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

    function fillSelect(select, options) {
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">Select</option>';
        (options || []).forEach(function (option) {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.textContent = option.name;
            select.appendChild(opt);
        });
        if (current && Array.from(select.options).some(function (opt) { return opt.value === current; })) {
            select.value = current;
        }
    }

    function filteredRows() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!keyword) return rows.slice();
        return rows.filter(function (row) {
            return [
                row.name, row.description, row.categoryName, row.unit, row.availableQuantity
            ].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function visibleColumnCount() {
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        if (!toggles.length) return 6;
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
                    + '<td>' + escapeHtml(display(row.description)) + '</td>'
                    + '<td>' + escapeHtml(display(row.categoryName)) + '</td>'
                    + '<td>' + escapeHtml(display(row.unit)) + '</td>'
                    + '<td>' + escapeHtml(display(row.availableQuantity)) + '</td>'
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
        if (!itemForm) return;
        itemForm.reset();
        itemIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    async function loadCategories() {
        try {
            const response = await fetch('/api/inventory/item-categories');
            if (!response.ok) throw new Error('Failed to load categories');
            const data = await response.json();
            fillSelect(categorySelect, Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
    }

    async function loadItems() {
        try {
            const response = await fetch('/api/inventory/catalog-items');
            if (!response.ok) throw new Error('Failed to load items');
            const data = await response.json();
            rows = Array.isArray(data) ? data : [];
            renderTable();
        } catch (error) {
            console.error(error);
            rows = [];
            renderTable();
        }
    }

    if (itemForm) {
        itemForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const payload = {
                name: nameInput.value.trim(),
                categoryId: categorySelect.value,
                unit: unitInput.value.trim(),
                description: descriptionInput.value.trim()
            };
            if (!payload.name || !payload.categoryId || !payload.unit) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Please complete all required fields.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            const id = itemIdInput.value;
            const url = id ? '/api/inventory/catalog-items/' + encodeURIComponent(id) : '/api/inventory/catalog-items';
            const method = id ? 'PUT' : 'POST';
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to save item');
                }
                resetForm();
                await loadItems();
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: data.message || 'Item saved successfully!',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save item.',
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
                itemIdInput.value = row.id;
                saveBtn.textContent = 'Update';
                nameInput.value = row.name || '';
                categorySelect.value = row.categoryId == null ? '' : String(row.categoryId);
                unitInput.value = row.unit || '';
                descriptionInput.value = row.description || '';
                nameInput.focus();
                return;
            }
            if (!deleteBtn) return;
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Item?',
                text: 'This item will be removed from inventory.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/inventory/catalog-items/' + encodeURIComponent(id), { method: 'DELETE' });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to delete item');
                }
                if (itemIdInput.value === String(id)) resetForm();
                await loadItems();
                Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete item.',
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
        const headers = ['Item', 'Description', 'Item Category', 'Unit', 'Available Quantity'];
        return [headers.join('\t')].concat(filteredRows().map(function (row) {
            return [row.name, row.description, row.categoryName, row.unit, row.availableQuantity].join('\t');
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

    ['copyBtn', 'csvBtn', 'excelBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
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
            downloadCsv(id === 'excelBtn' ? 'item-list.xls' : 'item-list.csv');
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

    loadCategories();
    loadItems();
});
