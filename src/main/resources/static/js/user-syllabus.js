(function () {
    'use strict';

    var grid = document.getElementById('usyGrid');
    var weekRangeLabel = document.getElementById('usyWeekRangeLabel');
    var prevWeekBtn = document.getElementById('usyPrevWeekBtn');
    var nextWeekBtn = document.getElementById('usyNextWeekBtn');
    var viewModal = document.getElementById('usyViewModal');
    var viewOverlay = document.getElementById('usyViewOverlay');
    var viewClose = document.getElementById('usyViewClose');
    var detailTable = document.getElementById('usyDetailTable');
    var commentList = document.getElementById('usyCommentList');
    var commentInput = document.getElementById('usyCommentInput');
    var sendCommentBtn = document.getElementById('usySendCommentBtn');
    var printBtn = document.getElementById('usyPrintBtn');
    var excelBtn = document.getElementById('usyExcelBtn');

    var weekStart = getMonday(new Date());
    var days = [];
    var schedulesByDate = {};
    var currentViewData = null;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function getMonday(date) {
        var copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var day = copy.getDay();
        var diff = day === 0 ? -6 : 1 - day;
        copy.setDate(copy.getDate() + diff);
        return copy;
    }

    function formatUsDate(date) {
        var mm = String(date.getMonth() + 1).padStart(2, '0');
        var dd = String(date.getDate()).padStart(2, '0');
        return mm + '/' + dd + '/' + date.getFullYear();
    }

    function toIsoDate(date) {
        var mm = String(date.getMonth() + 1).padStart(2, '0');
        var dd = String(date.getDate()).padStart(2, '0');
        return date.getFullYear() + '-' + mm + '-' + dd;
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

    function iconHtml(type) {
        if (type === 'clock') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
    }

    function subjectDisplay(lesson) {
        if (lesson.subjectLabel) {
            return lesson.subjectLabel;
        }
        var name = lesson.subjectName || 'Subject';
        if (lesson.subjectCode && name.indexOf('(') === -1) {
            return name + ' (' + lesson.subjectCode + ')';
        }
        return name;
    }

    function notScheduledHtml() {
        return ''
            + '<div class="usy-not-scheduled">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<circle cx="12" cy="12" r="10"></circle>'
            + '<line x1="15" y1="9" x2="9" y2="15"></line>'
            + '<line x1="9" y1="9" x2="15" y2="15"></line>'
            + '</svg>'
            + '<span>Not Scheduled</span>'
            + '</div>';
    }

    function lessonCardHtml(lesson) {
        var timeRange = formatDisplayTime(lesson.timeFrom, false) + ' - ' + formatDisplayTime(lesson.timeTo, true);
        return ''
            + '<div class="usy-lesson">'
            + '<button type="button" class="usy-view-btn" data-id="' + escapeHtml(String(lesson.id)) + '" title="View">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="4" y1="7" x2="20" y2="7"></line>'
            + '<line x1="4" y1="12" x2="20" y2="12"></line>'
            + '<line x1="4" y1="17" x2="20" y2="17"></line>'
            + '</svg></button>'
            + '<div class="usy-line usy-subject">' + iconHtml('book') + '<span>Subject: ' + escapeHtml(subjectDisplay(lesson)) + '</span></div>'
            + '<div class="usy-line">' + iconHtml('clock') + '<span>' + escapeHtml(timeRange) + '</span></div>'
            + '</div>';
    }

    function groupSchedules(entries) {
        var grouped = {};
        days.forEach(function (day) {
            grouped[day.date] = [];
        });
        (entries || []).forEach(function (lesson) {
            var key = lesson.planDate;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(lesson);
        });
        Object.keys(grouped).forEach(function (key) {
            grouped[key].sort(function (a, b) {
                return String(a.timeFrom || '').localeCompare(String(b.timeFrom || ''));
            });
        });
        return grouped;
    }

    function updateWeekLabel(label) {
        if (!weekRangeLabel) {
            return;
        }
        weekRangeLabel.textContent = label || (formatUsDate(weekStart) + ' To ' + formatUsDate(new Date(weekStart.getTime() + 6 * 86400000)));
    }

    function renderGrid() {
        if (!grid) {
            return;
        }
        if (!days.length) {
            grid.innerHTML = '<div class="usy-empty">No lesson plan found</div>';
            return;
        }
        grid.innerHTML = days.map(function (day) {
            var lessons = schedulesByDate[day.date] || [];
            var body = lessons.length
                ? lessons.map(lessonCardHtml).join('')
                : notScheduledHtml();
            return ''
                + '<div class="usy-day">'
                + '<h2 class="usy-day-title">' + escapeHtml(day.name + ' ' + day.dateLabel) + '</h2>'
                + '<div class="usy-day-body">' + body + '</div>'
                + '</div>';
        }).join('');
    }

    function detailRows(data) {
        return [
            ['Class', data.classLabel],
            ['Subject', data.subjectLabel],
            ['Date', data.dateLabel],
            ['Lesson', data.lessonName],
            ['Topic', data.topicName],
            ['Sub Topic', data.subTopic],
            ['General Objectives', data.generalObjectives],
            ['Teaching Method', data.teachingMethod],
            ['Previous Knowledge', data.previousKnowledge],
            ['Comprehensive Questions', data.comprehensiveQuestions],
            ['Presentation', data.presentation]
        ];
    }

    function renderDetailRows(data) {
        if (!detailTable) {
            return;
        }
        detailTable.innerHTML = detailRows(data).map(function (row) {
            return ''
                + '<div class="usy-detail-row">'
                + '<div class="detail-label">' + escapeHtml(row[0]) + '</div>'
                + '<div class="detail-value">' + escapeHtml(row[1] || '') + '</div>'
                + '</div>';
        }).join('');
    }

    function renderComments(comments) {
        if (!commentList) {
            return;
        }
        if (!comments || !comments.length) {
            commentList.innerHTML = '';
            return;
        }
        commentList.innerHTML = comments.map(function (comment) {
            return '<div class="usy-comment-item">' + escapeHtml(comment.commentText) + '</div>';
        }).join('');
    }

    function closeViewModal() {
        if (viewModal) {
            viewModal.hidden = true;
        }
        currentViewData = null;
        if (commentInput) {
            commentInput.value = '';
        }
    }

    async function openViewModal(scheduleId) {
        var response = await fetch('/api/user/syllabus/' + scheduleId + '/view');
        if (!response.ok) {
            var err = {};
            try { err = await response.json(); } catch (e) { err = {}; }
            throw new Error(err.message || 'Failed to load lesson plan details');
        }
        currentViewData = await response.json();
        renderDetailRows(currentViewData);
        renderComments(currentViewData.comments || []);
        if (viewModal) {
            viewModal.hidden = false;
        }
        if (commentInput) {
            commentInput.focus();
        }
    }

    function printViewModal() {
        if (!currentViewData) {
            return;
        }
        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            return;
        }
        printWindow.document.write(''
            + '<!DOCTYPE html><html><head><title>Lesson Plan</title><style>'
            + 'body{font-family:Arial,sans-serif;margin:24px;color:#111}'
            + 'h1{font-size:20px;margin-bottom:16px}'
            + 'table{width:100%;border-collapse:collapse}'
            + 'td{border:1px solid #ccc;padding:8px;vertical-align:top}'
            + 'td.label{font-weight:bold;width:200px;background:#f8fafc}'
            + '</style></head><body>'
            + '<h1>Lesson Plan</h1><table>'
            + detailRows(currentViewData).map(function (row) {
                return '<tr><td class="label">' + escapeHtml(row[0]) + '</td><td>'
                    + escapeHtml(row[1] || '') + '</td></tr>';
            }).join('')
            + '</table></body></html>');
        printWindow.document.close();
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
        };
    }

    function exportViewToExcel() {
        if (!currentViewData || !window.XLSX) {
            return;
        }
        var exportRow = {
            Class: currentViewData.classLabel,
            Subject: currentViewData.subjectLabel,
            Date: currentViewData.dateLabel,
            Lesson: currentViewData.lessonName,
            Topic: currentViewData.topicName,
            'Sub Topic': currentViewData.subTopic,
            'General Objectives': currentViewData.generalObjectives,
            'Teaching Method': currentViewData.teachingMethod,
            'Previous Knowledge': currentViewData.previousKnowledge,
            'Comprehensive Questions': currentViewData.comprehensiveQuestions,
            Presentation: currentViewData.presentation
        };
        var wb = window.XLSX.utils.book_new();
        var ws = window.XLSX.utils.json_to_sheet([exportRow]);
        window.XLSX.utils.book_append_sheet(wb, ws, 'Lesson Plan');
        window.XLSX.writeFile(wb, 'lesson-plan.xlsx');
    }

    async function sendComment() {
        if (!currentViewData || !currentViewData.scheduleId || !commentInput) {
            return;
        }
        var commentText = commentInput.value.trim();
        if (!commentText) {
            return;
        }
        if (sendCommentBtn) {
            sendCommentBtn.disabled = true;
        }
        try {
            var response = await fetch('/api/user/syllabus/' + currentViewData.scheduleId + '/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentText: commentText })
            });
            var result = {};
            try { result = await response.json(); } catch (e) { result = {}; }
            if (!response.ok || result.success === false) {
                throw new Error(result.message || 'Failed to send comment');
            }
            currentViewData.comments = currentViewData.comments || [];
            currentViewData.comments.push(result.data || result);
            renderComments(currentViewData.comments);
            commentInput.value = '';
        } catch (error) {
            window.alert(error.message || 'Failed to send comment');
        } finally {
            if (sendCommentBtn) {
                sendCommentBtn.disabled = false;
            }
        }
    }

    async function loadWeek() {
        if (grid) {
            grid.innerHTML = '<div class="usy-loading">Loading lesson plan...</div>';
        }
        try {
            var response = await fetch('/api/user/syllabus?weekStart=' + encodeURIComponent(toIsoDate(weekStart)));
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load lesson plan');
            }
            var data = await response.json();
            if (data.weekStart) {
                weekStart = new Date(data.weekStart + 'T00:00:00');
            }
            days = Array.isArray(data.days) ? data.days : [];
            schedulesByDate = groupSchedules(data.schedules || []);
            updateWeekLabel(data.weekLabel);
            renderGrid();
        } catch (error) {
            if (grid) {
                grid.innerHTML = '<div class="usy-empty">' + escapeHtml(error.message || 'Failed to load lesson plan') + '</div>';
            }
        }
    }

    if (grid) {
        grid.addEventListener('click', function (event) {
            var button = event.target.closest('.usy-view-btn');
            if (!button) {
                return;
            }
            openViewModal(button.getAttribute('data-id')).catch(function (error) {
                window.alert(error.message || 'Failed to load lesson plan details');
            });
        });
    }

    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', function () {
            weekStart.setDate(weekStart.getDate() - 7);
            loadWeek();
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', function () {
            weekStart.setDate(weekStart.getDate() + 7);
            loadWeek();
        });
    }

    if (viewOverlay) {
        viewOverlay.addEventListener('click', closeViewModal);
    }
    if (viewClose) {
        viewClose.addEventListener('click', closeViewModal);
    }
    if (printBtn) {
        printBtn.addEventListener('click', printViewModal);
    }
    if (excelBtn) {
        excelBtn.addEventListener('click', exportViewToExcel);
    }
    if (sendCommentBtn) {
        sendCommentBtn.addEventListener('click', sendComment);
    }
    if (commentInput) {
        commentInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendComment();
            }
        });
    }
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && viewModal && !viewModal.hidden) {
            closeViewModal();
        }
    });

    loadWeek();
})();
