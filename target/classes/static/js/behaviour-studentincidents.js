document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const searchBtn = document.getElementById('searchBtn');
    const tableBody = document.getElementById('incidentTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const assignModal = document.getElementById('assignModal');
    const incidentListModal = document.getElementById('incidentListModal');
    const assignForm = document.getElementById('assignForm');
    const assignStudentId = document.getElementById('assignStudentId');
    const incidentOptions = document.getElementById('incidentOptions');
    const studentIncidentBody = document.getElementById('studentIncidentBody');

    let classes = [];
    let masterSections = [];
    let masterIncidents = [];
    let students = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 100;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';
    let listStudentId = null;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function studentFullName(row) {
        return row.studentName || [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
    }

    function classLabel(row) {
        if (row.classLabel) return row.classLabel;
        const className = row.className || '';
        const section = row.section || '';
        if (className && section) return className + '(' + section + ')';
        return className || section || '';
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value).trim();
        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return isoMatch[3] + '/' + isoMatch[2] + '/' + isoMatch[1];
        }
        return text;
    }

    function emptyStateHtml() {
        return ''
            + '<tr class="empty-row"><td colspan="7">'
            + '<div class="empty-state">'
            + '<p class="empty-message">No data available in table</p>'
            + '<p class="empty-hint">Select class/section and click Search.</p>'
            + '</div></td></tr>';
    }

    function fillClassSelect() {
        if (!classSelect) return;
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
        if (current) classSelect.value = current;
    }

    function fillSectionSelect(preferred) {
        if (!sectionSelect) return;
        sectionSelect.innerHTML = '<option value="">Select</option>';

        const selectedClass = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
        const classSections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (s) { return s.sectionName || s.name || s; });

        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            sectionSelect.appendChild(option);
        });

        if (preferred) sectionSelect.value = preferred;
    }

    function sortValue(row, key) {
        switch (key) {
            case 'name': return studentFullName(row);
            case 'admissionNo': return row.admissionNo || '';
            case 'class': return classLabel(row);
            case 'gender': return row.gender || '';
            case 'phone': return row.mobileNumber || '';
            case 'totalPoints': return Number(row.totalPoints || 0);
            default: return '';
        }
    }

    function getFilteredStudents() {
        let rows = students.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    studentFullName(row),
                    row.admissionNo,
                    classLabel(row),
                    row.gender,
                    row.mobileNumber,
                    row.totalPoints
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

    function actionButtonsHtml(row) {
        const id = escapeHtml(String(row.id));
        const name = escapeHtml(studentFullName(row) || 'Student');
        return ''
            + '<button type="button" class="btn-action btn-assign" data-id="' + id + '" data-name="' + name + '" title="Assign Incident">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-list" data-id="' + id + '" data-name="' + name + '" title="View Assigned Incidents">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="8" y1="6" x2="8" y2="18"></line>'
            + '<line x1="12" y1="6" x2="12" y2="18"></line>'
            + '<line x1="16" y1="6" x2="16" y2="18"></line>'
            + '</svg></button>';
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>‹</button>';

        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }

        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>›</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFilteredStudents();
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
            const name = studentFullName(row) || 'Student';
            const viewUrl = '/student/view/' + encodeURIComponent(String(row.id));
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td><a href="' + viewUrl + '" class="student-link">' + escapeHtml(name) + '</a></td>'
                + '<td>' + escapeHtml(row.admissionNo || '') + '</td>'
                + '<td>' + escapeHtml(classLabel(row)) + '</td>'
                + '<td>' + escapeHtml(row.gender || '') + '</td>'
                + '<td>' + escapeHtml(row.mobileNumber || '') + '</td>'
                + '<td>' + escapeHtml(String(row.totalPoints == null ? 0 : row.totalPoints)) + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(row) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    function renderIncidentOptions() {
        if (!incidentOptions) return;
        if (!masterIncidents.length) {
            incidentOptions.innerHTML = '<p class="empty-hint">No incidents available.</p>';
            return;
        }

        incidentOptions.innerHTML = masterIncidents.map(function (item) {
            return ''
                + '<label class="incident-option">'
                + '<div class="incident-option-main">'
                + '<p class="incident-option-title">' + escapeHtml(item.title || '') + '</p>'
                + '<p class="incident-option-desc">' + escapeHtml(item.description || '') + '</p>'
                + '</div>'
                + '<span class="incident-option-points">Point: ' + escapeHtml(String(item.points == null ? 0 : item.points)) + '</span>'
                + '<input type="checkbox" class="incident-option-check" name="incidentIds" value="'
                + escapeHtml(String(item.id)) + '">'
                + '</label>';
        }).join('');
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect();
        fillSectionSelect();
    }

    async function loadSections() {
        const response = await fetch('/api/sections');
        if (!response.ok) throw new Error('Failed to load sections');
        masterSections = await response.json();
        fillSectionSelect();
    }

    async function loadMasterIncidents() {
        const response = await fetch('/api/behaviour/incidents');
        if (!response.ok) throw new Error('Failed to load incidents');
        masterIncidents = await response.json();
        renderIncidentOptions();
    }

    async function searchStudents() {
        const classValue = classSelect ? classSelect.value : '';
        if (!classValue) {
            Swal.fire({
                icon: 'warning',
                title: 'Class Required',
                text: 'Please select a class to search.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const query = new URLSearchParams();
        query.set('classId', classValue);
        if (sectionSelect && sectionSelect.value) {
            query.set('section', sectionSelect.value);
        }

        const response = await fetch('/api/behaviour/student-incidents?' + query.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to search students');
        }

        students = await response.json();
        currentPage = 1;
        renderTable();

        if (!students.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Results',
                text: 'No students found for the selected criteria.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    function openAssignModal(id) {
        assignStudentId.value = id;
        if (incidentOptions) {
            incidentOptions.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
                cb.checked = false;
            });
        }
        assignModal.hidden = false;
    }

    function closeAssignModal() {
        assignModal.hidden = true;
    }

    async function openIncidentList(id) {
        listStudentId = id;
        studentIncidentBody.innerHTML = '<tr class="empty-row"><td colspan="6">Loading...</td></tr>';
        incidentListModal.hidden = false;

        const response = await fetch('/api/behaviour/student-incidents/' + encodeURIComponent(id));
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load incidents');
        }
        const rows = await response.json();
        if (!rows.length) {
            studentIncidentBody.innerHTML = '<tr class="empty-row"><td colspan="6">No incidents assigned.</td></tr>';
            return;
        }
        studentIncidentBody.innerHTML = rows.map(function (row) {
            return '<tr data-incident-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td>' + escapeHtml(String(row.points == null ? 0 : row.points)) + '</td>'
                + '<td>' + escapeHtml(formatDate(row.incidentDate)) + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td>' + escapeHtml(row.assignedBy || 'System') + '</td>'
                + '<td><button type="button" class="btn-action btn-delete-incident" data-id="'
                + escapeHtml(String(row.id)) + '" title="Delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="3 6 5 6 21 6"></polyline>'
                + '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>'
                + '<path d="M10 11v6"></path><path d="M14 11v6"></path>'
                + '</svg></button></td>'
                + '</tr>';
        }).join('');
    }

    function closeListModal() {
        incidentListModal.hidden = true;
        listStudentId = null;
    }

    function exportCsv() {
        const rows = getFilteredStudents();
        const lines = [['Student Name', 'Admission No', 'Class', 'Gender', 'Phone', 'Total Points']];
        rows.forEach(function (row) {
            lines.push([
                studentFullName(row),
                row.admissionNo || '',
                classLabel(row),
                row.gender || '',
                row.mobileNumber || '',
                row.totalPoints == null ? 0 : row.totalPoints
            ].map(function (value) {
                const text = String(value).replace(/"/g, '""');
                return '"' + text + '"';
            }).join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'assign-incident-list.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    if (classSelect) {
        classSelect.addEventListener('change', function () {
            fillSectionSelect();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            searchStudents().catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to search students.',
                    confirmButtonColor: '#8b5cf6'
                });
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
            pageSize = parseInt(entriesSelect.value, 10) || 100;
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            else if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
            renderTable();
        });
    }

    document.querySelectorAll('#incidentTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
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
        tableBody.addEventListener('click', function (e) {
            const assignBtn = e.target.closest('.btn-assign');
            if (assignBtn) {
                openAssignModal(assignBtn.dataset.id);
                return;
            }
            const listBtn = e.target.closest('.btn-list');
            if (listBtn) {
                openIncidentList(listBtn.dataset.id).catch(function (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to load incidents.',
                        confirmButtonColor: '#8b5cf6'
                    });
                });
            }
        });
    }

    document.querySelectorAll('[data-close-assign]').forEach(function (el) {
        el.addEventListener('click', closeAssignModal);
    });
    document.querySelectorAll('[data-close-list]').forEach(function (el) {
        el.addEventListener('click', closeListModal);
    });

    if (assignForm) {
        assignForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const selected = Array.from(assignForm.querySelectorAll('input[name="incidentIds"]:checked'))
                .map(function (cb) { return Number(cb.value); });

            if (!selected.length) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Incident Selected',
                    text: 'Please select at least one incident.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const payload = {
                studentAdmissionId: Number(assignStudentId.value),
                incidentIds: selected,
                incidentDate: new Date().toISOString().slice(0, 10)
            };

            try {
                const response = await fetch('/api/behaviour/student-incidents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || 'Failed to assign incident');
                }
                closeAssignModal();
                await searchStudents();
                Swal.fire({
                    icon: 'success',
                    title: 'Assigned',
                    text: 'Incident(s) assigned successfully.',
                    confirmButtonColor: '#8b5cf6',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to assign incident.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (studentIncidentBody) {
        studentIncidentBody.addEventListener('click', async function (e) {
            const btn = e.target.closest('.btn-delete-incident');
            if (!btn) return;
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete incident?',
                text: 'This cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await fetch('/api/behaviour/student-incidents/' + encodeURIComponent(btn.dataset.id), {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || 'Failed to delete incident');
                }
                await openIncidentList(listStudentId);
                await searchStudents();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete incident.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    if (excelBtn) excelBtn.addEventListener('click', exportCsv);
    if (csvBtn) csvBtn.addEventListener('click', exportCsv);
    if (pdfBtn) pdfBtn.addEventListener('click', function () { window.print(); });
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    Promise.all([loadClasses(), loadSections(), loadMasterIncidents()]).catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load page data.',
            confirmButtonColor: '#8b5cf6'
        });
    });

    renderTable();
});
