document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const templateSelect = document.getElementById('templateSelect');
    const marksheetFilterForm = document.getElementById('marksheetFilterForm');
    const studentListPanel = document.getElementById('studentListPanel');
    const studentTableBody = document.getElementById('studentTableBody');
    const selectAllStudents = document.getElementById('selectAllStudents');
    const bulkDownloadBtn = document.getElementById('bulkDownloadBtn');

    let classes = [];
    let templates = [];
    let students = [];
    let selectedTemplateId = '';

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
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
    }

    function populateTemplateSelect() {
        templateSelect.innerHTML = '<option value="">Select</option>' + templates.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.templateName) + '</option>';
        }).join('');
    }

    function actionButtons(studentId) {
        return '<div class="marksheet-action-btns">'
            + '<button type="button" class="icon-action-btn btn-download-marksheet" data-id="' + studentId + '" title="Download">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
            + '</button>'
            + '<button type="button" class="icon-action-btn btn-print-marksheet" data-id="' + studentId + '" title="Print">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>'
            + '</button>'
            + '</div>';
    }

    function renderStudents(rows) {
        students = rows || [];
        if (!students.length) {
            studentTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#94a3b8;">No records found</td></tr>';
            return;
        }

        studentTableBody.innerHTML = students.map(function (student) {
            return '<tr>'
                + '<td class="col-check"><input type="checkbox" class="student-check" value="' + student.id + '"></td>'
                + '<td>' + escapeHtml(student.admissionNo) + '</td>'
                + '<td><a href="#" class="student-link" data-id="' + student.id + '">' + escapeHtml(student.studentName) + '</a></td>'
                + '<td>' + escapeHtml(student.fatherName) + '</td>'
                + '<td>' + escapeHtml(student.dateOfBirth) + '</td>'
                + '<td>' + escapeHtml(student.gender) + '</td>'
                + '<td>' + escapeHtml(student.mobileNumber) + '</td>'
                + '<td class="col-action">' + actionButtons(student.id) + '</td>'
                + '</tr>';
        }).join('');
    }

    function buildMarksheetHtml(data, student) {
        const previewStudent = Object.assign({}, data.student || {}, {
            admissionNo: student.admissionNo,
            studentName: student.studentName,
            fatherName: student.fatherName,
            dateOfBirth: student.dateOfBirth
        });
        const summary = data.summary || {};
        const attendance = data.attendance || {};
        const subjects = data.subjects || [];

        const subjectRows = subjects.map(function (subject) {
            const values = subject.values || [];
            return '<tr><td style="text-align:left;">' + escapeHtml(subject.subjectName) + ' (' + escapeHtml(subject.subjectCode) + ')</td>'
                + values.map(function (v) { return '<td>' + escapeHtml(v) + '</td>'; }).join('')
                + '</tr>';
        }).join('');

        return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Marksheet - ' + escapeHtml(student.studentName) + '</title>'
            + '<style>body{font-family:Arial,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #333;padding:6px 8px;text-align:center;font-size:12px}.report-title{text-align:center;font-size:20px;font-weight:700}.report-session{text-align:center;margin-bottom:1rem}.report-student-grid{display:grid;grid-template-columns:1fr 1fr 80px;gap:1rem;margin-bottom:1rem}.report-photo-box{width:70px;height:80px;border:1px solid #333;display:flex;align-items:center;justify-content:center;font-size:24px}</style>'
            + '</head><body>'
            + '<div class="report-card-preview">'
            + '<div class="report-title">REPORT CARD</div>'
            + '<div class="report-session">Academic Session : ' + escapeHtml(data.academicSession || '2026-27') + '</div>'
            + '<div class="report-student-grid">'
            + '<div><p><strong>Admission No.</strong> : ' + escapeHtml(previewStudent.admissionNo) + '</p><p><strong>Student\'s Name</strong> : ' + escapeHtml(previewStudent.studentName) + '</p><p><strong>Father\'s Name</strong> : ' + escapeHtml(previewStudent.fatherName) + '</p><p><strong>School Name</strong> : ' + escapeHtml(data.schoolName) + '</p><p><strong>Exam Center</strong> : ' + escapeHtml(data.examCenter) + '</p></div>'
            + '<div><p><strong>Roll No.</strong> : ' + escapeHtml(previewStudent.rollNo || '') + '</p><p><strong>Date of Birth</strong> : ' + escapeHtml(previewStudent.dateOfBirth) + '</p><p><strong>Mother\'s Name</strong> : ' + escapeHtml(previewStudent.motherName || '') + '</p><p><strong>Result Declaration Date</strong> : ' + escapeHtml(previewStudent.resultDate || '') + '</p></div>'
            + '<div class="report-photo-box">👤</div></div>'
            + '<table><thead><tr><th rowspan="2">Scholastic Areas<br>(Subject)</th><th colspan="4">T1</th><th colspan="4">T2</th><th colspan="2">T1+T2</th><th rowspan="2">Rank</th></tr>'
            + '<tr><th>PT-I(10)</th><th>MA(10)</th><th>HY(80)</th><th>Total(100)</th><th>PT-II(10)</th><th>MA-2(10)</th><th>Annual(80)</th><th>Total(100)</th><th>Marks(100%)</th><th>Grade</th></tr></thead><tbody>'
            + subjectRows
            + '<tr><td colspan="9" style="text-align:right;">Overall Marks: ' + escapeHtml(summary.overallMarks) + '</td><td colspan="2">Percentage ' + escapeHtml(summary.percentage) + '</td><td>Grade: ' + escapeHtml(summary.grade) + '</td><td>Rank: ' + escapeHtml(summary.rank) + '</td></tr>'
            + '</tbody></table>'
            + '<table><thead><tr><th>Total Working Days</th><th>Days Present</th><th>Attendance Percentage</th></tr></thead><tbody><tr>'
            + '<td>' + escapeHtml(attendance.workingDays) + '</td><td>' + escapeHtml(attendance.daysPresent) + '</td><td>' + escapeHtml(attendance.percentage) + '</td>'
            + '</tr></tbody></table>'
            + '<p><strong>Class Teacher Remark :</strong> Class teacher remark here</p>'
            + '</div></body></html>';
    }

    function findStudent(studentId) {
        return students.find(function (item) {
            return String(item.id) === String(studentId);
        });
    }

    async function getMarksheetHtml(studentId) {
        const student = findStudent(studentId);
        if (!student) {
            throw new Error('Student not found');
        }
        const preview = await fetchJson('/api/cbse-exam-templates/' + selectedTemplateId + '/preview');
        return buildMarksheetHtml(preview, student);
    }

    async function printMarksheet(studentId) {
        const html = await getMarksheetHtml(studentId);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
        };
    }

    async function downloadMarksheet(studentId) {
        const student = findStudent(studentId);
        const html = await getMarksheetHtml(studentId);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Marksheet_' + (student.admissionNo || studentId) + '.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    async function loadInitialData() {
        const [classData, templateData] = await Promise.all([
            fetchJson('/api/classes'),
            fetchJson('/api/cbse-marksheets/templates')
        ]);
        classes = classData || [];
        templates = templateData || [];
        populateClassSelect();
        populateTemplateSelect();
    }

    classSelect.addEventListener('change', function () {
        populateSectionSelect(classSelect.value);
    });

    marksheetFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const classId = classSelect.value;
        const section = sectionSelect.value;
        const templateId = templateSelect.value;
        if (!classId || !section || !templateId) {
            showError({ message: 'Class, Section and Template are required.' });
            return;
        }

        try {
            selectedTemplateId = templateId;
            const rows = await fetchJson('/api/cbse-marksheets/students?classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section)
                + '&templateId=' + encodeURIComponent(templateId));
            renderStudents(rows);
            studentListPanel.hidden = false;
            selectAllStudents.checked = false;
        } catch (error) {
            showError(error);
        }
    });

    selectAllStudents.addEventListener('change', function () {
        document.querySelectorAll('.student-check').forEach(function (checkbox) {
            checkbox.checked = selectAllStudents.checked;
        });
    });

    studentTableBody.addEventListener('click', async function (event) {
        const downloadBtn = event.target.closest('.btn-download-marksheet');
        const printBtn = event.target.closest('.btn-print-marksheet');
        const studentLink = event.target.closest('.student-link');

        if (studentLink) {
            event.preventDefault();
            try {
                await printMarksheet(studentLink.getAttribute('data-id'));
            } catch (error) {
                showError(error);
            }
            return;
        }

        if (downloadBtn) {
            event.preventDefault();
            try {
                await downloadMarksheet(downloadBtn.getAttribute('data-id'));
            } catch (error) {
                showError(error);
            }
            return;
        }

        if (printBtn) {
            event.preventDefault();
            try {
                await printMarksheet(printBtn.getAttribute('data-id'));
            } catch (error) {
                showError(error);
            }
        }
    });

    bulkDownloadBtn.addEventListener('click', async function () {
        const selectedIds = Array.from(document.querySelectorAll('.student-check:checked')).map(function (el) {
            return el.value;
        });

        if (!selectedIds.length) {
            showError({ message: 'Please select at least one student.' });
            return;
        }

        try {
            for (let i = 0; i < selectedIds.length; i++) {
                await downloadMarksheet(selectedIds[i]);
            }
            showSuccess('Downloaded ' + selectedIds.length + ' marksheet(s).');
        } catch (error) {
            showError(error);
        }
    });

    loadInitialData().catch(showError);
});
