document.addEventListener('DOMContentLoaded', function () {
    const teacherSelect = document.getElementById('teacherSelect');
    const searchForm = document.getElementById('teacherTimetableForm');
    const timetablePanel = document.getElementById('timetablePanel');
    const timetableGrid = document.getElementById('timetableGrid');
    const timetableTitle = document.getElementById('timetableTitle');
    const printBtn = document.getElementById('printBtn');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let teachers = [];
    let periodsByDay = {};
    let currentTitle = 'Teacher Time Table';

    days.forEach(function (day) {
        periodsByDay[day] = [];
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function iconHtml(type) {
        if (type === 'book') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
        }
        if (type === 'clock') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
    }

    function formatDisplayTime(value) {
        if (!value) return '';
        const parts = String(value).substring(0, 5).split(':');
        if (parts.length < 2) return String(value);
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        return hours + ':' + minutes + ' ' + suffix;
    }

    function subjectDisplay(period) {
        const name = period.subjectName || 'Subject';
        return period.subjectCode ? name + ' (' + period.subjectCode + ')' : name;
    }

    function classDisplay(period) {
        const className = period.className || 'Class';
        const section = period.section || '';
        return section ? className + '(' + section + ')' : className;
    }

    function periodCardHtml(period) {
        const timeRange = formatDisplayTime(period.timeFrom) + ' - ' + formatDisplayTime(period.timeTo);
        return ''
            + '<div class="period-card">'
            + '<div class="period-line">' + iconHtml('book')
            + '<span>Class: ' + escapeHtml(classDisplay(period))
            + ' Subject: ' + escapeHtml(subjectDisplay(period)) + '</span></div>'
            + '<div class="period-line">' + iconHtml('clock') + '<span>' + escapeHtml(timeRange) + '</span></div>'
            + '<div class="period-line">' + iconHtml('room') + '<span>Room No.: '
            + escapeHtml(period.roomNo || '-') + '</span></div>'
            + '</div>';
    }

    function notScheduledHtml() {
        return ''
            + '<div class="not-scheduled">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<circle cx="12" cy="12" r="10"></circle>'
            + '<line x1="15" y1="9" x2="9" y2="15"></line>'
            + '<line x1="9" y1="9" x2="15" y2="15"></line>'
            + '</svg>'
            + '<span>Not Scheduled</span>'
            + '</div>';
    }

    function groupPeriods(entries) {
        const grouped = {};
        days.forEach(function (day) {
            grouped[day] = [];
        });
        (entries || []).forEach(function (entry) {
            const day = entry.dayOfWeek || '';
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(entry);
        });
        days.forEach(function (day) {
            grouped[day].sort(function (a, b) {
                return String(a.timeFrom || '').localeCompare(String(b.timeFrom || ''));
            });
        });
        return grouped;
    }

    function renderTimetable() {
        timetableGrid.innerHTML = days.map(function (day) {
            const dayPeriods = periodsByDay[day] || [];
            const body = dayPeriods.length
                ? dayPeriods.map(periodCardHtml).join('')
                : notScheduledHtml();
            return ''
                + '<div class="day-column">'
                + '<div class="day-header">' + day + '</div>'
                + '<div class="day-body">' + body + '</div>'
                + '</div>';
        }).join('');
    }

    function fillTeacherSelect() {
        teacherSelect.innerHTML = '<option value="">Select</option>';
        teachers.forEach(function (teacher) {
            const option = document.createElement('option');
            option.value = String(teacher.code);
            option.textContent = teacher.display || (teacher.name + ' (' + teacher.code + ')');
            teacherSelect.appendChild(option);
        });
    }

    async function loadTeachers() {
        const response = await fetch('/api/class-teachers');
        if (!response.ok) throw new Error('Failed to load teachers');
        teachers = await response.json();
        fillTeacherSelect();
    }

    searchForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!teacherSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select a teacher.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const teacherLabel = teacherSelect.options[teacherSelect.selectedIndex].textContent.trim();
        currentTitle = teacherLabel + ' Time Table';
        timetableTitle.textContent = 'Teacher Time Table';

        try {
            const response = await fetch(
                '/api/timetable/teacher?teacherCode=' + encodeURIComponent(teacherSelect.value)
            );
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to load teacher timetable');
            }

            const entries = await response.json();
            periodsByDay = groupPeriods(entries);
            timetablePanel.style.display = '';
            renderTimetable();

            Swal.fire({
                icon: 'success',
                title: entries.length ? 'Timetable Loaded' : 'No Periods',
                text: entries.length
                    ? 'Showing timetable for ' + teacherLabel + '.'
                    : 'No timetable periods found for ' + teacherLabel + '.',
                timer: entries.length ? 1200 : 2200,
                showConfirmButton: !entries.length,
                confirmButtonColor: '#8b5cf6'
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load teacher timetable.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    if (printBtn) {
        printBtn.addEventListener('click', function () {
            if (timetablePanel.style.display === 'none') {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Timetable',
                    text: 'Please search for a teacher timetable first.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const printWindow = window.open('', '_blank');
            printWindow.document.write(''
                + '<!DOCTYPE html><html><head><title>' + escapeHtml(currentTitle) + '</title><style>'
                + 'body{font-family:Arial,sans-serif;margin:20px}'
                + 'h1{font-size:20px;margin-bottom:16px}'
                + '.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}'
                + '.col{border:1px solid #ccc;border-radius:4px;min-height:200px}'
                + '.head{background:#1e293b;color:#fff;text-align:center;padding:8px;font-weight:bold}'
                + '.body{padding:8px}'
                + '.card{border:1px solid #ddd;border-radius:4px;padding:8px;margin-bottom:8px;font-size:12px;color:#15803d}'
                + '.ns{color:#dc2626;text-align:center;padding:30px 8px;border:1px solid #dc2626;border-radius:4px}'
                + '</style></head><body>'
                + '<h1>' + escapeHtml(currentTitle) + '</h1>'
                + '<div class="grid">'
                + days.map(function (day) {
                    const dayPeriods = periodsByDay[day] || [];
                    let body = '';
                    if (!dayPeriods.length) {
                        body = '<div class="ns">Not Scheduled</div>';
                    } else {
                        body = dayPeriods.map(function (p) {
                            return '<div class="card"><div>Class: ' + escapeHtml(classDisplay(p))
                                + ' Subject: ' + escapeHtml(subjectDisplay(p))
                                + '</div><div>' + escapeHtml(formatDisplayTime(p.timeFrom) + ' - ' + formatDisplayTime(p.timeTo))
                                + '</div><div>Room No.: ' + escapeHtml(p.roomNo || '-') + '</div></div>';
                        }).join('');
                    }
                    return '<div class="col"><div class="head">' + day + '</div><div class="body">' + body + '</div></div>';
                }).join('')
                + '</div></body></html>'
            );
            printWindow.document.close();
            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
            };
        });
    }

    loadTeachers().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load teachers.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
