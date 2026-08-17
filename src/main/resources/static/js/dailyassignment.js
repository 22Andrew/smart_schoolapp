document.addEventListener('DOMContentLoaded', function () {
    const criteriaForm = document.getElementById('criteriaForm');
    const criteriaClassSelect = document.getElementById('criteriaClassSelect');
    const criteriaSectionSelect = document.getElementById('criteriaSectionSelect');
    const criteriaSubjectGroupSelect = document.getElementById('criteriaSubjectGroupSelect');
    const criteriaSubjectSelect = document.getElementById('criteriaSubjectSelect');
    const criteriaDate = document.getElementById('criteriaDate');

    const assignmentTableBody = document.getElementById('assignmentTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const copyBtn = document.getElementById('copyBtn');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let classes = [];
    let masterSections = [];
    let subjectGroups = [];
    let masterSubjects = [];
    let rows = [];
    let filteredRows = [];
    let currentPage = 1;
    let pageSize = 50;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length !== 3) return value;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function todayIso() {
        const now = new Date();
        return now.getFullYear() + '-'
            + String(now.getMonth() + 1).padStart(2, '0') + '-'
            + String(now.getDate()).padStart(2, '0');
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
        criteriaClassSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateSectionOptions(classId, selectedSection) {
        const schoolClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        if (!schoolClass) {
            criteriaSectionSelect.innerHTML = '<option value="">Select class first</option>';
            criteriaSectionSelect.disabled = true;
            return;
        }
        const classSections = Array.isArray(schoolClass.sections) ? schoolClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (section) {
                return section.sectionName || section.name || section;
            }).filter(Boolean);
        if (!sections.length) {
            criteriaSectionSelect.innerHTML = '<option value="">No sections found</option>';
            criteriaSectionSelect.disabled = true;
            return;
        }
        criteriaSectionSelect.disabled = false;
        criteriaSectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
        if (selectedSection) {
            criteriaSectionSelect.value = selectedSection;
        }
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

    function getFilteredSubjectGroups(classId, section) {
        let filtered = subjectGroups.slice();
        if (classId) {
            filtered = filtered.filter(function (group) {
                return getGroupClassId(group) === String(classId);
            });
        }
        if (section) {
            const upper = String(section).toUpperCase();
            const bySection = filtered.filter(function (group) {
                const sections = (group.sections || []).map(function (item) {
                    return String(item).toUpperCase();
                });
                return !sections.length || sections.indexOf(upper) !== -1;
            });
            if (bySection.length) {
                filtered = bySection;
            }
        }
        return filtered;
    }

    function populateSubjectGroupOptions(classId, section, selectedGroupId) {
        const filtered = getFilteredSubjectGroups(classId, section);
        if (!filtered.length) {
            criteriaSubjectGroupSelect.innerHTML = '<option value="">No subject groups found</option>';
            criteriaSubjectGroupSelect.disabled = true;
            return;
        }
        criteriaSubjectGroupSelect.disabled = false;
        criteriaSubjectGroupSelect.innerHTML = '<option value="">Select</option>' + filtered.map(function (group) {
            return '<option value="' + group.id + '">' + escapeHtml(group.name) + '</option>';
        }).join('');
        if (selectedGroupId) {
            criteriaSubjectGroupSelect.value = String(selectedGroupId);
        }
    }

    function asSubjectList(subjects) {
        if (!subjects) return [];
        return Array.isArray(subjects) ? subjects : Array.from(subjects);
    }

    function populateSubjectOptions(groupId, selectedSubjectId) {
        const group = subjectGroups.find(function (item) {
            return String(item.id) === String(groupId);
        });
        if (!group) {
            criteriaSubjectSelect.innerHTML = '<option value="">Select subject group first</option>';
            criteriaSubjectSelect.disabled = true;
            return;
        }
        let subjects = asSubjectList(group.subjects);
        if (!subjects.length && group.subjectIds && group.subjectIds.length) {
            subjects = masterSubjects.filter(function (subject) {
                return group.subjectIds.indexOf(subject.id) !== -1;
            });
        }
        if (!subjects.length) {
            criteriaSubjectSelect.innerHTML = '<option value="">No subjects found</option>';
            criteriaSubjectSelect.disabled = true;
            return;
        }
        criteriaSubjectSelect.disabled = false;
        criteriaSubjectSelect.innerHTML = '<option value="">Select</option>' + subjects.map(function (subject) {
            const label = (subject.name || '') + (subject.subjectCode ? ' (' + subject.subjectCode + ')' : '');
            return '<option value="' + subject.id + '">' + escapeHtml(label) + '</option>';
        }).join('');
        if (selectedSubjectId) {
            criteriaSubjectSelect.value = String(selectedSubjectId);
        }
    }

    function bindCascade() {
        criteriaClassSelect.addEventListener('change', function () {
            populateSectionOptions(criteriaClassSelect.value, '');
            populateSubjectGroupOptions(criteriaClassSelect.value, '', '');
            populateSubjectOptions('', '');
        });
        criteriaSectionSelect.addEventListener('change', function () {
            populateSubjectGroupOptions(criteriaClassSelect.value, criteriaSectionSelect.value, '');
            populateSubjectOptions('', '');
        });
        criteriaSubjectGroupSelect.addEventListener('change', function () {
            populateSubjectOptions(criteriaSubjectGroupSelect.value, '');
        });
    }

    async function loadMasterData() {
        const [classesRes, sectionsRes, groupsRes, subjectsRes] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups'),
            fetch('/api/subjects')
        ]);
        classes = classesRes.ok ? await classesRes.json() : [];
        masterSections = sectionsRes.ok ? await sectionsRes.json() : [];
        subjectGroups = groupsRes.ok ? await groupsRes.json() : [];
        masterSubjects = subjectsRes.ok ? await subjectsRes.json() : [];
        renderClassOptions();
        criteriaDate.value = todayIso();
    }

    function getSearchParams() {
        const params = new URLSearchParams();
        params.set('classId', criteriaClassSelect.value);
        params.set('section', criteriaSectionSelect.value);
        params.set('subjectGroupId', criteriaSubjectGroupSelect.value);
        params.set('subjectId', criteriaSubjectSelect.value);
        params.set('assignmentDate', criteriaDate.value);
        return params;
    }

    async function loadAssignments() {
        if (!criteriaClassSelect.value || !criteriaSectionSelect.value
            || !criteriaSubjectGroupSelect.value || !criteriaSubjectSelect.value || !criteriaDate.value) {
            showError('Please select class, section, subject group, subject, and date.');
            return;
        }
        const response = await fetch('/api/daily-assignments?' + getSearchParams().toString());
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load daily assignments');
        }
        rows = Array.isArray(data) ? data : [];
        applyLocalFilters();
    }

    function applyLocalFilters() {
        const keyword = (searchInput.value || '').trim().toLowerCase();
        filteredRows = rows.filter(function (row) {
            if (!keyword) return true;
            const haystack = [
                row.studentName,
                row.className,
                row.section,
                row.subjectName,
                row.title,
                row.evaluatedBy
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        });
        currentPage = 1;
        renderTable();
    }

    function renderEmptyRow() {
        assignmentTableBody.innerHTML = ''
            + '<tr><td colspan="9" class="empty-state-cell">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration">📁</div>'
            + '<div class="empty-hint">+ Add new record or search with different criteria.</div>'
            + '</td></tr>';
    }

    function renderTable() {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        const total = filteredRows.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const pageRows = filteredRows.slice(start, start + pageSize);

        if (!pageRows.length) {
            renderEmptyRow();
        } else {
            assignmentTableBody.innerHTML = pageRows.map(function (row) {
                return ''
                    + '<tr data-id="' + row.id + '">'
                    + '<td>' + escapeHtml(row.studentName) + '</td>'
                    + '<td>' + escapeHtml(row.className) + '</td>'
                    + '<td>' + escapeHtml(row.section) + '</td>'
                    + '<td>' + escapeHtml(row.subjectName) + '</td>'
                    + '<td>' + escapeHtml(row.title) + '</td>'
                    + '<td>' + escapeHtml(formatDate(row.submissionDate)) + '</td>'
                    + '<td>' + escapeHtml(formatDate(row.evaluationDate)) + '</td>'
                    + '<td>' + escapeHtml(row.evaluatedBy || '') + '</td>'
                    + '<td>'
                    + '<button type="button" class="btn-action btn-delete" title="Delete">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                    + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
                    + '</svg></button>'
                    + '</td>'
                    + '</tr>';
            }).join('');
        }

        const from = total ? start + 1 : 0;
        const to = Math.min(start + pageSize, total);
        showingInfo.textContent = 'Showing ' + from + ' to ' + to + ' of ' + total + ' entries';

        pagination.innerHTML = '';
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = currentPage <= 1;
        prevBtn.addEventListener('click', function () {
            currentPage -= 1;
            renderTable();
        });
        pagination.appendChild(prevBtn);

        for (let page = 1; page <= totalPages; page += 1) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = 'pagination-btn' + (page === currentPage ? ' active' : '');
            pageBtn.textContent = String(page);
            pageBtn.addEventListener('click', function () {
                currentPage = page;
                renderTable();
            });
            pagination.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.addEventListener('click', function () {
            currentPage += 1;
            renderTable();
        });
        pagination.appendChild(nextBtn);
    }

    function getExportRows() {
        return filteredRows.map(function (row) {
            return [
                row.studentName || '',
                row.className || '',
                row.section || '',
                row.subjectName || '',
                row.title || '',
                formatDate(row.submissionDate),
                formatDate(row.evaluationDate),
                row.evaluatedBy || ''
            ];
        });
    }

    copyBtn.addEventListener('click', function () {
        const headers = ['Student Name', 'Class', 'Section', 'Subject', 'Title', 'Submission Date', 'Evaluation Date', 'Evaluated By'];
        const text = [headers.join('\t')].concat(getExportRows().map(function (row) {
            return row.join('\t');
        })).join('\n');
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied', timer: 1200, showConfirmButton: false });
        });
    });

    excelBtn.addEventListener('click', function () {
        const headers = ['Student Name', 'Class', 'Section', 'Subject', 'Title', 'Submission Date', 'Evaluation Date', 'Evaluated By'];
        const sheetData = [headers].concat(getExportRows());
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Assignment');
        XLSX.writeFile(workbook, 'daily-assignment.xlsx');
    });

    csvBtn.addEventListener('click', function () {
        const headers = ['Student Name', 'Class', 'Section', 'Subject', 'Title', 'Submission Date', 'Evaluation Date', 'Evaluated By'];
        const csv = [headers.join(',')].concat(getExportRows().map(function (row) {
            return row.map(function (cell) {
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        })).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'daily-assignment.csv';
        link.click();
    });

    pdfBtn.addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.text('Daily Assignment List', 14, 15);
        doc.autoTable({
            head: [['Student Name', 'Class', 'Section', 'Subject', 'Title', 'Submission Date', 'Evaluation Date', 'Evaluated By']],
            body: getExportRows(),
            startY: 22,
            styles: { fontSize: 8 }
        });
        doc.save('daily-assignment.pdf');
    });

    printBtn.addEventListener('click', function () {
        window.print();
    });

    criteriaForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loadAssignments().catch(function (error) {
            showError(error.message);
        });
    });

    searchInput.addEventListener('input', applyLocalFilters);
    entriesSelect.addEventListener('change', renderTable);

    assignmentTableBody.addEventListener('click', function (event) {
        const deleteBtn = event.target.closest('.btn-delete');
        const row = event.target.closest('tr[data-id]');
        if (!deleteBtn || !row) return;
        const id = row.getAttribute('data-id');
        Swal.fire({
            icon: 'warning',
            title: 'Delete assignment?',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        }).then(function (result) {
            if (!result.isConfirmed) return;
            fetch('/api/daily-assignments/' + id, { method: 'DELETE' })
                .then(function (response) { return response.json(); })
                .then(function (payload) {
                    if (!payload.success) throw new Error(payload.message);
                    return loadAssignments();
                })
                .catch(function (error) {
                    showError(error.message);
                });
        });
    });

    bindCascade();
    loadMasterData()
        .then(function () {
            renderEmptyRow();
            renderTable();
        })
        .catch(function (error) {
            showError(error.message);
        });
});
