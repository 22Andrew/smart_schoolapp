document.addEventListener('DOMContentLoaded', function () {
    const syllabusFilterForm = document.getElementById('syllabusFilterForm');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const subjectGroupSelect = document.getElementById('subjectGroupSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const syllabusListPanel = document.getElementById('syllabusListPanel');
    const syllabusStatusTitle = document.getElementById('syllabusStatusTitle');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const syllabusTableWrap = document.getElementById('syllabusTableWrap');
    const syllabusTableBody = document.getElementById('syllabusTableBody');
    const excelBtn = document.getElementById('excelBtn');
    const printBtn = document.getElementById('printBtn');

    let classes = [];
    let masterSections = [];
    let subjectGroups = [];
    let masterSubjects = [];
    let rows = [];

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
            sectionSelect.innerHTML = '<option value="">Select class first</option>';
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
        if (!subjects) {
            return [];
        }
        if (Array.isArray(subjects)) {
            return subjects;
        }
        return Array.from(subjects);
    }

    function subjectLabel(subject) {
        if (!subject) {
            return '';
        }
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
        const section = sectionSelect.value
            ? String(sectionSelect.value).toUpperCase()
            : '';

        let filtered = subjectGroups.slice();

        if (classId) {
            filtered = filtered.filter(function (group) {
                return getGroupClassId(group) === String(classId);
            });
        }

        if (section) {
            const bySection = filtered.filter(function (group) {
                const sections = (group.sections || []).map(function (item) {
                    return String(item).toUpperCase();
                });
                return !sections.length || sections.indexOf(section) !== -1;
            });
            if (bySection.length) {
                filtered = bySection;
            }
        }

        return filtered;
    }

    function populateSubjectGroupOptions(preferredGroupId) {
        const filtered = getFilteredSubjectGroups();
        if (!filtered.length) {
            subjectGroupSelect.innerHTML = '<option value="">No subject groups found</option>';
            subjectGroupSelect.disabled = true;
            return;
        }
        subjectGroupSelect.disabled = false;
        subjectGroupSelect.innerHTML = '<option value="">Select</option>' + filtered.map(function (group) {
            return '<option value="' + group.id + '">' + escapeHtml(group.name) + '</option>';
        }).join('');
        if (preferredGroupId) {
            subjectGroupSelect.value = String(preferredGroupId);
        }
    }

    function populateSubjectOptions(preferredSubjectId) {
        const group = subjectGroups.find(function (item) {
            return String(item.id) === String(subjectGroupSelect.value);
        });
        const groupSubjects = asSubjectList(group && group.subjects);
        const subjects = groupSubjects.length ? groupSubjects : masterSubjects;

        if (!subjects.length) {
            subjectSelect.innerHTML = '<option value="">No subjects found</option>';
            subjectSelect.disabled = true;
            return;
        }
        subjectSelect.disabled = false;
        subjectSelect.innerHTML = '<option value="">Select</option>' + subjects.map(function (subject) {
            return '<option value="' + subject.id + '">' + escapeHtml(subjectLabel(subject)) + '</option>';
        }).join('');
        if (preferredSubjectId) {
            subjectSelect.value = String(preferredSubjectId);
        }
    }

    function renderTable() {
        if (!rows.length) {
            noRecordBanner.hidden = false;
            syllabusTableWrap.hidden = true;
            syllabusTableBody.innerHTML = '';
            return;
        }

        noRecordBanner.hidden = true;
        syllabusTableWrap.hidden = false;
        syllabusTableBody.innerHTML = rows.map(function (row, index) {
            const completed = !!row.completed;
            const statusClass = completed ? 'completed' : 'incomplete';
            return '<tr data-topic-id="' + escapeHtml(String(row.topicId)) + '">'
                + '<td>' + (row.serial || (index + 1)) + '</td>'
                + '<td class="lesson-topic-cell">'
                    + '<span class="lesson-name">' + escapeHtml(row.lessonName) + '</span>'
                    + '<span class="topic-name">' + escapeHtml(row.topicName) + '</span>'
                + '</td>'
                + '<td class="completion-date-cell">' + escapeHtml(row.completionDate || '') + '</td>'
                + '<td><span class="status-badge ' + statusClass + '">' + escapeHtml(row.status) + '</span></td>'
                + '<td class="action-cell">'
                    + '<label class="toggle-switch" title="Toggle completion">'
                        + '<input type="checkbox" class="status-toggle" data-topic-id="' + escapeHtml(String(row.topicId)) + '"' + (completed ? ' checked' : '') + '>'
                        + '<span class="toggle-slider"></span>'
                    + '</label>'
                + '</td>'
                + '</tr>';
        }).join('');
    }

    async function loadInitialData() {
        const [classesResponse, sectionsResponse, groupsResponse, subjectsResponse] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups'),
            fetch('/api/subjects')
        ]);
        if (!classesResponse.ok || !sectionsResponse.ok || !groupsResponse.ok || !subjectsResponse.ok) {
            throw new Error('Failed to load page data');
        }
        classes = await classesResponse.json();
        masterSections = await sectionsResponse.json();
        subjectGroups = await groupsResponse.json();
        masterSubjects = await subjectsResponse.json();
        renderClassOptions();
    }

    async function searchSyllabusStatus() {
        const url = '/api/lesson-plan/syllabus/status?classId=' + encodeURIComponent(classSelect.value)
            + '&section=' + encodeURIComponent(sectionSelect.value)
            + '&subjectGroupId=' + encodeURIComponent(subjectGroupSelect.value)
            + '&subjectId=' + encodeURIComponent(subjectSelect.value);
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load syllabus status');
        }
        rows = data.rows || [];
        syllabusStatusTitle.textContent = 'Syllabus Status For: ' + (data.subjectLabel || '');
        syllabusListPanel.hidden = false;
        renderTable();
    }

    async function updateStatus(topicId, completed, rowEl) {
        const response = await fetch('/api/lesson-plan/syllabus/status/' + topicId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completed })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to update status');
        }

        const updated = result.data;
        const rowIndex = rows.findIndex(function (item) {
            return String(item.topicId) === String(topicId);
        });
        if (rowIndex >= 0) {
            rows[rowIndex] = Object.assign({}, rows[rowIndex], updated);
        }

        if (rowEl) {
            rowEl.querySelector('.completion-date-cell').textContent = updated.completionDate || '';
            const badge = rowEl.querySelector('.status-badge');
            badge.textContent = updated.status;
            badge.classList.toggle('completed', !!updated.completed);
            badge.classList.toggle('incomplete', !updated.completed);
        }
    }

    classSelect.addEventListener('change', function () {
        populateSectionOptions(classSelect.value);
        subjectGroupSelect.innerHTML = '<option value="">Select section first</option>';
        subjectGroupSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
    });

    sectionSelect.addEventListener('change', function () {
        populateSubjectGroupOptions();
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
    });

    subjectGroupSelect.addEventListener('change', populateSubjectOptions);

    syllabusFilterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchSyllabusStatus().catch(showError);
    });

    syllabusTableBody.addEventListener('change', function (event) {
        const toggle = event.target.closest('.status-toggle');
        if (!toggle) {
            return;
        }
        const rowEl = toggle.closest('tr');
        const topicId = toggle.getAttribute('data-topic-id');
        const completed = toggle.checked;
        updateStatus(topicId, completed, rowEl).catch(function (error) {
            toggle.checked = !completed;
            showError(error.message);
        });
    });

    excelBtn.addEventListener('click', function () {
        if (!rows.length || !window.XLSX) {
            return;
        }
        const exportRows = rows.map(function (row) {
            return {
                '#': row.serial,
                'Lesson Topic': row.lessonName + ' (' + row.topicName + ')',
                'Topic Completion Date': row.completionDate || '',
                Status: row.status
            };
        });
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportRows);
        XLSX.utils.book_append_sheet(wb, ws, 'Syllabus Status');
        XLSX.writeFile(wb, 'syllabus-status.xlsx');
    });

    printBtn.addEventListener('click', function () {
        window.print();
    });

    loadInitialData().catch(function (error) {
        showError(error.message);
    });
});
