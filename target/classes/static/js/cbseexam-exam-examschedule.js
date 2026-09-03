document.addEventListener('DOMContentLoaded', function () {
    const examGroupSelect = document.getElementById('examGroupSelect');
    const examSelect = document.getElementById('examSelect');
    const examScheduleFilterForm = document.getElementById('examScheduleFilterForm');
    const scheduleListPanel = document.getElementById('scheduleListPanel');
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    const scheduleSearchInput = document.getElementById('scheduleSearchInput');
    const scheduleTable = document.getElementById('scheduleTable');
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');

    let examGroups = [];
    let scheduleRows = [];
    let filteredRows = [];
    const columnVisibility = [true, true, true, true, true, true, true];

    examSelect.disabled = true;
    examSelect.innerHTML = '<option value="">Select exam group first</option>';

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

    function exportToast(title, text) {
        Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            timer: 2000,
            showConfirmButton: false,
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

    function setExamSelectLoading(isLoading) {
        examSelect.disabled = isLoading;
        if (isLoading) {
            examSelect.innerHTML = '<option value="">Loading...</option>';
        }
    }

    function applyColumnVisibility() {
        if (!scheduleTable) {
            return;
        }
        const headerCells = scheduleTable.querySelectorAll('thead th');
        columnVisibility.forEach(function (isVisible, columnIndex) {
            const display = isVisible ? '' : 'none';
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = display;
            }
            scheduleTable.querySelectorAll('tbody tr').forEach(function (row) {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = display;
                }
            });
        });
    }

    function renderScheduleRows(rows) {
        scheduleRows = rows || [];
        applySearchFilter();
    }

    function applySearchFilter() {
        const keyword = scheduleSearchInput ? scheduleSearchInput.value.trim().toLowerCase() : '';
        filteredRows = scheduleRows.filter(function (row) {
            if (!keyword) {
                return true;
            }
            return Object.values(row).some(function (value) {
                return String(value == null ? '' : value).toLowerCase().includes(keyword);
            });
        });

        if (!filteredRows.length) {
            scheduleTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#94a3b8;">No records found</td></tr>';
            applyColumnVisibility();
            return;
        }

        scheduleTableBody.innerHTML = filteredRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.subject) + '</td>'
                + '<td>' + escapeHtml(row.dateFrom) + '</td>'
                + '<td>' + escapeHtml(row.startTime) + '</td>'
                + '<td>' + escapeHtml(row.duration) + '</td>'
                + '<td>' + escapeHtml(row.roomNo) + '</td>'
                + '<td>' + escapeHtml(row.marksMax) + '</td>'
                + '<td>' + escapeHtml(row.marksMin) + '</td>'
                + '</tr>';
        }).join('');
        applyColumnVisibility();
    }

    function getVisibleScheduleRows() {
        return Array.from(scheduleTableBody.querySelectorAll('tr')).filter(function (row) {
            return row.querySelector('td[colspan]') == null && row.style.display !== 'none';
        });
    }

    function getScheduleTableData() {
        const headers = [];
        const data = [];
        if (!scheduleTable) {
            return { headers: headers, data: data };
        }

        scheduleTable.querySelectorAll('thead th').forEach(function (th, index) {
            if (columnVisibility[index]) {
                headers.push(th.textContent.trim());
            }
        });

        getVisibleScheduleRows().forEach(function (row) {
            const rowData = [];
            row.querySelectorAll('td').forEach(function (cell, index) {
                if (columnVisibility[index]) {
                    rowData.push(cell.textContent.trim());
                }
            });
            if (rowData.length) {
                data.push(rowData);
            }
        });

        return { headers: headers, data: data };
    }

    async function loadExamGroups() {
        examGroupSelect.innerHTML = '<option value="">Loading...</option>';
        examGroupSelect.disabled = true;
        examGroups = await fetchJson('/api/exam-groups');
        populateExamGroupSelect();
        populateExamSelect([]);
    }

    examGroupSelect.addEventListener('change', async function () {
        const groupId = examGroupSelect.value;
        populateExamSelect([]);
        scheduleListPanel.hidden = true;
        if (!groupId) {
            examSelect.innerHTML = '<option value="">Select</option>';
            examSelect.disabled = true;
            return;
        }
        try {
            setExamSelectLoading(true);
            const exams = await fetchJson('/api/exam-groups/' + encodeURIComponent(groupId) + '/exams');
            populateExamSelect(exams);
        } catch (error) {
            populateExamSelect([]);
            showError(error);
        }
    });

    examScheduleFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const groupId = examGroupSelect.value;
        const examId = examSelect.value;
        if (!groupId || !examId) {
            showError({ message: 'Exam Group and Exam are required.' });
            return;
        }

        try {
            const rows = await fetchJson('/api/exam-schedules/search?groupId=' + encodeURIComponent(groupId)
                + '&examId=' + encodeURIComponent(examId));
            renderScheduleRows(rows);
            scheduleListPanel.hidden = false;
            if (scheduleSearchInput) {
                scheduleSearchInput.value = '';
            }
        } catch (error) {
            showError(error);
        }
    });

    if (scheduleSearchInput) {
        scheduleSearchInput.addEventListener('input', applySearchFilter);
    }

    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function (event) {
            if (!columnVisibilityDropdown.contains(event.target)
                    && event.target !== columnVisibilityBtn
                    && !columnVisibilityBtn.contains(event.target)) {
                columnVisibilityDropdown.classList.remove('active');
            }
        });

        columnVisibilityDropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const columnIndex = parseInt(checkbox.getAttribute('data-column'), 10);
                columnVisibility[columnIndex] = checkbox.checked;
                applyColumnVisibility();
            });
        });
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getScheduleTableData();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) {
                text += row.join('\t') + '\n';
            });
            navigator.clipboard.writeText(text).then(function () {
                exportToast('Copied!', 'Table data copied to clipboard');
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getScheduleTableData();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Exam Schedule');
            XLSX.writeFile(wb, 'ExamSchedule_' + new Date().toISOString().split('T')[0] + '.xlsx');
            exportToast('Exported!', 'Excel file downloaded successfully');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getScheduleTableData();
            let csvContent = result.headers.join(',') + '\n';
            result.data.forEach(function (row) {
                csvContent += row.map(function (cell) {
                    return (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1)
                        ? '"' + cell.replace(/"/g, '""') + '"' : cell;
                }).join(',') + '\n';
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
            link.download = 'ExamSchedule_' + new Date().toISOString().split('T')[0] + '.csv';
            link.click();
            exportToast('Exported!', 'CSV file downloaded successfully');
        });
    }

    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            const result = getScheduleTableData();
            const doc = new window.jspdf.jsPDF('p', 'pt', 'a4');
            doc.setFontSize(16);
            doc.text('Exam Schedule', 40, 40);
            doc.setFontSize(10);
            doc.text('Generated on: ' + new Date().toLocaleDateString(), 40, 58);
            doc.autoTable({
                head: [result.headers],
                body: result.data,
                startY: 70,
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 4 }
            });
            doc.save('ExamSchedule_' + new Date().toISOString().split('T')[0] + '.pdf');
            exportToast('Exported!', 'PDF file downloaded successfully');
        });
    }

    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            const result = getScheduleTableData();
            let html = '<html><head><title>Exam Schedule</title>'
                + '<style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left;font-size:12px}th{background:#1e293b;color:#fff}</style>'
                + '</head><body><h2>Exam Schedule</h2><table><thead><tr>'
                + result.headers.map(function (h) { return '<th>' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>'
                + result.data.map(function (row) {
                    return '<tr>' + row.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
                }).join('')
                + '</tbody></table></body></html>';
            const printWindow = window.open('', '_blank');
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
            };
        });
    }

    loadExamGroups().catch(showError);
});
