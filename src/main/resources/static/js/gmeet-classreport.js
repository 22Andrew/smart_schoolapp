document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const searchForm = document.getElementById('reportSearchForm');
    const noRecordBox = document.getElementById('noRecordBox');
    const reportResults = document.getElementById('reportResults');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let classes = [];
    let reportRows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';
    let hasSearched = false;

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

    function renderClassOptions() {
        if (!classSelect) return;
        classSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + escapeHtml(String(item.id)) + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function renderSectionOptions(classId) {
        if (!sectionSelect) return;
        sectionSelect.innerHTML = '<option value="">Select</option>';
        if (!classId) return;

        const selectedClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        if (!selectedClass || !selectedClass.sections) return;

        sectionSelect.innerHTML += selectedClass.sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
    }

    async function loadFormOptions() {
        const response = await fetch('/api/gmeet/live-classes/form-options');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load form options');
        }
        const options = await response.json();
        classes = options.classes || [];
        renderClassOptions();
    }

    function sortValue(row, key) {
        switch (key) {
            case 'classTitle': return row.classTitle || '';
            case 'description': return row.description || '';
            case 'dateTime': return row.dateTime || '';
            case 'durationMinutes': return row.durationMinutes || 0;
            case 'createdBy': return row.createdBy || '';
            case 'createdFor': return row.createdFor || '';
            case 'status': return row.status || '';
            default: return '';
        }
    }

    function getFiltered() {
        let rows = reportRows.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.classTitle,
                    row.description,
                    row.dateTime,
                    row.createdBy,
                    row.createdFor,
                    row.status,
                    (row.classSections || []).join(' ')
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
                const av = sortValue(a, sortKey);
                const bv = sortValue(b, sortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
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

    function classSectionsHtml(row) {
        const sections = row.classSections || [];
        if (!sections.length) {
            if (row.className && row.section) {
                return escapeHtml(row.className + ' (' + row.section + ')');
            }
            return '';
        }
        return sections.map(function (section) {
            return escapeHtml(section);
        }).join('<br>');
    }

    function renderTable() {
        if (!tableBody) return;

        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = ''
                + '<tr class="empty-row"><td colspan="8">'
                + '<div class="empty-state"><p class="empty-message">No data available in table</p></div>'
                + '</td></tr>';
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.classTitle || '') + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td>' + escapeHtml(row.dateTime || '') + '</td>'
                + '<td>' + escapeHtml(row.durationMinutes == null ? '' : row.durationMinutes) + '</td>'
                + '<td>' + escapeHtml(row.createdBy || '') + '</td>'
                + '<td>' + escapeHtml(row.createdFor || '') + '</td>'
                + '<td>' + classSectionsHtml(row) + '</td>'
                + '<td>' + escapeHtml(row.status || '') + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    function showNoRecordState() {
        if (noRecordBox) noRecordBox.hidden = false;
        if (reportResults) reportResults.hidden = true;
    }

    function showResultsState() {
        if (noRecordBox) noRecordBox.hidden = true;
        if (reportResults) reportResults.hidden = false;
        renderTable();
    }

    async function searchReport(event) {
        if (event) event.preventDefault();

        const classId = classSelect ? classSelect.value : '';
        const section = sectionSelect ? sectionSelect.value : '';
        const selectedClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });

        if (!selectedClass || !section) {
            showError(new Error('Please select class and section.'));
            return;
        }

        const params = new URLSearchParams({
            className: selectedClass.name,
            section: section
        });

        const response = await fetch('/api/gmeet/live-classes/report?' + params.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load live classes report');
        }

        reportRows = await response.json();
        hasSearched = true;
        currentPage = 1;
        tableFilter = '';
        sortKey = '';
        sortDir = 'asc';
        if (tableSearchInput) tableSearchInput.value = '';

        if (!reportRows.length) {
            showNoRecordState();
            return;
        }

        showResultsState();
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportTable(type) {
        const filtered = getFiltered();
        if (!filtered.length) {
            Swal.fire({
                icon: 'info',
                title: 'No data',
                text: 'There is no data to export.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const headers = [
            'Class Title', 'Description', 'Date Time', 'Duration',
            'Created By', 'Created For', 'Class', 'Status'
        ];
        const rows = filtered.map(function (row) {
            const sections = row.classSections && row.classSections.length
                ? row.classSections.join(', ')
                : ((row.className && row.section) ? row.className + ' (' + row.section + ')' : '');
            return [
                row.classTitle,
                row.description,
                row.dateTime,
                row.durationMinutes,
                row.createdBy,
                row.createdFor,
                sections,
                row.status
            ];
        });

        if (type === 'print') {
            window.print();
            return;
        }

        if (type === 'csv') {
            const csv = [headers.join(',')].concat(rows.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('live-classes-report.csv', csv, 'text/csv');
            return;
        }

        if (type === 'excel' && window.XLSX) {
            const worksheet = XLSX.utils.aoa_to_sheet([headers].concat(rows));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Classes Report');
            XLSX.writeFile(workbook, 'live-classes-report.xlsx');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({ head: [headers], body: rows });
            doc.save('live-classes-report.pdf');
        }
    }

    if (classSelect) {
        classSelect.addEventListener('change', function () {
            renderSectionOptions(classSelect.value);
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            searchReport(event).catch(showError);
        });
    }

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            tableFilter = tableSearchInput.value;
            currentPage = 1;
            renderTable();
        });
    }

    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.page) {
                currentPage = parseInt(btn.dataset.page, 10);
            } else if (btn.dataset.nav === 'prev') {
                currentPage -= 1;
            } else if (btn.dataset.nav === 'next') {
                currentPage += 1;
            }
            renderTable();
        });
    }

    document.querySelectorAll('#reportTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.dataset.sort;
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            renderTable();
        });
    });

    if (excelBtn) excelBtn.addEventListener('click', function () { exportTable('excel'); });
    if (csvBtn) csvBtn.addEventListener('click', function () { exportTable('csv'); });
    if (pdfBtn) pdfBtn.addEventListener('click', function () { exportTable('pdf'); });
    if (printBtn) printBtn.addEventListener('click', function () { exportTable('print'); });

    loadFormOptions().catch(showError);
});
