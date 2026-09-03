document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('liveMeetingsTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const addMeetingBtn = document.getElementById('addMeetingBtn');
    const meetingModal = document.getElementById('meetingModal');
    const meetingForm = document.getElementById('meetingForm');
    const staffListContainer = document.getElementById('staffListContainer');
    const staffViewModal = document.getElementById('staffViewModal');
    const invitedStaffTableBody = document.getElementById('invitedStaffTableBody');
    const invitedStaffSearchInput = document.getElementById('invitedStaffSearchInput');
    const invitedStaffEntriesSelect = document.getElementById('invitedStaffEntriesSelect');
    const invitedStaffShowingInfo = document.getElementById('invitedStaffShowingInfo');
    const invitedStaffPagination = document.getElementById('invitedStaffPagination');
    const invitedStaffCopyBtn = document.getElementById('invitedStaffCopyBtn');
    const invitedStaffExcelBtn = document.getElementById('invitedStaffExcelBtn');
    const invitedStaffCsvBtn = document.getElementById('invitedStaffCsvBtn');
    const invitedStaffPdfBtn = document.getElementById('invitedStaffPdfBtn');
    const invitedStaffPrintBtn = document.getElementById('invitedStaffPrintBtn');
    const invitedStaffColumnBtn = document.getElementById('invitedStaffColumnBtn');
    const invitedStaffColumnDropdown = document.getElementById('invitedStaffColumnDropdown');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let liveMeetings = [];
    let formOptions = { staff: [], statuses: ['Awaited', 'Started', 'Completed', 'Cancelled'] };
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    let invitedStaffRows = [];
    let staffCurrentPage = 1;
    let staffPageSize = parseInt(invitedStaffEntriesSelect && invitedStaffEntriesSelect.value, 10) || 50;
    let staffTableFilter = '';
    let staffSortKey = '';
    let staffSortDir = 'asc';
    let staffColumnVisibility = { staff: true, staffId: true, role: true };

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function emptyStateHtml() {
        return ''
            + '<tr class="empty-row"><td colspan="7">'
            + '<div class="empty-state"><p class="empty-message">No data available in table</p></div>'
            + '</td></tr>';
    }

    function sortValue(row, key) {
        switch (key) {
            case 'meetingTitle': return row.meetingTitle || '';
            case 'description': return row.description || '';
            case 'dateTime': return row.dateTime || '';
            case 'durationMinutes': return row.durationMinutes || 0;
            case 'createdBy': return row.createdBy || '';
            case 'status': return row.status || '';
            default: return '';
        }
    }

    function getFiltered() {
        let rows = liveMeetings.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.meetingTitle,
                    row.description,
                    row.dateTime,
                    row.createdBy,
                    row.status,
                    (row.staffMembers || []).join(' ')
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
                const av = sortValue(a, sortKey);
                const bv = sortValue(b, sortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function statusSelectHtml(row) {
        const id = escapeHtml(String(row.id));
        const current = row.status || 'Awaited';
        let html = '<select class="status-select" data-id="' + id + '">';
        (formOptions.statuses || ['Awaited', 'Started', 'Completed', 'Cancelled']).forEach(function (status) {
            html += '<option value="' + escapeHtml(status) + '"'
                + (status === current ? ' selected' : '') + '>' + escapeHtml(status) + '</option>';
        });
        html += '</select>';
        return html;
    }

    function actionButtonsHtml(row) {
        const id = escapeHtml(String(row.id));
        return ''
            + '<button type="button" class="btn-start" data-start="' + id + '" title="Start">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>'
            + '<polyline points="10 17 15 12 10 7"></polyline>'
            + '<line x1="15" y1="12" x2="3" y2="12"></line>'
            + '</svg> Start</button>'
            + '<button type="button" class="btn-view-users" data-view="' + id + '" title="Invited Staff">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>'
            + '<circle cx="9" cy="7" r="4"></circle>'
            + '<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>'
            + '<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-delete-meeting" data-delete="' + id + '" title="Delete">'
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
                + '<td>' + escapeHtml(row.meetingTitle || '') + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td>' + escapeHtml(row.dateTime || '') + '</td>'
                + '<td>' + escapeHtml(row.durationMinutes == null ? '' : row.durationMinutes) + '</td>'
                + '<td>' + escapeHtml(row.createdBy || '') + '</td>'
                + '<td>' + statusSelectHtml(row) + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(row) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    function renderStaffCheckboxes() {
        if (!staffListContainer) return;
        const staff = formOptions.staff || [];
        if (!staff.length) {
            staffListContainer.innerHTML = '<p class="staff-empty">No staff available</p>';
            return;
        }
        staffListContainer.innerHTML = staff.map(function (member) {
            return '<label class="staff-check-item">'
                + '<input type="checkbox" name="staffIds" value="' + escapeHtml(String(member.id)) + '">'
                + '<span>' + escapeHtml(member.label) + '</span>'
                + '</label>';
        }).join('');
    }

    async function loadFormOptions() {
        const response = await fetch('/api/gmeet/live-meetings/form-options');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load form options');
        }
        formOptions = await response.json();
        renderStaffCheckboxes();
    }

    async function loadLiveMeetings() {
        const response = await fetch('/api/gmeet/live-meetings');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load live meetings');
        }
        liveMeetings = await response.json();
        renderTable();
    }

    function openModal() {
        if (!meetingForm) return;
        meetingForm.reset();
        renderStaffCheckboxes();
        meetingModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        meetingModal.hidden = true;
        document.body.style.overflow = '';
    }

    function closeStaffViewModal() {
        staffViewModal.hidden = true;
        document.body.style.overflow = '';
        if (invitedStaffColumnDropdown) {
            invitedStaffColumnDropdown.classList.remove('active');
        }
    }

    function parseStaffMemberLabel(label) {
        const value = String(label == null ? '' : label).trim();
        const match = value.match(/^(.+?)\s+\(([^:]+)\s*:\s*(.+?)\)$/);
        if (!match) {
            return { staff: value, staffId: '', role: '' };
        }
        return {
            staff: match[1].trim(),
            role: match[2].trim(),
            staffId: match[3].trim()
        };
    }

    function getInvitedStaffFromRow(row) {
        if (row.invitedStaff && row.invitedStaff.length) {
            return row.invitedStaff.map(function (item) {
                return {
                    staff: item.staff || '',
                    staffId: item.staffId == null ? '' : String(item.staffId),
                    role: item.role || ''
                };
            });
        }
        return (row.staffMembers || []).map(parseStaffMemberLabel);
    }

    function invitedStaffSortValue(row, key) {
        switch (key) {
            case 'staff': return row.staff || '';
            case 'staffId': return row.staffId || '';
            case 'role': return row.role || '';
            default: return '';
        }
    }

    function getFilteredInvitedStaff() {
        let rows = invitedStaffRows.slice();
        const filter = staffTableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [row.staff, row.staffId, row.role].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (staffSortKey) {
            rows.sort(function (a, b) {
                const av = invitedStaffSortValue(a, staffSortKey);
                const bv = invitedStaffSortValue(b, staffSortKey);
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return staffSortDir === 'asc' ? -1 : 1;
                if (as > bs) return staffSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function invitedStaffEmptyStateHtml() {
        return ''
            + '<tr class="empty-row"><td colspan="3">'
            + '<div class="empty-state"><p class="empty-message">No staff assigned</p></div>'
            + '</td></tr>';
    }

    function renderInvitedStaffPagination(total, totalPages) {
        if (!invitedStaffPagination) return;
        let html = '<button type="button" class="pagination-btn" data-staff-nav="prev"'
            + (staffCurrentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';

        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === staffCurrentPage ? ' active' : '')
                + '" data-staff-page="' + page + '">' + page + '</button>';
        }

        html += '<button type="button" class="pagination-btn" data-staff-nav="next"'
            + (staffCurrentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        invitedStaffPagination.innerHTML = html;
    }

    function applyInvitedStaffColumnVisibility() {
        document.querySelectorAll('#invitedStaffTable [data-col]').forEach(function (el) {
            const col = el.dataset.col;
            if (staffColumnVisibility[col]) {
                el.classList.remove('hidden-col');
            } else {
                el.classList.add('hidden-col');
            }
        });
    }

    function renderInvitedStaffTable() {
        if (!invitedStaffTableBody) return;

        const filtered = getFilteredInvitedStaff();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / staffPageSize) || 1);
        if (staffCurrentPage > totalPages) staffCurrentPage = totalPages;

        if (!total) {
            invitedStaffTableBody.innerHTML = invitedStaffEmptyStateHtml();
            if (invitedStaffShowingInfo) invitedStaffShowingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderInvitedStaffPagination(0, 1);
            applyInvitedStaffColumnVisibility();
            return;
        }

        const start = (staffCurrentPage - 1) * staffPageSize;
        const end = Math.min(start + staffPageSize, total);
        const pageRows = filtered.slice(start, end);

        invitedStaffTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr>'
                + '<td data-col="staff">' + escapeHtml(row.staff) + '</td>'
                + '<td data-col="staffId">' + escapeHtml(row.staffId) + '</td>'
                + '<td data-col="role">' + escapeHtml(row.role) + '</td>'
                + '</tr>';
        }).join('');

        if (invitedStaffShowingInfo) {
            invitedStaffShowingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderInvitedStaffPagination(total, totalPages);
        applyInvitedStaffColumnVisibility();
    }

    function getInvitedStaffExportRows() {
        const headers = [];
        const keys = [];
        if (staffColumnVisibility.staff) {
            headers.push('Staff');
            keys.push('staff');
        }
        if (staffColumnVisibility.staffId) {
            headers.push('Staff ID');
            keys.push('staffId');
        }
        if (staffColumnVisibility.role) {
            headers.push('Role');
            keys.push('role');
        }
        const rows = getFilteredInvitedStaff().map(function (row) {
            return keys.map(function (key) { return row[key] || ''; });
        });
        return { headers: headers, rows: rows };
    }

    function exportInvitedStaff(type) {
        const exportData = getInvitedStaffExportRows();
        if (!exportData.rows.length) {
            Swal.fire({
                icon: 'info',
                title: 'No data',
                text: 'There is no staff data to export.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        if (type === 'copy') {
            let text = exportData.headers.join('\t') + '\n';
            exportData.rows.forEach(function (row) {
                text += row.join('\t') + '\n';
            });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Invited staff data copied to clipboard',
                    timer: 2000,
                    showConfirmButton: false,
                    confirmButtonColor: '#8b5cf6'
                });
            });
            return;
        }

        if (type === 'print') {
            window.print();
            return;
        }

        if (type === 'csv') {
            const csv = [exportData.headers.join(',')].concat(exportData.rows.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('invited-staff.csv', csv, 'text/csv');
            return;
        }

        if (type === 'excel' && window.XLSX) {
            const worksheet = XLSX.utils.aoa_to_sheet([exportData.headers].concat(exportData.rows));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Invited Staff');
            XLSX.writeFile(workbook, 'invited-staff.xlsx');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({ head: [exportData.headers], body: exportData.rows });
            doc.save('invited-staff.pdf');
        }
    }

    function getSelectedStaffIds() {
        return Array.from(document.querySelectorAll('#staffListContainer input[name="staffIds"]:checked'))
            .map(function (input) { return input.value; });
    }

    async function saveMeeting(event) {
        event.preventDefault();

        const staffIds = getSelectedStaffIds();
        const payload = {
            meetingTitle: document.getElementById('meetingTitle').value.trim(),
            meetingDateTime: document.getElementById('meetingDateTime').value,
            durationMinutes: document.getElementById('durationMinutes').value,
            gmeetUrl: document.getElementById('gmeetUrl').value.trim(),
            description: document.getElementById('description').value.trim(),
            staffIds: staffIds,
            createdByLabel: formOptions.defaultCreatedBy || 'Self'
        };

        if (!payload.meetingTitle || !payload.meetingDateTime || !payload.durationMinutes
            || !payload.gmeetUrl || !staffIds.length) {
            throw new Error('Please fill all required fields and select at least one staff member.');
        }

        const response = await fetch('/api/gmeet/live-meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to save live meeting');
        }

        closeModal();
        await loadLiveMeetings();
        Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: 'Live meeting added successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function updateStatus(id, status) {
        const response = await fetch('/api/gmeet/live-meetings/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to update status');
        }
        const updated = await response.json();
        liveMeetings = liveMeetings.map(function (row) {
            return String(row.id) === String(id) ? updated : row;
        });
        renderTable();
    }

    async function deleteMeeting(id) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete live meeting?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) return;

        const response = await fetch('/api/gmeet/live-meetings/' + id, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete live meeting');
        }
        liveMeetings = liveMeetings.filter(function (row) {
            return String(row.id) !== String(id);
        });
        renderTable();
    }

    function startMeeting(id) {
        const row = liveMeetings.find(function (item) {
            return String(item.id) === String(id);
        });
        if (!row) return;
        if (row.gmeetUrl) {
            window.open(row.gmeetUrl, '_blank');
        }
        updateStatus(id, 'Started').catch(showError);
    }

    function viewStaff(id) {
        const row = liveMeetings.find(function (item) {
            return String(item.id) === String(id);
        });
        if (!row || !staffViewModal) return;

        invitedStaffRows = getInvitedStaffFromRow(row);
        staffCurrentPage = 1;
        staffTableFilter = '';
        staffSortKey = '';
        staffSortDir = 'asc';
        if (invitedStaffSearchInput) invitedStaffSearchInput.value = '';
        renderInvitedStaffTable();
        staffViewModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function exportTable(type) {
        const filtered = getFiltered();
        if (!filtered.length) {
            Swal.fire({
                icon: 'info',
                title: 'No data',
                text: 'There is no data to export.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const headers = ['Meeting Title', 'Description', 'Date Time', 'Duration', 'Created By', 'Status'];
        const rows = filtered.map(function (row) {
            return [
                row.meetingTitle,
                row.description,
                row.dateTime,
                row.durationMinutes,
                row.createdBy,
                row.status
            ];
        });

        if (type === 'print') {
            window.print();
            return;
        }

        if (type === 'csv') {
            const csv = [headers.join(',')].concat(rows.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('live-meetings.csv', csv, 'text/csv');
            return;
        }

        if (type === 'excel' && window.XLSX) {
            const worksheet = XLSX.utils.aoa_to_sheet([headers].concat(rows));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Meetings');
            XLSX.writeFile(workbook, 'live-meetings.xlsx');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({ head: [headers], body: rows });
            doc.save('live-meetings.pdf');
        }
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    if (addMeetingBtn) addMeetingBtn.addEventListener('click', openModal);

    if (meetingForm) {
        meetingForm.addEventListener('submit', function (event) {
            saveMeeting(event).catch(showError);
        });
    }

    meetingModal && meetingModal.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    staffViewModal && staffViewModal.querySelectorAll('[data-close-staff-modal]').forEach(function (el) {
        el.addEventListener('click', closeStaffViewModal);
    });

    if (invitedStaffSearchInput) {
        invitedStaffSearchInput.addEventListener('input', function () {
            staffTableFilter = invitedStaffSearchInput.value;
            staffCurrentPage = 1;
            renderInvitedStaffTable();
        });
    }

    if (invitedStaffEntriesSelect) {
        invitedStaffEntriesSelect.addEventListener('change', function () {
            staffPageSize = parseInt(invitedStaffEntriesSelect.value, 10) || 50;
            staffCurrentPage = 1;
            renderInvitedStaffTable();
        });
    }

    if (invitedStaffPagination) {
        invitedStaffPagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.staffPage) {
                staffCurrentPage = parseInt(btn.dataset.staffPage, 10);
            } else if (btn.dataset.staffNav === 'prev') {
                staffCurrentPage -= 1;
            } else if (btn.dataset.staffNav === 'next') {
                staffCurrentPage += 1;
            }
            renderInvitedStaffTable();
        });
    }

    document.querySelectorAll('#invitedStaffTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.dataset.sort;
            if (staffSortKey === key) {
                staffSortDir = staffSortDir === 'asc' ? 'desc' : 'asc';
            } else {
                staffSortKey = key;
                staffSortDir = 'asc';
            }
            renderInvitedStaffTable();
        });
    });

    if (invitedStaffCopyBtn) invitedStaffCopyBtn.addEventListener('click', function () { exportInvitedStaff('copy'); });
    if (invitedStaffExcelBtn) invitedStaffExcelBtn.addEventListener('click', function () { exportInvitedStaff('excel'); });
    if (invitedStaffCsvBtn) invitedStaffCsvBtn.addEventListener('click', function () { exportInvitedStaff('csv'); });
    if (invitedStaffPdfBtn) invitedStaffPdfBtn.addEventListener('click', function () { exportInvitedStaff('pdf'); });
    if (invitedStaffPrintBtn) invitedStaffPrintBtn.addEventListener('click', function () { exportInvitedStaff('print'); });

    if (invitedStaffColumnBtn && invitedStaffColumnDropdown) {
        invitedStaffColumnBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            invitedStaffColumnDropdown.classList.toggle('active');
        });
        invitedStaffColumnDropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        document.addEventListener('click', function () {
            invitedStaffColumnDropdown.classList.remove('active');
        });
        invitedStaffColumnDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const col = checkbox.dataset.col;
                staffColumnVisibility[col] = checkbox.checked;
                const visibleCount = Object.keys(staffColumnVisibility).filter(function (key) {
                    return staffColumnVisibility[key];
                }).length;
                if (!visibleCount) {
                    staffColumnVisibility[col] = true;
                    checkbox.checked = true;
                    return;
                }
                applyInvitedStaffColumnVisibility();
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

    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.page) {
                currentPage = parseInt(btn.dataset.page, 10);
            } else if (btn.dataset.nav === 'prev') {
                currentPage -= 1;
            } else if (btn.dataset.nav === 'next') {
                currentPage += 1;
            }
            renderTable();
        });
    }

    document.querySelectorAll('.data-table thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.dataset.sort;
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            renderTable();
        });
    });

    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            const startBtn = event.target.closest('[data-start]');
            if (startBtn) {
                startMeeting(startBtn.dataset.start);
                return;
            }
            const viewBtn = event.target.closest('[data-view]');
            if (viewBtn) {
                viewStaff(viewBtn.dataset.view);
                return;
            }
            const deleteBtn = event.target.closest('[data-delete]');
            if (deleteBtn) {
                deleteMeeting(deleteBtn.dataset.delete).catch(showError);
            }
        });

        tableBody.addEventListener('change', function (event) {
            const select = event.target.closest('.status-select');
            if (select) {
                updateStatus(select.dataset.id, select.value).catch(showError);
            }
        });
    }

    if (excelBtn) excelBtn.addEventListener('click', function () { exportTable('excel'); });
    if (csvBtn) csvBtn.addEventListener('click', function () { exportTable('csv'); });
    if (pdfBtn) pdfBtn.addEventListener('click', function () { exportTable('pdf'); });
    if (printBtn) printBtn.addEventListener('click', function () { exportTable('print'); });

    Promise.all([loadFormOptions(), loadLiveMeetings()]).catch(showError);
});
