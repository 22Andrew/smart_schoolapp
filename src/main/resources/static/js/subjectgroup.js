document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('groupTable');
    const tableBody = document.getElementById('groupTableBody');
    const form = document.getElementById('subjectGroupForm');
    const groupIdInput = document.getElementById('groupId');
    const groupNameInput = document.getElementById('groupName');
    const classSelect = document.getElementById('classSelect');
    const sectionsChecklist = document.getElementById('sectionsChecklist');
    const subjectsChecklist = document.getElementById('subjectsChecklist');
    const groupDescriptionInput = document.getElementById('groupDescription');
    const saveBtn = document.getElementById('saveBtn');

    let classes = [];
    let subjects = [];
    let groups = [];

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
        groupIdInput.value = '';
        saveBtn.textContent = 'Save';
        renderSectionsChecklist([]);
        renderSubjectsChecklist([]);
    }

    function getSelectedSections() {
        return Array.from(sectionsChecklist.querySelectorAll('input[name="sections"]:checked'))
            .map(function (box) { return box.value; });
    }

    function getSelectedSubjectIds() {
        return Array.from(subjectsChecklist.querySelectorAll('input[name="subjects"]:checked'))
            .map(function (box) { return box.value; });
    }

    function renderClassOptions() {
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
        if (current) {
            classSelect.value = current;
        }
    }

    function renderSectionsChecklist(selectedSections) {
        const selected = (selectedSections || []).map(function (s) { return String(s).toUpperCase(); });
        const classId = classSelect.value;
        const schoolClass = classes.find(function (c) { return String(c.id) === String(classId); });

        if (!schoolClass) {
            sectionsChecklist.innerHTML = '<div class="empty-hint">Select a class to load sections</div>';
            return;
        }

        const sectionList = schoolClass.sections || [];
        if (!sectionList.length) {
            sectionsChecklist.innerHTML = '<div class="empty-hint">No sections found for this class</div>';
            return;
        }

        sectionsChecklist.innerHTML = sectionList.map(function (section) {
            const value = String(section).toUpperCase();
            const checked = selected.indexOf(value) !== -1 ? ' checked' : '';
            return '<label class="check-item"><input type="checkbox" name="sections" value="'
                + escapeHtml(value) + '"' + checked + '> <span>' + escapeHtml(value) + '</span></label>';
        }).join('');
    }

    function renderSubjectsChecklist(selectedIds) {
        const selected = (selectedIds || []).map(function (id) { return String(id); });
        if (!subjects.length) {
            subjectsChecklist.innerHTML = '<div class="empty-hint">No subjects available. Add subjects first.</div>';
            return;
        }

        subjectsChecklist.innerHTML = subjects.map(function (item) {
            const checked = selected.indexOf(String(item.id)) !== -1 ? ' checked' : '';
            return '<label class="check-item"><input type="checkbox" name="subjects" value="'
                + item.id + '"' + checked + '> <span>' + escapeHtml(item.name) + '</span></label>';
        }).join('');
    }

    function formatClassSections(group) {
        const className = group.schoolClass && group.schoolClass.name ? group.schoolClass.name : '';
        const sections = group.sections || [];
        if (!sections.length) {
            return className;
        }
        return sections.map(function (section, index) {
            return (index + 1) + '. ' + className + '(' + section + ')';
        }).join('\n');
    }

    function formatSubjects(group) {
        const list = group.subjects || [];
        return list.map(function (subject) { return subject.name; }).join('\n');
    }

    function renderGroups() {
        tableBody.innerHTML = '';
        if (!groups.length) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No subject groups found</td></tr>';
            return;
        }

        groups.forEach(function (group) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', String(group.id));
            tr.innerHTML = ''
                + '<td class="group-name">' + escapeHtml(group.name) + '</td>'
                + '<td class="list-cell">' + escapeHtml(formatClassSections(group)) + '</td>'
                + '<td class="list-cell">' + escapeHtml(formatSubjects(group)) + '</td>'
                + '<td class="action-cell">' + createActionButtonsHtml() + '</td>';
            tableBody.appendChild(tr);
        });
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
        renderClassOptions();
    }

    async function loadSubjects() {
        const response = await fetch('/api/subjects');
        if (!response.ok) throw new Error('Failed to load subjects');
        subjects = await response.json();
        renderSubjectsChecklist([]);
    }

    async function loadGroups() {
        const response = await fetch('/api/subject-groups');
        if (!response.ok) throw new Error('Failed to load subject groups');
        groups = await response.json();
        renderGroups();
    }

    async function bootstrap() {
        try {
            await Promise.all([loadClasses(), loadSubjects(), loadGroups()]);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load subject group data.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    classSelect.addEventListener('change', function () {
        renderSectionsChecklist([]);
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = groupNameInput.value.trim();
        const classId = classSelect.value;
        const sections = getSelectedSections();
        const subjectIds = getSelectedSubjectIds();
        const description = groupDescriptionInput.value.trim();

        if (!name) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter a name.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!classId) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select a class.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!sections.length) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select at least one section.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!subjectIds.length) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select at least one subject.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        const editingId = groupIdInput.value;
        const payload = {
            name: name,
            classId: classId,
            sections: sections,
            subjectIds: subjectIds,
            description: description
        };

        try {
            let response;
            if (editingId) {
                response = await fetch('/api/subject-groups/' + editingId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch('/api/subject-groups', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                throw new Error(await parseErrorMessage(response));
            }

            resetForm();
            await loadGroups();
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Updated' : 'Saved',
                text: editingId ? 'Subject group updated successfully.' : 'Subject group saved to database.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save subject group.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    tableBody.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        const row = e.target.closest('tr');
        if (!row) return;

        if (editBtn) {
            const id = row.getAttribute('data-id');
            const group = groups.find(function (g) { return String(g.id) === String(id); });
            if (!group) return;

            groupIdInput.value = String(group.id);
            groupNameInput.value = group.name || '';
            groupDescriptionInput.value = group.description || '';
            classSelect.value = group.schoolClass ? String(group.schoolClass.id) : '';
            renderSectionsChecklist(group.sections || []);
            renderSubjectsChecklist((group.subjects || []).map(function (s) { return s.id; }));
            saveBtn.textContent = 'Update';
            groupNameInput.focus();
            return;
        }

        if (deleteBtn) {
            const id = row.getAttribute('data-id');
            const name = row.querySelector('.group-name').textContent.trim();

            Swal.fire({
                icon: 'warning',
                title: 'Delete Subject Group?',
                text: '"' + name + '" will be deleted from the database.',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            }).then(async function (result) {
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/subject-groups/' + id, { method: 'DELETE' });
                    if (!response.ok && response.status !== 204) {
                        throw new Error('Failed to delete subject group');
                    }
                    if (groupIdInput.value === id) {
                        resetForm();
                    }
                    await loadGroups();
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted',
                        text: 'Subject group deleted from database.',
                        timer: 1400,
                        showConfirmButton: false
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to delete subject group.',
                        confirmButtonColor: '#8b5cf6'
                    });
                }
            });
        }
    });

    function getTableData() {
        const headers = ['Name', 'Class (Section)', 'Subject'];
        const data = groups.map(function (group) {
            return [
                group.name || '',
                formatClassSections(group).replace(/\n/g, ', '),
                formatSubjects(group).replace(/\n/g, ', ')
            ];
        });
        return { headers: headers, data: data };
    }

    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            const result = getTableData();
            const jsPDF = window.jspdf.jsPDF;
            const doc = new jsPDF('l', 'pt', 'a4');
            doc.setFontSize(16);
            doc.text('Subject Group List', 40, 40);
            doc.setFontSize(10);
            doc.text('Generated on: ' + new Date().toLocaleDateString(), 40, 58);
            doc.autoTable({
                head: [result.headers],
                body: result.data,
                startY: 70,
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: { fontSize: 9, cellPadding: 4 }
            });
            doc.save('Subject_Groups_' + new Date().toISOString().split('T')[0] + '.pdf');
        });
    }

    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            const result = getTableData();
            let printContent = ''
                + '<!DOCTYPE html><html><head><title>Subject Group List</title><style>'
                + 'body{font-family:Arial,sans-serif;margin:20px}'
                + 'table{width:100%;border-collapse:collapse;margin-top:20px}'
                + 'th,td{border:1px solid #ddd;padding:10px;text-align:left;font-size:12px}'
                + 'th{background:#1e293b;color:#fff}'
                + '</style></head><body><h1>Subject Group List</h1><table><thead><tr>';
            result.headers.forEach(function (header) {
                printContent += '<th>' + header + '</th>';
            });
            printContent += '</tr></thead><tbody>';
            result.data.forEach(function (row) {
                printContent += '<tr>';
                row.forEach(function (cell) {
                    printContent += '<td>' + cell + '</td>';
                });
                printContent += '</tr>';
            });
            printContent += '</tbody></table></body></html>';
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
            };
        });
    }

    bootstrap();
});
