(function () {
    'use strict';

    var examsLoaded = false;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function examResultBadge(result) {
        var key = String(result || '').toLowerCase();
        if (!result) {
            return '';
        }
        return '<span class="exam-result ' + escapeHtml(key) + '">' + escapeHtml(result) + '</span>';
    }

    function marksCell(value) {
        if (value == null || value === '') {
            return '';
        }
        var text = String(value);
        if (text.toUpperCase() === 'ABS') {
            return '<span class="exam-absent">ABS</span>';
        }
        var num = Number(value);
        if (!Number.isNaN(num)) {
            return escapeHtml(num.toFixed(2));
        }
        return escapeHtml(text);
    }

    function renderExamPanels(exams) {
        var container = document.getElementById('profileExamPanels');
        if (!container) {
            return;
        }

        if (!exams || !exams.length) {
            container.innerHTML = '<p class="sp-empty">No record found</p>';
            return;
        }

        container.innerHTML = exams.map(function (exam) {
            var outcomeColumn = exam.outcomeColumn || 'Result';
            var subjects = exam.subjects || [];
            var summary = exam.summary || {};

            var rows = subjects.map(function (subject) {
                var outcomeHtml = outcomeColumn === 'Result'
                    ? examResultBadge(subject.outcome)
                    : escapeHtml(subject.outcome || '');

                return ''
                    + '<tr>'
                    + '<td><span class="exam-subject">' + escapeHtml(subject.name)
                    + ' <span class="exam-subject-code">(' + escapeHtml(subject.code || '') + ')</span></span></td>'
                    + '<td>' + escapeHtml(formatMark(subject.max)) + '</td>'
                    + '<td>' + escapeHtml(formatMark(subject.min)) + '</td>'
                    + '<td>' + marksCell(subject.obtained) + '</td>'
                    + '<td>' + outcomeHtml + '</td>'
                    + '<td>' + escapeHtml(subject.note || '') + '</td>'
                    + '</tr>';
            }).join('');

            return ''
                + '<div class="exam-card">'
                + '<h3 class="exam-card-title">' + escapeHtml(exam.title || 'Exam') + '</h3>'
                + '<div class="exam-table-wrap">'
                + '<table class="exam-table">'
                + '<thead><tr>'
                + '<th>Subject</th><th>Max Marks</th><th>Min Marks</th><th>Marks Obtained</th>'
                + '<th>' + escapeHtml(outcomeColumn) + '</th><th>Note</th>'
                + '</tr></thead>'
                + '<tbody>' + rows + '</tbody>'
                + '</table></div>'
                + '<div class="exam-summary">'
                + summaryItem('Percentage', escapeHtml(formatMark(summary.percentage)))
                + summaryItem('Rank', escapeHtml(String(summary.rank != null ? summary.rank : '')))
                + summaryItem('Result', examResultBadge(summary.result), true)
                + (summary.division ? summaryItem('Division', escapeHtml(summary.division)) : '')
                + summaryItem('Grand Total', escapeHtml(formatSummaryTotal(summary.grandTotal)))
                + summaryItem('Total Obtain Marks', escapeHtml(formatSummaryTotal(summary.totalObtain)))
                + '</div></div>';
        }).join('');
    }

    function summaryItem(label, valueHtml, isHtml) {
        return '<div class="exam-summary-item">'
            + '<span class="exam-summary-label">' + escapeHtml(label) + ' :</span> '
            + (isHtml ? valueHtml : '<span class="exam-summary-value">' + valueHtml + '</span>')
            + '</div>';
    }

    function formatMark(value) {
        if (value == null || value === '') {
            return '';
        }
        var num = Number(value);
        if (Number.isNaN(num)) {
            return String(value);
        }
        return num.toFixed(2);
    }

    function formatSummaryTotal(value) {
        if (value == null || value === '') {
            return '';
        }
        var num = Number(value);
        if (Number.isNaN(num)) {
            return String(value);
        }
        if (Math.floor(num) === num) {
            return String(num);
        }
        return num.toFixed(2);
    }

    function loadExams(force) {
        if (examsLoaded && !force) {
            return;
        }
        examsLoaded = true;

        var container = document.getElementById('profileExamPanels');
        if (container) {
            container.innerHTML = '<p class="sp-empty">Loading...</p>';
        }

        fetch('/api/user/user/exams', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load exams');
                }
                return response.json();
            })
            .then(function (data) {
                renderExamPanels(data && data.exams);
            })
            .catch(function () {
                if (container) {
                    container.innerHTML = '<p class="sp-empty">No record found</p>';
                }
            });
    }

    function initExamTabLoader() {
        var examTab = document.querySelector('.sp-tab[data-profile-tab="exam"]');
        if (examTab) {
            examTab.addEventListener('click', function () {
                loadExams(true);
            });
        }
        var examPanel = document.querySelector('.sp-tab-content[data-profile-panel="exam"]');
        if (examPanel && examPanel.classList.contains('active')) {
            loadExams();
        }
    }

    document.addEventListener('DOMContentLoaded', initExamTabLoader);
})();
