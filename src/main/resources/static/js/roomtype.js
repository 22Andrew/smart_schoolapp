document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('roomTypeForm');
    const roomTypeIdInput = document.getElementById('roomTypeId');
    const roomTypeNameInput = document.getElementById('roomTypeName');
    const roomTypeDescriptionInput = document.getElementById('roomTypeDescription');
    const saveBtn = document.getElementById('saveBtn');
    const tableBody = document.getElementById('roomTypeTableBody');
    const tableSearch = document.getElementById('tableSearch');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const entriesInfo = document.getElementById('entriesInfo');
    const pagination = document.getElementById('pagination');

    let roomTypes = [];
    let filtered = [];
    let currentPage = 1;
    let sortKey = 'roomType';
    let sortAsc = true;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>'
            + '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line>'
            + '<line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function resetForm() {
        form.reset();
        roomTypeIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    function applyFilters() {
        const query = (tableSearch.value || '').trim().toLowerCase();
        filtered = roomTypes.filter(function (row) {
            if (!query) return true;
            return [row.roomType, row.description]
                .join(' ')
                .toLowerCase()
                .indexOf(query) !== -1;
        });

        filtered.sort(function (a, b) {
            const av = String(a[sortKey] == null ? '' : a[sortKey]).toLowerCase();
            const bv = String(b[sortKey] == null ? '' : b[sortKey]).toLowerCase();
            if (av < bv) return sortAsc ? -1 : 1;
            if (av > bv) return sortAsc ? 1 : -1;
            return 0;
        });

        const pageSize = parseInt(pageSizeSelect.value, 10) || 50;
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        renderTable();
        renderPagination(totalPages);
    }

    function renderTable() {
        const pageSize = parseInt(pageSizeSelect.value, 10) || 50;
        const start = (currentPage - 1) * pageSize;
        const pageRows = filtered.slice(start, start + pageSize);

        if (!pageRows.length) {
            tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">No room types found</td></tr>';
            entriesInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.roomType || '') + '</td>'
                + '<td class="action-cell">' + createActionButtonsHtml() + '</td>'
                + '</tr>';
        }).join('');

        const end = start + pageRows.length;
        entriesInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + filtered.length + ' entries';
    }

    function renderPagination(totalPages) {
        let html = '';
        html += '<button type="button" class="page-btn" data-page="prev" ' + (currentPage <= 1 ? 'disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= totalPages; i++) {
            html += '<button type="button" class="page-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="page-btn" data-page="next" ' + (currentPage >= totalPages ? 'disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    async function parseErrorMessage(response) {
        try {
            const data = await response.json();
            return data.message || 'Request failed';
        } catch (e) {
            return 'Request failed';
        }
    }

    async function loadRoomTypes() {
        const response = await fetch('/api/room-types');
        if (!response.ok) throw new Error('Failed to load room types');
        roomTypes = await response.json();
        applyFilters();
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = {
            roomType: roomTypeNameInput.value.trim(),
            description: roomTypeDescriptionInput.value.trim()
        };

        if (!payload.roomType) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please enter Room Type.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const editingId = roomTypeIdInput.value;
        try {
            const response = await fetch(
                editingId ? '/api/room-types/' + editingId : '/api/room-types',
                {
                    method: editingId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );
            if (!response.ok) {
                throw new Error(await parseErrorMessage(response));
            }
            await loadRoomTypes();
            resetForm();
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Updated' : 'Saved',
                text: editingId ? 'Room type updated successfully.' : 'Room type saved successfully.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save room type.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const item = roomTypes.find(function (r) { return String(r.id) === String(id); });
        if (!item) return;

        if (e.target.closest('.btn-edit')) {
            roomTypeIdInput.value = String(item.id);
            roomTypeNameInput.value = item.roomType || '';
            roomTypeDescriptionInput.value = item.description || '';
            saveBtn.textContent = 'Update';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (e.target.closest('.btn-delete')) {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Room Type?',
                text: 'Remove "' + item.roomType + '"?',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await fetch('/api/room-types/' + id, { method: 'DELETE' });
                if (!response.ok && response.status !== 204) {
                    throw new Error(await parseErrorMessage(response));
                }
                if (roomTypeIdInput.value === id) resetForm();
                await loadRoomTypes();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    timer: 1200,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete room type.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        }
    });

    tableSearch.addEventListener('input', function () {
        currentPage = 1;
        applyFilters();
    });

    pageSizeSelect.addEventListener('change', function () {
        currentPage = 1;
        applyFilters();
    });

    pagination.addEventListener('click', function (e) {
        const btn = e.target.closest('.page-btn');
        if (!btn || btn.disabled) return;
        const pageSize = parseInt(pageSizeSelect.value, 10) || 50;
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        const value = btn.getAttribute('data-page');
        if (value === 'prev') currentPage = Math.max(1, currentPage - 1);
        else if (value === 'next') currentPage = Math.min(totalPages, currentPage + 1);
        else currentPage = parseInt(value, 10) || 1;
        renderTable();
        renderPagination(totalPages);
    });

    document.querySelectorAll('#roomTypeTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) sortAsc = !sortAsc;
            else {
                sortKey = key;
                sortAsc = true;
            }
            applyFilters();
        });
    });

    function exportRows() {
        return filtered.map(function (row) {
            return [row.roomType || '', row.description || ''];
        });
    }

    document.getElementById('copyBtn').addEventListener('click', function () {
        const text = ['Room Type\tDescription']
            .concat(exportRows().map(function (r) { return r.join('\t'); }))
            .join('\n');
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
        });
    });

    document.getElementById('excelBtn').addEventListener('click', function () {
        if (typeof XLSX === 'undefined') return;
        const ws = XLSX.utils.aoa_to_sheet([['Room Type', 'Description']].concat(exportRows()));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Room Types');
        XLSX.writeFile(wb, 'room-type-list.xlsx');
    });

    document.getElementById('pdfBtn').addEventListener('click', function () {
        if (!window.jspdf) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Room Type List', 14, 16);
        doc.autoTable({
            startY: 22,
            head: [['Room Type', 'Description']],
            body: exportRows()
        });
        doc.save('room-type-list.pdf');
    });

    document.getElementById('printBtn').addEventListener('click', function () {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(''
            + '<html><head><title>Room Type List</title></head><body>'
            + '<h2>Room Type List</h2><table border="1" cellspacing="0" cellpadding="6">'
            + '<thead><tr><th>Room Type</th><th>Description</th></tr></thead><tbody>'
            + exportRows().map(function (r) {
                return '<tr><td>' + escapeHtml(r[0]) + '</td><td>' + escapeHtml(r[1]) + '</td></tr>';
            }).join('')
            + '</tbody></table></body></html>'
        );
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    });

    loadRoomTypes().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load room types.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
