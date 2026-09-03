document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('holidayTypeTable');
    const tableBody = document.getElementById('holidayTypeTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput');
    const holidayTypeForm = document.getElementById('holidayTypeForm');
    const holidayTypeNameInput = document.getElementById('holidayTypeName');
    const holidayTypeIdInput = document.getElementById('holidayTypeId');
    const saveBtn = document.getElementById('saveBtn');
    const entriesSelect = document.getElementById('entriesSelect');
    const pagination = document.getElementById('pagination');

    let types = [];
    let currentPage = 1;
    let pageSize = 50;

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path>'
            + '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line>'
            + '<line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function resetForm() {
        if (!holidayTypeForm) return;
        holidayTypeForm.reset();
        holidayTypeIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function getFilteredTypes() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!searchTerm) return types.slice();
        return types.filter(function (item) {
            return String(item.name || '').toLowerCase().indexOf(searchTerm) !== -1;
        });
    }

    function updateShowingInfo(start, end, total) {
        if (!showingInfo) return;
        if (total === 0) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        showingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + total + ' entries';
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

    function renderTypes() {
        const filtered = getFilteredTypes();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:40px;color:#94a3b8;">No holiday types found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filtered.slice(startIndex, endIndex);

        tableBody.innerHTML = pageRows.map(function (item) {
            return '<tr data-id="' + escapeHtml(String(item.id)) + '">'
                + '<td class="type-name">' + escapeHtml(item.name) + '</td>'
                + '<td><div class="action-buttons">' + createActionButtonsHtml() + '</div></td>'
                + '</tr>';
        }).join('');

        updateShowingInfo(startIndex + 1, endIndex, total);
        renderPagination(total, totalPages);
    }

    async function loadTypes() {
        try {
            const response = await fetch('/api/holiday-types');
            if (!response.ok) throw new Error('Failed to load holiday types');
            types = await response.json();
            currentPage = 1;
            renderTypes();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load holiday types.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    if (holidayTypeForm) {
        holidayTypeForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const name = holidayTypeNameInput.value.trim();

            if (!name) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Please enter a name.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const editingId = holidayTypeIdInput.value;
            const payload = { name: name };

            try {
                const url = editingId ? '/api/holiday-types/' + editingId : '/api/holiday-types';
                const method = editingId ? 'PUT' : 'POST';
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to save holiday type');
                }

                resetForm();
                await loadTypes();
                Swal.fire({
                    icon: 'success',
                    title: editingId ? 'Updated' : 'Saved',
                    text: result.message || 'Holiday type saved successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save holiday type.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const row = e.target.closest('tr');
            if (!row || !row.dataset.id) return;

            if (editBtn) {
                holidayTypeIdInput.value = row.getAttribute('data-id') || '';
                holidayTypeNameInput.value = row.querySelector('.type-name').textContent.trim();
                saveBtn.textContent = 'Update';
                holidayTypeNameInput.focus();
                return;
            }

            if (deleteBtn) {
                const name = row.querySelector('.type-name').textContent.trim();
                const rowId = row.getAttribute('data-id');

                Swal.fire({
                    icon: 'warning',
                    title: 'Delete Holiday Type?',
                    text: '"' + name + '" will be deleted.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                }).then(async function (result) {
                    if (!result.isConfirmed) return;
                    try {
                        const response = await fetch('/api/holiday-types/' + rowId, { method: 'DELETE' });
                        const data = await response.json().catch(function () { return {}; });
                        if (!response.ok || !data.success) {
                            throw new Error(data.message || 'Failed to delete holiday type');
                        }
                        if (holidayTypeIdInput.value === rowId) resetForm();
                        await loadTypes();
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Holiday type deleted successfully.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to delete holiday type.',
                            confirmButtonColor: '#8b5cf6'
                        });
                    }
                });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderTypes();
        });
    }

    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderTypes();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFilteredTypes();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') {
                currentPage = Math.max(1, currentPage - 1);
            } else if (btn.getAttribute('data-nav') === 'next') {
                currentPage = Math.min(totalPages, currentPage + 1);
            } else if (btn.getAttribute('data-page')) {
                currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            }
            renderTypes();
        });
    }

    function exportRows() {
        return getFilteredTypes().map(function (item) {
            return { Name: item.name || '' };
        });
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        let text = headers.join('\t') + '\n';
        rows.forEach(function (row) {
            text += headers.map(function (key) { return row[key]; }).join('\t') + '\n';
        });
        navigator.clipboard.writeText(text);
        Swal.fire({ icon: 'success', title: 'Copied!', text: 'Holiday type list copied to clipboard', timer: 1500, showConfirmButton: false });
    });

    document.getElementById('excelBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.XLSX) return;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Holiday Types');
        XLSX.writeFile(wb, 'holiday-types.xlsx');
    });

    document.getElementById('csvBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        let csv = headers.join(',') + '\n';
        rows.forEach(function (row) {
            csv += headers.map(function (key) {
                const value = String(row[key] || '').replace(/"/g, '""');
                return '"' + value + '"';
            }).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'holiday-types.csv';
        link.click();
    });

    document.getElementById('pdfBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.jspdf) return;
        const doc = new window.jspdf.jsPDF();
        doc.text('Holiday Type List', 14, 16);
        doc.autoTable({
            startY: 24,
            head: [['Name']],
            body: rows.map(function (row) {
                return [row.Name];
            })
        });
        doc.save('holiday-types.pdf');
    });

    document.getElementById('printBtn')?.addEventListener('click', function () {
        window.print();
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
        columnVisibilityDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
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

    loadTypes();
});
