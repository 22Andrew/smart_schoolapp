document.addEventListener('DOMContentLoaded', function () {
    const copyLessonForm = document.getElementById('copyLessonForm');
    const sessionSelect = document.getElementById('sessionSelect');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const subjectGroupSelect = document.getElementById('subjectGroupSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const copyLessonResultsPanel = document.getElementById('copyLessonResultsPanel');
    const copyLessonResultsTitle = document.getElementById('copyLessonResultsTitle');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const copyLessonTableWrap = document.getElementById('copyLessonTableWrap');
    const copyLessonTableBody = document.getElementById('copyLessonTableBody');
    const copyLessonsBtn = document.getElementById('copyLessonsBtn');

    let sessions = [];
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

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6',
            timer: 1800,
            showConfirmButton: false
        });
    }

    function renderSessionOptions() {
        sessionSelect.innerHTML = '<option value="">Select</option>' + sessions.map(function (item) {
            const label = item.current ? item.sessionName + ' (Current)' : item.sessionName;
            return '<option value="' + escapeHtml(item.sessionName) + '">' + escapeHtml(label) + '</option>';
        }).join('');
    }

    function renderClassOptions() {
        classSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function asSubjectList(subjects) {
        if (!subjects) return [];
        if (Array.isArray(subjects)) return subjects;
        return Array.from(subjects);
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

    function populateSubjectGroupOptions() {
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
    }

    function populateSubjectOptions() {
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
    }

    function renderResultsTable() {
        if (!rows.length) {
            noRecordBanner.hidden = false;
            copyLessonTableWrap.hidden = true;
            copyLessonTableBody.innerHTML = '';
            return;
        }

        noRecordBanner.hidden = true;
        copyLessonTableWrap.hidden = false;
        copyLessonTableBody.innerHTML = rows.map(function (row, index) {
            return '<tr>'
                + '<td>' + (index + 1) + '</td>'
                + '<td>' + escapeHtml(row.lessonName) + '</td>'
                + '<td>' + escapeHtml(row.topicText || (row.topics || []).join(', ')) + '</td>'
                + '</tr>';
        }).join('');
    }

    async function loadInitialData() {
        const [sessionsResponse, classesResponse, sectionsResponse, groupsResponse, subjectsResponse] = await Promise.all([
            fetch('/api/sessions'),
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups'),
            fetch('/api/subjects')
        ]);

        if (!sessionsResponse.ok || !classesResponse.ok || !sectionsResponse.ok
                || !groupsResponse.ok || !subjectsResponse.ok) {
            throw new Error('Failed to load page data');
        }

        sessions = await sessionsResponse.json();
        classes = await classesResponse.json();
        masterSections = await sectionsResponse.json();
        subjectGroups = await groupsResponse.json();
        masterSubjects = await subjectsResponse.json();
        renderSessionOptions();
        renderClassOptions();
    }

    async function searchOldLessons() {
        const url = '/api/lesson-plan/copy-lessons/search?sessionName=' + encodeURIComponent(sessionSelect.value)
            + '&classId=' + encodeURIComponent(classSelect.value)
            + '&section=' + encodeURIComponent(sectionSelect.value)
            + '&subjectGroupId=' + encodeURIComponent(subjectGroupSelect.value)
            + '&subjectId=' + encodeURIComponent(subjectSelect.value);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to search old lessons');
        }
        rows = await response.json();
        copyLessonResultsTitle.textContent = 'Old Session Lessons: ' + sessionSelect.value;
        copyLessonResultsPanel.hidden = false;
        renderResultsTable();
    }

    async function copyLessonsToCurrentSession() {
        const payload = {
            sessionName: sessionSelect.value,
            classId: classSelect.value,
            section: sectionSelect.value,
            subjectGroupId: subjectGroupSelect.value,
            subjectId: subjectSelect.value
        };
        const response = await fetch('/api/lesson-plan/copy-lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to copy lessons');
        }
        showSuccess(result.message);
    }

    classSelect.addEventListener('change', function () {
        populateSectionOptions(classSelect.value, '');
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

    copyLessonForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchOldLessons().catch(showError);
    });

    copyLessonsBtn.addEventListener('click', function () {
        if (!rows.length) {
            showError('Search for old lessons first.');
            return;
        }
        copyLessonsToCurrentSession().catch(showError);
    });

    loadInitialData().catch(showError);
});
