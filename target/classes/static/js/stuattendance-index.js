document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const attendanceDateInput = document.getElementById('attendanceDate');
    const attendanceFilterForm = document.getElementById('attendanceFilterForm');
    const studentListPanel = document.getElementById('studentListPanel');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const studentTableWrap = document.getElementById('studentTableWrap');
    const studentTableBody = document.getElementById('studentTableBody');
    const bulkAttendanceOptions = document.getElementById('bulkAttendanceOptions');
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

    const STATUSES = ['Present', 'Late', 'Absent', 'Holiday', 'Half Day'];
    let classes = [];
    let students = [];
    let currentAttendanceDate = '';

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

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function formatDateForApi(value) {
        if (!value) {
            return '';
        }
        const parts = value.split('-');
        if (parts.length === 3) {
            return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        return value;
    }

    function setDefaultDate() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        attendanceDateInput.value = today.getFullYear() + '-' + month + '-' + day;
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

    function renderBulkOptions() {
        bulkAttendanceOptions.innerHTML = STATUSES.map(function (status, index) {
            return '<label><input type="radio" name="bulkAttendance" value="' + escapeHtml(status) + '"' + (index === 0 ? ' checked' : '') + '> ' + escapeHtml(status) + '</label>';
        }).join('');
    }

    function renderAttendanceRadios(studentId, selectedStatus) {
        return '<div class="attendance-radio-group">' + STATUSES.map(function (status) {
            return '<label><input type="radio" name="attendance-' + escapeHtml(studentId) + '" value="' + escapeHtml(status) + '" data-student-id="' + escapeHtml(studentId) + '"' + (status === selectedStatus ? ' checked' : '') + '> ' + escapeHtml(status) + '</label>';
        }).join('') + '</div>';
    }

    function showNoRecords() {
        noRecordBanner.hidden = false;
        studentTableWrap.hidden = true;
        studentTableBody.innerHTML = '';
    }

    function renderStudents(rows) {
        students = rows || [];
        if (!students.length) {
            studentListPanel.hidden = false;
            showNoRecords();
            return;
        }

        studentListPanel.hidden = false;
        noRecordBanner.hidden = true;
        studentTableWrap.hidden = false;

        studentTableBody.innerHTML = students.map(function (student) {
            return '<tr data-id="' + escapeHtml(student.id) + '">'
                + '<td>' + escapeHtml(student.rowNumber) + '</td>'
                + '<td>' + escapeHtml(student.admissionNo) + '</td>'
                + '<td>' + escapeHtml(student.rollNumber) + '</td>'
                + '<td class="student-name-cell">' + escapeHtml(student.studentName) + '</td>'
                + '<td>' + renderAttendanceRadios(student.id, student.status || 'Present') + '</td>'
                + '<td>' + escapeHtml(student.attendanceDate || currentAttendanceDate) + '</td>'
                + '<td>' + escapeHtml(student.source || 'Manual') + '</td>'
                + '<td><input type="text" class="attendance-time-input entry-time-input" value="' + escapeHtml(student.entryTime || '8:45 AM') + '"></td>'
                + '<td><input type="text" class="attendance-time-input exit-time-input" value="' + escapeHtml(student.exitTime || '9:00 AM') + '"></td>'
                + '<td><input type="text" class="attendance-note-input note-input" value="' + escapeHtml(student.note || '') + '"></td>'
                + '</tr>';
        }).join('');
    }

    function applyBulkAttendance(status) {
        document.querySelectorAll('.attendance-radio-group input[value="' + status + '"]').forEach(function (radio) {
            radio.checked = true;
        });
    }

    function collectRecords() {
        const records = [];
        studentTableBody.querySelectorAll('tr[data-id]').forEach(function (row) {
            const studentId = row.getAttribute('data-id');
            const checked = row.querySelector('.attendance-radio-group input:checked');
            records.push({
                id: studentId,
                status: checked ? checked.value : 'Present',
                source: 'Manual',
                entryTime: row.querySelector('.entry-time-input').value.trim(),
                exitTime: row.querySelector('.exit-time-input').value.trim(),
                note: row.querySelector('.note-input').value.trim()
            });
        });
        return records;
    }

    async function loadInitialData() {
        classes = await fetchJson('/api/classes');
        populateClassSelect();
        renderBulkOptions();
        setDefaultDate();
    }

    classSelect.addEventListener('change', function () {
        populateSectionSelect(classSelect.value);
    });

    bulkAttendanceOptions.addEventListener('change', function (event) {
        const radio = event.target.closest('input[name="bulkAttendance"]');
        if (radio) {
            applyBulkAttendance(radio.value);
        }
    });

    attendanceFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const classId = classSelect.value;
        const section = sectionSelect.value;
        const attendanceDate = formatDateForApi(attendanceDateInput.value);

        if (!classId || !section || !attendanceDate) {
            showError({ message: 'Class, Section and Attendance Date are required.' });
            return;
        }

        try {
            currentAttendanceDate = attendanceDate;
            const rows = await fetchJson('/api/student-attendance/students?classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section)
                + '&attendanceDate=' + encodeURIComponent(attendanceDate));
            renderStudents(rows);
        } catch (error) {
            showError(error);
        }
    });

    saveAttendanceBtn.addEventListener('click', async function () {
        if (!students.length) {
            showError({ message: 'No students to save attendance for.' });
            return;
        }
        if (!currentAttendanceDate) {
            showError({ message: 'Please search students before saving attendance.' });
            return;
        }

        try {
            const response = await fetchJson('/api/student-attendance/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attendanceDate: currentAttendanceDate,
                    records: collectRecords()
                })
            });
            showSuccess(response.message || 'Attendance saved successfully!');
            const rows = await fetchJson('/api/student-attendance/students?classId=' + encodeURIComponent(classSelect.value)
                + '&section=' + encodeURIComponent(sectionSelect.value)
                + '&attendanceDate=' + encodeURIComponent(currentAttendanceDate));
            renderStudents(rows);
        } catch (error) {
            showError(error);
        }
    });

    loadInitialData().catch(showError);
});
