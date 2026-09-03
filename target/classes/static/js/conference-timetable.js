document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('liveClassesTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const addLiveClassBtn = document.getElementById('addLiveClassBtn');
    const liveClassModal = document.getElementById('liveClassModal');
    const liveClassForm = document.getElementById('liveClassForm');
    const roleSelect = document.getElementById('roleSelect');
    const staffSelect = document.getElementById('staffSelect');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let liveClasses = [];
    let formOptions = { staff: [], classes: [], statuses: ['Awaited', 'Started', 'Completed', 'Cancelled'] };
    let schoolClasses = [];
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
            + '<tr class="empty-row"><td colspan="10">'
            + '<div class="empty-state"><p class="empty-message">No data available in table</p></div>'
            + '</td></tr>';
    }

    function sortValue(row, key) {
        switch (key) {
            case 'classTitle': return row.classTitle || '';
            case 'description': return row.description || '';
            case 'dateTime': return row.dateTime || '';
            case 'durationMinutes': return row.durationMinutes || 0;
            case 'apiUsed': return row.apiUsed || '';
            case 'createdBy': return row.createdBy || '';
            case 'createdFor': return row.createdFor || '';
            case 'status': return row.status || '';
            default: return '';
        }
    }

    function getFiltered() {
        let rows = liveClasses.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.classTitle,
                    row.description,
                    row.dateTime,
                    row.apiUsed,
                    row.createdBy,
                    row.createdFor,
                    row.status,
                    (row.classSections || []).join(' ')
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

    function classSectionsHtml(sections) {
        if (!sections || !sections.length) {
            return '<span>-</span>';
        }
        return '<div class="class-section-list">' + sections.map(function (label) {
            return '<label class="class-section-item"><input type="checkbox" checked disabled><span>'
                + escapeHtml(label) + '</span></label>';
        }).join('') + '</div>';
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
            + '<button type="button" class="btn-join-class" data-join="' + id + '" title="Join Class">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M23 7l-7 5 7 5V7z"></path>'
            + '<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>'
            + '</svg></button>'
            + '<button type="button" class="btn-delete-row" data-delete="' + id + '" title="Delete">'
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
                + '<td>' + escapeHtml(row.classTitle || '') + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td>' + escapeHtml(row.dateTime || '') + '</td>'
                + '<td>' + escapeHtml(row.durationMinutes == null ? '' : row.durationMinutes) + '</td>'
                + '<td>' + escapeHtml(row.apiUsed || '') + '</td>'
                + '<td>' + escapeHtml(row.createdBy || '') + '</td>'
                + '<td>' + escapeHtml(row.createdFor || '') + '</td>'
                + '<td>' + classSectionsHtml(row.classSections) + '</td>'
                + '<td>' + statusSelectHtml(row) + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(row) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    function populateSelect(select, options, placeholder) {
        if (!select) return;
        let html = '<option value="">' + escapeHtml(placeholder || 'Select') + '</option>';
        options.forEach(function (option) {
            if (typeof option === 'string') {
                html += '<option value="' + escapeHtml(option) + '">' + escapeHtml(option) + '</option>';
            } else {
                html += '<option value="' + escapeHtml(String(option.id)) + '">' + escapeHtml(option.label) + '</option>';
            }
        });
        select.innerHTML = html;
    }

    function filterStaffByRole() {
        if (!staffSelect || !roleSelect) return;
        const role = roleSelect.value;
        let staff = formOptions.staff || [];
        if (role) {
            staff = staff.filter(function (member) {
                return member.role === role;
            });
        }
        populateSelect(staffSelect, staff, 'Select');
    }

    function fillClassSelect() {
        if (!classSelect) return;
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        schoolClasses.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
        if (current) classSelect.value = current;
    }

    function fillSectionSelect() {
        if (!sectionSelect) return;
        sectionSelect.innerHTML = '<option value="">Select</option>';

        const selectedClass = schoolClasses.find(function (item) {
            return String(item.id) === String(classSelect.value);
        });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];

        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            sectionSelect.appendChild(option);
        });
    }

    async function loadFormOptions() {
        const response = await fetch('/api/conference/live-classes/form-options');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load form options');
        }
        formOptions = await response.json();
        schoolClasses = formOptions.classes || [];
        populateSelect(roleSelect, formOptions.roles || [], 'Select');
        fillClassSelect();
        fillSectionSelect();
        filterStaffByRole();
    }

    async function loadLiveClasses() {
        const response = await fetch('/api/conference/live-classes');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load live classes');
        }
        liveClasses = await response.json();
        renderTable();
    }

    async function refreshSchoolClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) {
            throw new Error('Failed to load classes');
        }
        schoolClasses = await response.json();
        fillClassSelect();
        fillSectionSelect();
    }

    function openModal() {
        if (!liveClassForm) return;
        liveClassForm.reset();
        filterStaffByRole();
        refreshSchoolClasses().catch(showError);
        liveClassModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        liveClassModal.hidden = true;
        document.body.style.overflow = '';
    }

    async function saveLiveClass(event) {
        event.preventDefault();

        const payload = {
            classTitle: document.getElementById('classTitle').value.trim(),
            classDate: document.getElementById('classDate').value,
            durationMinutes: document.getElementById('durationMinutes').value,
            role: roleSelect.value,
            staffId: staffSelect.value,
            classId: classSelect.value,
            section: sectionSelect.value,
            hostVideo: document.getElementById('hostVideo').checked,
            clientVideo: document.getElementById('clientVideo').checked,
            description: document.getElementById('description').value.trim(),
            createdByLabel: formOptions.defaultCreatedBy || 'Self',
            apiUsed: formOptions.defaultApiUsed || 'Global'
        };

        if (!payload.classTitle || !payload.classDate || !payload.durationMinutes
            || !payload.role || !payload.staffId || !payload.classId || !payload.section) {
            throw new Error('Please fill all required fields.');
        }

        const response = await fetch('/api/conference/live-classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to save live class');
        }

        closeModal();
        await loadLiveClasses();
        Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: 'Live class added successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function updateStatus(id, status) {
        const response = await fetch('/api/conference/live-classes/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to update status');
        }
        const updated = await response.json();
        liveClasses = liveClasses.map(function (row) {
            return String(row.id) === String(id) ? updated : row;
        });
        renderTable();
    }

    async function deleteLiveClass(id) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete live class?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) return;

        const response = await fetch('/api/conference/live-classes/' + id, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete live class');
        }
        liveClasses = liveClasses.filter(function (row) {
            return String(row.id) !== String(id);
        });
        renderTable();
    }

    function joinLiveClass(id) {
        const row = liveClasses.find(function (item) {
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

        const headers = ['Class Title', 'Description', 'Date Time', 'Duration', 'Api Used', 'Created By', 'Created For', 'Class', 'Status'];
        const rows = filtered.map(function (row) {
            return [
                row.classTitle,
                row.description,
                row.dateTime,
                row.durationMinutes,
                row.apiUsed,
                row.createdBy,
                row.createdFor,
                (row.classSections || []).join(', '),
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
            downloadFile('live-classes.csv', csv, 'text/csv');
            return;
        }

        if (type === 'excel' && window.XLSX) {
            const worksheet = XLSX.utils.aoa_to_sheet([headers].concat(rows));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Classes');
            XLSX.writeFile(workbook, 'live-classes.xlsx');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({
                head: [headers],
                body: rows
            });
            doc.save('live-classes.pdf');
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

    if (addLiveClassBtn) {
        addLiveClassBtn.addEventListener('click', openModal);
    }

    if (liveClassForm) {
        liveClassForm.addEventListener('submit', function (event) {
            saveLiveClass(event).catch(showError);
        });
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', filterStaffByRole);
    }

    if (classSelect) {
        classSelect.addEventListener('change', fillSectionSelect);
    }

    liveClassModal && liveClassModal.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', closeModal);
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

    document.querySelectorAll('#liveClassesTable thead th[data-sort]').forEach(function (th) {
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
            const joinBtn = event.target.closest('[data-join]');
            if (joinBtn) {
                joinLiveClass(joinBtn.dataset.join);
                return;
            }
            const deleteBtn = event.target.closest('[data-delete]');
            if (deleteBtn) {
                deleteLiveClass(deleteBtn.dataset.delete).catch(showError);
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

    Promise.all([loadFormOptions(), loadLiveClasses()]).catch(showError);
});
