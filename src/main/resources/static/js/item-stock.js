document.addEventListener('DOMContentLoaded', function () {
    const stockForm = document.getElementById('itemStockForm');
    const stockIdInput = document.getElementById('stockId');
    const saveBtn = document.getElementById('saveStockBtn');
    const categorySelect = document.getElementById('itemCategoryId');
    const itemSelect = document.getElementById('itemId');
    const supplierSelect = document.getElementById('supplierId');
    const storeSelect = document.getElementById('storeId');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('itemStockTable');
    const tableBody = document.getElementById('itemStockTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const fileInput = document.getElementById('document');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileName = document.getElementById('fileName');

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

    function todayIso() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return now.getFullYear() + '-' + month + '-' + day;
    }

    function formatMoney(value) {
        return window.formatCurrency(value);
    }

    function pageSize() {
        return parseInt(entriesSelect && entriesSelect.value ? entriesSelect.value : '50', 10) || 50;
    }

    function fillSelect(select, options, placeholder, labelKey) {
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">' + placeholder + '</option>';
        (options || []).forEach(function (option) {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.textContent = option[labelKey] || option.label || option.name;
            select.appendChild(opt);
        });
        if (current && Array.from(select.options).some(function (opt) { return opt.value === current; })) {
            select.value = current;
        }
    }

    async function loadItems(categoryId, selectedItemId) {
        if (!itemSelect) return;
        itemSelect.innerHTML = '<option value="">Select</option>';
        if (!categoryId) return;
        try {
            const response = await fetch('/api/inventory/items?categoryId=' + encodeURIComponent(categoryId));
            if (!response.ok) throw new Error('Failed to load items');
            const items = await response.json();
            fillSelect(itemSelect, Array.isArray(items) ? items : [], 'Select', 'name');
            if (selectedItemId) itemSelect.value = String(selectedItemId);
        } catch (error) {
            console.error(error);
        }
    }

    function filteredRows() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!keyword) return rows.slice();
        return rows.filter(function (row) {
            return [
                row.itemName, row.categoryName, row.supplierName, row.storeName,
                row.quantity, row.purchasePrice, row.dateDisplay
            ].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function visibleColumnCount() {
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        if (!toggles.length) return 8;
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
                    + '<td>' + escapeHtml(display(row.itemName)) + '</td>'
                    + '<td>' + escapeHtml(display(row.categoryName)) + '</td>'
                    + '<td>' + escapeHtml(display(row.supplierName)) + '</td>'
                    + '<td>' + escapeHtml(display(row.storeName)) + '</td>'
                    + '<td>' + escapeHtml(display(row.quantity)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(row.purchasePrice)) + '</td>'
                    + '<td>' + escapeHtml(display(row.dateDisplay)) + '</td>'
                    + '<td>' + actionButtons(row.id) + '</td>'
                    + '</tr>';
            }).join('');
        }

        if (showingInfo) {
            showingInfo.textContent = 'Records: ' + start + ' to ' + end + ' of ' + data.length;
        }
        renderPagination(data.length, pages);
        applyColumnVisibility();
    }

    function resetForm() {
        if (!stockForm) return;
        stockForm.reset();
        stockIdInput.value = '';
        saveBtn.textContent = 'Save';
        itemSelect.innerHTML = '<option value="">Select</option>';
        if (fileName) {
            fileName.textContent = '';
            fileName.classList.remove('active');
        }
        const dateInput = document.getElementById('stockDate');
        if (dateInput) dateInput.value = todayIso();
        const symbol = document.getElementById('quantitySymbol');
        if (symbol) symbol.value = '+';
    }

    async function loadOptions() {
        try {
            const response = await fetch('/api/inventory/item-stock-options');
            if (!response.ok) throw new Error('Failed to load options');
            const data = await response.json();
            fillSelect(categorySelect, data.categories || [], 'Select', 'name');
            fillSelect(supplierSelect, data.suppliers || [], 'Select', 'name');
            fillSelect(storeSelect, data.stores || [], 'Select', 'label');
        } catch (error) {
            console.error(error);
        }
    }

    async function loadStock() {
        try {
            const response = await fetch('/api/inventory/item-stock');
            if (!response.ok) throw new Error('Failed to load item stock');
            const data = await response.json();
            rows = Array.isArray(data) ? data : [];
            renderTable();
        } catch (error) {
            console.error(error);
            rows = [];
            renderTable();
        }
    }

    function buildFormData() {
        const formData = new FormData();
        formData.append('itemId', itemSelect.value);
        formData.append('supplierId', supplierSelect.value);
        formData.append('storeId', storeSelect.value);
        formData.append('quantitySymbol', document.getElementById('quantitySymbol').value);
        formData.append('quantity', document.getElementById('quantity').value);
        formData.append('purchasePrice', document.getElementById('purchasePrice').value);
        formData.append('date', document.getElementById('stockDate').value);
        formData.append('description', document.getElementById('description').value);
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append('document', fileInput.files[0]);
        }
        return formData;
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            loadItems(categorySelect.value);
        });
    }

    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', function () {
            fileInput.click();
        });
        fileUploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
        });
        fileUploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                fileInput.files = e.dataTransfer.files;
                fileName.textContent = e.dataTransfer.files[0].name;
                fileName.classList.add('active');
            }
        });
        fileInput.addEventListener('change', function () {
            if (fileInput.files && fileInput.files[0]) {
                fileName.textContent = fileInput.files[0].name;
                fileName.classList.add('active');
            }
        });
    }

    if (stockForm) {
        stockForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!categorySelect.value || !itemSelect.value || !document.getElementById('quantity').value
                || !document.getElementById('purchasePrice').value || !document.getElementById('stockDate').value) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Please complete all required fields.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            const stockId = stockIdInput.value;
            const url = stockId ? '/api/inventory/item-stock/' + encodeURIComponent(stockId) : '/api/inventory/item-stock';
            const method = stockId ? 'PUT' : 'POST';
            try {
                const response = await fetch(url, { method: method, body: buildFormData() });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to save item stock');
                }
                resetForm();
                await loadStock();
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: data.message || 'Item stock saved successfully!',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save item stock.',
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
                stockIdInput.value = row.id;
                saveBtn.textContent = 'Update';
                categorySelect.value = row.categoryId == null ? '' : String(row.categoryId);
                await loadItems(categorySelect.value, row.itemId);
                supplierSelect.value = row.supplierId == null ? '' : String(row.supplierId);
                storeSelect.value = row.storeId == null ? '' : String(row.storeId);
                document.getElementById('quantitySymbol').value = row.quantitySymbol || '+';
                document.getElementById('quantity').value = row.quantity == null ? '' : row.quantity;
                document.getElementById('purchasePrice').value = row.purchasePrice == null ? '' : row.purchasePrice;
                document.getElementById('stockDate').value = row.date || '';
                document.getElementById('description').value = row.description || '';
                if (row.documentName) {
                    fileName.textContent = row.documentName;
                    fileName.classList.add('active');
                } else {
                    fileName.textContent = '';
                    fileName.classList.remove('active');
                }
                return;
            }
            if (!deleteBtn) return;
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Item Stock?',
                text: 'This stock record will be removed.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/inventory/item-stock/' + encodeURIComponent(id), { method: 'DELETE' });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to delete item stock');
                }
                if (stockIdInput.value === String(id)) resetForm();
                await loadStock();
                Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete item stock.',
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
        const headers = ['Item', 'Category', 'Supplier', 'Store', 'Quantity', 'Purchase Price ($)', 'Date'];
        return [headers.join('\t')].concat(filteredRows().map(function (row) {
            return [
                row.itemName, row.categoryName, row.supplierName, row.storeName,
                row.quantity, row.purchasePrice, row.dateDisplay
            ].join('\t');
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
            downloadCsv(id === 'excelBtn' ? 'item-stock.xls' : 'item-stock.csv');
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

    resetForm();
    loadOptions();
    loadStock();
});
