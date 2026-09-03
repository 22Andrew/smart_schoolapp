(function () {
    'use strict';

    var grid = document.getElementById('uttGrid');
    var printBtn = document.getElementById('uttPrintBtn');
    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var periodsByDay = {};

    function escapeHtml(text) {
        var div = document.createElement('div');
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
        if (type === 'user') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>';
    }

    function formatDisplayTime(value, padHour) {
        if (!value) {
            return '';
        }
        var parts = String(value).substring(0, 5).split(':');
        if (parts.length < 2) {
            return String(value);
        }
        var hours = parseInt(parts[0], 10);
        var minutes = parts[1];
        var suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }
        var hourText = padHour ? String(hours).padStart(2, '0') : String(hours);
        return hourText + ':' + minutes + ' ' + suffix;
    }

    function subjectDisplay(period) {
        var name = period.subjectName || 'Subject';
        if (period.subjectCode && name.indexOf('(') === -1) {
            return name + ' (' + period.subjectCode + ')';
        }
        return name;
    }

    function teacherDisplay(period) {
        var name = period.teacherName || '-';
        var id = period.teacherId || '';
        if (id && name.indexOf('(') === -1) {
            return name + ' (' + id + ')';
        }
        return name;
    }

    function notScheduledHtml() {
        return ''
            + '<div class="utt-not-scheduled">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<circle cx="12" cy="12" r="10"></circle>'
            + '<line x1="15" y1="9" x2="9" y2="15"></line>'
            + '<line x1="9" y1="9" x2="15" y2="15"></line>'
            + '</svg>'
            + '<span>Not Scheduled</span>'
            + '</div>';
    }

    function periodCardHtml(period) {
        var timeRange = formatDisplayTime(period.timeFrom, false) + ' - ' + formatDisplayTime(period.timeTo, true);
        return ''
            + '<div class="utt-period">'
            + '<div class="utt-line">' + iconHtml('book') + '<span>Subject: ' + escapeHtml(subjectDisplay(period)) + '</span></div>'
            + '<div class="utt-line">' + iconHtml('clock') + '<span>' + escapeHtml(timeRange) + '</span></div>'
            + '<div class="utt-line">' + iconHtml('user') + '<span>' + escapeHtml(teacherDisplay(period)) + '</span></div>'
            + '<div class="utt-line">' + iconHtml('room') + '<span>Room No.: ' + escapeHtml(period.roomNo || '-') + '</span></div>'
            + '</div>';
    }

    function groupPeriods(entries) {
        var grouped = {};
        days.forEach(function (day) {
            grouped[day] = [];
        });
        (entries || []).forEach(function (period) {
            var day = period.dayOfWeek || '';
            var match = days.find(function (item) {
                return item.toLowerCase() === String(day).toLowerCase();
            });
            if (match) {
                grouped[match].push(period);
            }
        });
        days.forEach(function (day) {
            grouped[day].sort(function (a, b) {
                return String(a.timeFrom || '').localeCompare(String(b.timeFrom || ''));
            });
        });
        return grouped;
    }

    function renderGrid() {
        if (!grid) {
            return;
        }
        grid.innerHTML = days.map(function (day) {
            var dayPeriods = periodsByDay[day] || [];
            var body = dayPeriods.length
                ? dayPeriods.map(periodCardHtml).join('')
                : notScheduledHtml();
            return ''
                + '<div class="utt-day">'
                + '<h2 class="utt-day-title">' + escapeHtml(day) + '</h2>'
                + '<div class="utt-day-body">' + body + '</div>'
                + '</div>';
        }).join('');
    }

    function printTimetable() {
        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            window.print();
            return;
        }
        printWindow.document.write(''
            + '<!DOCTYPE html><html><head><title>Class Timetable</title><style>'
            + 'body{font-family:Arial,sans-serif;margin:20px;color:#333}'
            + 'h1{font-size:20px;margin:0 0 16px}'
            + '.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}'
            + '.col{min-width:0}'
            + '.head{font-weight:bold;margin-bottom:8px}'
            + '.card{border:1px solid #ddd;border-radius:4px;padding:8px;margin-bottom:8px;font-size:12px;color:#22a45a}'
            + '.ns{color:#dc2626;text-align:center;padding:24px 8px;border:1px solid #dc2626;border-radius:4px;font-weight:600}'
            + '</style></head><body>'
            + '<h1>Class Timetable</h1>'
            + '<div class="grid">'
            + days.map(function (day) {
                var dayPeriods = periodsByDay[day] || [];
                var body = '';
                if (!dayPeriods.length) {
                    body = '<div class="ns">Not Scheduled</div>';
                } else {
                    body = dayPeriods.map(function (p) {
                        return '<div class="card"><div>Subject: ' + escapeHtml(subjectDisplay(p))
                            + '</div><div>' + escapeHtml(formatDisplayTime(p.timeFrom, false) + ' - ' + formatDisplayTime(p.timeTo, true))
                            + '</div><div>' + escapeHtml(teacherDisplay(p))
                            + '</div><div>Room No.: ' + escapeHtml(p.roomNo || '-') + '</div></div>';
                    }).join('');
                }
                return '<div class="col"><div class="head">' + day + '</div>' + body + '</div>';
            }).join('')
            + '</div></body></html>'
        );
        printWindow.document.close();
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
        };
    }

    async function loadTimetable() {
        try {
            var response = await fetch('/api/user/timetable');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load timetable');
            }
            var data = await response.json();
            if (Array.isArray(data.days) && data.days.length) {
                days = data.days;
            }
            periodsByDay = groupPeriods(data.periods || []);
            renderGrid();
        } catch (error) {
            if (grid) {
                grid.innerHTML = '<div class="utt-empty">' + escapeHtml(error.message || 'Failed to load timetable') + '</div>';
            }
        }
    }

    if (printBtn) {
        printBtn.addEventListener('click', printTimetable);
    }

    loadTimetable();
})();
