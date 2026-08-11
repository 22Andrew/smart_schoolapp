document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('liveMeetingsTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const addMeetingBtn = document.getElementById('addMeetingBtn');
    const addCredentialBtn = document.getElementById('addCredentialBtn');
    const meetingModal = document.getElementById('meetingModal');
    const credentialModal = document.getElementById('credentialModal');
    const meetingForm = document.getElementById('meetingForm');
    const credentialForm = document.getElementById('credentialForm');
    const staffListContainer = document.getElementById('staffListContainer');
    const resetCredentialBtn = document.getElementById('resetCredentialBtn');
    const getAccessTokenBtn = document.getElementById('getAccessTokenBtn');
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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function emptyStateHtml() {
        return ''
            + '<tr class="empty-row"><td colspan="8">'
            + '<div class="empty-state"><p class="empty-message">No data available in table</p></div>'
            + '</td></tr>';
    }

    function sortValue(row, key) {
        switch (key) {
            case 'meetingTitle': return row.meetingTitle || '';
            case 'description': return row.description || '';
            case 'dateTime': return row.dateTime || '';
            case 'durationMinutes': return row.durationMinutes || 0;
            case 'apiUsed': return row.apiUsed || '';
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
                    row.apiUsed,
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
            + '<button type="button" class="btn-join-meeting" data-join="' + id + '" title="Join Meeting">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M23 7l-7 5 7 5V7z"></path>'
            + '<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>'
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
                + '<td>' + escapeHtml(row.apiUsed || '') + '</td>'
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
        const response = await fetch('/api/conference/live-meetings/form-options');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load form options');
        }
        formOptions = await response.json();
        renderStaffCheckboxes();
    }

    async function loadLiveMeetings() {
        const response = await fetch('/api/conference/live-meetings');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load live meetings');
        }
        liveMeetings = await response.json();
        renderTable();
    }

    async function loadCredentials() {
        const response = await fetch('/api/conference/credentials');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load credentials');
        }
        const data = await response.json();
        document.getElementById('zoomApiKey').value = data.apiKey || '';
        document.getElementById('zoomApiSecret').value = data.apiSecret || '';
        const redirectEl = document.getElementById('zoomRedirectUrl');
        if (redirectEl) {
            redirectEl.textContent = data.redirectUrl || '';
        }
        return data;
    }

    function openMeetingModal() {
        if (!meetingForm) return;
        meetingForm.reset();
        renderStaffCheckboxes();
        meetingModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeMeetingModal() {
        meetingModal.hidden = true;
        document.body.style.overflow = '';
    }

    async function openCredentialModal() {
        await loadCredentials();
        credentialModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeCredentialModal() {
        credentialModal.hidden = true;
        document.body.style.overflow = '';
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
            hostVideo: document.getElementById('hostVideo').checked,
            clientVideo: document.getElementById('clientVideo').checked,
            description: document.getElementById('description').value.trim(),
            staffIds: staffIds,
            apiUsed: formOptions.defaultApiUsed || 'Self',
            createdByLabel: formOptions.defaultCreatedBy || 'Self'
        };

        if (!payload.meetingTitle || !payload.meetingDateTime || !payload.durationMinutes || !staffIds.length) {
            throw new Error('Please fill all required fields and select at least one staff member.');
        }

        const response = await fetch('/api/conference/live-meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to save live meeting');
        }

        closeMeetingModal();
        await loadLiveMeetings();
        Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: 'Live meeting added successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function saveCredentials(event) {
        event.preventDefault();
        const payload = {
            apiKey: document.getElementById('zoomApiKey').value.trim(),
            apiSecret: document.getElementById('zoomApiSecret').value.trim()
        };

        if (!payload.apiKey || !payload.apiSecret) {
            throw new Error('Zoom API Key and Secret are required.');
        }

        const response = await fetch('/api/conference/credentials', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to save credentials');
        }

        closeCredentialModal();
        Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: 'Zoom credentials saved successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function resetCredentials() {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Reset credentials?',
            text: 'This will clear the API key, secret, and access token.',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Reset'
        });
        if (!result.isConfirmed) return;

        const response = await fetch('/api/conference/credentials/reset', { method: 'POST' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to reset credentials');
        }

        await loadCredentials();
        Swal.fire({
            icon: 'success',
            title: 'Reset',
            text: 'Zoom credentials have been reset.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function requestAccessToken() {
        const response = await fetch('/api/conference/credentials/access-token', { method: 'POST' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to get access token');
        }

        Swal.fire({
            icon: 'success',
            title: 'Access Token',
            text: 'Access token generated successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function updateStatus(id, status) {
        const response = await fetch('/api/conference/live-meetings/' + id + '/status', {
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

        const response = await fetch('/api/conference/live-meetings/' + id, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete live meeting');
        }
        liveMeetings = liveMeetings.filter(function (row) {
            return String(row.id) !== String(id);
        });
        renderTable();
    }

    function joinMeeting(id) {
        const row = liveMeetings.find(function (item) {
            return String(item.id) === String(id);
        });
        if (!row) return;
        if (row.meetingUrl) {
            window.open(row.meetingUrl, '_blank');
        }
        updateStatus(id, 'Started').catch(showError);
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

        const headers = ['Meeting Title', 'Description', 'Date Time', 'Duration', 'Api Used', 'Created By', 'Status'];
        const rows = filtered.map(function (row) {
            return [
                row.meetingTitle,
                row.description,
                row.dateTime,
                row.durationMinutes,
                row.apiUsed,
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

    if (addMeetingBtn) addMeetingBtn.addEventListener('click', openMeetingModal);
    if (addCredentialBtn) addCredentialBtn.addEventListener('click', function () {
        openCredentialModal().catch(showError);
    });

    if (meetingForm) {
        meetingForm.addEventListener('submit', function (event) {
            saveMeeting(event).catch(showError);
        });
    }

    if (credentialForm) {
        credentialForm.addEventListener('submit', function (event) {
            saveCredentials(event).catch(showError);
        });
    }

    if (resetCredentialBtn) {
        resetCredentialBtn.addEventListener('click', function () {
            resetCredentials().catch(showError);
        });
    }

    if (getAccessTokenBtn) {
        getAccessTokenBtn.addEventListener('click', function () {
            requestAccessToken().catch(showError);
        });
    }

    meetingModal && meetingModal.querySelectorAll('[data-close-meeting-modal]').forEach(function (el) {
        el.addEventListener('click', closeMeetingModal);
    });

    credentialModal && credentialModal.querySelectorAll('[data-close-credential-modal]').forEach(function (el) {
        el.addEventListener('click', closeCredentialModal);
    });

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

    document.querySelectorAll('#liveMeetingsTable thead th[data-sort]').forEach(function (th) {
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
        tableBody.addEventListener('change', function (event) {
            const select = event.target.closest('.status-select');
            if (!select) return;
            updateStatus(select.dataset.id, select.value).catch(showError);
        });

        tableBody.addEventListener('click', function (event) {
            const joinBtn = event.target.closest('[data-join]');
            if (joinBtn) {
                joinMeeting(joinBtn.dataset.join);
                return;
            }
            const deleteBtn = event.target.closest('[data-delete]');
            if (deleteBtn) {
                deleteMeeting(deleteBtn.dataset.delete).catch(showError);
            }
        });
    }

    if (excelBtn) excelBtn.addEventListener('click', function () { exportTable('excel'); });
    if (csvBtn) csvBtn.addEventListener('click', function () { exportTable('csv'); });
    if (pdfBtn) pdfBtn.addEventListener('click', function () { exportTable('pdf'); });
    if (printBtn) printBtn.addEventListener('click', function () { exportTable('print'); });

    Promise.all([loadFormOptions(), loadLiveMeetings()]).catch(showError);
});
