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
    const joinListModal = document.getElementById('joinListModal');
    const joinListNoRecord = document.getElementById('joinListNoRecord');
    const joinListTableWrap = document.getElementById('joinListTableWrap');
    const joinListTableBody = document.getElementById('joinListTableBody');

    let classes = [];
    let reportRows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

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
        const response = await fetch('/api/conference/live-classes/form-options');
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
            case 'apiUsed': return row.apiUsed || '';
            case 'createdBy': return row.createdBy || '';
            case 'createdFor': return row.createdFor || '';
            case 'totalJoin': return row.totalJoin || 0;
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
                    row.apiUsed,
                    row.createdBy,
                    row.createdFor,
                    row.totalJoin
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

    function actionButtonHtml(row) {
        const id = escapeHtml(String(row.id));
        return ''
            + '<button type="button" class="btn-view-join-list" data-view="' + id + '" title="Join List">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="8" y1="6" x2="21" y2="6"></line>'
            + '<line x1="8" y1="12" x2="21" y2="12"></line>'
            + '<line x1="8" y1="18" x2="21" y2="18"></line>'
            + '<line x1="3" y1="6" x2="3.01" y2="6"></line>'
            + '<line x1="3" y1="12" x2="3.01" y2="12"></line>'
            + '<line x1="3" y1="18" x2="3.01" y2="18"></line>'
            + '</svg></button>';
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
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.classTitle || '') + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td>' + escapeHtml(row.dateTime || '') + '</td>'
                + '<td>' + escapeHtml(row.apiUsed || '') + '</td>'
                + '<td>' + escapeHtml(row.createdBy || '') + '</td>'
                + '<td>' + escapeHtml(row.createdFor || '') + '</td>'
                + '<td>' + escapeHtml(row.totalJoin == null ? '0' : row.totalJoin) + '</td>'
                + '<td class="action-cell">' + actionButtonHtml(row) + '</td>'
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

        const response = await fetch('/api/conference/live-classes/report?' + params.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load live classes report');
        }

        reportRows = await response.json();
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

    function closeJoinListModal() {
        if (!joinListModal) return;
        joinListModal.hidden = true;
        document.body.style.overflow = '';
    }

    function openJoinListModal(rowId) {
        const row = reportRows.find(function (item) {
            return String(item.id) === String(rowId);
        });
        if (!row || !joinListModal) return;

        const joinList = row.joinList || [];
        if (!joinList.length) {
            if (joinListNoRecord) joinListNoRecord.hidden = false;
            if (joinListTableWrap) joinListTableWrap.hidden = true;
            if (joinListTableBody) joinListTableBody.innerHTML = '';
        } else {
            if (joinListNoRecord) joinListNoRecord.hidden = true;
            if (joinListTableWrap) joinListTableWrap.hidden = false;
            if (joinListTableBody) {
                joinListTableBody.innerHTML = joinList.map(function (item) {
                    return '<tr>'
                        + '<td>' + escapeHtml(item.name || '') + '</td>'
                        + '<td>' + escapeHtml(item.role || '') + '</td>'
                        + '<td>' + escapeHtml(item.id || '') + '</td>'
                        + '</tr>';
                }).join('');
            }
        }

        joinListModal.hidden = false;
        document.body.style.overflow = 'hidden';
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
            'Class Title', 'Description', 'Date', 'Api Used',
            'Created By', 'Created For', 'Total Join'
        ];
        const rows = filtered.map(function (row) {
            return [
                row.classTitle,
                row.description,
                row.dateTime,
                row.apiUsed,
                row.createdBy,
                row.createdFor,
                row.totalJoin
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

    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            const viewBtn = event.target.closest('[data-view]');
            if (viewBtn) openJoinListModal(viewBtn.dataset.view);
        });
    }

    joinListModal && joinListModal.querySelectorAll('[data-close-join-modal]').forEach(function (el) {
        el.addEventListener('click', closeJoinListModal);
    });

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
