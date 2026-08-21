document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('hostelRoomForm');
    const hostelRoomIdInput = document.getElementById('hostelRoomId');
    const roomNumberInput = document.getElementById('roomNumber');
    const hostelSelect = document.getElementById('hostelSelect');
    const roomTypeSelect = document.getElementById('roomTypeSelect');
    const numberOfBedInput = document.getElementById('numberOfBed');
    const costPerBedInput = document.getElementById('costPerBed');
    const roomDescriptionInput = document.getElementById('roomDescription');
    const saveBtn = document.getElementById('saveBtn');
    const tableBody = document.getElementById('hostelRoomTableBody');
    const tableSearch = document.getElementById('tableSearch');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const entriesInfo = document.getElementById('entriesInfo');
    const pagination = document.getElementById('pagination');

    let rooms = [];
    let hostels = [];
    let roomTypes = [];
    let filtered = [];
    let currentPage = 1;
    let sortKey = 'roomNumber';
    let sortAsc = true;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        if (window.AppCurrency) return window.AppCurrency.formatCurrency(value);
        const num = Number(value);
        if (isNaN(num)) return value == null ? '' : String(value);
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        hostelRoomIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    function fillHostelSelect() {
        const current = hostelSelect.value;
        hostelSelect.innerHTML = '<option value="">Select</option>';
        hostels.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.hostelName;
            hostelSelect.appendChild(option);
        });
        if (current) hostelSelect.value = current;
    }

    function fillRoomTypeSelect() {
        const current = roomTypeSelect.value;
        roomTypeSelect.innerHTML = '<option value="">Select</option>';
        roomTypes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.roomType;
            roomTypeSelect.appendChild(option);
        });
        if (current) roomTypeSelect.value = current;
    }

    function applyFilters() {
        const query = (tableSearch.value || '').trim().toLowerCase();
        filtered = rooms.filter(function (row) {
            if (!query) return true;
            return [
                row.roomNumber,
                row.hostelName,
                row.roomTypeName,
                row.numberOfBed,
                row.costPerBed,
                row.description
            ].join(' ').toLowerCase().indexOf(query) !== -1;
        });

        filtered.sort(function (a, b) {
            const av = a[sortKey] == null ? '' : a[sortKey];
            const bv = b[sortKey] == null ? '' : b[sortKey];
            if (typeof av === 'number' && typeof bv === 'number') {
                return sortAsc ? av - bv : bv - av;
            }
            const as = String(av).toLowerCase();
            const bs = String(bv).toLowerCase();
            if (as < bs) return sortAsc ? -1 : 1;
            if (as > bs) return sortAsc ? 1 : -1;
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
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No hostel rooms found</td></tr>';
            entriesInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.roomNumber || '') + '</td>'
                + '<td>' + escapeHtml(row.hostelName || '') + '</td>'
                + '<td>' + escapeHtml(row.roomTypeName || '') + '</td>'
                + '<td>' + escapeHtml(row.numberOfBed == null ? '' : String(row.numberOfBed)) + '</td>'
                + '<td>$' + escapeHtml(formatMoney(row.costPerBed)) + '</td>'
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

    async function loadHostels() {
        const response = await fetch('/api/hostels');
        if (!response.ok) throw new Error('Failed to load hostels');
        hostels = await response.json();
        fillHostelSelect();
    }

    async function loadRoomTypes() {
        const response = await fetch('/api/room-types');
        if (!response.ok) throw new Error('Failed to load room types');
        roomTypes = await response.json();
        fillRoomTypeSelect();
    }

    async function loadRooms() {
        const response = await fetch('/api/hostel-rooms');
        if (!response.ok) throw new Error('Failed to load hostel rooms');
        rooms = await response.json();
        applyFilters();
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = {
            roomNumber: roomNumberInput.value.trim(),
            hostelId: hostelSelect.value,
            roomTypeId: roomTypeSelect.value,
            numberOfBed: numberOfBedInput.value,
            costPerBed: costPerBedInput.value,
            description: roomDescriptionInput.value.trim()
        };

        if (!payload.roomNumber || !payload.hostelId || !payload.roomTypeId
            || !payload.numberOfBed || payload.costPerBed === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please fill Room Number, Hostel, Room Type, Number Of Bed and Cost Per Bed.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const editingId = hostelRoomIdInput.value;
        try {
            const response = await fetch(
                editingId ? '/api/hostel-rooms/' + editingId : '/api/hostel-rooms',
                {
                    method: editingId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );
            if (!response.ok) {
                throw new Error(await parseErrorMessage(response));
            }
            await loadRooms();
            resetForm();
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Updated' : 'Saved',
                text: editingId ? 'Hostel room updated successfully.' : 'Hostel room saved successfully.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save hostel room.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const item = rooms.find(function (r) { return String(r.id) === String(id); });
        if (!item) return;

        if (e.target.closest('.btn-edit')) {
            hostelRoomIdInput.value = String(item.id);
            roomNumberInput.value = item.roomNumber || '';
            hostelSelect.value = item.hostelId != null ? String(item.hostelId) : '';
            roomTypeSelect.value = item.roomTypeId != null ? String(item.roomTypeId) : '';
            numberOfBedInput.value = item.numberOfBed == null ? '' : item.numberOfBed;
            costPerBedInput.value = item.costPerBed == null ? '' : item.costPerBed;
            roomDescriptionInput.value = item.description || '';
            saveBtn.textContent = 'Update';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (e.target.closest('.btn-delete')) {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Hostel Room?',
                text: 'Remove room "' + item.roomNumber + '"?',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await fetch('/api/hostel-rooms/' + id, { method: 'DELETE' });
                if (!response.ok && response.status !== 204) {
                    throw new Error(await parseErrorMessage(response));
                }
                if (hostelRoomIdInput.value === id) resetForm();
                await loadRooms();
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
                    text: error.message || 'Failed to delete hostel room.',
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

    document.querySelectorAll('#hostelRoomTable thead th[data-sort]').forEach(function (th) {
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
            return [
                row.roomNumber || '',
                row.hostelName || '',
                row.roomTypeName || '',
                row.numberOfBed == null ? '' : String(row.numberOfBed),
                row.costPerBed == null ? '' : formatMoney(row.costPerBed)
            ];
        });
    }

    document.getElementById('copyBtn').addEventListener('click', function () {
        const text = ['Room Number / Name\tHostel\tRoom Type\tNumber Of Bed\tCost Per Bed']
            .concat(exportRows().map(function (r) { return r.join('\t'); }))
            .join('\n');
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
        });
    });

    document.getElementById('excelBtn').addEventListener('click', function () {
        if (typeof XLSX === 'undefined') return;
        const ws = XLSX.utils.aoa_to_sheet(
            [['Room Number / Name', 'Hostel', 'Room Type', 'Number Of Bed', 'Cost Per Bed']].concat(exportRows())
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hostel Rooms');
        XLSX.writeFile(wb, 'hostel-room-list.xlsx');
    });

    document.getElementById('pdfBtn').addEventListener('click', function () {
        if (!window.jspdf) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Hostel Room List', 14, 16);
        doc.autoTable({
            startY: 22,
            head: [['Room Number / Name', 'Hostel', 'Room Type', 'Number Of Bed', 'Cost Per Bed']],
            body: exportRows()
        });
        doc.save('hostel-room-list.pdf');
    });

    document.getElementById('printBtn').addEventListener('click', function () {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(''
            + '<html><head><title>Hostel Room List</title></head><body>'
            + '<h2>Hostel Room List</h2><table border="1" cellspacing="0" cellpadding="6">'
            + '<thead><tr><th>Room Number / Name</th><th>Hostel</th><th>Room Type</th><th>Number Of Bed</th><th>Cost Per Bed</th></tr></thead><tbody>'
            + exportRows().map(function (r) {
                return '<tr><td>' + escapeHtml(r[0]) + '</td><td>' + escapeHtml(r[1]) + '</td><td>'
                    + escapeHtml(r[2]) + '</td><td>' + escapeHtml(r[3]) + '</td><td>$'
                    + escapeHtml(r[4]) + '</td></tr>';
            }).join('')
            + '</tbody></table></body></html>'
        );
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    });

    Promise.all([loadHostels(), loadRoomTypes(), loadRooms()]).catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load hostel room data. Add Hostels and Room Types first.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
