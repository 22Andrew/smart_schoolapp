document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const attendanceDateInput = document.getElementById('attendanceDate');
    const attendanceReportFilterForm = document.getElementById('attendanceReportFilterForm');
    const attendanceListPanel = document.getElementById('attendanceListPanel');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const attendanceTableWrap = document.getElementById('attendanceTableWrap');
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const copyBtn = document.getElementById('copyBtn');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let classes = [];
    let records = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';

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

    function badgeClass(status) {
        const normalized = String(status || 'Present').toLowerCase().replace(/\s+/g, '-');
        if (normalized === 'half-day') {
            return 'half-day';
        }
        if (normalized === 'present' || normalized === 'late' || normalized === 'absent' || normalized === 'holiday') {
            return normalized;
        }
        return 'present';
    }

    function attendanceBadgeHtml(status) {
        const label = status || 'Present';
        return '<span class="attendance-badge ' + escapeHtml(badgeClass(label)) + '">' + escapeHtml(label) + '</span>';
    }

    function getFilteredRecords() {
        let rows = records.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.rowNumber,
                    row.admissionNo,
                    row.rollNumber,
                    row.studentName,
                    row.status,
                    row.note
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }
        return rows;
    }

    function renderPagination(total, totalPages) {
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFilteredRecords();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        attendanceListPanel.hidden = false;

        if (!total) {
            noRecordBanner.hidden = false;
            attendanceTableWrap.hidden = true;
            attendanceTableBody.innerHTML = '';
            if (showingInfo) {
                showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            }
            renderPagination(0, 1);
            return;
        }

        noRecordBanner.hidden = true;
        attendanceTableWrap.hidden = false;

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        attendanceTableBody.innerHTML = pageRows.map(function (row, index) {
            return '<tr>'
                + '<td>' + escapeHtml(start + index + 1) + '</td>'
                + '<td>' + escapeHtml(row.admissionNo || '') + '</td>'
                + '<td>' + escapeHtml(row.rollNumber || '') + '</td>'
                + '<td class="student-name-cell">' + escapeHtml(row.studentName || '') + '</td>'
                + '<td>' + attendanceBadgeHtml(row.status) + '</td>'
                + '<td>' + escapeHtml(row.note || '') + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    classSelect.addEventListener('change', function () {
        populateSectionSelect(classSelect.value);
    });

    attendanceReportFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const classId = classSelect.value;
        const section = sectionSelect.value;
        const attendanceDate = formatDateForApi(attendanceDateInput.value);

        if (!classId || !section || !attendanceDate) {
            showError({ message: 'Class, Section and Attendance Date are required.' });
            return;
        }

        try {
            records = await fetchJson('/api/student-attendance/students?classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section)
                + '&attendanceDate=' + encodeURIComponent(attendanceDate));
            currentPage = 1;
            renderTable();
        } catch (error) {
            showError(error);
        }
    });

    tableSearchInput.addEventListener('input', function () {
        tableFilter = tableSearchInput.value;
        currentPage = 1;
        renderTable();
    });

    entriesSelect.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderTable();
    });

    pagination.addEventListener('click', function (event) {
        const pageBtn = event.target.closest('[data-page]');
        const navBtn = event.target.closest('[data-nav]');
        const filtered = getFilteredRecords();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
        if (pageBtn) {
            currentPage = parseInt(pageBtn.getAttribute('data-page'), 10);
            renderTable();
        } else if (navBtn) {
            if (navBtn.getAttribute('data-nav') === 'prev' && currentPage > 1) {
                currentPage -= 1;
                renderTable();
            } else if (navBtn.getAttribute('data-nav') === 'next' && currentPage < totalPages) {
                currentPage += 1;
                renderTable();
            }
        }
    });

    function exportCsv() {
        const rows = getFilteredRecords();
        const lines = [['#', 'Admission No', 'Roll Number', 'Name', 'Attendance', 'Note']];
        rows.forEach(function (row, index) {
            lines.push([
                index + 1,
                row.admissionNo || '',
                row.rollNumber || '',
                row.studentName || '',
                row.status || '',
                row.note || ''
            ].map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'attendance-by-date.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const rows = getFilteredRecords();
            const text = rows.map(function (row, index) {
                return [
                    index + 1,
                    row.admissionNo,
                    row.rollNumber,
                    row.studentName,
                    row.status,
                    row.note
                ].join('\t');
            }).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                showSuccess('Copied to clipboard');
            }).catch(function () {
                showError({ message: 'Failed to copy data' });
            });
        });
    }

    if (csvBtn) {
        csvBtn.addEventListener('click', exportCsv);
    }

    if (excelBtn && typeof XLSX !== 'undefined') {
        excelBtn.addEventListener('click', function () {
            const rows = getFilteredRecords().map(function (row, index) {
                return {
                    '#': index + 1,
                    'Admission No': row.admissionNo || '',
                    'Roll Number': row.rollNumber || '',
                    Name: row.studentName || '',
                    Attendance: row.status || '',
                    Note: row.note || ''
                };
            });
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
            XLSX.writeFile(workbook, 'attendance-by-date.xlsx');
        });
    }

    if (pdfBtn && window.jspdf) {
        pdfBtn.addEventListener('click', function () {
            const doc = new window.jspdf.jsPDF('l', 'pt');
            const rows = getFilteredRecords().map(function (row, index) {
                return [
                    index + 1,
                    row.admissionNo || '',
                    row.rollNumber || '',
                    row.studentName || '',
                    row.status || '',
                    row.note || ''
                ];
            });
            doc.autoTable({
                head: [['#', 'Admission No', 'Roll Number', 'Name', 'Attendance', 'Note']],
                body: rows,
                styles: { fontSize: 8 }
            });
            doc.save('attendance-by-date.pdf');
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    async function loadInitialData() {
        classes = await fetchJson('/api/classes');
        populateClassSelect();
        setDefaultDate();
    }

    loadInitialData().catch(showError);
});
