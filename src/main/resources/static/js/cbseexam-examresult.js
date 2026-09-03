document.addEventListener('DOMContentLoaded', function () {
    const examGroupSelect = document.getElementById('examGroupSelect');
    const examSelect = document.getElementById('examSelect');
    const sessionSelect = document.getElementById('sessionSelect');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const examResultFilterForm = document.getElementById('examResultFilterForm');
    const resultListPanel = document.getElementById('resultListPanel');
    const resultTableHead = document.getElementById('resultTableHead');
    const resultTableBody = document.getElementById('resultTableBody');
    const resultTable = document.getElementById('resultTable');
    const resultSearchInput = document.getElementById('resultSearchInput');
    const resultEntriesSelect = document.getElementById('resultEntriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    const columnVisibilityContent = document.getElementById('columnVisibilityContent');

    let examGroups = [];
    let classes = [];
    let subjectColumns = [];
    let resultRows = [];
    let filteredRows = [];
    let columnVisibility = [];
    let currentPage = 1;
    let pageSize = 50;

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

    function populateSessionSelect(sessions) {
        sessionSelect.innerHTML = (sessions || []).map(function (session, index) {
            return '<option value="' + escapeHtml(session) + '"' + (index === 0 ? ' selected' : '') + '>'
                + escapeHtml(session) + '</option>';
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

    function buildColumnDefinitions() {
        const fixedColumns = [
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'rollNumber', label: 'Roll Number' },
            { key: 'studentName', label: 'Student Name' }
        ];
        const subjectDefs = subjectColumns.map(function (subject) {
            return {
                key: 'subject:' + subject.key,
                label: subject.name,
                subLabel: (subject.maxMarks || '100.00') + ' - ' + (subject.code || '')
            };
        });
        const tailColumns = [
            { key: 'grandTotal', label: 'Grand Total' },
            { key: 'percent', label: 'Percent (%)' },
            { key: 'rank', label: 'Rank' },
            { key: 'result', label: 'Result' }
        ];
        return fixedColumns.concat(subjectDefs, tailColumns);
    }

    function renderTableHeader() {
        const columns = buildColumnDefinitions();
        if (columnVisibility.length !== columns.length) {
            columnVisibility = columns.map(function () {
                return true;
            });
        }

        resultTableHead.innerHTML = '<tr>' + columns.map(function (column, index) {
            if (column.subLabel) {
                return '<th class="subject-header">' + escapeHtml(column.label)
                    + '<small>' + escapeHtml(column.subLabel) + '</small></th>';
            }
            return '<th>' + escapeHtml(column.label) + '</th>';
        }).join('') + '</tr>';

        columnVisibilityContent.innerHTML = columns.map(function (column, index) {
            return '<label class="column-toggle-item">'
                + '<input type="checkbox" class="column-toggle" data-column="' + index + '"'
                + (columnVisibility[index] ? ' checked' : '') + '>'
                + '<span>' + escapeHtml(column.label) + '</span>'
                + '</label>';
        }).join('');

        bindColumnToggleEvents();
        applyColumnVisibility();
    }

    function bindColumnToggleEvents() {
        columnVisibilityContent.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const columnIndex = parseInt(checkbox.getAttribute('data-column'), 10);
                columnVisibility[columnIndex] = checkbox.checked;
                applyColumnVisibility();
            });
        });
    }

    function applyColumnVisibility() {
        if (!resultTable) {
            return;
        }
        const headerCells = resultTable.querySelectorAll('thead th');
        columnVisibility.forEach(function (isVisible, columnIndex) {
            const display = isVisible ? '' : 'none';
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = display;
            }
            resultTable.querySelectorAll('tbody tr').forEach(function (row) {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = display;
                }
            });
        });
    }

    function renderEmptyState(colspan) {
        resultTableBody.innerHTML = '<tr class="empty-row"><td colspan="' + colspan + '">'
            + '<div class="empty-state">'
            + '<div class="empty-icon" aria-hidden="true">📁</div>'
            + '<p class="empty-message">No data available in table</p>'
            + '<p class="empty-submessage">Add new record or search with different criteria.</p>'
            + '</div></td></tr>';
        showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        pagination.innerHTML = '';
    }

    function getCellValue(row, column) {
        if (column.key.indexOf('subject:') === 0) {
            const subjectKey = column.key.replace('subject:', '');
            return row.subjectMarks && row.subjectMarks[subjectKey] ? row.subjectMarks[subjectKey] : '';
        }
        return row[column.key] == null ? '' : row[column.key];
    }

    function applyFiltersAndRender() {
        const keyword = resultSearchInput ? resultSearchInput.value.trim().toLowerCase() : '';
        filteredRows = resultRows.filter(function (row) {
            if (!keyword) {
                return true;
            }
            const columns = buildColumnDefinitions();
            return columns.some(function (column) {
                return String(getCellValue(row, column)).toLowerCase().includes(keyword);
            });
        });

        const columns = buildColumnDefinitions();
        const colspan = columns.length || 7;

        if (!filteredRows.length) {
            renderEmptyState(colspan);
            applyColumnVisibility();
            return;
        }

        const total = filteredRows.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filteredRows.slice(startIndex, endIndex);

        resultTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr>' + columns.map(function (column) {
                const value = getCellValue(row, column);
                if (column.key === 'studentName') {
                    return '<td><a href="#" class="student-link">' + escapeHtml(value) + '</a></td>';
                }
                return '<td>' + escapeHtml(value) + '</td>';
            }).join('') + '</tr>';
        }).join('');

        showingInfo.textContent = 'Showing ' + (startIndex + 1) + ' to ' + endIndex + ' of ' + total + ' entries';
        renderPagination(totalPages);
        applyColumnVisibility();
    }

    function renderPagination(totalPages) {
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderResults(data) {
        subjectColumns = data.subjects || [];
        resultRows = data.rows || [];
        currentPage = 1;
        renderTableHeader();
        applyFiltersAndRender();
    }

    function getVisibleResultRows() {
        return Array.from(resultTableBody.querySelectorAll('tr')).filter(function (row) {
            return !row.classList.contains('empty-row') && row.style.display !== 'none';
        });
    }

    function getResultTableData() {
        const columns = buildColumnDefinitions().filter(function (_column, index) {
            return columnVisibility[index];
        });
        const headers = columns.map(function (column) {
            return column.subLabel ? column.label + ' (' + column.subLabel + ')' : column.label;
        });
        const data = [];

        getVisibleResultRows().forEach(function (row) {
            const cells = row.querySelectorAll('td');
            const rowData = [];
            columnVisibility.forEach(function (isVisible, index) {
                if (isVisible && cells[index]) {
                    rowData.push(cells[index].textContent.trim());
                }
            });
            if (rowData.length) {
                data.push(rowData);
            }
        });

        return { headers: headers, data: data };
    }

    async function loadInitialData() {
        examGroupSelect.innerHTML = '<option value="">Loading...</option>';
        examGroupSelect.disabled = true;
        const [groups, sessionData, classData] = await Promise.all([
            fetchJson('/api/exam-groups'),
            fetchJson('/api/exam-results/sessions'),
            fetchJson('/api/classes')
        ]);
        examGroups = groups || [];
        classes = classData || [];
        populateExamGroupSelect();
        populateSessionSelect(sessionData || []);
        populateClassSelect();
        populateExamSelect([]);
    }

    examGroupSelect.addEventListener('change', async function () {
        const groupId = examGroupSelect.value;
        populateExamSelect([]);
        if (!groupId) {
            examSelect.innerHTML = '<option value="">Select exam group first</option>';
            examSelect.disabled = true;
            return;
        }
        try {
            examSelect.innerHTML = '<option value="">Loading...</option>';
            examSelect.disabled = true;
            const exams = await fetchJson('/api/exam-groups/' + encodeURIComponent(groupId) + '/exams');
            populateExamSelect(exams);
        } catch (error) {
            populateExamSelect([]);
            showError(error);
        }
    });

    classSelect.addEventListener('change', function () {
        populateSectionSelect(classSelect.value);
    });

    examResultFilterForm.addEventListener('submit', async function (event) {
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
            const data = await fetchJson('/api/exam-results/search?groupId=' + encodeURIComponent(groupId)
                + '&examId=' + encodeURIComponent(examId)
                + '&sessionYear=' + encodeURIComponent(sessionYear)
                + '&classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section));
            renderResults(data);
            resultListPanel.hidden = false;
            if (resultSearchInput) {
                resultSearchInput.value = '';
            }
        } catch (error) {
            showError(error);
        }
    });

    if (resultSearchInput) {
        resultSearchInput.addEventListener('input', function () {
            currentPage = 1;
            applyFiltersAndRender();
        });
    }

    if (resultEntriesSelect) {
        resultEntriesSelect.addEventListener('change', function () {
            pageSize = Number(resultEntriesSelect.value) || 50;
            currentPage = 1;
            applyFiltersAndRender();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const pageBtn = event.target.closest('[data-page]');
            const navBtn = event.target.closest('[data-nav]');
            if (pageBtn) {
                currentPage = Number(pageBtn.getAttribute('data-page'));
                applyFiltersAndRender();
            } else if (navBtn && !navBtn.disabled) {
                if (navBtn.getAttribute('data-nav') === 'prev') {
                    currentPage -= 1;
                } else {
                    currentPage += 1;
                }
                applyFiltersAndRender();
            }
        });
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
    }

    resultTableBody.addEventListener('click', function (event) {
        if (event.target.closest('.student-link')) {
            event.preventDefault();
        }
    });

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getResultTableData();
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
            const result = getResultTableData();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Exam Result');
            XLSX.writeFile(wb, 'ExamResult_' + new Date().toISOString().split('T')[0] + '.xlsx');
            exportToast('Exported!', 'Excel file downloaded successfully');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getResultTableData();
            let csvContent = result.headers.join(',') + '\n';
            result.data.forEach(function (row) {
                csvContent += row.map(function (cell) {
                    return (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1)
                        ? '"' + cell.replace(/"/g, '""') + '"' : cell;
                }).join(',') + '\n';
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
            link.download = 'ExamResult_' + new Date().toISOString().split('T')[0] + '.csv';
            link.click();
            exportToast('Exported!', 'CSV file downloaded successfully');
        });
    }

    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            const result = getResultTableData();
            const doc = new window.jspdf.jsPDF('l', 'pt', 'a4');
            doc.setFontSize(16);
            doc.text('Exam Result', 40, 40);
            doc.setFontSize(10);
            doc.text('Generated on: ' + new Date().toLocaleDateString(), 40, 58);
            doc.autoTable({
                head: [result.headers],
                body: result.data,
                startY: 70,
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 4 }
            });
            doc.save('ExamResult_' + new Date().toISOString().split('T')[0] + '.pdf');
            exportToast('Exported!', 'PDF file downloaded successfully');
        });
    }

    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            const result = getResultTableData();
            let html = '<html><head><title>Exam Result</title>'
                + '<style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left;font-size:11px}th{background:#1e293b;color:#fff}</style>'
                + '</head><body><h2>Exam Result</h2><table><thead><tr>'
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

    loadInitialData().catch(showError);
});
