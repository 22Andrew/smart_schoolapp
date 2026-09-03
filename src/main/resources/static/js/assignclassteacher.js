document.addEventListener('DOMContentLoaded', function () {
    const readOnly = window.academicsListReadOnly === true;
    const form = document.getElementById('assignTeacherForm');
    const assignmentIdInput = document.getElementById('assignmentId');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const teachersChecklist = document.getElementById('teachersChecklist');
    const saveBtn = document.getElementById('saveBtn');
    const tableBody = document.getElementById('assignmentTableBody');
    const tableSearch = document.getElementById('tableSearch');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const entriesInfo = document.getElementById('entriesInfo');
    const pagination = document.getElementById('pagination');

    let classes = [];
    let teachers = [];
    let assignments = [];
    let filtered = [];
    let currentPage = 1;
    let sortKey = 'className';
    let sortAsc = true;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function createActionButtonsHtml() {
        if (readOnly) {
            return '';
        }
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
        assignmentIdInput.value = '';
        saveBtn.textContent = 'Save';
        fillSectionSelect();
        renderTeachersChecklist('');
    }

    function fillClassSelect() {
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
        sectionSelect.innerHTML = '<option value="">Select</option>';
        const schoolClass = classes.find(function (c) { return String(c.id) === String(classSelect.value); });
        const sections = schoolClass && schoolClass.sections ? schoolClass.sections : [];
        sections.forEach(function (section) {
            const option = document.createElement('option');
            option.value = String(section);
            option.textContent = String(section);
            sectionSelect.appendChild(option);
        });
        if (preferred) sectionSelect.value = preferred;
    }

    function renderTeachersChecklist(selectedCode) {
        if (!teachers.length) {
            teachersChecklist.innerHTML = '<div class="empty-hint">No teachers available</div>';
            return;
        }
        teachersChecklist.innerHTML = teachers.map(function (teacher) {
            const checked = String(teacher.code) === String(selectedCode) ? ' checked' : '';
            return '<label class="check-item">'
                + '<input type="radio" name="classTeacher" value="' + escapeHtml(String(teacher.code)) + '"'
                + ' data-name="' + escapeHtml(teacher.name) + '"' + checked + '>'
                + '<span>' + escapeHtml(teacher.display || (teacher.name + ' (' + teacher.code + ')')) + '</span>'
                + '</label>';
        }).join('');
    }

    function getSelectedTeacher() {
        const selected = teachersChecklist.querySelector('input[name="classTeacher"]:checked');
        if (!selected) return null;
        return {
            code: selected.value,
            name: selected.getAttribute('data-name') || ''
        };
    }

    function applyFilters() {
        const query = (tableSearch.value || '').trim().toLowerCase();
        filtered = assignments.filter(function (row) {
            if (!query) return true;
            return [row.className, row.section, row.teacherDisplay, row.teacherName, row.teacherCode]
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
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No class teacher assignments found</td></tr>';
            entriesInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.className || '') + '</td>'
                + '<td>' + escapeHtml(row.section || '') + '</td>'
                + '<td>' + escapeHtml(row.teacherDisplay || '') + '</td>'
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

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect();
        fillSectionSelect();
    }

    async function loadTeachers() {
        const response = await fetch('/api/class-teachers');
        if (!response.ok) throw new Error('Failed to load teachers');
        teachers = await response.json();
        renderTeachersChecklist('');
    }

    async function loadAssignments() {
        const response = await fetch('/api/class-teacher-assignments');
        if (!response.ok) throw new Error('Failed to load assignments');
        assignments = await response.json();
        applyFilters();
    }

    classSelect.addEventListener('change', function () {
        fillSectionSelect();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const teacher = getSelectedTeacher();
        if (!classSelect.value || !sectionSelect.value || !teacher) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select Class, Section and Class Teacher.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const payload = {
            classId: classSelect.value,
            section: sectionSelect.value,
            teacherCode: teacher.code,
            teacherName: teacher.name
        };

        const editingId = assignmentIdInput.value;
        try {
            const response = await fetch(
                editingId ? '/api/class-teacher-assignments/' + editingId : '/api/class-teacher-assignments',
                {
                    method: editingId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );
            if (!response.ok) {
                throw new Error(await parseErrorMessage(response));
            }
            await loadAssignments();
            resetForm();
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Updated' : 'Saved',
                text: editingId ? 'Class teacher assignment updated.' : 'Class teacher assigned successfully.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save assignment.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const item = assignments.find(function (a) { return String(a.id) === String(id); });
        if (!item) return;

        if (e.target.closest('.btn-edit')) {
            assignmentIdInput.value = String(item.id);
            classSelect.value = String(item.classId);
            fillSectionSelect(item.section);
            renderTeachersChecklist(item.teacherCode);
            saveBtn.textContent = 'Update';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (e.target.closest('.btn-delete')) {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Assignment?',
                text: 'Remove class teacher for ' + item.className + ' (' + item.section + ')?',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await fetch('/api/class-teacher-assignments/' + id, { method: 'DELETE' });
                if (!response.ok && response.status !== 204) {
                    throw new Error(await parseErrorMessage(response));
                }
                if (assignmentIdInput.value === id) resetForm();
                await loadAssignments();
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
                    text: error.message || 'Failed to delete assignment.',
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

    document.querySelectorAll('#assignmentTable thead th[data-sort]').forEach(function (th) {
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
            return [row.className || '', row.section || '', row.teacherDisplay || ''];
        });
    }

    document.getElementById('copyBtn').addEventListener('click', function () {
        const text = ['Class\tSection\tClass Teacher']
            .concat(exportRows().map(function (r) { return r.join('\t'); }))
            .join('\n');
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
        });
    });

    document.getElementById('excelBtn').addEventListener('click', function () {
        if (typeof XLSX === 'undefined') return;
        const ws = XLSX.utils.aoa_to_sheet([['Class', 'Section', 'Class Teacher']].concat(exportRows()));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Class Teachers');
        XLSX.writeFile(wb, 'class-teacher-list.xlsx');
    });

    document.getElementById('pdfBtn').addEventListener('click', function () {
        if (!window.jspdf) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Class Teacher List', 14, 16);
        doc.autoTable({
            startY: 22,
            head: [['Class', 'Section', 'Class Teacher']],
            body: exportRows()
        });
        doc.save('class-teacher-list.pdf');
    });

    document.getElementById('printBtn').addEventListener('click', function () {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(''
            + '<html><head><title>Class Teacher List</title></head><body>'
            + '<h2>Class Teacher List</h2><table border="1" cellspacing="0" cellpadding="6">'
            + '<thead><tr><th>Class</th><th>Section</th><th>Class Teacher</th></tr></thead><tbody>'
            + exportRows().map(function (r) {
                return '<tr><td>' + escapeHtml(r[0]) + '</td><td>' + escapeHtml(r[1]) + '</td><td>' + escapeHtml(r[2]) + '</td></tr>';
            }).join('')
            + '</tbody></table></body></html>'
        );
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    });

    Promise.all([loadClasses(), loadTeachers(), loadAssignments()]).catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load Assign Class Teacher data.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
