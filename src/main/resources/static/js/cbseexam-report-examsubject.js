document.addEventListener('DOMContentLoaded', function () {
    const examSelect = document.getElementById('examSelect');
    const reportFilterForm = document.getElementById('reportFilterForm');
    const reportTableSection = document.getElementById('reportTableSection');
    const subjectMarksHead = document.getElementById('subjectMarksHead');
    const subjectMarksBody = document.getElementById('subjectMarksBody');

    let reportData = null;

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

    function formatMark(value) {
        if (value == null || value === '') return '';
        const text = String(value).trim();
        if (text.toUpperCase() === 'ABS') {
            return '<span class="abs-mark">ABS</span>';
        }
        return escapeHtml(text);
    }

    function buildTableHead(subjects) {
        let topRow = '<tr>'
            + '<th rowspan="2">Student</th>'
            + '<th rowspan="2">Admission No</th>'
            + '<th rowspan="2">Father Name</th>';

        subjects.forEach(function (subject) {
            const colspan = (subject.assessments || []).length || 1;
            topRow += '<th colspan="' + colspan + '">' + escapeHtml(subject.subjectName) + '</th>';
        });

        topRow += '<th rowspan="2">Total Marks</th>'
            + '<th rowspan="2">Percentage (%)</th>'
            + '<th rowspan="2">Grade</th>'
            + '<th rowspan="2">Rank</th></tr>';

        let subRow = '<tr>';
        subjects.forEach(function (subject) {
            (subject.assessments || []).forEach(function (assessment) {
                subRow += '<th><span class="sub-header">' + escapeHtml(assessment.label)
                    + '<br>(Max - ' + escapeHtml(String(assessment.maxMarks)) + ')</span></th>';
            });
        });
        subRow += '</tr>';

        subjectMarksHead.innerHTML = topRow + subRow;
    }

    function buildTableBody(rows, subjects) {
        if (!rows.length) {
            const colspan = 4 + subjects.reduce(function (sum, subject) {
                return sum + ((subject.assessments || []).length || 1);
            }, 0);
            subjectMarksBody.innerHTML = '<tr><td colspan="' + colspan + '" style="text-align:center;padding:2rem;color:#94a3b8;">No records found</td></tr>';
            return;
        }

        subjectMarksBody.innerHTML = rows.map(function (row) {
            let markCells = '';
            let markIndex = 0;
            const marks = row.marks || [];

            subjects.forEach(function (subject) {
                (subject.assessments || []).forEach(function () {
                    markCells += '<td>' + formatMark(marks[markIndex++]) + '</td>';
                });
            });

            return '<tr>'
                + '<td class="student-cell">' + escapeHtml(row.studentName) + '</td>'
                + '<td>' + escapeHtml(row.admissionNo) + '</td>'
                + '<td>' + escapeHtml(row.fatherName || '') + '</td>'
                + markCells
                + '<td>' + escapeHtml(row.totalMarks) + '</td>'
                + '<td>' + escapeHtml(row.percentage) + '</td>'
                + '<td>' + escapeHtml(row.grade) + '</td>'
                + '<td>' + escapeHtml(row.rank) + '</td>'
                + '</tr>';
        }).join('');
    }

    function renderReport(data) {
        reportData = data;
        buildTableHead(data.subjects || []);
        buildTableBody(data.rows || [], data.subjects || []);
        reportTableSection.hidden = false;
    }

    async function loadExamOptions() {
        const response = await fetch('/api/cbse-exam-reports/exam-options');
        if (!response.ok) throw new Error('Failed to load exams');
        const exams = await response.json();
        examSelect.innerHTML = exams.map(function (exam, index) {
            return '<option value="' + exam.id + '"' + (index === 0 ? ' selected' : '') + '>'
                + escapeHtml(exam.examName) + '</option>';
        }).join('');
        if (exams.length) {
            await searchReport();
        }
    }

    async function searchReport() {
        const examId = examSelect.value;
        if (!examId) {
            Swal.fire({ icon: 'warning', title: 'Select Exam', text: 'Please select an exam.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const response = await fetch('/api/cbse-exam-reports/exam-subject?examId=' + encodeURIComponent(examId));
        if (!response.ok) throw new Error('Failed to load report');
        renderReport(await response.json());
    }

    reportFilterForm?.addEventListener('submit', function (e) {
        e.preventDefault();
        searchReport().catch(showError);
    });

    document.getElementById('printBtn')?.addEventListener('click', function () {
        if (!reportData) return;
        const table = document.getElementById('subjectMarksTable');
        const win = window.open('', '_blank');
        win.document.write('<html><head><title>Subject Marks Report</title>'
            + '<style>body{font-family:Arial,sans-serif;padding:20px}h1{font-size:18px;margin-bottom:12px}'
            + 'table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px;text-align:center}'
            + 'th{background:#1e293b;color:#fff}.student-cell{text-align:left}</style></head><body>'
            + '<h1>' + escapeHtml(reportData.examName) + ' - Subject wise Marks Report</h1>'
            + table.outerHTML + '</body></html>');
        win.document.close();
        win.print();
    });

    document.getElementById('excelBtn')?.addEventListener('click', function () {
        if (!reportData) return;
        const headers = ['Student', 'Admission No', 'Father Name'];
        reportData.subjects.forEach(function (subject) {
            (subject.assessments || []).forEach(function (assessment) {
                headers.push(subject.subjectName + ' - ' + assessment.label);
            });
        });
        headers.push('Total Marks', 'Percentage (%)', 'Grade', 'Rank');

        const rows = (reportData.rows || []).map(function (row) {
            const line = [row.studentName, row.admissionNo, row.fatherName || ''];
            let markIndex = 0;
            reportData.subjects.forEach(function (subject) {
                (subject.assessments || []).forEach(function () {
                    line.push((row.marks || [])[markIndex++] || '');
                });
            });
            line.push(row.totalMarks, row.percentage, row.grade, row.rank);
            return line;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers].concat(rows));
        XLSX.utils.book_append_sheet(wb, ws, 'Subject Marks');
        XLSX.writeFile(wb, 'Subject_Marks_Report_' + new Date().toISOString().split('T')[0] + '.xlsx');
    });

    loadExamOptions().catch(showError);
});
