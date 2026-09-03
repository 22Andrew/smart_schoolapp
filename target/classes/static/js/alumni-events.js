document.addEventListener('DOMContentLoaded', function () {
    const calTitle = document.getElementById('calTitle');
    const calBody = document.getElementById('calBody');
    const tableBody = document.getElementById('eventTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const modal = document.getElementById('eventModal');
    const modalContent = document.getElementById('eventModalContent');
    const viewModal = document.getElementById('eventViewModal');
    const form = document.getElementById('eventForm');
    const classFields = document.getElementById('classFields');
    const sessionSelect = document.getElementById('eventSession');
    const classSelect = document.getElementById('eventClass');
    const sectionSelect = document.getElementById('eventSection');
    const photoInput = document.getElementById('eventPhoto');
    const photoPreview = document.getElementById('eventPhotoPreview');
    const dropzone = document.getElementById('eventDropzone');
    const viewPhoto = document.getElementById('viewEventPhoto');
    const viewPlaceholder = viewPhoto ? viewPhoto.innerHTML : '';
    const viewIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
    const editIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    const deleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let viewDate = new Date();
    let rows = [];
    let classes = [];
    let currentPage = 1;
    let pageSize = 50;
    let tableFilter = '';
    let sortKey = 'fromDate';
    let sortDir = 'desc';

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('T')[0].split('-');
        if (parts.length !== 3) return String(value);
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function iso(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    function eventDates() {
        const set = {};
        rows.forEach(function (row) {
            const start = new Date(row.fromDate);
            const end = new Date(row.toDate || row.fromDate);
            if (isNaN(start)) return;
            const cursor = new Date(start);
            while (cursor <= end) {
                set[iso(cursor)] = true;
                cursor.setDate(cursor.getDate() + 1);
            }
        });
        return set;
    }

    function renderCalendar() {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        calTitle.textContent = months[month] + ' ' + year;
        const first = new Date(year, month, 1);
        const startOffset = (first.getDay() + 6) % 7;
        const start = new Date(year, month, 1 - startOffset);
        const today = iso(new Date());
        const marks = eventDates();
        let html = '';
        for (let week = 0; week < 6; week++) {
            html += '<tr>';
            for (let day = 0; day < 7; day++) {
                const cell = new Date(start);
                cell.setDate(start.getDate() + week * 7 + day);
                const key = iso(cell);
                const classes = [];
                if (cell.getMonth() !== month) classes.push('muted');
                if (key === today) classes.push('today');
                if (marks[key]) classes.push('has-event');
                html += '<td class="' + classes.join(' ') + '">' + cell.getDate() + '</td>';
            }
            html += '</tr>';
        }
        calBody.innerHTML = html;
    }

    function filteredRows() {
        const keyword = tableFilter.toLowerCase();
        let data = rows.filter(function (row) {
            return [row.title, row.classSection, row.sessionName, row.fromDate, row.toDate]
                .some(function (value) { return String(value || '').toLowerCase().includes(keyword); });
        });
        data.sort(function (a, b) {
            const left = String(a[sortKey] || '').toLowerCase();
            const right = String(b[sortKey] || '').toLowerCase();
            if (left < right) return sortDir === 'asc' ? -1 : 1;
            if (left > right) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }

    function renderTable() {
        const data = filteredRows();
        const total = data.length;
        const pages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > pages) currentPage = pages;
        const start = total ? (currentPage - 1) * pageSize : 0;
        const pageRows = data.slice(start, start + pageSize);
        tableBody.innerHTML = pageRows.length ? pageRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.title) + '</td>'
                + '<td>' + escapeHtml(row.classSection || 'All') + '</td>'
                + '<td>' + escapeHtml(row.sessionName || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(row.fromDate)) + '</td>'
                + '<td>' + escapeHtml(formatDate(row.toDate)) + '</td>'
                + '<td><div class="list-actions">'
                + '<button type="button" class="btn-action" data-view="' + row.id + '" title="View">' + viewIcon + '</button>'
                + '<button type="button" class="btn-action" data-edit="' + row.id + '" title="Edit">' + editIcon + '</button>'
                + '<button type="button" class="btn-action" data-delete="' + row.id + '" title="Delete">' + deleteIcon + '</button>'
                + '</div></td>'
                + '</tr>';
        }).join('') : '<tr><td colspan="6" class="empty-message">No data available in table</td></tr>';
        showingInfo.textContent = 'Showing ' + (total ? start + 1 : 0) + ' to ' + (start + pageRows.length) + ' of ' + total + ' entries';
        let html = '<button type="button" class="pagination-btn" data-page="prev"' + (currentPage === 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= pages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="next"' + (currentPage === pages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
        renderCalendar();
    }

    async function loadEvents() {
        rows = await fetch('/api/alumni/events').then(function (r) { return r.json(); }).catch(function () { return []; });
        currentPage = 1;
        renderTable();
    }

    function populateSections() {
        const selected = classes.find(function (item) { return String(item.id) === String(classSelect.value); });
        const sections = selected && Array.isArray(selected.sections) ? selected.sections : [];
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (name) {
            return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>';
        }).join('');
    }

    async function loadLookups() {
        const [sessions, classRows] = await Promise.all([
            fetch('/api/sessions').then(function (r) { return r.json(); }).catch(function () { return []; }),
            fetch('/api/classes').then(function (r) { return r.json(); }).catch(function () { return []; })
        ]);
        classes = classRows || [];
        sessionSelect.innerHTML = '<option value="">Select</option>' + (sessions || []).map(function (row) {
            return '<option value="' + row.id + '">' + escapeHtml(row.sessionName) + '</option>';
        }).join('');
        classSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (row) {
            return '<option value="' + row.id + '">' + escapeHtml(row.name) + '</option>';
        }).join('');
        populateSections();
    }

    function eventFor() {
        const checked = document.querySelector('input[name="eventFor"]:checked');
        return checked ? checked.value : 'ALL';
    }

    function syncEventFor() {
        classFields.classList.toggle('open', eventFor() === 'CLASS');
    }

    function setPhotoPreview(url) {
        if (url) {
            photoPreview.src = url;
            dropzone.classList.add('has-preview');
        } else {
            photoPreview.removeAttribute('src');
            dropzone.classList.remove('has-preview');
        }
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    function closeViewModal() {
        viewModal.classList.remove('active');
    }

    function openViewModal(row) {
        document.getElementById('viewEventTitle').textContent = row.title || '';
        document.getElementById('viewEventDates').textContent = formatDate(row.fromDate) + ' - ' + formatDate(row.toDate);
        document.getElementById('viewEventNote').textContent = row.note || '';
        document.getElementById('viewEventMessage').textContent = row.notificationMessage || '';
        if (row.photoUrl) {
            viewPhoto.innerHTML = '<img src="' + escapeHtml(row.photoUrl) + '" alt="">';
        } else {
            viewPhoto.innerHTML = viewPlaceholder;
        }
        viewModal.classList.add('active');
    }

    function openModal(row) {
        const isEdit = Boolean(row && row.id);
        form.reset();
        modalContent.classList.toggle('is-add', !isEdit);
        modalContent.classList.toggle('is-edit', isEdit);
        document.getElementById('eventId').value = isEdit ? row.id : '';
        document.getElementById('eventModalTitle').textContent = isEdit ? 'Edit Event' : 'Add Event';
        document.getElementById('eventNote').rows = isEdit ? 4 : 1;
        document.getElementById('eventMessage').rows = isEdit ? 4 : 3;
        const forValue = row && row.eventFor === 'CLASS' ? 'CLASS' : 'ALL';
        document.querySelector('input[name="eventFor"][value="' + forValue + '"]').checked = true;
        document.getElementById('eventTitle').value = row ? row.title || '' : '';
        document.getElementById('eventFrom').value = row && row.fromDate ? String(row.fromDate).slice(0, 10) : '';
        document.getElementById('eventTo').value = row && row.toDate ? String(row.toDate).slice(0, 10) : '';
        document.getElementById('eventNote').value = row ? row.note || '' : '';
        document.getElementById('eventMessage').value = row ? row.notificationMessage || '' : '';
        document.getElementById('notifyEmail').checked = Boolean(row && row.notifyEmail);
        document.getElementById('notifySms').checked = Boolean(row && row.notifySms);
        document.getElementById('smsTemplateId').value = row ? row.smsTemplateId || '' : '';
        sessionSelect.value = row && row.sessionId ? row.sessionId : '';
        classSelect.value = row && row.classId ? row.classId : '';
        populateSections();
        sectionSelect.value = row && row.sectionName ? row.sectionName : '';
        photoInput.value = '';
        setPhotoPreview(row ? row.photoUrl : '');
        syncEventFor();
        modal.classList.add('active');
    }

    function visibleRows() {
        const start = (currentPage - 1) * pageSize;
        return filteredRows().slice(start, start + pageSize);
    }

    function exportHeaders() {
        return ['Event Title', 'Class Section', 'Pass Out Session', 'From', 'To'];
    }

    function exportData() {
        return visibleRows().map(function (row) {
            return [row.title, row.classSection || 'All', row.sessionName || '', formatDate(row.fromDate), formatDate(row.toDate)];
        });
    }

    document.getElementById('calPrev').addEventListener('click', function () {
        viewDate.setMonth(viewDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', function () {
        viewDate.setMonth(viewDate.getMonth() + 1);
        renderCalendar();
    });
    document.getElementById('addEventBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('eventModalClose').addEventListener('click', closeModal);
    document.getElementById('eventModalOverlay').addEventListener('click', closeModal);
    document.getElementById('eventViewClose').addEventListener('click', closeViewModal);
    document.getElementById('eventViewOverlay').addEventListener('click', closeViewModal);
    document.querySelectorAll('input[name="eventFor"]').forEach(function (input) {
        input.addEventListener('change', syncEventFor);
    });
    classSelect.addEventListener('change', populateSections);
    photoInput.addEventListener('change', function () {
        const file = photoInput.files && photoInput.files[0];
        if (file) setPhotoPreview(URL.createObjectURL(file));
    });
    ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (e) {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
    });
    ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (e) {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });
    dropzone.addEventListener('drop', function (e) {
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;
        const transfer = new DataTransfer();
        transfer.items.add(file);
        photoInput.files = transfer.files;
        setPhotoPreview(URL.createObjectURL(file));
    });
    document.getElementById('tableSearchInput').addEventListener('input', function (e) {
        tableFilter = e.target.value || '';
        currentPage = 1;
        renderTable();
    });
    document.getElementById('entriesSelect').addEventListener('change', function (e) {
        pageSize = parseInt(e.target.value, 10) || 50;
        currentPage = 1;
        renderTable();
    });
    pagination.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-page]');
        if (!btn || btn.disabled) return;
        if (btn.dataset.page === 'prev') currentPage -= 1;
        else if (btn.dataset.page === 'next') currentPage += 1;
        else currentPage = parseInt(btn.dataset.page, 10);
        renderTable();
    });
    document.getElementById('eventTable').addEventListener('click', async function (e) {
        const th = e.target.closest('th[data-sort]');
        const viewBtn = e.target.closest('[data-view]');
        const editBtn = e.target.closest('[data-edit]');
        const deleteBtn = e.target.closest('[data-delete]');
        if (th) {
            const key = th.dataset.sort;
            if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else {
                sortKey = key;
                sortDir = 'asc';
            }
            renderTable();
            return;
        }
        if (viewBtn) {
            const row = rows.find(function (item) { return String(item.id) === String(viewBtn.dataset.view); });
            if (row) openViewModal(row);
            return;
        }
        if (editBtn) {
            const row = rows.find(function (item) { return String(item.id) === String(editBtn.dataset.edit); });
            if (row) openModal(row);
            return;
        }
        if (!deleteBtn) return;
        const confirmed = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'This event will be removed.',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#6b7280'
        });
        if (!confirmed.isConfirmed) return;
        try {
            const response = await fetch('/api/alumni/events/' + deleteBtn.dataset.delete, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Delete failed');
            await loadEvents();
            Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1200, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
        }
    });
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const id = document.getElementById('eventId').value;
        const fd = new FormData();
        fd.append('eventFor', eventFor());
        fd.append('title', document.getElementById('eventTitle').value.trim());
        fd.append('fromDate', document.getElementById('eventFrom').value);
        fd.append('toDate', document.getElementById('eventTo').value);
        fd.append('note', document.getElementById('eventNote').value.trim());
        fd.append('notificationMessage', document.getElementById('eventMessage').value.trim());
        fd.append('notifyEmail', document.getElementById('notifyEmail').checked ? 'true' : 'false');
        fd.append('notifySms', document.getElementById('notifySms').checked ? 'true' : 'false');
        fd.append('smsTemplateId', document.getElementById('smsTemplateId').value.trim());
        if (eventFor() === 'CLASS') {
            const selectedClass = classes.find(function (item) { return String(item.id) === String(classSelect.value); });
            const selectedSession = sessionSelect.options[sessionSelect.selectedIndex];
            fd.append('classId', classSelect.value);
            fd.append('className', selectedClass ? selectedClass.name : '');
            fd.append('sectionName', sectionSelect.value);
            fd.append('sessionId', sessionSelect.value);
            fd.append('sessionName', selectedSession ? selectedSession.textContent : '');
        }
        if (photoInput.files && photoInput.files[0]) fd.append('photo', photoInput.files[0]);
        try {
            const response = await fetch(id ? '/api/alumni/events/' + id : '/api/alumni/events', { method: 'POST', body: fd });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            closeModal();
            await loadEvents();
            Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1200, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
        }
    });
    document.getElementById('copyBtn').addEventListener('click', async function () {
        const text = [exportHeaders().join('\t')].concat(exportData().map(function (row) { return row.join('\t'); })).join('\n');
        await navigator.clipboard.writeText(text);
        Swal.fire({ icon: 'success', title: 'Copied', timer: 900, showConfirmButton: false });
    });
    document.getElementById('excelBtn').addEventListener('click', function () {
        const sheet = XLSX.utils.aoa_to_sheet([exportHeaders()].concat(exportData()));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, 'Events');
        XLSX.writeFile(wb, 'alumni-events.xlsx');
    });
    document.getElementById('csvBtn').addEventListener('click', function () {
        const csv = [exportHeaders().join(',')].concat(exportData().map(function (row) {
            return row.map(function (value) { return '"' + String(value || '').replace(/"/g, '""') + '"'; }).join(',');
        })).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'alumni-events.csv';
        link.click();
    });
    document.getElementById('pdfBtn').addEventListener('click', function () {
        const doc = new window.jspdf.jsPDF();
        doc.autoTable({ head: [exportHeaders()], body: exportData() });
        doc.save('alumni-events.pdf');
    });
    document.getElementById('printBtn').addEventListener('click', function () { window.print(); });

    loadLookups();
    loadEvents();
});
