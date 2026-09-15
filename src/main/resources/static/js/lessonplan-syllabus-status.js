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
    let lessonGroups = [];
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
        if (typeof subjects === 'object') {
            return Object.values(subjects).filter(function (item) {
                return item && typeof item === 'object';
            });
        }
        return Array.from(subjects);
    }

    function mergeSubjects(base, extra) {
        const merged = [];
        const seen = {};
        function add(subject) {
            if (!subject) {
                return;
            }
            const idKey = subject.id != null ? 'id:' + subject.id : '';
            const nameKey = (subject.name || '').toLowerCase();
            const key = idKey || ('name:' + nameKey);
            if (seen[key] || (!idKey && !nameKey)) {
                return;
            }
            seen[key] = true;
            merged.push(subject);
        }
        (base || []).forEach(add);
        (extra || []).forEach(add);
        return merged;
    }

    function subjectsFromLessons() {
        const classId = classSelect.value;
        const section = sectionSelect.value ? String(sectionSelect.value).toUpperCase() : '';
        const groupId = subjectGroupSelect.value;
        return lessonGroups.filter(function (row) {
            const sameClass = String(row.classId) === String(classId)
                || String(row.className || '').toLowerCase() === String(
                    (classes.find(function (item) { return String(item.id) === String(classId); }) || {}).name || ''
                ).toLowerCase();
            const sameSection = String(row.section || '').toUpperCase() === section;
            const sameGroup = String(row.subjectGroupId) === String(groupId)
                || String(row.subjectGroupName || '').toLowerCase() === String(
                    (subjectGroups.find(function (item) { return String(item.id) === String(groupId); }) || {}).name || ''
                ).toLowerCase();
            return sameClass && sameSection && sameGroup && row.subjectId;
        }).map(function (row) {
            return {
                id: row.subjectId,
                name: row.subjectName,
                subjectCode: row.subjectCode
            };
        });
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
        const subjects = mergeSubjects(asSubjectList(group && group.subjects), subjectsFromLessons());
        const fallback = subjects.length ? subjects : masterSubjects;

        if (!fallback.length) {
            subjectSelect.innerHTML = '<option value="">No subjects found</option>';
            subjectSelect.disabled = true;
            return;
        }
        subjectSelect.disabled = false;
        subjectSelect.innerHTML = '<option value="">Select</option>' + fallback.map(function (subject) {
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
            const topicId = row.topicId != null && row.topicId !== '' ? String(row.topicId) : '';
            const toggle = topicId
                ? '<label class="toggle-switch" title="Toggle completion">'
                    + '<input type="checkbox" class="status-toggle" data-topic-id="' + escapeHtml(topicId) + '"' + (completed ? ' checked' : '') + '>'
                    + '<span class="toggle-slider"></span>'
                    + '</label>'
                : '';
            return '<tr data-topic-id="' + escapeHtml(topicId) + '">'
                + '<td>' + (row.serial || (index + 1)) + '</td>'
                + '<td class="lesson-topic-cell">'
                    + '<span class="lesson-name">' + escapeHtml(row.lessonName) + '</span>'
                    + '<span class="topic-name">' + escapeHtml(row.topicName) + '</span>'
                + '</td>'
                + '<td class="completion-date-cell">' + escapeHtml(row.completionDate || '') + '</td>'
                + '<td><span class="status-badge ' + statusClass + '">' + escapeHtml(row.status || 'Incomplete') + '</span></td>'
                + '<td class="action-cell">' + toggle + '</td>'
                + '</tr>';
        }).join('');
    }

    async function loadInitialData() {
        const [classesResponse, sectionsResponse, groupsResponse, subjectsResponse, lessonsResponse] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups'),
            fetch('/api/subjects'),
            fetch('/api/lesson-plan/lesson-groups')
        ]);
        if (!classesResponse.ok || !sectionsResponse.ok || !groupsResponse.ok || !subjectsResponse.ok) {
            throw new Error('Failed to load page data');
        }
        classes = await classesResponse.json();
        masterSections = await sectionsResponse.json();
        subjectGroups = await groupsResponse.json();
        masterSubjects = await subjectsResponse.json();
        lessonGroups = lessonsResponse.ok ? await lessonsResponse.json() : [];
        if (!Array.isArray(lessonGroups)) {
            lessonGroups = [];
        }
        renderClassOptions();
    }

    async function searchSyllabusStatus() {
        if (!classSelect.value || !sectionSelect.value || !subjectGroupSelect.value || !subjectSelect.value) {
            showError('Class, Section, Subject Group, and Subject are required');
            return;
        }
        const url = '/api/lesson-plan/syllabus/status?classId=' + encodeURIComponent(classSelect.value)
            + '&section=' + encodeURIComponent(sectionSelect.value)
            + '&subjectGroupId=' + encodeURIComponent(subjectGroupSelect.value)
            + '&subjectId=' + encodeURIComponent(subjectSelect.value);
        let data = {};
        try {
            const response = await fetch(url);
            data = await response.json();
            if (!response.ok) {
                data = { rows: [] };
            }
        } catch (error) {
            data = { rows: [] };
        }
        rows = Array.isArray(data.rows) ? data.rows : [];
        const fromLessonPlans = await fallbackRowsFromLessonPlans();
        rows = mergeStatusRows(fromLessonPlans, rows);
        if (!rows.length) {
            rows = await fallbackRowsFromTopics();
        }
        rows.forEach(function (row, index) {
            row.serial = index + 1;
        });
        const subjectLabel = data.subjectLabel || (subjectSelect.options[subjectSelect.selectedIndex]
            ? subjectSelect.options[subjectSelect.selectedIndex].textContent
            : '');
        syllabusStatusTitle.textContent = 'Syllabus Status For: ' + subjectLabel;
        syllabusListPanel.hidden = false;
        renderTable();
    }

    function selectedClassName() {
        const selected = classes.find(function (item) {
            return String(item.id) === String(classSelect.value);
        });
        return selected ? String(selected.name || '') : '';
    }

    function selectedGroupName() {
        const selected = subjectGroups.find(function (item) {
            return String(item.id) === String(subjectGroupSelect.value);
        });
        return selected ? String(selected.name || '') : '';
    }

    function selectedSubjectName() {
        const option = subjectSelect.options[subjectSelect.selectedIndex];
        const label = option ? String(option.textContent || '') : '';
        return label.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }

    function selectedSubjectCode() {
        const option = subjectSelect.options[subjectSelect.selectedIndex];
        const label = option ? String(option.textContent || '') : '';
        const match = label.match(/\(([^)]+)\)\s*$/);
        return match ? match[1].trim().toLowerCase() : '';
    }

    function subjectMatchesFilter(row) {
        const subjectId = String(subjectSelect.value);
        const subjectName = selectedSubjectName().toLowerCase();
        const subjectCode = selectedSubjectCode();
        const rowName = String(row.subjectName || '').toLowerCase();
        const rowCode = String(row.subjectCode || '').toLowerCase();
        if (row.subjectId != null && String(row.subjectId) === subjectId) {
            return true;
        }
        if (subjectCode && rowCode && rowCode === subjectCode) {
            return true;
        }
        if (!rowName || !subjectName) {
            return false;
        }
        return rowName === subjectName || rowName.indexOf(subjectName) === 0 || subjectName.indexOf(rowName) === 0;
    }

    function mergeStatusRows(base, extra) {
        const merged = [];
        const seen = {};
        function add(row) {
            if (!row) {
                return;
            }
            const lessonName = String(row.lessonName || '').trim();
            const topicName = String(row.topicName || '').trim();
            if (!lessonName && !topicName) {
                return;
            }
            const key = lessonName.toLowerCase() + '|' + topicName.toLowerCase();
            if (seen[key]) {
                return;
            }
            seen[key] = true;
            merged.push(row);
        }
        (base || []).forEach(add);
        (extra || []).forEach(add);
        return merged;
    }

    async function fallbackRowsFromLessonPlans() {
        const fromClassApi = await fallbackFromClassSchedulesApi();
        if (fromClassApi.length) {
            return fromClassApi;
        }
        return fallbackFromTeacherCalendars();
    }

    async function fallbackFromClassSchedulesApi() {
        const url = '/api/lesson-plan/class-schedules?classId=' + encodeURIComponent(classSelect.value)
            + '&section=' + encodeURIComponent(sectionSelect.value)
            + '&className=' + encodeURIComponent(selectedClassName());
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return [];
            }
            const all = await response.json();
            if (!Array.isArray(all)) {
                return [];
            }
            return mapLessonPlanRows(all.filter(subjectMatchesFilter));
        } catch (error) {
            return [];
        }
    }

    function mapLessonPlanRows(items) {
        const unique = [];
        const seen = {};
        (items || []).forEach(function (row) {
            const lessonName = String(row.lessonName || row.subjectName || '').trim();
            const topicName = String(row.topicName || '').trim() || (lessonName ? 'Lesson Plan' : '');
            if (!lessonName && !topicName) {
                return;
            }
            const key = lessonName.toLowerCase() + '|' + topicName.toLowerCase();
            if (seen[key]) {
                return;
            }
            seen[key] = true;
            unique.push({
                serial: unique.length + 1,
                topicId: '',
                lessonName: lessonName,
                topicName: topicName,
                completionDate: '',
                status: 'Incomplete',
                completed: false
            });
        });
        return unique;
    }

    function mondayIsoDates() {
        const dates = ['2026-08-10', '2026-08-24'];
        const seen = { '2026-08-10': true, '2026-08-24': true };
        const start = new Date(2026, 7, 10);
        const end = new Date();
        end.setDate(end.getDate() + 7);
        for (let cursor = new Date(start.getTime()); cursor <= end; cursor.setDate(cursor.getDate() + 7)) {
            const y = cursor.getFullYear();
            const m = String(cursor.getMonth() + 1).padStart(2, '0');
            const d = String(cursor.getDate()).padStart(2, '0');
            const iso = y + '-' + m + '-' + d;
            if (!seen[iso]) {
                seen[iso] = true;
                dates.push(iso);
            }
        }
        return dates;
    }

    function scheduleMatchesFilter(schedule) {
        const classId = String(classSelect.value);
        const className = selectedClassName().toLowerCase();
        const section = String(sectionSelect.value || '').toUpperCase();
        const sameClass = String(schedule.classId || '') === classId
            || String(schedule.className || '').toLowerCase() === className;
        const sameSection = String(schedule.section || '').toUpperCase() === section;
        return sameClass && sameSection && subjectMatchesFilter(schedule);
    }

    async function fallbackFromTeacherCalendars() {
        try {
            const teachersResponse = await fetch('/api/class-teachers');
            if (!teachersResponse.ok) {
                return [];
            }
            const teachers = await teachersResponse.json();
            const codes = [];
            const seenCodes = {};
            function addCode(code) {
                if (!code || seenCodes[String(code)]) {
                    return;
                }
                seenCodes[String(code)] = true;
                codes.push(String(code));
            }
            addCode('9002');
            (Array.isArray(teachers) ? teachers : []).forEach(function (teacher) {
                addCode(teacher.teacherCode || teacher.code || teacher.staffId || teacher.staff_id);
            });
            const weeks = mondayIsoDates();
            const fetches = [];
            codes.forEach(function (code) {
                weeks.forEach(function (week) {
                    fetches.push(
                        fetch('/api/lesson-plan/schedules?teacherCode=' + encodeURIComponent(code)
                            + '&weekStart=' + encodeURIComponent(week))
                            .then(function (response) { return response.ok ? response.json() : []; })
                            .catch(function () { return []; })
                    );
                });
            });
            const batches = await Promise.all(fetches);
            const schedules = [];
            const seenIds = {};
            batches.forEach(function (list) {
                (Array.isArray(list) ? list : []).forEach(function (item) {
                    if (!item || item.id == null || seenIds[item.id]) {
                        return;
                    }
                    seenIds[item.id] = true;
                    if (scheduleMatchesFilter(item)) {
                        schedules.push(item);
                    }
                });
            });
            const views = await Promise.all(schedules.map(function (item) {
                return fetch('/api/lesson-plan/schedules/' + encodeURIComponent(item.id) + '/view')
                    .then(function (response) { return response.ok ? response.json() : null; })
                    .catch(function () { return null; });
            }));
            const combined = views.map(function (view, index) {
                const schedule = schedules[index];
                return {
                    lessonName: (view && view.lessonName) || schedule.subjectName || '',
                    topicName: (view && view.topicName) || '',
                    subjectName: schedule.subjectName,
                    subjectCode: schedule.subjectCode,
                    subjectId: schedule.subjectId
                };
            });
            return mapLessonPlanRows(combined);
        } catch (error) {
            return [];
        }
    }

    async function fallbackRowsFromTopics() {
        const response = await fetch('/api/lesson-plan/topics');
        if (!response.ok) {
            return [];
        }
        const all = await response.json();
        if (!Array.isArray(all)) {
            return [];
        }
        const classId = String(classSelect.value);
        const section = String(sectionSelect.value || '').toUpperCase();
        const groupId = String(subjectGroupSelect.value);
        const subjectId = String(subjectSelect.value);
        const className = selectedClassName().toLowerCase();
        const groupName = selectedGroupName().toLowerCase();
        const subjectName = selectedSubjectName().toLowerCase();

        const matched = all.filter(function (row) {
            const sameClass = String(row.classId) === classId
                || String(row.className || '').toLowerCase() === className;
            const sameSection = String(row.section || '').toUpperCase() === section;
            const sameGroup = String(row.subjectGroupId) === groupId
                || String(row.subjectGroupName || '').toLowerCase() === groupName;
            const sameSubject = String(row.subjectId) === subjectId
                || String(row.subjectName || '').toLowerCase() === subjectName;
            return sameClass && sameSection && sameGroup && sameSubject;
        });

        const fallback = [];
        matched.forEach(function (row) {
            const names = Array.isArray(row.topics) ? row.topics : [];
            const ids = Array.isArray(row.topicIds) ? row.topicIds : [];
            names.forEach(function (topicName, index) {
                fallback.push({
                    serial: fallback.length + 1,
                    topicId: ids[index] || '',
                    lessonName: row.lessonName || '',
                    topicName: topicName,
                    completionDate: '',
                    status: 'Incomplete',
                    completed: false
                });
            });
        });
        return fallback;
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
