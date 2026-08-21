document.addEventListener('DOMContentLoaded', function () {
    const feeGroupId = document.getElementById('feeGroupId').value;
    const sessionYear = document.getElementById('sessionYear').value || '2026-27';
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const categorySelect = document.getElementById('categorySelect');
    const genderSelect = document.getElementById('genderSelect');
    const rteSelect = document.getElementById('rteSelect');
    const searchBtn = document.getElementById('searchBtn');
    const saveBtn = document.getElementById('saveBtn');
    const feesListBody = document.getElementById('feesListBody');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const selectAll = document.getElementById('selectAllStudents');

    let classes = [];
    let categories = [];
    let students = [];
    let assignedIds = new Set();

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        if (window.AppCurrency) return window.AppCurrency.formatCurrency(value);
        const num = Number(value);
        if (Number.isNaN(num)) return '$0.00';
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fullName(student) {
        return ((student.firstName || '') + ' ' + (student.lastName || '')).trim();
    }

    function classLabel(student) {
        const cls = student.className || '';
        const sec = student.section || '';
        if (cls && sec) return cls + '(' + sec + ')';
        return cls || sec || '';
    }

    function populateSections() {
        const selected = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
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

    async function loadLookups() {
        const [classesRes, categoriesRes] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/categories')
        ]);
        if (!classesRes.ok || !categoriesRes.ok) throw new Error('Failed to load filter lists');
        classes = await classesRes.json();
        categories = await categoriesRes.json();

        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            classSelect.appendChild(option);
        });

        categorySelect.innerHTML = '<option value="">Select</option>';
        categories.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.categoryName || item.name;
            categorySelect.appendChild(option);
        });
    }

    async function loadFeesList() {
        const response = await fetch('/api/fee-masters/group/' + feeGroupId + '?sessionYear=' + encodeURIComponent(sessionYear));
        if (!response.ok) throw new Error('Failed to load fees group details');
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        if (!items.length) {
            feesListBody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">No fees codes in this group</td></tr>';
            return;
        }
        feesListBody.innerHTML = items.map(function (item) {
            return '<tr>'
                + '<td>' + escapeHtml(item.feesCode || '') + '</td>'
                + '<td>' + escapeHtml(formatMoney(item.amount)) + '</td>'
                + '</tr>';
        }).join('');
    }

    async function loadAssignments() {
        const response = await fetch('/api/fee-group-assignments/' + feeGroupId + '?sessionYear=' + encodeURIComponent(sessionYear));
        if (!response.ok) throw new Error('Failed to load assignments');
        const data = await response.json();
        assignedIds = new Set((data.studentIds || []).map(String));
    }

    function renderStudents() {
        if (!students.length) {
            studentsTableBody.innerHTML = '<tr class="no-data-row"><td colspan="7" style="text-align:center;color:#94a3b8;">No students found</td></tr>';
            selectAll.checked = false;
            return;
        }

        studentsTableBody.innerHTML = students.map(function (student) {
            const id = String(student.id);
            const checked = assignedIds.has(id) ? ' checked' : '';
            return '<tr data-id="' + escapeHtml(id) + '">'
                + '<td><label class="student-check-label"><input type="checkbox" class="student-check"' + checked + '></label></td>'
                + '<td>' + escapeHtml(student.admissionNo || '') + '</td>'
                + '<td>' + escapeHtml(fullName(student)) + '</td>'
                + '<td>' + escapeHtml(classLabel(student)) + '</td>'
                + '<td>' + escapeHtml(student.fatherName || '') + '</td>'
                + '<td>' + escapeHtml(student.categoryName || '') + '</td>'
                + '<td>' + escapeHtml(student.gender || '') + '</td>'
                + '</tr>';
        }).join('');

        syncSelectAll();
    }

    function syncSelectAll() {
        const checks = studentsTableBody.querySelectorAll('.student-check');
        if (!checks.length) {
            selectAll.checked = false;
            return;
        }
        selectAll.checked = Array.from(checks).every(function (c) { return c.checked; });
    }

    function matchesFilters(student) {
        const categoryId = categorySelect.value;
        const gender = genderSelect.value;
        const rte = rteSelect.value;

        if (categoryId && String(student.categoryId || '') !== String(categoryId)) return false;
        if (gender && String(student.gender || '').toLowerCase() !== gender.toLowerCase()) return false;
        if (rte) {
            const studentRte = String(student.rte || '').toLowerCase();
            if (studentRte !== rte.toLowerCase()) return false;
        }
        return true;
    }

    async function searchStudents() {
        const classId = classSelect.value;
        if (!classId) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select a class.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        try {
            let url = '/api/student-admissions?classId=' + encodeURIComponent(classId);
            if (sectionSelect.value) {
                url += '&section=' + encodeURIComponent(sectionSelect.value);
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to search students');
            const data = await response.json();
            students = (Array.isArray(data) ? data : []).filter(matchesFilters);
            renderStudents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to search students.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    async function saveAssignments() {
        const selectedIds = Array.from(studentsTableBody.querySelectorAll('.student-check:checked'))
            .map(function (input) {
                return input.closest('tr').getAttribute('data-id');
            })
            .filter(Boolean);

        // Keep previously assigned students that are not in the current filtered result
        const currentResultIds = new Set(students.map(function (s) { return String(s.id); }));
        assignedIds.forEach(function (id) {
            if (!currentResultIds.has(id) && selectedIds.indexOf(id) === -1) {
                selectedIds.push(id);
            }
        });

        try {
            const response = await fetch('/api/fee-group-assignments/' + feeGroupId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionYear: sessionYear,
                    studentIds: selectedIds
                })
            });
            if (!response.ok) {
                let message = 'Failed to save assignments';
                try {
                    const err = await response.json();
                    message = err.message || message;
                } catch (e) { /* ignore */ }
                throw new Error(message);
            }
            assignedIds = new Set(selectedIds.map(String));
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Fees group assigned to selected students.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save assignments.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    if (classSelect) {
        classSelect.addEventListener('change', populateSections);
    }
    if (searchBtn) searchBtn.addEventListener('click', searchStudents);
    if (saveBtn) saveBtn.addEventListener('click', saveAssignments);

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            studentsTableBody.querySelectorAll('.student-check').forEach(function (checkbox) {
                checkbox.checked = selectAll.checked;
            });
        });
    }

    if (studentsTableBody) {
        studentsTableBody.addEventListener('change', function (e) {
            if (e.target.classList.contains('student-check')) {
                syncSelectAll();
            }
        });
    }

    Promise.all([loadLookups(), loadFeesList(), loadAssignments()]).catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load assign fees group page.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
