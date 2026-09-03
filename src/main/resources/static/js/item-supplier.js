document.addEventListener('DOMContentLoaded', function () {
    const supplierForm = document.getElementById('itemSupplierForm');
    const supplierIdInput = document.getElementById('supplierId');
    const saveBtn = document.getElementById('saveSupplierBtn');
    const nameInput = document.getElementById('supplierName');
    const phoneInput = document.getElementById('supplierPhone');
    const emailInput = document.getElementById('supplierEmail');
    const addressInput = document.getElementById('supplierAddress');
    const contactNameInput = document.getElementById('contactPersonName');
    const contactPhoneInput = document.getElementById('contactPersonPhone');
    const contactEmailInput = document.getElementById('contactPersonEmail');
    const descriptionInput = document.getElementById('supplierDescription');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('itemSupplierTable');
    const tableBody = document.getElementById('itemSupplierTableBody');
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
            return [
                row.name, row.phone, row.email, row.address,
                row.contactPersonName, row.contactPersonPhone, row.contactPersonEmail, row.description
            ].some(function (value) {
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

    function iconSvg(kind) {
        if (kind === 'phone') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0 1 22 16.92z"></path></svg>';
        }
        if (kind === 'email') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>';
        }
        if (kind === 'user') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"></path></svg>';
    }

    function metaLine(kind, value) {
        if (!display(value)) return '';
        return '<div class="meta-line">' + iconSvg(kind) + '<span>' + escapeHtml(display(value)) + '</span></div>';
    }

    function supplierCell(row) {
        return '<div class="stacked-cell">'
            + '<div class="stacked-title">' + escapeHtml(display(row.name)) + '</div>'
            + metaLine('phone', row.phone)
            + metaLine('email', row.email)
            + '</div>';
    }

    function contactCell(row) {
        if (!display(row.contactPersonName) && !display(row.contactPersonPhone) && !display(row.contactPersonEmail)) {
            return '';
        }
        return '<div class="stacked-cell">'
            + (display(row.contactPersonName)
                ? '<div class="meta-line">' + iconSvg('user') + '<span>' + escapeHtml(display(row.contactPersonName)) + '</span></div>'
                : '')
            + metaLine('phone', row.contactPersonPhone)
            + metaLine('email', row.contactPersonEmail)
            + '</div>';
    }

    function addressCell(row) {
        if (!display(row.address)) return '';
        return '<div class="stacked-cell">' + metaLine('building', row.address) + '</div>';
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
                    + '<td>' + supplierCell(row) + '</td>'
                    + '<td>' + contactCell(row) + '</td>'
                    + '<td>' + addressCell(row) + '</td>'
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
        if (!supplierForm) return;
        supplierForm.reset();
        supplierIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    function formPayload() {
        return {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            address: addressInput.value.trim(),
            contactPersonName: contactNameInput.value.trim(),
            contactPersonPhone: contactPhoneInput.value.trim(),
            contactPersonEmail: contactEmailInput.value.trim(),
            description: descriptionInput.value.trim()
        };
    }

    async function loadSuppliers() {
        try {
            const response = await fetch('/api/inventory/item-suppliers');
            if (!response.ok) throw new Error('Failed to load item suppliers');
            const data = await response.json();
            rows = Array.isArray(data) ? data : [];
            renderTable();
        } catch (error) {
            console.error(error);
            rows = [];
            renderTable();
        }
    }

    if (supplierForm) {
        supplierForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const payload = formPayload();
            if (!payload.name) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Name is required.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            const id = supplierIdInput.value;
            const url = id
                ? '/api/inventory/item-suppliers/' + encodeURIComponent(id)
                : '/api/inventory/item-suppliers';
            const method = id ? 'PUT' : 'POST';
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to save item supplier');
                }
                resetForm();
                await loadSuppliers();
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: data.message || 'Item supplier saved successfully!',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save item supplier.',
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
                supplierIdInput.value = row.id;
                saveBtn.textContent = 'Update';
                nameInput.value = row.name || '';
                phoneInput.value = row.phone || '';
                emailInput.value = row.email || '';
                addressInput.value = row.address || '';
                contactNameInput.value = row.contactPersonName || '';
                contactPhoneInput.value = row.contactPersonPhone || '';
                contactEmailInput.value = row.contactPersonEmail || '';
                descriptionInput.value = row.description || '';
                nameInput.focus();
                return;
            }
            if (!deleteBtn) return;
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Item Supplier?',
                text: 'This supplier will be removed from inventory.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/inventory/item-suppliers/' + encodeURIComponent(id), { method: 'DELETE' });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to delete item supplier');
                }
                if (supplierIdInput.value === String(id)) resetForm();
                await loadSuppliers();
                Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete item supplier.',
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
        const headers = ['Item Supplier', 'Phone', 'Email', 'Contact Person', 'Contact Phone', 'Contact Email', 'Address', 'Description'];
        return [headers.join('\t')].concat(filteredRows().map(function (row) {
            return [
                row.name, row.phone, row.email, row.contactPersonName,
                row.contactPersonPhone, row.contactPersonEmail, row.address, row.description
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
            downloadCsv(id === 'excelBtn' ? 'item-supplier-list.xls' : 'item-supplier-list.csv');
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

    loadSuppliers();
});
