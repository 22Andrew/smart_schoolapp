document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('hwReportRoot');
    if (!root) return;

    const reportKey = root.dataset.reportKey || 'homeworkreport';
    const apiUrl = root.dataset.apiUrl || '';
    const listTitle = root.dataset.listTitle || 'Homework Report';
    const showSearchType = root.dataset.showSearchType === 'true';

    const criteriaForm = document.getElementById('hwCriteriaForm');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const subjectGroupSelect = document.getElementById('subjectGroupSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const searchTypeSelect = document.getElementById('searchTypeSelect');
    const tableHead = document.getElementById('reportTableHead');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const resultsHeading = document.getElementById('resultsHeading');

    let classes = [];
    let masterSections = [];
    let subjectGroups = [];
    let rows = [];
    let columns = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    const COLUMN_SETS = {
        homeworkreport: [
            { key: 'className', label: 'Class' },
            { key: 'section', label: 'Section' },
            { key: 'subjectGroup', label: 'Subject Group' },
            { key: 'subject', label: 'Subject' },
            { key: 'homeworkDate', label: 'Homework Date' },
            { key: 'submissionDate', label: 'Submission Date' },
            { key: 'studentCount', label: 'Student Count', numeric: true },
            { key: 'homeworkSubmitted', label: 'Homework Submitted', numeric: true },
            { key: 'pendingStudent', label: 'Pending Student', numeric: true }
        ],
        evaluation_report: [
            { key: 'subject', label: 'Subject' },
            { key: 'homeworkDate', label: 'Homework Date' },
            { key: 'submissionDate', label: 'Submission Date' },
            { key: 'completeIncomplete', label: 'Complete / Incomplete' },
            { key: 'completePercent', label: 'Complete%' }
        ],
        homeworkordailyassignmentreport: [
            { key: 'studentName', label: 'Student Name' },
            { key: 'className', label: 'Class' },
            { key: 'section', label: 'Section' },
            { key: 'totalAssignment', label: 'Total Assignment', numeric: true },
            { key: 'action', label: 'Action', action: true }
        ],
        homeworksmarksreport: [
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'rollNumber', label: 'Roll No.' },
            { key: 'homeworkDate', label: 'Homework Date' },
            { key: 'submissionDate', label: 'Submission Date' },
            { key: 'evaluationDate', label: 'Evaluation Date' },
            { key: 'totalMarks', label: 'Total Marks', numeric: true },
            { key: 'marksObtained', label: 'Marks Obtained', numeric: true },
            { key: 'note', label: 'Note' }
        ]
    };

    columns = COLUMN_SETS[reportKey] || COLUMN_SETS.homeworkreport;
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
            sectionSelect.disabled = true;
            return;
        }

        sectionSelect.disabled = false;
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
    }

    function asSubjectList(subjects) {
        if (!subjects) return [];
        return Array.isArray(subjects) ? subjects : Array.from(subjects);
    }

    function subjectLabel(subject) {
        if (!subject) return '';
        const code = subject.subjectCode ? ' (' + subject.subjectCode + ')' : '';
        return (subject.name || '') + code;
    }

    function getGroupClassId(group) {
        if (group.schoolClass && group.schoolClass.id != null) {
            return String(group.schoolClass.id);
        }
        if (group.classId != null) {
            return String(group.classId);
        }
        return '';
    }

    function getFilteredSubjectGroups() {
        const classId = classSelect.value;
        const section = sectionSelect.value ? String(sectionSelect.value).toUpperCase() : '';
        let filtered = subjectGroups.slice();

        if (classId) {
            filtered = filtered.filter(function (group) {
                return getGroupClassId(group) === String(classId);
            });
        }

        if (section) {
            filtered = filtered.filter(function (group) {
                const sections = (group.sections || []).map(function (item) {
                    return String(item).toUpperCase();
                });
                return sections.length === 0 || sections.indexOf(section) !== -1;
            });
        }

        return filtered;
    }

    function populateSubjectGroupOptions() {
        const filtered = getFilteredSubjectGroups();
        if (!filtered.length) {
            subjectGroupSelect.innerHTML = '<option value="">No subject groups found</option>';
            subjectGroupSelect.disabled = true;
            return;
        }

        subjectGroupSelect.disabled = false;
        subjectGroupSelect.innerHTML = '<option value="">Select</option>' + filtered.map(function (group) {
            return '<option value="' + group.id + '">' + escapeHtml(group.name || group.subjectGroupName || '') + '</option>';
        }).join('');
    }

    function populateSubjectOptions() {
        const group = subjectGroups.find(function (item) {
            return String(item.id) === String(subjectGroupSelect.value);
        });

        if (!group) {
            subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
            subjectSelect.disabled = true;
            return;
        }

        const subjects = asSubjectList(group.subjects);
        if (!subjects.length) {
            subjectSelect.innerHTML = '<option value="">No subjects found</option>';
            subjectSelect.disabled = true;
            return;
        }

        subjectSelect.disabled = false;
        subjectSelect.innerHTML = '<option value="">Select</option>' + subjects.map(function (subject) {
            return '<option value="' + subject.id + '">' + escapeHtml(subjectLabel(subject)) + '</option>';
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
        if (col.action) return '';
        const value = row[col.key];
        if (col.numeric && value != null && value !== '') {
            const num = Number(value);
            if (!Number.isNaN(num) && !Number.isInteger(num)) {
                return num.toFixed(2);
            }
        }
        return value == null ? '' : value;
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return columns.map(function (col) {
                    return col.action ? '' : cellValue(row, col);
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
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
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
                if (col.action && row.studentAdmissionId) {
                    return '<td><button type="button" class="action-view-btn" data-student-id="'
                        + escapeHtml(String(row.studentAdmissionId)) + '">View</button></td>';
                }
                if (col.action) {
                    return '<td></td>';
                }
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
        const [classesRes, sectionsRes, groupsRes] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups')
        ]);

        if (!classesRes.ok || !sectionsRes.ok || !groupsRes.ok) {
            throw new Error('Failed to load homework report filters');
        }

        classes = await classesRes.json();
        masterSections = await sectionsRes.json();
        subjectGroups = await groupsRes.json();
        renderClassOptions();
        populateSectionOptions();
        populateSubjectGroupOptions();
        populateSubjectOptions();
    }

    function validateCriteria() {
        if (!classSelect.value || !sectionSelect.value || !subjectGroupSelect.value || !subjectSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please select class, section, subject group and subject.',
                confirmButtonColor: '#8b5cf6'
            });
            return false;
        }
        if (showSearchType && searchTypeSelect && !searchTypeSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Field',
                text: 'Please select search type.',
                confirmButtonColor: '#8b5cf6'
            });
            return false;
        }
        return true;
    }

    async function loadReport() {
        if (!validateCriteria()) return;

        const params = new URLSearchParams();
        params.set('classId', classSelect.value);
        params.set('section', sectionSelect.value);
        params.set('subjectGroupId', subjectGroupSelect.value);
        params.set('subjectId', subjectSelect.value);
        if (showSearchType && searchTypeSelect && searchTypeSelect.value) {
            params.set('searchType', searchTypeSelect.value);
        }

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
        const headers = columns.filter(function (col) { return !col.action; })
            .map(function (col) { return col.label; });
        const data = filtered.map(function (row) {
            return columns.filter(function (col) { return !col.action; }).map(function (col) {
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

        if (format === 'csv') {
            const csv = [headers.join(',')].concat(data.map(function (row) {
                return row.map(function (cell) {
                    const text = String(cell).replace(/"/g, '""');
                    return '"' + text + '"';
                }).join(',');
            })).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = reportKey + '.csv';
            link.click();
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
        populateSubjectGroupOptions();
        populateSubjectOptions();
    });

    sectionSelect.addEventListener('change', function () {
        populateSubjectGroupOptions();
        populateSubjectOptions();
    });

    subjectGroupSelect.addEventListener('change', populateSubjectOptions);

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

    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            const btn = event.target.closest('.action-view-btn');
            if (!btn) return;
            const studentId = btn.getAttribute('data-student-id');
            if (studentId) {
                window.location.href = '/dailyassignment?studentId=' + encodeURIComponent(studentId);
            }
        });
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () { exportRows('copy'); });
    document.getElementById('csvBtn')?.addEventListener('click', function () { exportRows('csv'); });
    document.getElementById('excelBtn')?.addEventListener('click', function () { exportRows('excel'); });
    document.getElementById('pdfBtn')?.addEventListener('click', function () { exportRows('pdf'); });
    document.getElementById('printBtn')?.addEventListener('click', function () { exportRows('print'); });

    renderHead();
    renderEmptyTable();
    loadLookups().catch(function (error) {
        showError(error.message);
    });
});
