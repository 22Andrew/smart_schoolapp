(function () {
    'use strict';

    var attendanceLoaded = false;
    var attendanceData = null;
    var visibleMonthKeys = {};
    var searchTerm = '';
    var pageSize = 31;
    var currentPage = 1;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function daysInMonth(monthIndex, year) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    function attendanceCodeClass(code) {
        switch (String(code || '').toUpperCase()) {
            case 'P': return 'present';
            case 'E': return 'excuse';
            case 'L': return 'late';
            case 'A': return 'absent';
            case 'H': return 'holiday';
            case 'F': return 'half';
            default: return '';
        }
    }

    function attendanceCellHtml(code) {
        if (!code) {
            return '';
        }
        var cls = attendanceCodeClass(code);
        return '<em class="att-code ' + cls + '">' + escapeHtml(String(code).toUpperCase()) + '</em>';
    }

    function renderSummaryCards(summary) {
        var statsEl = document.getElementById('profileAttendanceStats');
        if (!statsEl) {
            return;
        }

        summary = summary || {};
        var cards = [
            { label: 'Total Present', value: summary.present || 0 },
            { label: 'Total Late', value: summary.late || 0 },
            { label: 'Total Absent', value: summary.absent || 0 },
            { label: 'Total Half Day', value: summary.halfDay || 0 },
            { label: 'Total Holiday', value: summary.holiday || 0 }
        ];

        statsEl.innerHTML = cards.map(function (card) {
            return ''
                + '<div class="attendance-stat-card">'
                + '<span class="attendance-stat-icon" aria-hidden="true">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                + '</span>'
                + '<h4>' + escapeHtml(card.label) + '</h4>'
                + '<strong>' + escapeHtml(String(card.value)) + '</strong>'
                + '</div>';
        }).join('');
    }

    function getVisibleMonths() {
        if (!attendanceData || !attendanceData.months) {
            return [];
        }
        return attendanceData.months.filter(function (month) {
            return visibleMonthKeys[month.key] !== false;
        });
    }

    function rowMatchesSearch(day, months, data) {
        if (!searchTerm) {
            return true;
        }
        var term = searchTerm.toLowerCase();
        if (String(day).indexOf(term) !== -1) {
            return true;
        }
        for (var i = 0; i < months.length; i++) {
            var month = months[i];
            var maxDay = daysInMonth(month.monthIndex, month.year);
            if (day > maxDay) {
                continue;
            }
            var code = (data[month.key] && data[month.key][day]) || '';
            if (String(code).toLowerCase().indexOf(term) !== -1) {
                return true;
            }
        }
        return false;
    }

    function renderAttendanceTable() {
        var headEl = document.getElementById('profileAttendanceHead');
        var bodyEl = document.getElementById('profileAttendanceBody');
        if (!headEl || !bodyEl || !attendanceData) {
            return;
        }

        var months = getVisibleMonths();
        var data = attendanceData.data || {};

        headEl.innerHTML = '<tr><th>Date | Month</th>'
            + months.map(function (month) {
                return '<th data-month-key="' + escapeHtml(month.key) + '">' + escapeHtml(month.label) + '</th>';
            }).join('')
            + '</tr>';

        var matchingDays = [];
        for (var day = 1; day <= 31; day++) {
            if (rowMatchesSearch(day, months, data)) {
                matchingDays.push(day);
            }
        }

        var totalPages = Math.max(1, Math.ceil(matchingDays.length / pageSize));
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        var startIndex = (currentPage - 1) * pageSize;
        var pageDays = matchingDays.slice(startIndex, startIndex + pageSize);

        if (!pageDays.length) {
            bodyEl.innerHTML = '<tr><td colspan="' + (months.length + 1) + '" class="attendance-empty-row">No record found</td></tr>';
            return;
        }

        bodyEl.innerHTML = pageDays.map(function (day) {
            var cells = months.map(function (month) {
                var maxDay = daysInMonth(month.monthIndex, month.year);
                var code = day <= maxDay ? ((data[month.key] && data[month.key][day]) || '') : '';
                return '<td data-month-key="' + escapeHtml(month.key) + '">' + attendanceCellHtml(code) + '</td>';
            }).join('');
            return '<tr><td>' + day + '</td>' + cells + '</tr>';
        }).join('');
    }

    function renderColumnDropdown() {
        var dropdown = document.getElementById('profileAttColumnsDropdown');
        if (!dropdown || !attendanceData || !attendanceData.months) {
            return;
        }

        dropdown.innerHTML = ''
            + '<div class="dropdown-header"><span>Toggle Columns</span></div>'
            + '<div class="dropdown-content">'
            + attendanceData.months.map(function (month) {
                var checked = visibleMonthKeys[month.key] !== false ? ' checked' : '';
                return ''
                    + '<label class="column-toggle-item">'
                    + '<input type="checkbox" data-attendance-col="' + escapeHtml(month.key) + '"' + checked + '>'
                    + '<span>' + escapeHtml(month.label) + '</span>'
                    + '</label>';
            }).join('')
            + '</div>';

        dropdown.querySelectorAll('input[data-attendance-col]').forEach(function (input) {
            input.addEventListener('change', function () {
                visibleMonthKeys[input.getAttribute('data-attendance-col')] = input.checked;
                renderAttendanceTable();
            });
        });
    }

    function toggleMonthColumn(monthKey, visible) {
        visibleMonthKeys[monthKey] = visible;
        var table = document.getElementById('profileAttendanceTable');
        if (!table) {
            return;
        }
        table.querySelectorAll('[data-month-key="' + monthKey + '"]').forEach(function (cell) {
            cell.style.display = visible ? '' : 'none';
        });
    }

    function applyColumnVisibilityFromState() {
        if (!attendanceData || !attendanceData.months) {
            return;
        }
        attendanceData.months.forEach(function (month) {
            toggleMonthColumn(month.key, visibleMonthKeys[month.key] !== false);
        });
    }

    function attendanceToTsv() {
        if (!attendanceData) {
            return '';
        }
        var months = getVisibleMonths();
        var data = attendanceData.data || {};
        var lines = [['Date | Month'].concat(months.map(function (m) { return m.label; })).join('\t')];
        for (var day = 1; day <= 31; day++) {
            if (!rowMatchesSearch(day, months, data)) {
                continue;
            }
            var row = [String(day)];
            months.forEach(function (month) {
                var maxDay = daysInMonth(month.monthIndex, month.year);
                row.push(day <= maxDay ? ((data[month.key] && data[month.key][day]) || '') : '');
            });
            lines.push(row.join('\t'));
        }
        return lines.join('\n');
    }

    function downloadCsv() {
        var text = attendanceToTsv().split('\n').map(function (line) {
            return line.split('\t').map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        var blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'student-attendance.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function renderAttendancePanel(data) {
        attendanceData = data || null;
        if (!attendanceData) {
            var panel = document.querySelector('.sp-tab-content[data-profile-panel="attendance"] .attendance-panel');
            if (panel) {
                panel.innerHTML = '<p class="sp-empty">No record found</p>';
            }
            return;
        }

        if (attendanceData.months) {
            attendanceData.months.forEach(function (month) {
                if (visibleMonthKeys[month.key] === undefined) {
                    visibleMonthKeys[month.key] = true;
                }
            });
        }

        renderSummaryCards(attendanceData.summary);
        renderColumnDropdown();
        renderAttendanceTable();
        applyColumnVisibilityFromState();
    }

    function bindControls() {
        var searchInput = document.getElementById('profileAttendanceSearch');
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = '1';
            searchInput.addEventListener('input', function () {
                searchTerm = searchInput.value.trim().toLowerCase();
                currentPage = 1;
                renderAttendanceTable();
            });
        }

        var pageSizeSelect = document.getElementById('profileAttendancePageSize');
        if (pageSizeSelect && !pageSizeSelect.dataset.bound) {
            pageSizeSelect.dataset.bound = '1';
            pageSizeSelect.addEventListener('change', function () {
                pageSize = Number(pageSizeSelect.value) || 31;
                currentPage = 1;
                renderAttendanceTable();
            });
        }

        var columnsBtn = document.getElementById('profileAttColumnsBtn');
        var columnsDropdown = document.getElementById('profileAttColumnsDropdown');
        if (columnsBtn && columnsDropdown && !columnsBtn.dataset.bound) {
            columnsBtn.dataset.bound = '1';
            columnsBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                columnsDropdown.classList.toggle('active');
            });
            document.addEventListener('click', function (event) {
                if (!columnsDropdown.contains(event.target) && event.target !== columnsBtn) {
                    columnsDropdown.classList.remove('active');
                }
            });
        }

        var copyBtn = document.getElementById('profileAttCopyBtn');
        if (copyBtn && !copyBtn.dataset.bound) {
            copyBtn.dataset.bound = '1';
            copyBtn.addEventListener('click', function () {
                if (!attendanceData) {
                    return;
                }
                navigator.clipboard.writeText(attendanceToTsv()).catch(function () {});
            });
        }

        ['profileAttCsvBtn', 'profileAttExcelBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = '1';
                btn.addEventListener('click', downloadCsv);
            }
        });

        ['profileAttPrintBtn', 'profileAttPdfBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = '1';
                btn.addEventListener('click', function () {
                    window.print();
                });
            }
        });
    }

    function loadAttendance(force) {
        if (attendanceLoaded && !force) {
            return;
        }
        attendanceLoaded = true;

        var panel = document.querySelector('.sp-tab-content[data-profile-panel="attendance"] .attendance-panel');
        if (panel) {
            var statsEl = document.getElementById('profileAttendanceStats');
            var bodyEl = document.getElementById('profileAttendanceBody');
            if (statsEl) {
                statsEl.innerHTML = '';
            }
            if (bodyEl) {
                bodyEl.innerHTML = '<tr><td colspan="13" class="attendance-empty-row">Loading...</td></tr>';
            }
        }

        fetch('/api/user/user/attendance', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load attendance');
                }
                return response.json();
            })
            .then(function (data) {
                bindControls();
                renderAttendancePanel(data);
            })
            .catch(function () {
                renderAttendancePanel(null);
            });
    }

    function initAttendanceTabLoader() {
        bindControls();
        var attendanceTab = document.querySelector('.sp-tab[data-profile-tab="attendance"]');
        if (attendanceTab) {
            attendanceTab.addEventListener('click', function () {
                loadAttendance(true);
            });
        }
        var attendancePanel = document.querySelector('.sp-tab-content[data-profile-panel="attendance"]');
        if (attendancePanel && attendancePanel.classList.contains('active')) {
            loadAttendance();
        }
    }

    document.addEventListener('DOMContentLoaded', initAttendanceTabLoader);
})();
