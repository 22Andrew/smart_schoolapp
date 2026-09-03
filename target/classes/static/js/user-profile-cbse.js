(function () {
    'use strict';

    var cbseLoaded = false;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
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

    function renderCbsePanels(exams) {
        var container = document.getElementById('profileCbsePanels');
        if (!container) {
            return;
        }

        if (!exams || !exams.length) {
            container.innerHTML = '<p class="sp-empty">No record found</p>';
            return;
        }

        container.innerHTML = exams.map(function (exam) {
            var columns = exam.columns || [];
            var subjects = exam.subjects || [];
            var summary = exam.summary || {};

            var headerCols = columns.map(function (col) {
                return '<th><span class="cbse-th-main">' + escapeHtml(col.label || '')
                    + '</span><span class="cbse-th-sub">(Max ' + escapeHtml(String(col.max != null ? col.max : ''))
                    + ')</span></th>';
            }).join('');

            var rows = subjects.map(function (subject) {
                var markCells = columns.map(function (col) {
                    return '<td>' + marksCell(subject[col.key]) + '</td>';
                }).join('');

                return ''
                    + '<tr>'
                    + '<td><span class="exam-subject">' + escapeHtml(subject.name || '')
                    + ' <span class="exam-subject-code">(' + escapeHtml(subject.code || '') + ')</span></span></td>'
                    + markCells
                    + '<td>' + marksCell(subject.total) + '</td>'
                    + '</tr>';
            }).join('');

            return ''
                + '<div class="exam-card">'
                + '<h3 class="exam-card-title">' + escapeHtml(exam.title || 'CBSE Examination') + '</h3>'
                + '<div class="exam-table-wrap">'
                + '<table class="exam-table cbse-table">'
                + '<thead><tr>'
                + '<th>Subject</th>'
                + headerCols
                + '<th>Total</th>'
                + '</tr></thead>'
                + '<tbody>' + rows + '</tbody>'
                + '</table></div>'
                + '<div class="exam-summary cbse-summary">'
                + cbseSummaryItem('Total Marks', summary.totalMarks)
                + cbseSummaryItem('Percentage (%)', summary.percentage)
                + cbseSummaryItem('Grade', summary.grade)
                + cbseSummaryItem('Rank', summary.rank != null ? summary.rank : '')
                + '</div></div>';
        }).join('');
    }

    function cbseSummaryItem(label, value) {
        return '<div class="exam-summary-item"><span class="exam-summary-label">'
            + escapeHtml(label) + ':</span> <strong class="exam-summary-value">'
            + escapeHtml(value == null ? '' : String(value)) + '</strong></div>';
    }

    function loadCbseExams(force) {
        if (cbseLoaded && !force) {
            return;
        }
        cbseLoaded = true;

        var container = document.getElementById('profileCbsePanels');
        if (container) {
            container.innerHTML = '<p class="sp-empty">Loading...</p>';
        }

        fetch('/api/user/user/cbse-exams', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load CBSE exams');
                }
                return response.json();
            })
            .then(function (data) {
                renderCbsePanels(data && data.exams);
            })
            .catch(function () {
                if (container) {
                    container.innerHTML = '<p class="sp-empty">No record found</p>';
                }
            });
    }

    function initCbseTabLoader() {
        var cbseTab = document.querySelector('.sp-tab[data-profile-tab="cbse"]');
        if (cbseTab) {
            cbseTab.addEventListener('click', function () {
                loadCbseExams(true);
            });
        }
        var cbsePanel = document.querySelector('.sp-tab-content[data-profile-panel="cbse"]');
        if (cbsePanel && cbsePanel.classList.contains('active')) {
            loadCbseExams();
        }
    }

    document.addEventListener('DOMContentLoaded', initCbseTabLoader);
})();
