document.addEventListener('DOMContentLoaded', function () {
    const fromClass = document.getElementById('fromClass');
    const fromSection = document.getElementById('fromSection');
    const toClass = document.getElementById('toClass');
    const toSection = document.getElementById('toSection');
    const promoteSession = document.getElementById('promoteSession');
    const searchForm = document.getElementById('promoteSearchForm');
    const studentListPanel = document.getElementById('studentListPanel');
    const tableBody = document.getElementById('promoteTableBody');
    const selectAll = document.getElementById('selectAll');
    const promoteBtn = document.getElementById('promoteBtn');

    let classes = [];

    const sampleStudents = [
        { id: 1, admissionNo: '120020', name: 'Ayan Maqsood', fatherName: 'Edward Thomas', dob: '05/16/2014', className: 'Class 2', section: 'A' },
        { id: 2, admissionNo: '18001', name: 'Aliza', fatherName: 'Wilson', dob: '02/01/2015', className: 'Class 2', section: 'A' },
        { id: 3, admissionNo: '18002', name: 'Noah Khan', fatherName: 'Imran Khan', dob: '07/22/2014', className: 'Class 2', section: 'A' },
        { id: 4, admissionNo: '18003', name: 'Sara Ahmed', fatherName: 'Ahmed Raza', dob: '11/03/2014', className: 'Class 2', section: 'B' },
        { id: 5, admissionNo: '18004', name: 'Bilal Hussain', fatherName: 'Hussain Ali', dob: '01/19/2015', className: 'Class 1', section: 'A' },
        { id: 6, admissionNo: '18005', name: 'Fatima Noor', fatherName: 'Noor Alam', dob: '09/08/2014', className: 'Class 1', section: 'A' },
        { id: 7, admissionNo: '18006', name: 'Zain Malik', fatherName: 'Malik Asif', dob: '03/27/2015', className: 'Class 3', section: 'A' },
        { id: 8, admissionNo: '18007', name: 'Hira Shah', fatherName: 'Shahid', dob: '12/12/2014', className: 'Class 3', section: 'B' }
    ];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function fillClassSelect(selectEl) {
        const current = selectEl.value;
        selectEl.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            selectEl.appendChild(option);
        });
        if (current) selectEl.value = current;
    }

    function fillSectionSelect(selectEl, classId, preferred) {
        selectEl.innerHTML = '<option value="">Select</option>';
        const schoolClass = classes.find(function (c) { return String(c.id) === String(classId); });
        const sections = schoolClass && schoolClass.sections ? schoolClass.sections : [];
        sections.forEach(function (section) {
            const option = document.createElement('option');
            option.value = String(section);
            option.textContent = String(section);
            selectEl.appendChild(option);
        });
        if (preferred) selectEl.value = preferred;
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect(fromClass);
        fillClassSelect(toClass);
    }

    function renderStudents(students) {
        tableBody.innerHTML = '';
        if (!students.length) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No students found for the selected class and section.</td></tr>';
            return;
        }

        students.forEach(function (student) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', String(student.id));
            tr.innerHTML = ''
                + '<td><input type="checkbox" class="row-checkbox student-check" value="' + student.id + '"></td>'
                + '<td>' + escapeHtml(student.admissionNo) + '</td>'
                + '<td>' + escapeHtml(student.name) + '</td>'
                + '<td>' + escapeHtml(student.fatherName) + '</td>'
                + '<td>' + escapeHtml(student.dob) + '</td>'
                + '<td><div class="radio-inline-group">'
                + '<label class="radio-inline"><input type="radio" name="result_' + student.id + '" value="Pass" checked> <span>Pass</span></label>'
                + '<label class="radio-inline"><input type="radio" name="result_' + student.id + '" value="Fail"> <span>Fail</span></label>'
                + '</div></td>'
                + '<td><div class="radio-inline-group">'
                + '<label class="radio-inline"><input type="radio" name="status_' + student.id + '" value="Continue" checked> <span>Continue</span></label>'
                + '<label class="radio-inline"><input type="radio" name="status_' + student.id + '" value="Leave"> <span>Leave</span></label>'
                + '</div></td>';
            tableBody.appendChild(tr);
        });

        if (selectAll) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }
    }

    function syncSelectAll() {
        if (!selectAll) return;
        const boxes = Array.from(document.querySelectorAll('.student-check'));
        if (!boxes.length) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            return;
        }
        const checked = boxes.filter(function (b) { return b.checked; }).length;
        selectAll.checked = checked === boxes.length;
        selectAll.indeterminate = checked > 0 && checked < boxes.length;
    }

    fromClass.addEventListener('change', function () {
        fillSectionSelect(fromSection, fromClass.value);
    });

    toClass.addEventListener('change', function () {
        fillSectionSelect(toSection, toClass.value);
    });

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!fromClass.value || !fromSection.value || !promoteSession.value || !toClass.value || !toSection.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please fill all required fields.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const fromClassName = fromClass.options[fromClass.selectedIndex].textContent.trim();
        const section = fromSection.value;
        const matched = sampleStudents.filter(function (student) {
            return student.className === fromClassName && student.section === section;
        });

        // If no sample matches the selected class name, show Class 2(A) samples as fallback demo data
        const students = matched.length
            ? matched
            : sampleStudents.filter(function (s) { return s.className === 'Class 2' && s.section === 'A'; });

        studentListPanel.style.display = '';
        renderStudents(students);

        Swal.fire({
            icon: 'success',
            title: 'Search Complete',
            text: students.length + ' student(s) found.',
            timer: 1200,
            showConfirmButton: false
        });
    });

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            document.querySelectorAll('.student-check').forEach(function (box) {
                box.checked = selectAll.checked;
            });
            selectAll.indeterminate = false;
        });
    }

    tableBody.addEventListener('change', function (e) {
        if (e.target.classList.contains('student-check')) {
            syncSelectAll();
        }
    });

    promoteBtn.addEventListener('click', function () {
        const selected = Array.from(document.querySelectorAll('.student-check:checked'));
        if (!selected.length) {
            Swal.fire({
                icon: 'warning',
                title: 'No Students Selected',
                text: 'Please select at least one student to promote.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const toClassName = toClass.options[toClass.selectedIndex].textContent.trim();
        const details = selected.map(function (box) {
            const row = box.closest('tr');
            const id = box.value;
            const name = row.children[2].textContent.trim();
            const result = (document.querySelector('input[name="result_' + id + '"]:checked') || {}).value || 'Pass';
            const status = (document.querySelector('input[name="status_' + id + '"]:checked') || {}).value || 'Continue';
            return name + ' (' + result + ', ' + status + ')';
        });

        Swal.fire({
            icon: 'question',
            title: 'Promote Selected Students?',
            html: '<div style="text-align:left">'
                + '<p>Session: <strong>' + escapeHtml(promoteSession.value) + '</strong></p>'
                + '<p>Target: <strong>' + escapeHtml(toClassName + ' (' + toSection.value + ')') + '</strong></p>'
                + '<p>' + selected.length + ' student(s) will be promoted.</p>'
                + '</div>',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Promote'
        }).then(function (result) {
            if (!result.isConfirmed) return;

            // Remove promoted rows from the current list (UI demo behavior)
            selected.forEach(function (box) {
                const row = box.closest('tr');
                if (row) row.remove();
            });
            syncSelectAll();

            if (!tableBody.querySelectorAll('tr').length) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No students remaining in this list.</td></tr>';
            }

            Swal.fire({
                icon: 'success',
                title: 'Promoted',
                text: details.length + ' student(s) promoted successfully.',
                timer: 1600,
                showConfirmButton: false
            });
        });
    });

    loadClasses().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load classes. Add classes under Academics → Class first.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
