document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('reportPageRoot');
    const reportType = root ? root.dataset.reportType : 'studentincidentreport';
    const apiUrl = root ? root.dataset.apiUrl : '/api/behaviour/reports/student-incident';
    const showAction = root ? root.dataset.showAction === 'true' : true;
    const showClassSection = root ? root.dataset.showClassSection === 'true' : true;

    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const searchBtn = document.getElementById('searchBtn');
    const tableHead = document.getElementById('reportTableHead');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const emptyHint = document.getElementById('emptyHint');

    const incidentListModal = document.getElementById('incidentListModal');
    const studentIncidentBody = document.getElementById('studentIncidentBody');
    const modalSearchInput = document.getElementById('modalSearchInput');
    const modalEntriesSelect = document.getElementById('modalEntriesSelect');
    const modalShowingInfo = document.getElementById('modalShowingInfo');
    const modalPagination = document.getElementById('modalPagination');

    let classes = [];
    let masterSections = [];
    let rows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 100;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    let modalRows = [];
    let modalPage = 1;
    let modalPageSize = parseInt(modalEntriesSelect && modalEntriesSelect.value, 10) || 100;
    let modalFilter = '';
    let modalSortKey = '';
    let modalSortDir = 'asc';

    const configs = {
        studentincidentreport: {
            columns: [
                { key: 'admissionNo', label: 'Admission No' },
                { key: 'name', label: 'Student Name' },
                { key: 'class', label: 'Class (Section)' },
                { key: 'gender', label: 'Gender' },
                { key: 'phone', label: 'Phone' },
                { key: 'totalIncidents', label: 'Total Incidents', numeric: true },
                { key: 'totalPoints', label: 'Total Points', numeric: true }
            ],
            needsSearch: true,
            emptyHint: 'Select class and click Search.'
        },
        studentbehaviorrankreport: {
            columns: [
                { key: 'rank', label: 'Rank', numeric: true },
                { key: 'admissionNo', label: 'Admission No' },
                { key: 'name', label: 'Student Name' },
                { key: 'class', label: 'Class (Section)' },
                { key: 'gender', label: 'Gender' },
                { key: 'phone', label: 'Phone' },
                { key: 'totalPoints', label: 'Total Points', numeric: true }
            ],
            needsSearch: true,
            emptyHint: 'Select class and click Search.'
        },
        classwiserankreport: {
            columns: [
                { key: 'rank', label: 'Rank', numeric: true },
                { key: 'className', label: 'Class' },
                { key: 'totalStudents', label: 'Total Students', numeric: true },
                { key: 'totalPoints', label: 'Total Points', numeric: true }
            ],
            needsSearch: false,
            emptyHint: 'No class rank data available.'
        },
        classsectionwiserankreport: {
            columns: [
                { key: 'rank', label: 'Rank', numeric: true },
                { key: 'className', label: 'Class' },
                { key: 'section', label: 'Section' },
                { key: 'totalStudents', label: 'Total Students', numeric: true },
                { key: 'totalPoints', label: 'Total Points', numeric: true }
            ],
            needsSearch: false,
            emptyHint: 'No class-section rank data available.'
        },
        housewiserankreport: {
            columns: [
                { key: 'rank', label: 'Rank', numeric: true },
                { key: 'houseName', label: 'House' },
                { key: 'totalStudents', label: 'Total Students', numeric: true },
                { key: 'totalPoints', label: 'Total Points', numeric: true }
            ],
            needsSearch: false,
            emptyHint: 'No house rank data available.'
        },
        incidentwisereport: {
            columns: [
                { key: 'title', label: 'Title' },
                { key: 'points', label: 'Point', numeric: true },
                { key: 'description', label: 'Description' },
                { key: 'totalAssigned', label: 'Total Assigned', numeric: true }
            ],
            needsSearch: false,
            emptyHint: 'No incident data available.'
        }
    };

    const config = configs[reportType] || configs.studentincidentreport;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function studentFullName(row) {
        return row.studentName || [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
    }

    function classLabel(row) {
        if (row.classLabel) return row.classLabel;
        const className = row.className || '';
        const section = row.section || '';
        if (className && section) return className + ' (' + section + ')';
        return className || section || '';
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value).trim();
        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) return isoMatch[3] + '/' + isoMatch[2] + '/' + isoMatch[1];
        return text;
    }

    function cellValue(row, key) {
        switch (key) {
            case 'name': return studentFullName(row);
            case 'class': return classLabel(row);
            case 'phone': return row.mobileNumber || '';
            case 'admissionNo': return row.admissionNo || '';
            case 'gender': return row.gender || '';
            case 'totalIncidents': return row.totalIncidents == null ? 0 : row.totalIncidents;
            case 'totalPoints': return row.totalPoints == null ? 0 : row.totalPoints;
            case 'rank': return row.rank == null ? '' : row.rank;
            case 'className': return row.className || '';
            case 'section': return row.section || '';
            case 'houseName': return row.houseName || '';
            case 'totalStudents': return row.totalStudents == null ? 0 : row.totalStudents;
            case 'title': return row.title || '';
            case 'points': return row.points == null ? 0 : row.points;
            case 'description': return row.description || '';
            case 'totalAssigned': return row.totalAssigned == null ? 0 : row.totalAssigned;
            default: return row[key] == null ? '' : row[key];
        }
    }

    function renderHead() {
        const cols = config.columns.map(function (col) {
            return '<th data-sort="' + escapeHtml(col.key) + '">' + escapeHtml(col.label)
                + ' <span class="sort-icon">↑↓</span></th>';
        }).join('');
        tableHead.innerHTML = '<tr>' + cols + (showAction ? '<th>Action</th>' : '') + '</tr>';

        tableHead.querySelectorAll('th[data-sort]').forEach(function (th) {
            th.addEventListener('click', function () {
                const key = th.getAttribute('data-sort');
                if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                else {
                    sortKey = key;
                    sortDir = 'asc';
                }
                renderTable();
            });
        });
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                const haystack = config.columns.map(function (col) {
                    return cellValue(row, col.key);
                }).join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            const col = config.columns.find(function (c) { return c.key === sortKey; });
            list.sort(function (a, b) {
                const av = cellValue(a, sortKey);
                const bv = cellValue(b, sortKey);
                if (col && col.numeric) {
                    return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function actionHtml(row) {
        if (!showAction) return '';
        return '<td class="action-cell">'
            + '<button type="button" class="btn-action btn-list" data-id="'
            + escapeHtml(String(row.id)) + '" title="Assigned Incident">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="3" y1="12" x2="21" y2="12"></line>'
            + '<line x1="3" y1="6" x2="21" y2="6"></line>'
            + '<line x1="3" y1="18" x2="21" y2="18"></line>'
            + '</svg></button></td>';
    }

    function renderPagination(el, page, totalPages, total, handlerAttr) {
        if (!el) return;
        let html = '<button type="button" class="pagination-btn" data-' + handlerAttr + '="prev"'
            + (page <= 1 ? ' disabled' : '') + '>‹</button>';
        for (let p = 1; p <= totalPages; p++) {
            html += '<button type="button" class="pagination-btn'
                + (p === page ? ' active' : '') + '" data-' + handlerAttr + '-page="' + p + '">' + p + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-' + handlerAttr + '="next"'
            + (page >= totalPages || total === 0 ? ' disabled' : '') + '>›</button>';
        el.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;
        const colspan = config.columns.length + (showAction ? 1 : 0);

        if (!total) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="' + colspan + '">'
                + '<div class="empty-state"><p class="empty-message">No data available in table</p>'
                + '<p class="empty-hint">' + escapeHtml(config.emptyHint || '') + '</p></div></td></tr>';
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(pagination, 1, 1, 0, 'nav');
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            const cells = config.columns.map(function (col) {
                let value = cellValue(row, col.key);
                if (col.key === 'name' && row.id) {
                    return '<td><a class="student-link" href="/student/view/'
                        + encodeURIComponent(String(row.id)) + '">' + escapeHtml(value) + '</a></td>';
                }
                return '<td>' + escapeHtml(String(value)) + '</td>';
            }).join('');
            return '<tr>' + cells + actionHtml(row) + '</tr>';
        }).join('');

        if (showingInfo) showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        renderPagination(pagination, currentPage, totalPages, total, 'nav');
    }

    function fillClassSelect() {
        if (!classSelect) return;
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
        if (current) classSelect.value = current;
    }

    function fillSectionSelect(preferred) {
        if (!sectionSelect) return;
        sectionSelect.innerHTML = '<option value="">Select</option>';
        const selectedClass = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
        const classSections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (s) { return s.sectionName || s.name || s; });
        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            sectionSelect.appendChild(option);
        });
        if (preferred) sectionSelect.value = preferred;
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect();
        fillSectionSelect();
    }

    async function loadSections() {
        const response = await fetch('/api/sections');
        if (!response.ok) throw new Error('Failed to load sections');
        masterSections = await response.json();
        fillSectionSelect();
    }

    async function loadReport() {
        let url = apiUrl;
        if (showClassSection) {
            const classValue = classSelect ? classSelect.value : '';
            if (!classValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Class Required',
                    text: 'Please select a class to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            const query = new URLSearchParams();
            query.set('classId', classValue);
            if (sectionSelect && sectionSelect.value) query.set('section', sectionSelect.value);
            url += (url.indexOf('?') >= 0 ? '&' : '?') + query.toString();
        }

        const response = await fetch(url);
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load report');
        }
        rows = await response.json();
        currentPage = 1;
        renderTable();
        if (!rows.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Results',
                text: 'No records found for this report.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    function modalSortValue(row, key) {
        switch (key) {
            case 'title': return row.title || '';
            case 'points': return Number(row.points || 0);
            case 'session': return row.session || '';
            case 'date': return row.incidentDate || '';
            case 'description': return row.description || '';
            case 'assignedBy': return row.assignedBy || '';
            default: return '';
        }
    }

    function getFilteredModalRows() {
        let list = modalRows.slice();
        const filter = modalFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                const haystack = [
                    row.title, row.points, row.session, formatDate(row.incidentDate),
                    row.description, row.assignedBy
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }
        if (modalSortKey) {
            list.sort(function (a, b) {
                const av = modalSortValue(a, modalSortKey);
                const bv = modalSortValue(b, modalSortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return modalSortDir === 'asc' ? av - bv : bv - av;
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return modalSortDir === 'asc' ? -1 : 1;
                if (as > bs) return modalSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function renderModalTable() {
        const filtered = getFilteredModalRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / modalPageSize) || 1);
        if (modalPage > totalPages) modalPage = totalPages;

        if (!total) {
            studentIncidentBody.innerHTML = '<tr class="empty-row"><td colspan="6">No incidents assigned.</td></tr>';
            if (modalShowingInfo) modalShowingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(modalPagination, 1, 1, 0, 'modal-nav');
            return;
        }

        const start = (modalPage - 1) * modalPageSize;
        const end = Math.min(start + modalPageSize, total);
        studentIncidentBody.innerHTML = filtered.slice(start, end).map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td>' + escapeHtml(String(row.points == null ? 0 : row.points)) + '</td>'
                + '<td>' + escapeHtml(row.session || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(row.incidentDate)) + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td>' + escapeHtml(row.assignedBy || '') + '</td>'
                + '</tr>';
        }).join('');

        if (modalShowingInfo) {
            modalShowingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(modalPagination, modalPage, totalPages, total, 'modal-nav');
    }

    async function openIncidentList(id) {
        modalRows = [];
        modalPage = 1;
        modalFilter = '';
        if (modalSearchInput) modalSearchInput.value = '';
        studentIncidentBody.innerHTML = '<tr class="empty-row"><td colspan="6">Loading...</td></tr>';
        incidentListModal.hidden = false;

        const response = await fetch('/api/behaviour/student-incidents/' + encodeURIComponent(id));
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load incidents');
        }
        modalRows = await response.json();
        renderModalTable();
    }

    function closeListModal() {
        incidentListModal.hidden = true;
    }

    function exportCsv(list, headers, mapRow, filename) {
        const lines = [headers];
        list.forEach(function (row) {
            lines.push(mapRow(row).map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    if (emptyHint) emptyHint.textContent = config.emptyHint || '';
    renderHead();
    renderTable();

    if (showClassSection) {
        Promise.all([loadClasses(), loadSections()]).catch(function (error) {
            console.error(error);
        });
    } else {
        loadReport().catch(function (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load report.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    }

    if (classSelect) {
        classSelect.addEventListener('change', function () { fillSectionSelect(); });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            loadReport().catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to load report.',
                    confirmButtonColor: '#8b5cf6'
                });
            });
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
            pageSize = parseInt(entriesSelect.value, 10) || 100;
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            else if (btn.dataset.navPage) currentPage = parseInt(btn.dataset.navPage, 10);
            renderTable();
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const listBtn = e.target.closest('.btn-list');
            if (!listBtn) return;
            openIncidentList(listBtn.dataset.id).catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to load incidents.',
                    confirmButtonColor: '#8b5cf6'
                });
            });
        });
    }

    document.querySelectorAll('[data-close-list]').forEach(function (el) {
        el.addEventListener('click', closeListModal);
    });

    if (modalSearchInput) {
        modalSearchInput.addEventListener('input', function () {
            modalFilter = modalSearchInput.value;
            modalPage = 1;
            renderModalTable();
        });
    }

    if (modalEntriesSelect) {
        modalEntriesSelect.addEventListener('change', function () {
            modalPageSize = parseInt(modalEntriesSelect.value, 10) || 100;
            modalPage = 1;
            renderModalTable();
        });
    }

    if (modalPagination) {
        modalPagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.modalNav === 'prev') modalPage -= 1;
            else if (btn.dataset.modalNav === 'next') modalPage += 1;
            else if (btn.dataset.modalNavPage) modalPage = parseInt(btn.dataset.modalNavPage, 10);
            renderModalTable();
        });
    }

    document.querySelectorAll('#assignedIncidentsTable thead th[data-modal-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-modal-sort');
            if (modalSortKey === key) modalSortDir = modalSortDir === 'asc' ? 'desc' : 'asc';
            else {
                modalSortKey = key;
                modalSortDir = 'asc';
            }
            renderModalTable();
        });
    });

    function exportMain() {
        exportCsv(
            getFilteredRows(),
            config.columns.map(function (c) { return c.label; }),
            function (row) {
                return config.columns.map(function (c) { return cellValue(row, c.key); });
            },
            reportType + '.csv'
        );
    }

    function exportModal() {
        exportCsv(
            getFilteredModalRows(),
            ['Title', 'Point', 'Session', 'Date', 'Description', 'Assign By'],
            function (row) {
                return [
                    row.title || '',
                    row.points == null ? 0 : row.points,
                    row.session || '',
                    formatDate(row.incidentDate),
                    row.description || '',
                    row.assignedBy || ''
                ];
            },
            'assigned-incident.csv'
        );
    }

    ['excelBtn', 'csvBtn'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', exportMain);
    });
    ['pdfBtn', 'printBtn'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', function () { window.print(); });
    });
    ['modalExcelBtn', 'modalCsvBtn'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', exportModal);
    });
    ['modalPdfBtn', 'modalPrintBtn'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', function () { window.print(); });
    });
});
