(function () {
    'use strict';

    var container = document.getElementById('ucrPanels');
    var printBtn = document.getElementById('ucrPrintBtn');

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function marksCell(value, extraClass) {
        if (value == null || value === '') {
            return '<td class="' + (extraClass || '') + '"></td>';
        }
        var text = String(value);
        if (text.toUpperCase() === 'ABS') {
            return '<td class="' + (extraClass || '') + '"><span class="ucr-absent">ABS</span></td>';
        }
        var num = Number(value);
        var display = !Number.isNaN(num) ? num.toFixed(2) : text;
        return '<td class="' + (extraClass || '') + '">' + escapeHtml(display) + '</td>';
    }

    function summaryItem(label, value) {
        return '<div><span class="ucr-summary-label">' + escapeHtml(label)
            + ':</span> <span class="ucr-summary-value">'
            + escapeHtml(value == null ? '' : String(value)) + '</span></div>';
    }

    function render(exams) {
        if (!container) return;
        if (!exams || !exams.length) {
            container.innerHTML = '<p class="ucr-empty">No record found</p>';
            return;
        }

        container.innerHTML = exams.map(function (exam) {
            var columns = exam.columns || [];
            var subjects = exam.subjects || [];
            var summary = exam.summary || {};

            var headerCols = columns.map(function (col) {
                return '<th><span class="ucr-th-main">' + escapeHtml(col.label || '')
                    + '</span><span class="ucr-th-sub">(Max '
                    + escapeHtml(String(col.max != null ? col.max : ''))
                    + ')</span></th>';
            }).join('');

            var rows = subjects.map(function (subject) {
                var markCells = columns.map(function (col) {
                    return marksCell(subject[col.key]);
                }).join('');
                var subjectLabel = escapeHtml(subject.name || '')
                    + (subject.code ? ' <span>(' + escapeHtml(subject.code) + ')</span>' : '');
                return '<tr>'
                    + '<td>' + subjectLabel + '</td>'
                    + markCells
                    + marksCell(subject.total, 'ucr-total')
                    + '<td>' + escapeHtml(subject.note || '') + '</td>'
                    + '</tr>';
            }).join('');

            return '<article class="ucr-card">'
                + '<h2 class="ucr-card-title">' + escapeHtml(exam.title || 'CBSE Examination') + '</h2>'
                + '<div class="ucr-table-wrap"><table class="ucr-table">'
                + '<thead><tr><th>Subject</th>' + headerCols + '<th>Total</th><th>Note</th></tr></thead>'
                + '<tbody>' + rows + '</tbody></table></div>'
                + '<div class="ucr-summary">'
                + summaryItem('Total Marks', summary.totalMarks)
                + summaryItem('Percentage (%)', summary.percentage)
                + summaryItem('Grade', summary.grade)
                + summaryItem('Rank', summary.rank != null ? summary.rank : '')
                + '</div></article>';
        }).join('');
    }

    async function loadResults() {
        if (container) {
            container.innerHTML = '<p class="ucr-empty">Loading CBSE exam results...</p>';
        }
        try {
            var response = await fetch('/api/user/cbse/exam/result', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load CBSE exam results');
            }
            var data = await response.json();
            render(Array.isArray(data.exams) ? data.exams : []);
        } catch (error) {
            if (container) {
                container.innerHTML = '<p class="ucr-empty">' + escapeHtml(error.message || 'No record found') + '</p>';
            }
        }
    }

    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    loadResults();
})();
