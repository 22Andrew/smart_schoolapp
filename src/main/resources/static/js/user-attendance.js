(function () {
    'use strict';

    var monthLabel = document.getElementById('uatMonthLabel');
    var daysEl = document.getElementById('uatDays');
    var prevBtn = document.getElementById('uatPrevBtn');
    var nextBtn = document.getElementById('uatNextBtn');

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function statusClass(code) {
        switch (String(code || '').toUpperCase()) {
            case 'P': return 'present';
            case 'A': return 'absent';
            case 'F': return 'half';
            case 'L': return 'late';
            case 'H': return 'holiday';
            case 'E': return 'excuse';
            default: return '';
        }
    }

    function render(data) {
        if (!data) return;
        if (monthLabel) monthLabel.textContent = data.monthLabel || '';
        var days = Array.isArray(data.days) ? data.days : [];
        if (!days.length) {
            daysEl.innerHTML = '<div class="uat-empty">No attendance records</div>';
            return;
        }
        daysEl.innerHTML = days.map(function (day) {
            var cls = 'uat-day' + (day.inMonth ? '' : ' outside');
            var codeClass = statusClass(day.code);
            var badge = day.status
                ? '<span class="uat-day-status ' + codeClass + '">' + escapeHtml(day.status) + '</span>'
                : '';
            return '<div class="' + cls + '">'
                + '<span class="uat-day-num">' + escapeHtml(String(day.day)) + '</span>'
                + badge
                + '</div>';
        }).join('');
    }

    async function loadCalendar() {
        if (daysEl) daysEl.innerHTML = '<div class="uat-empty">Loading attendance...</div>';
        try {
            var response = await fetch('/api/user/attendance?year=' + year + '&month=' + month);
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load attendance');
            }
            var data = await response.json();
            year = Number(data.year) || year;
            month = Number(data.month) || month;
            render(data);
        } catch (error) {
            if (monthLabel) monthLabel.textContent = '';
            daysEl.innerHTML = '<div class="uat-empty">' + escapeHtml(error.message || 'Failed to load attendance') + '</div>';
        }
    }

    function shiftMonth(delta) {
        month += delta;
        if (month < 1) {
            month = 12;
            year -= 1;
        } else if (month > 12) {
            month = 1;
            year += 1;
        }
        loadCalendar();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { shiftMonth(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { shiftMonth(1); });

    loadCalendar();
})();
