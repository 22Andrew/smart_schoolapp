(function () {
    'use strict';

    var container = document.getElementById('uctPanels');
    var printBtn = document.getElementById('uctPrintBtn');

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function render(exams) {
        if (!container) return;
        if (!exams || !exams.length) {
            container.innerHTML = '<p class="uct-empty">No record found</p>';
            return;
        }

        container.innerHTML = exams.map(function (exam) {
            var subjects = exam.subjects || [];
            var rows = subjects.map(function (subject) {
                return '<tr>'
                    + '<td>' + escapeHtml(subject.subjectName || '') + '</td>'
                    + '<td>' + escapeHtml(subject.examDate || '') + '</td>'
                    + '<td>' + escapeHtml(subject.startTime || '') + '</td>'
                    + '<td>' + escapeHtml(subject.durationMinutes == null ? '' : String(subject.durationMinutes)) + '</td>'
                    + '<td>' + escapeHtml(subject.roomNo || '') + '</td>'
                    + '</tr>';
            }).join('');

            if (!rows) {
                rows = '<tr><td colspan="5">No record found</td></tr>';
            }

            return '<section class="uct-group">'
                + '<h2 class="uct-group-title">' + escapeHtml(exam.title || 'CBSE Examination') + '</h2>'
                + '<div class="uct-table-wrap"><table class="uct-table">'
                + '<thead><tr>'
                + '<th>Subject</th>'
                + '<th>Date</th>'
                + '<th>Start Time</th>'
                + '<th>Duration (minute)</th>'
                + '<th>Room No.</th>'
                + '</tr></thead>'
                + '<tbody>' + rows + '</tbody>'
                + '</table></div></section>';
        }).join('');
    }

    async function loadTimetable() {
        if (container) {
            container.innerHTML = '<p class="uct-empty">Loading CBSE exam timetable...</p>';
        }
        try {
            var response = await fetch('/api/user/cbse/exam/timetable', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load CBSE exam timetable');
            }
            var data = await response.json();
            render(Array.isArray(data.exams) ? data.exams : []);
        } catch (error) {
            if (container) {
                container.innerHTML = '<p class="uct-empty">' + escapeHtml(error.message || 'No record found') + '</p>';
            }
        }
    }

    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    loadTimetable();
})();
