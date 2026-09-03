document.addEventListener('DOMContentLoaded', function () {
    const examGroupSelect = document.getElementById('examGroupSelect');
    const examSelect = document.getElementById('examSelect');
    const sessionSelect = document.getElementById('sessionSelect');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const printAdmitCardFilterForm = document.getElementById('printAdmitCardFilterForm');
    const studentListPanel = document.getElementById('studentListPanel');
    const studentTableBody = document.getElementById('studentTableBody');
    const selectAllStudents = document.getElementById('selectAllStudents');
    const generateBtn = document.getElementById('generateBtn');

    let examGroups = [];
    let classes = [];
    let students = [];

    examSelect.disabled = true;
    examSelect.innerHTML = '<option value="">Select exam group first</option>';
    sectionSelect.disabled = true;
    sectionSelect.innerHTML = '<option value="">Select class first</option>';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchJson(url) {
        const response = await fetch(url);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function populateExamGroupSelect() {
        if (!examGroups.length) {
            examGroupSelect.innerHTML = '<option value="">No exam groups found</option>';
            examGroupSelect.disabled = true;
            return;
        }
        examGroupSelect.disabled = false;
        examGroupSelect.innerHTML = '<option value="">Select</option>' + examGroups.map(function (group) {
            return '<option value="' + group.id + '">' + escapeHtml(group.name) + '</option>';
        }).join('');
    }

    function populateExamSelect(exams) {
        if (!exams || !exams.length) {
            examSelect.innerHTML = '<option value="">No exams found</option>';
            examSelect.disabled = true;
            return;
        }
        examSelect.disabled = false;
        examSelect.innerHTML = '<option value="">Select</option>' + exams.map(function (exam) {
            return '<option value="' + exam.id + '">' + escapeHtml(exam.name) + '</option>';
        }).join('');
    }

    function populateSessionSelect(sessions) {
        sessionSelect.innerHTML = '<option value="">Select</option>' + (sessions || []).map(function (session) {
            return '<option value="' + escapeHtml(session) + '">' + escapeHtml(session) + '</option>';
        }).join('');
    }

    function populateClassSelect() {
        classSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateSectionSelect(classId) {
        const selectedClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        if (!sections.length) {
            sectionSelect.innerHTML = '<option value="">No sections found</option>';
            sectionSelect.disabled = true;
            return;
        }
        sectionSelect.disabled = false;
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
    }

    function renderStudents(rows) {
        students = rows || [];
        selectAllStudents.checked = false;

        if (!students.length) {
            studentTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#94a3b8;">No records found</td></tr>';
            return;
        }

        studentTableBody.innerHTML = students.map(function (student) {
            return '<tr>'
                + '<td class="col-check"><input type="checkbox" class="student-check" value="' + escapeHtml(student.id) + '"></td>'
                + '<td>' + escapeHtml(student.admissionNo) + '</td>'
                + '<td><a href="#" class="student-link" data-id="' + escapeHtml(student.id) + '">' + escapeHtml(student.studentName) + '</a></td>'
                + '<td>' + escapeHtml(student.fatherName) + '</td>'
                + '<td>' + escapeHtml(student.dateOfBirth) + '</td>'
                + '<td>' + escapeHtml(student.gender) + '</td>'
                + '<td>' + escapeHtml(student.category) + '</td>'
                + '<td>' + escapeHtml(student.mobileNumber) + '</td>'
                + '</tr>';
        }).join('');
    }

    async function loadInitialData() {
        const [groupData, classData, sessionData] = await Promise.all([
            fetchJson('/api/exam-groups'),
            fetchJson('/api/classes'),
            fetchJson('/api/exam-results/sessions')
        ]);
        examGroups = groupData || [];
        classes = classData || [];
        populateExamGroupSelect();
        populateClassSelect();
        populateSessionSelect(sessionData || []);
    }

    examGroupSelect.addEventListener('change', async function () {
        const groupId = examGroupSelect.value;
        if (!groupId) {
            examSelect.disabled = true;
            examSelect.innerHTML = '<option value="">Select exam group first</option>';
            return;
        }
        examSelect.disabled = true;
        examSelect.innerHTML = '<option value="">Loading...</option>';
        try {
            const exams = await fetchJson('/api/exam-groups/' + encodeURIComponent(groupId) + '/exams');
            populateExamSelect(exams);
        } catch (error) {
            showError(error);
            examSelect.innerHTML = '<option value="">Select exam group first</option>';
        }
    });

    classSelect.addEventListener('change', function () {
        populateSectionSelect(classSelect.value);
    });

    printAdmitCardFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const groupId = examGroupSelect.value;
        const examId = examSelect.value;
        const sessionYear = sessionSelect.value;
        const classId = classSelect.value;
        const section = sectionSelect.value;

        if (!groupId || !examId || !sessionYear || !classId || !section) {
            showError({ message: 'Exam Group, Exam, Session, Class and Section are required.' });
            return;
        }

        try {
            const rows = await fetchJson('/api/print-admit-cards/students?groupId=' + encodeURIComponent(groupId)
                + '&examId=' + encodeURIComponent(examId)
                + '&sessionYear=' + encodeURIComponent(sessionYear)
                + '&classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section));
            renderStudents(rows);
            studentListPanel.hidden = false;
        } catch (error) {
            showError(error);
        }
    });

    selectAllStudents.addEventListener('change', function () {
        document.querySelectorAll('.student-check').forEach(function (checkbox) {
            checkbox.checked = selectAllStudents.checked;
        });
    });

    studentTableBody.addEventListener('click', function (event) {
        const link = event.target.closest('.student-link');
        if (link) {
            event.preventDefault();
        }
    });

    generateBtn.addEventListener('click', function () {
        const selected = Array.from(document.querySelectorAll('.student-check:checked')).map(function (el) {
            return el.value;
        });
        if (!selected.length) {
            showError({ message: 'Please select at least one student.' });
            return;
        }
        showSuccess('Generate admit card for ' + selected.length + ' selected student(s).');
    });

    loadInitialData().catch(showError);
});
