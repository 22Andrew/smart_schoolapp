document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const subjectGroupSelect = document.getElementById('subjectGroupSelect');
    const criteriaForm = document.getElementById('criteriaForm');
    const paramsForm = document.getElementById('paramsForm');
    const editorWrap = document.getElementById('editorWrap');
    const periodTableBody = document.getElementById('periodTableBody');
    const addNewBtn = document.getElementById('addNewBtn');
    const saveBtn = document.getElementById('saveBtn');
    const dayTabs = document.getElementById('dayTabs');

    const periodStartTime = document.getElementById('periodStartTime');
    const durationMinutes = document.getElementById('durationMinutes');
    const intervalMinutes = document.getElementById('intervalMinutes');
    const defaultRoomNo = document.getElementById('defaultRoomNo');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sampleTeachers = [
        { id: '9002', name: 'Shivam Verma (9002)' },
        { id: '90005', name: 'Jason Sharpu (90005)' },
        { id: '6789', name: 'Albert Thomas (6789)' }
    ];

    let classes = [];
    let subjectGroups = [];
    let availableSubjects = [];
    let activeDay = 'Monday';
    const periodsByDay = {};

    days.forEach(function (day) {
        periodsByDay[day] = [];
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function subjectLabel(subject) {
        if (!subject) return '';
        const code = subject.subjectCode ? ' (' + subject.subjectCode + ')' : '';
        return (subject.name || '') + code;
    }

    function asSubjectList(subjects) {
        if (!subjects) return [];
        if (Array.isArray(subjects)) return subjects;
        return Array.from(subjects);
    }

    function resetPeriods() {
        days.forEach(function (day) {
            periodsByDay[day] = [];
        });
    }

    function fillClassSelect() {
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
        sectionSelect.innerHTML = '<option value="">Select</option>';
        const schoolClass = classes.find(function (c) { return String(c.id) === String(classSelect.value); });
        const sections = schoolClass && schoolClass.sections ? schoolClass.sections : [];
        sections.forEach(function (section) {
            const option = document.createElement('option');
            option.value = String(section);
            option.textContent = String(section);
            sectionSelect.appendChild(option);
        });
        if (preferred) sectionSelect.value = preferred;
    }

    function formatSubjectGroupLabel(group) {
        const name = group.name || 'Subject Group';
        const className = group.schoolClass && group.schoolClass.name
            ? group.schoolClass.name
            : '';
        const sections = (group.sections || []).map(function (s) { return String(s); });
        const subjectNames = asSubjectList(group.subjects).map(function (s) {
            return s && s.name ? s.name : '';
        }).filter(Boolean);

        let detail = '';
        if (className && sections.length) {
            detail = className + ' (' + sections.join(', ') + ')';
        } else if (className) {
            detail = className;
        } else if (sections.length) {
            detail = sections.join(', ');
        }

        let label = name;
        if (detail) label += ' — ' + detail;
        if (subjectNames.length) label += ' | ' + subjectNames.join(', ');
        return label;
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

    function fillSubjectGroupSelect() {
        const current = subjectGroupSelect.value;
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
                const sections = (group.sections || []).map(function (s) {
                    return String(s).toUpperCase();
                });
                return !sections.length || sections.indexOf(section) !== -1;
            });
            if (bySection.length) {
                filtered = bySection;
            }
        }

        subjectGroupSelect.innerHTML = '<option value="">Select</option>';

        if (!filtered.length) {
            const empty = document.createElement('option');
            empty.value = '';
            empty.disabled = true;
            empty.textContent = classId
                ? 'No subject group found for this class/section'
                : 'No subject groups available';
            subjectGroupSelect.appendChild(empty);
            return;
        }

        filtered.forEach(function (group) {
            const option = document.createElement('option');
            option.value = String(group.id);
            option.textContent = formatSubjectGroupLabel(group);
            option.title = formatSubjectGroupLabel(group);
            subjectGroupSelect.appendChild(option);
        });

        if (current) subjectGroupSelect.value = current;
    }

    function subjectOptionsHtml(selectedId) {
        let html = '<option value="">Select</option>';
        availableSubjects.forEach(function (subject) {
            const selected = String(subject.id) === String(selectedId) ? ' selected' : '';
            html += '<option value="' + escapeHtml(String(subject.id)) + '"' + selected + '>'
                + escapeHtml(subjectLabel(subject)) + '</option>';
        });
        return html;
    }

    function teacherOptionsHtml(selectedId) {
        let html = '<option value="">Select</option>';
        sampleTeachers.forEach(function (teacher) {
            const selected = String(teacher.id) === String(selectedId) ? ' selected' : '';
            html += '<option value="' + escapeHtml(String(teacher.id)) + '"' + selected + '>'
                + escapeHtml(teacher.name) + '</option>';
        });
        return html;
    }

    function emptyRowHtml() {
        return '<tr><td colspan="6" class="empty-periods">No periods yet. Click "+ Add New" or use Apply to generate rows.</td></tr>';
    }

    function renderPeriodRows() {
        const rows = periodsByDay[activeDay] || [];
        if (!rows.length) {
            periodTableBody.innerHTML = emptyRowHtml();
            return;
        }

        periodTableBody.innerHTML = rows.map(function (row, index) {
            return ''
                + '<tr data-index="' + index + '">'
                + '<td><select class="form-select subject-select">' + subjectOptionsHtml(row.subjectId) + '</select></td>'
                + '<td><input type="time" class="form-input time-from" value="' + escapeHtml(row.timeFrom || '') + '"></td>'
                + '<td><input type="time" class="form-input time-to" value="' + escapeHtml(row.timeTo || '') + '"></td>'
                + '<td><select class="form-select teacher-select">' + teacherOptionsHtml(row.teacherId) + '</select></td>'
                + '<td><input type="text" class="form-input room-input" value="' + escapeHtml(row.roomNo || '') + '" placeholder="Room No."></td>'
                + '<td class="col-action">'
                + '<button type="button" class="btn-delete-row" title="Delete" data-index="' + index + '">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="3 6 5 6 21 6"></polyline>'
                + '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'
                + '</svg></button>'
                + '</td>'
                + '</tr>';
        }).join('');
    }

    function syncRowsFromDom() {
        const rows = [];
        periodTableBody.querySelectorAll('tr[data-index]').forEach(function (tr) {
            const teacherSelect = tr.querySelector('.teacher-select');
            rows.push({
                subjectId: (tr.querySelector('.subject-select') || {}).value || '',
                timeFrom: (tr.querySelector('.time-from') || {}).value || '',
                timeTo: (tr.querySelector('.time-to') || {}).value || '',
                teacherId: teacherSelect ? teacherSelect.value : '',
                teacherName: teacherSelect && teacherSelect.selectedIndex >= 0
                    ? teacherSelect.options[teacherSelect.selectedIndex].textContent.trim()
                    : '',
                roomNo: (tr.querySelector('.room-input') || {}).value || ''
            });
        });
        periodsByDay[activeDay] = rows;
    }

    function parseTimeToMinutes(value) {
        if (!value) return null;
        const parts = value.split(':');
        if (parts.length < 2) return null;
        return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
    }

    function minutesToTime(total) {
        const hours = Math.floor(total / 60) % 24;
        const minutes = total % 60;
        return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
    }

    function normalizeTimeValue(value) {
        if (!value) return '';
        const text = String(value);
        return text.length >= 5 ? text.substring(0, 5) : text;
    }

    function loadSubjectsFromGroup() {
        const group = subjectGroups.find(function (g) {
            return String(g.id) === String(subjectGroupSelect.value);
        });
        availableSubjects = asSubjectList(group && group.subjects);
    }

    function applyLoadedPeriods(entries) {
        resetPeriods();
        (entries || []).forEach(function (entry) {
            const day = entry.dayOfWeek || 'Monday';
            if (!periodsByDay[day]) {
                periodsByDay[day] = [];
            }
            periodsByDay[day].push({
                id: entry.id,
                subjectId: entry.subjectId != null ? String(entry.subjectId) : '',
                timeFrom: normalizeTimeValue(entry.timeFrom),
                timeTo: normalizeTimeValue(entry.timeTo),
                teacherId: entry.teacherId || '',
                teacherName: entry.teacherName || '',
                roomNo: entry.roomNo || ''
            });
        });
    }

    async function loadExistingTimetable() {
        const response = await fetch(
            '/api/timetable?classId=' + encodeURIComponent(classSelect.value)
            + '&section=' + encodeURIComponent(sectionSelect.value)
        );
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load timetable');
        }
        return response.json();
    }

    function collectAllPeriods() {
        const periods = [];
        days.forEach(function (day) {
            (periodsByDay[day] || []).forEach(function (row, index) {
                if (!row.subjectId || !row.timeFrom || !row.timeTo) {
                    return;
                }
                const teacher = sampleTeachers.find(function (t) { return String(t.id) === String(row.teacherId); });
                periods.push({
                    dayOfWeek: day,
                    subjectId: row.subjectId,
                    timeFrom: row.timeFrom,
                    timeTo: row.timeTo,
                    teacherId: row.teacherId || '',
                    teacherName: row.teacherName || (teacher ? teacher.name : ''),
                    roomNo: row.roomNo || '',
                    periodNumber: index + 1
                });
            });
        });
        return periods;
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect();
    }

    async function loadSubjectGroups() {
        const response = await fetch('/api/subject-groups');
        if (!response.ok) throw new Error('Failed to load subject groups');
        const data = await response.json();
        subjectGroups = Array.isArray(data) ? data : [];
        fillSubjectGroupSelect();
    }

    classSelect.addEventListener('change', function () {
        fillSectionSelect();
        fillSubjectGroupSelect();
    });

    sectionSelect.addEventListener('change', function () {
        fillSubjectGroupSelect();
    });

    criteriaForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!classSelect.value || !sectionSelect.value || !subjectGroupSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select Class, Section and Subject Group.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        loadSubjectsFromGroup();
        if (!availableSubjects.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Subjects',
                text: 'Selected subject group has no subjects. Add subjects to the group first.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        try {
            const entries = await loadExistingTimetable();
            applyLoadedPeriods(entries);

            if (entries.length && entries[0].subjectGroupId != null) {
                subjectGroupSelect.value = String(entries[0].subjectGroupId);
                loadSubjectsFromGroup();
            }

            activeDay = 'Monday';
            dayTabs.querySelectorAll('.day-tab').forEach(function (tab) {
                tab.classList.toggle('active', tab.getAttribute('data-day') === activeDay);
            });
            editorWrap.style.display = '';
            renderPeriodRows();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load timetable.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    paramsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!availableSubjects.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Subjects',
                text: 'Selected subject group has no subjects.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const start = parseTimeToMinutes(periodStartTime.value);
        const duration = parseInt(durationMinutes.value, 10);
        const interval = parseInt(intervalMinutes.value, 10) || 0;
        const room = (defaultRoomNo.value || '').trim();

        if (start == null || !duration || duration < 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Parameters',
                text: 'Please provide a valid start time and duration.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        syncRowsFromDom();
        let cursor = start;
        const generated = availableSubjects.map(function (subject, index) {
            const from = minutesToTime(cursor);
            const to = minutesToTime(cursor + duration);
            cursor += duration + interval;
            const teacher = sampleTeachers[index % sampleTeachers.length];
            return {
                subjectId: String(subject.id),
                timeFrom: from,
                timeTo: to,
                teacherId: teacher.id,
                teacherName: teacher.name,
                roomNo: room
            };
        });

        periodsByDay[activeDay] = generated;
        renderPeriodRows();
    });

    dayTabs.addEventListener('click', function (e) {
        const tab = e.target.closest('.day-tab');
        if (!tab) return;
        syncRowsFromDom();
        activeDay = tab.getAttribute('data-day');
        dayTabs.querySelectorAll('.day-tab').forEach(function (btn) {
            btn.classList.toggle('active', btn === tab);
        });
        renderPeriodRows();
    });

    addNewBtn.addEventListener('click', function () {
        syncRowsFromDom();
        periodsByDay[activeDay].push({
            subjectId: '',
            timeFrom: '',
            timeTo: '',
            teacherId: '',
            teacherName: '',
            roomNo: (defaultRoomNo.value || '').trim()
        });
        renderPeriodRows();
    });

    periodTableBody.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-delete-row');
        if (!btn) return;
        syncRowsFromDom();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(index)) {
            periodsByDay[activeDay].splice(index, 1);
            renderPeriodRows();
        }
    });

    periodTableBody.addEventListener('change', function () {
        syncRowsFromDom();
    });

    periodTableBody.addEventListener('input', function () {
        syncRowsFromDom();
    });

    saveBtn.addEventListener('click', async function () {
        syncRowsFromDom();
        const periods = collectAllPeriods();

        if (!periods.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Nothing to Save',
                text: 'Add at least one complete period (subject + times) before saving.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        try {
            const response = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: classSelect.value,
                    section: sectionSelect.value,
                    subjectGroupId: subjectGroupSelect.value,
                    periods: periods
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to save timetable');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Class timetable saved for '
                    + classSelect.options[classSelect.selectedIndex].text
                    + ' - ' + sectionSelect.value + '.',
                confirmButtonColor: '#8b5cf6'
            });
            window.location.href = '/classreport';
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save timetable.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    Promise.all([loadClasses(), loadSubjectGroups()]).catch(function () {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load class or subject group data.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
