document.addEventListener('DOMContentLoaded', function () {
    const criteriaForm = document.getElementById('criteriaForm');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const cardsGrid = document.getElementById('studentCardsGrid');

    let classes = [];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function populateSections() {
        const selected = classes.find(function (c) { return String(c.id) === String(classSelect.value); });
        const current = sectionSelect.value;
        sectionSelect.innerHTML = '<option value="">Select</option>';
        const sections = selected && Array.isArray(selected.sections) ? selected.sections : [];
        sections.forEach(function (name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            sectionSelect.appendChild(option);
        });
        if (current) sectionSelect.value = current;
    }

    function classOptionsHtml(selectedId) {
        let html = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const selected = String(selectedId) === String(item.id) ? ' selected' : '';
            html += '<option value="' + escapeHtml(item.id) + '"' + selected + '>' + escapeHtml(item.name) + '</option>';
        });
        return html;
    }

    function sectionOptionsHtml(classId, selectedSection) {
        const selectedClass = classes.find(function (c) { return String(c.id) === String(classId); });
        const sections = selectedClass && Array.isArray(selectedClass.sections) ? selectedClass.sections : [];
        let html = '<option value="">Select</option>';
        sections.forEach(function (name) {
            const selected = String(selectedSection || '').toLowerCase() === String(name).toLowerCase() ? ' selected' : '';
            html += '<option value="' + escapeHtml(name) + '"' + selected + '>' + escapeHtml(name) + '</option>';
        });
        return html;
    }

    function createClassRow(classId, section) {
        const row = document.createElement('div');
        row.className = 'class-row';
        row.innerHTML =
            '<div class="form-group">' +
                '<label>Class</label>' +
                '<select class="form-select student-class">' + classOptionsHtml(classId) + '</select>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>Section</label>' +
                '<select class="form-select student-section">' + sectionOptionsHtml(classId, section) + '</select>' +
            '</div>' +
            '<div class="form-group remove-group">' +
                '<label>&nbsp;</label>' +
                '<button type="button" class="btn-remove">Remove</button>' +
            '</div>';
        return row;
    }

    function bindCard(card) {
        const rowsContainer = card.querySelector('[data-class-rows]');
        const addBtn = card.querySelector('.btn-add-class');
        const updateBtn = card.querySelector('.btn-update');

        if (addBtn && rowsContainer) {
            addBtn.addEventListener('click', function () {
                const firstClassId = classSelect.value || (classes[0] && classes[0].id) || '';
                rowsContainer.appendChild(createClassRow(firstClassId, ''));
            });
        }

        if (rowsContainer) {
            rowsContainer.addEventListener('change', function (e) {
                const classField = e.target.closest('.student-class');
                if (!classField) return;
                const row = classField.closest('.class-row');
                const sectionField = row.querySelector('.student-section');
                if (sectionField) {
                    sectionField.innerHTML = sectionOptionsHtml(classField.value, '');
                }
            });

            rowsContainer.addEventListener('click', function (e) {
                const removeBtn = e.target.closest('.btn-remove');
                if (!removeBtn) return;
                const rows = rowsContainer.querySelectorAll('.class-row');
                if (rows.length <= 1) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Cannot Remove',
                        text: 'At least one class/section row is required.',
                        confirmButtonColor: '#8b5cf6'
                    });
                    return;
                }
                removeBtn.closest('.class-row').remove();
            });
        }

        if (updateBtn) {
            updateBtn.addEventListener('click', async function () {
                const studentId = card.getAttribute('data-student-id');
                const rows = Array.from(rowsContainer.querySelectorAll('.class-row'));
                const assignments = [];
                for (let i = 0; i < rows.length; i++) {
                    const classId = rows[i].querySelector('.student-class').value;
                    const section = rows[i].querySelector('.student-section').value;
                    if (!classId || !section) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Required Fields',
                            text: 'Please select class and section for every row.',
                            confirmButtonColor: '#8b5cf6'
                        });
                        return;
                    }
                    assignments.push({ classId: classId, section: section });
                }

                try {
                    const response = await fetch('/api/student-admissions/' + encodeURIComponent(studentId) + '/class-assignments', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assignments: assignments })
                    });
                    const data = await response.json().catch(function () { return {}; });
                    if (!response.ok) throw new Error(data.message || 'Failed to update class details');
                    Swal.fire({
                        icon: 'success',
                        title: 'Updated',
                        text: 'Class details updated.',
                        timer: 1600,
                        showConfirmButton: false
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to update class details.',
                        confirmButtonColor: '#8b5cf6'
                    });
                }
            });
        }
    }

    function renderStudents(students) {
        if (!students.length) {
            cardsGrid.innerHTML = '<div id="multiClassEmpty" style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:2rem;">No students found for the selected class and section</div>';
            return;
        }

        cardsGrid.innerHTML = students.map(function (item) {
            const assignments = Array.isArray(item.classAssignments) && item.classAssignments.length
                ? item.classAssignments
                : [{ classId: item.classId, section: item.section }];
            const rowsHtml = assignments.map(function (assignment) {
                return '<div class="class-row">'
                    + '<div class="form-group"><label>Class</label>'
                    + '<select class="form-select student-class">' + classOptionsHtml(assignment.classId) + '</select></div>'
                    + '<div class="form-group"><label>Section</label>'
                    + '<select class="form-select student-section">' + sectionOptionsHtml(assignment.classId, assignment.section) + '</select></div>'
                    + '<div class="form-group remove-group"><label>&nbsp;</label>'
                    + '<button type="button" class="btn-remove">Remove</button></div>'
                    + '</div>';
            }).join('');

            return '<div class="student-card" data-student-id="' + escapeHtml(item.id) + '">'
                + '<div class="student-card-header">'
                + '<h3 class="student-card-name">' + escapeHtml(item.studentName || '') + ' (' + escapeHtml(item.admissionNo || '') + ')</h3>'
                + '</div>'
                + '<div class="student-card-body">'
                + '<div class="class-rows" data-class-rows>' + rowsHtml + '</div>'
                + '<button type="button" class="btn-add-class">+ Add Class</button>'
                + '</div>'
                + '<div class="student-card-footer">'
                + '<button type="button" class="btn-update">Update</button>'
                + '</div></div>';
        }).join('');

        cardsGrid.querySelectorAll('.student-card').forEach(bindCard);
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
    }

    async function searchStudents() {
        const classId = classSelect.value;
        const section = sectionSelect.value;
        if (!classId || !section) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please select both Class and Section.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        const query = new URLSearchParams();
        query.set('classId', classId);
        query.set('section', section);
        const response = await fetch('/api/multi-class-students?' + query.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to search students');
        }
        const students = await response.json();
        renderStudents(students);
    }

    if (classSelect) classSelect.addEventListener('change', populateSections);
    if (criteriaForm) {
        criteriaForm.addEventListener('submit', function (e) {
            e.preventDefault();
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

    loadClasses().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load classes.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
