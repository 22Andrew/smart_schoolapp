document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('arReportRoot');
    if (!root) return;

    const reportKey = root.dataset.reportKey || 'alumnireport';
    const apiUrl = root.dataset.apiUrl || '';
    const listTitle = root.dataset.listTitle || 'Alumni Report';

    const criteriaForm = document.getElementById('arCriteriaForm');
    const sessionSelect = document.getElementById('sessionSelect');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const tableHead = document.getElementById('reportTableHead');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const resultsHeading = document.getElementById('resultsHeading');

    let sessions = [];
    let classes = [];
    let masterSections = [];
    let rows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    const columns = [
        { key: 'passOutSession', label: 'Pass Out Session' },
        { key: 'classSection', label: 'Class (Section)' },
        { key: 'admissionNumber', label: 'Admission No' },
        { key: 'studentName', label: 'Student Name' },
        { key: 'mobileNumber', label: 'Mobile Number' },
        { key: 'email', label: 'Email' },
        { key: 'gender', label: 'Gender' },
        { key: 'occupation', label: 'Occupation' },
        { key: 'address', label: 'Address' }
    ];

    if (resultsHeading) {
        resultsHeading.textContent = listTitle;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function renderSessionOptions() {
        sessionSelect.innerHTML = '<option value="">Select</option>' + sessions.map(function (item) {
            const id = item.id == null ? '' : String(item.id);
            const name = item.sessionName || item.name || id;
            return '<option value="' + escapeHtml(id) + '">' + escapeHtml(String(name)) + '</option>';
        }).join('');
    }

    function renderClassOptions() {
        classSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateSectionOptions(classId) {
        const schoolClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        if (!schoolClass) {
            sectionSelect.innerHTML = '<option value="">Select</option>';
            sectionSelect.disabled = true;
            return;
        }

        const classSections = Array.isArray(schoolClass.sections) ? schoolClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (section) {
                return section.sectionName || section.name || section;
            }).filter(Boolean);

        if (!sections.length) {
            sectionSelect.innerHTML = '<option value="">No sections found</option>';
            sectionSelect.disabled = false;
            return;
        }

        sectionSelect.disabled = false;
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            const value = typeof section === 'string' ? section : (section.sectionName || section.name || section);
            return '<option value="' + escapeHtml(String(value)) + '">' + escapeHtml(String(value)) + '</option>';
        }).join('');
    }

    function renderHead() {
        if (!tableHead) return;
        tableHead.innerHTML = '<tr>' + columns.map(function (col) {
            return '<th data-sort="' + escapeHtml(col.key) + '">'
                + escapeHtml(col.label)
                + ' <span class="sort-icon">↑↓</span></th>';
        }).join('') + '</tr>';

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

    function cellValue(row, col) {
        const value = row[col.key];
        return value == null ? '' : value;
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return columns.map(function (col) {
                    return cellValue(row, col);
                }).join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            list.sort(function (a, b) {
                const av = a[sortKey];
                const bv = b[sortKey];
                if (av == null && bv == null) return 0;
                if (av == null) return 1;
                if (bv == null) return -1;
                const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return list;
    }

    function renderPagination(el, page, totalPages, total) {
        if (!el) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (page <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let p = 1; p <= totalPages; p++) {
            html += '<button type="button" class="pagination-btn'
                + (p === page ? ' active' : '') + '" data-nav-page="' + p + '">' + p + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (page >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        el.innerHTML = html;
    }

    function renderEmptyTable() {
        const colspan = Math.max(columns.length, 1);
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="' + colspan + '">'
            + '<div class="empty-state">'
            + '<p class="empty-message">No data available in table</p>'
            + '<div class="empty-illustration" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<p class="empty-hint">← Add new record or search with different criteria.</p>'
            + '</div></td></tr>';
        if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        renderPagination(pagination, 1, 1, 0);
    }

    function renderTable() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            renderEmptyTable();
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            const cells = columns.map(function (col) {
                return '<td>' + escapeHtml(String(cellValue(row, col))) + '</td>';
            }).join('');
            return '<tr>' + cells + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(pagination, currentPage, totalPages, total);
    }

    async function loadLookups() {
        const [sessionsRes, classesRes, sectionsRes] = await Promise.all([
            fetch('/api/sessions'),
            fetch('/api/classes'),
            fetch('/api/sections')
        ]);

        if (!sessionsRes.ok || !classesRes.ok || !sectionsRes.ok) {
            throw new Error('Failed to load alumni report filters');
        }

        sessions = await sessionsRes.json();
        classes = await classesRes.json();
        masterSections = await sectionsRes.json();
        renderSessionOptions();
        renderClassOptions();
        populateSectionOptions('');
    }

    async function loadReport() {
        if (!sessionSelect.value) {
            showError('Please select Pass Out Session.');
            return;
        }
        if (!classSelect.value) {
            showError('Please select Class.');
            return;
        }

        const params = new URLSearchParams();
        params.set('categoryId', sessionSelect.value);
        params.set('classId', classSelect.value);
        if (sectionSelect.value) params.set('section', sectionSelect.value);

        const response = await fetch(apiUrl + '?' + params.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load report');
        }

        rows = await response.json();
        currentPage = 1;
        renderTable();
    }

    function exportRows(format) {
        const filtered = getFilteredRows();
        if (!filtered.length) {
            showError('No data to export.');
            return;
        }
        const headers = columns.map(function (col) { return col.label; });
        const data = filtered.map(function (row) {
            return columns.map(function (col) {
                return cellValue(row, col);
            });
        });

        if (format === 'copy') {
            const text = [headers.join('\t')].concat(data.map(function (row) {
                return row.join('\t');
            })).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied', timer: 1200, showConfirmButton: false });
            }).catch(function () {
                showError('Unable to copy data.');
            });
            return;
        }

        if (format === 'excel' && window.XLSX) {
            const sheetData = [headers].concat(data);
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            XLSX.writeFile(workbook, reportKey + '.xlsx');
            return;
        }

        if (format === 'print' || format === 'pdf') {
            window.print();
        }
    }

    classSelect.addEventListener('change', function () {
        populateSectionOptions(classSelect.value);
    });

    criteriaForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loadReport().catch(function (error) {
            showError(error.message);
        });
    });

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
            if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            else if (btn.dataset.navPage) currentPage = parseInt(btn.dataset.navPage, 10);
            renderTable();
        });
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () { exportRows('copy'); });
    document.getElementById('excelBtn')?.addEventListener('click', function () { exportRows('excel'); });
    document.getElementById('pdfBtn')?.addEventListener('click', function () { exportRows('pdf'); });
    document.getElementById('printBtn')?.addEventListener('click', function () { exportRows('print'); });

    renderHead();
    renderEmptyTable();
    loadLookups().catch(function (error) {
        showError(error.message);
    });
});
