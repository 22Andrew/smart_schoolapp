document.addEventListener('DOMContentLoaded', function () {
    const sessionSelect = document.getElementById('sessionSelect');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const tableBody = document.getElementById('alumniTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const modal = document.getElementById('alumniModal');
    const form = document.getElementById('alumniForm');
    const photoInput = document.getElementById('alumniPhoto');
    const photoPreview = document.getElementById('alumniPhotoPreview');
    const dropzone = document.getElementById('alumniDropzone');
    const detailsList = document.getElementById('detailsList');
    const detailsEmpty = document.getElementById('detailsEmptyState');
    const pencil = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    let classes = [];
    let rows = [];
    let currentPage = 1;
    let pageSize = 50;
    let tableFilter = '';
    let sortKey = 'studentName';
    let sortDir = 'asc';

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function emptyRow() {
        return '<tr class="empty-row"><td colspan="7"><div class="empty-state"><p class="empty-message">No data available in table</p></div></td></tr>';
    }

    function filteredRows() {
        const keyword = tableFilter.toLowerCase();
        let data = rows.filter(function (row) {
            return Object.values(row).some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
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

    function actionHtml(id) {
        return '<div class="list-actions">'
            + '<button type="button" class="btn-action" data-edit="' + id + '" title="Edit">' + pencil + '</button>'
            + '<button type="button" class="btn-action" data-delete="' + id + '" title="Remove">' + closeIcon + '</button>'
            + '</div>';
    }

    function renderTable() {
        const data = filteredRows();
        const total = data.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > pages) currentPage = pages;
        const start = total ? (currentPage - 1) * pageSize : 0;
        const pageRows = data.slice(start, start + pageSize);
        tableBody.innerHTML = pageRows.length ? pageRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.admissionNumber) + '</td>'
                + '<td>' + escapeHtml(row.studentName) + '</td>'
                + '<td>' + escapeHtml(row.classLabel) + '</td>'
                + '<td>' + escapeHtml(row.gender) + '</td>'
                + '<td>' + escapeHtml(row.currentEmail) + '</td>'
                + '<td>' + escapeHtml(row.currentPhone) + '</td>'
                + '<td>' + actionHtml(row.id) + '</td>'
                + '</tr>';
        }).join('') : emptyRow();
        const from = total ? start + 1 : 0;
        const to = start + pageRows.length;
        showingInfo.textContent = 'Showing ' + from + ' to ' + to + ' of ' + total + ' entries';
        let html = '<button type="button" class="pagination-btn" data-page="prev"' + (currentPage === 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= pages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="next"' + (currentPage === pages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
        renderDetails(pageRows);
    }

    function renderDetails(pageRows) {
        if (!pageRows.length) {
            detailsList.innerHTML = '';
            detailsEmpty.style.display = '';
            return;
        }
        detailsEmpty.style.display = 'none';
        detailsList.innerHTML = pageRows.map(function (row) {
            const photo = row.photoUrl
                ? '<img src="' + escapeHtml(row.photoUrl) + '" alt="">'
                : '<div class="detail-avatar"></div>';
            return '<div class="alumni-detail-card">'
                + photo
                + '<div class="alumni-detail-meta"><h3>' + escapeHtml(row.studentName) + '</h3>'
                + '<p>' + escapeHtml(row.classLabel) + '</p>'
                + '<p>' + escapeHtml(row.currentEmail) + '</p>'
                + '<p>' + escapeHtml(row.currentPhone) + '</p></div>'
                + actionHtml(row.id)
                + '</div>';
        }).join('');
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
        const current = (sessions || []).find(function (row) { return row.current || row.sessionName === '2024-25'; });
        if (current) sessionSelect.value = current.id;
        const classOne = classes.find(function (row) { return String(row.name).toLowerCase() === 'class 1'; });
        if (classOne) {
            classSelect.value = classOne.id;
            populateSections();
            if (Array.from(sectionSelect.options).some(function (opt) { return opt.value === 'A'; })) {
                sectionSelect.value = 'A';
            }
        }
    }

    async function search(useAdmission) {
        const params = new URLSearchParams();
        if (useAdmission) {
            const admission = document.getElementById('admissionSearch').value.trim();
            if (!admission) {
                Swal.fire({ icon: 'warning', title: 'Admission number is required', confirmButtonColor: '#8b5cf6' });
                return;
            }
            params.set('admissionNumber', admission);
        } else {
            if (!sessionSelect.value || !classSelect.value) {
                Swal.fire({ icon: 'warning', title: 'Pass Out Session and Class are required', confirmButtonColor: '#8b5cf6' });
                return;
            }
            params.set('sessionId', sessionSelect.value);
            params.set('classId', classSelect.value);
            if (sectionSelect.value) params.set('section', sectionSelect.value);
        }
        rows = await fetch('/api/alumni?' + params.toString()).then(function (r) { return r.json(); }).catch(function () { return []; });
        currentPage = 1;
        renderTable();
    }

    function closeModal() {
        modal.classList.remove('active');
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

    function openModal(row) {
        document.getElementById('alumniId').value = row.id;
        document.getElementById('alumniPhone').value = row.currentPhone || '';
        document.getElementById('alumniEmail').value = row.currentEmail || '';
        document.getElementById('alumniOccupation').value = row.occupation || '';
        document.getElementById('alumniAddress').value = row.address || '';
        photoInput.value = '';
        setPhotoPreview(row.photoUrl);
        modal.classList.add('active');
    }

    async function handleAction(e) {
        const editBtn = e.target.closest('[data-edit]');
        const delBtn = e.target.closest('[data-delete]');
        if (editBtn) {
            const row = rows.find(function (item) { return String(item.id) === String(editBtn.dataset.edit); });
            if (row) openModal(row);
            return;
        }
        if (!delBtn) return;
        const confirmed = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'This alumni record will be removed.',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#6b7280'
        });
        if (!confirmed.isConfirmed) return;
        await fetch('/api/alumni/' + delBtn.dataset.delete, { method: 'DELETE' });
        rows = rows.filter(function (item) { return String(item.id) !== String(delBtn.dataset.delete); });
        renderTable();
    }

    function visibleRows() {
        const start = (currentPage - 1) * pageSize;
        return filteredRows().slice(start, start + pageSize);
    }

    function exportHeaders() {
        return ['Admission No', 'Student Name', 'Class', 'Gender', 'Current Email', 'Current Phone'];
    }

    function exportData() {
        return visibleRows().map(function (row) {
            return [row.admissionNumber, row.studentName, row.classLabel, row.gender, row.currentEmail, row.currentPhone];
        });
    }

    document.querySelectorAll('.view-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.view-tab').forEach(function (item) { item.classList.remove('active'); });
            document.querySelectorAll('.view-panel').forEach(function (item) { item.classList.remove('active'); });
            tab.classList.add('active');
            document.getElementById(tab.dataset.view === 'details' ? 'detailsViewPanel' : 'listViewPanel').classList.add('active');
        });
    });
    classSelect.addEventListener('change', populateSections);
    document.getElementById('criteriaSearchBtn').addEventListener('click', function () { search(false); });
    document.getElementById('admissionSearchBtn').addEventListener('click', function () { search(true); });
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
    tableBody.addEventListener('click', handleAction);
    detailsList.addEventListener('click', handleAction);
    document.getElementById('alumniModalClose').addEventListener('click', closeModal);
    document.getElementById('alumniModalOverlay').addEventListener('click', closeModal);
    photoInput.addEventListener('change', function () {
        const file = photoInput.files && photoInput.files[0];
        if (file) setPhotoPreview(URL.createObjectURL(file));
    });
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const id = document.getElementById('alumniId').value;
        const fd = new FormData();
        fd.append('currentPhone', document.getElementById('alumniPhone').value.trim());
        fd.append('currentEmail', document.getElementById('alumniEmail').value.trim());
        fd.append('occupation', document.getElementById('alumniOccupation').value.trim());
        fd.append('address', document.getElementById('alumniAddress').value.trim());
        if (photoInput.files && photoInput.files[0]) fd.append('photo', photoInput.files[0]);
        try {
            const response = await fetch('/api/alumni/' + id, { method: 'POST', body: fd });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            closeModal();
            const index = rows.findIndex(function (item) { return String(item.id) === String(id); });
            if (index >= 0 && result.data) rows[index] = result.data;
            renderTable();
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
        XLSX.utils.book_append_sheet(wb, sheet, 'Alumni');
        XLSX.writeFile(wb, 'alumni.xlsx');
    });
    document.getElementById('csvBtn').addEventListener('click', function () {
        const csv = [exportHeaders().join(',')].concat(exportData().map(function (row) {
            return row.map(function (value) { return '"' + String(value || '').replace(/"/g, '""') + '"'; }).join(',');
        })).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'alumni.csv';
        link.click();
    });
    document.getElementById('pdfBtn').addEventListener('click', function () {
        const doc = new window.jspdf.jsPDF();
        doc.autoTable({ head: [exportHeaders()], body: exportData() });
        doc.save('alumni.pdf');
    });
    document.getElementById('printBtn').addEventListener('click', function () { window.print(); });

    tableBody.innerHTML = emptyRow();
    loadLookups();
});
