document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('lessonPlanReportRoot');
    if (!root) return;

    const apiUrl = root.dataset.apiUrl || '';
    const showSubject = root.dataset.showSubject === 'true';

    const criteriaForm = document.getElementById('lessonPlanCriteriaForm');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const subjectGroupSelect = document.getElementById('subjectGroupSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const resultsPanel = document.getElementById('resultsPanel');
    const syllabusNoRecordBanner = document.getElementById('syllabusNoRecordBanner');
    const tableHead = document.getElementById('reportTableHead');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');

    let classes = [];
    let masterSections = [];
    let subjectGroups = [];
    let rows = [];
    let columns = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';

    const SYLLABUS_COLUMNS = [
        { key: 'subjectName', label: 'Subject' },
        { key: 'lessonName', label: 'Lesson Name' },
        { key: 'topicName', label: 'Topic Name' },
        { key: 'status', label: 'Status' },
        { key: 'completionDate', label: 'Completion Date' }
    ];

    const SUBJECT_LESSON_COLUMNS = [
        { key: 'teacher', label: 'Teacher' },
        { key: 'lessonName', label: 'Lesson Name' },
        { key: 'topicName', label: 'Topic Name' },
        { key: 'subTopic', label: 'Sub Topic' },
        { key: 'date', label: 'Date' },
        { key: 'timeFrom', label: 'Time From' },
        { key: 'timeTo', label: 'Time To' },
        { key: 'action', label: 'Action', action: true }
    ];

    columns = showSubject ? SUBJECT_LESSON_COLUMNS : SYLLABUS_COLUMNS;

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

    function populateSectionOptions(classId, preferredSection) {
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

        if (preferredSection) {
            sectionSelect.value = preferredSection;
        }
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
        if (!showSubject || !subjectSelect) return;

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
            return '<th>' + escapeHtml(col.label) + '</th>';
        }).join('') + '</tr>';
    }

    function cellValue(row, key) {
        if (key === 'action') return '';
        return row[key] == null ? '' : row[key];
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return columns.map(function (col) {
                    return cellValue(row, col.key);
                }).join(' ').toLowerCase().indexOf(filter) !== -1;
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

    function renderEmptyTable(message, hint) {
        const colspan = Math.max(columns.length, 1);
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="' + colspan + '">'
            + '<div class="empty-state">'
            + '<p class="empty-message">' + escapeHtml(message || 'No data available in table') + '</p>'
            + '<div class="empty-illustration" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<p class="empty-hint">' + escapeHtml(hint || '← Add new record or search with different criteria.') + '</p>'
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
                if (col.action && row.scheduleId) {
                    return '<td><button type="button" class="action-view-btn" data-schedule-id="'
                        + escapeHtml(String(row.scheduleId)) + '">View</button></td>';
                }
                if (col.action) {
                    return '<td></td>';
                }
                return '<td>' + escapeHtml(String(cellValue(row, col.key))) + '</td>';
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
            throw new Error('Failed to load lesson plan filters');
        }

        classes = await classesRes.json();
        masterSections = await sectionsRes.json();
        subjectGroups = await groupsRes.json();
        renderClassOptions();
        populateSectionOptions();
        populateSubjectGroupOptions();
        populateSubjectOptions();
    }

    async function loadReport() {
        if (!classSelect.value || !sectionSelect.value || !subjectGroupSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please select class, section and subject group.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        if (showSubject && subjectSelect && !subjectSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Field',
                text: 'Please select subject.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const params = new URLSearchParams();
        params.set('classId', classSelect.value);
        params.set('section', sectionSelect.value);
        params.set('subjectGroupId', subjectGroupSelect.value);
        if (showSubject && subjectSelect && subjectSelect.value) {
            params.set('subjectId', subjectSelect.value);
        }

        const response = await fetch(apiUrl + '?' + params.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load report');
        }

        rows = await response.json();
        currentPage = 1;

        if (showSubject) {
            if (resultsPanel) resultsPanel.classList.remove('hidden');
            if (syllabusNoRecordBanner) syllabusNoRecordBanner.classList.add('hidden');
            renderTable();
            return;
        }

        if (resultsPanel) resultsPanel.classList.add('hidden');
        if (!rows.length) {
            if (syllabusNoRecordBanner) syllabusNoRecordBanner.classList.remove('hidden');
            return;
        }

        if (syllabusNoRecordBanner) syllabusNoRecordBanner.classList.add('hidden');
        if (resultsPanel) {
            resultsPanel.classList.remove('hidden');
            renderTable();
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
            const scheduleId = btn.getAttribute('data-schedule-id');
            if (scheduleId) {
                window.location.href = '/syllabus?scheduleId=' + encodeURIComponent(scheduleId);
            }
        });
    }

    renderHead();
    if (showSubject) {
        renderEmptyTable();
    }

    loadLookups().catch(function (error) {
        showError(error.message);
    });
});
