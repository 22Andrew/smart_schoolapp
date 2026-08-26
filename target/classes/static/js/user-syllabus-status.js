(function () {
    'use strict';

    var chartsEl = document.getElementById('ussCharts');
    var listEl = document.getElementById('ussList');
    var pdfBtn = document.getElementById('ussPdfBtn');
    var printBtn = document.getElementById('ussPrintBtn');
    var subjects = [];

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function donutHtml(percent) {
        var value = Math.max(0, Math.min(100, Number(percent) || 0));
        var radius = 15.9155;
        var circ = 2 * Math.PI * radius;
        var dash = (value / 100) * circ;
        return ''
            + '<svg class="uss-donut" viewBox="0 0 36 36" aria-hidden="true">'
            + '<circle class="uss-donut-bg" cx="18" cy="18" r="' + radius + '" fill="none" stroke-width="3.4"></circle>'
            + '<circle class="uss-donut-fill" cx="18" cy="18" r="' + radius + '" fill="none" stroke-width="3.4"'
            + ' stroke-dasharray="' + dash.toFixed(2) + ' ' + circ.toFixed(2) + '"'
            + (value === 0 ? ' stroke="transparent"' : '')
            + '></circle>'
            + '</svg>';
    }

    function renderCharts() {
        if (!chartsEl) {
            return;
        }
        if (!subjects.length) {
            chartsEl.innerHTML = '<div class="uss-empty">No syllabus status found</div>';
            return;
        }
        chartsEl.innerHTML = subjects.map(function (subject) {
            return ''
                + '<div class="uss-chart">'
                + '<h3 class="uss-chart-title">' + escapeHtml(subject.subjectLabel || subject.subjectName) + '</h3>'
                + donutHtml(subject.percent)
                + '<div class="uss-badge">Complete ' + escapeHtml(String(subject.percent || 0)) + ' %</div>'
                + '</div>';
        }).join('');
    }

    function renderList() {
        if (!listEl) {
            return;
        }
        if (!subjects.length) {
            listEl.innerHTML = '<div class="uss-empty">No record found</div>';
            return;
        }
        listEl.innerHTML = subjects.map(function (subject) {
            var lessons = subject.lessons || [];
            var lessonHtml = lessons.map(function (lesson) {
                var topics = lesson.topics || [];
                var topicHtml = topics.map(function (topic) {
                    return ''
                        + '<div class="uss-row uss-topic-row">'
                        + '<span class="uss-row-label">' + escapeHtml(topic.label || topic.name) + '</span>'
                        + '<span class="uss-row-status">' + escapeHtml(topic.statusLabel || '') + '</span>'
                        + '</div>';
                }).join('');
                return ''
                    + '<div class="uss-row uss-lesson-row">'
                    + '<span class="uss-row-label">' + escapeHtml(lesson.label || lesson.name) + '</span>'
                    + '<span class="uss-row-status">' + escapeHtml(String(lesson.percent || 0)) + '% Complete</span>'
                    + '</div>'
                    + topicHtml;
            }).join('');
            return ''
                + '<div class="uss-subject-block">'
                + '<div class="uss-row uss-subject-row">'
                + '<span class="uss-row-label">' + escapeHtml(subject.subjectLabel || subject.subjectName) + '</span>'
                + '<span class="uss-row-status">' + escapeHtml(String(subject.percent || 0)) + '% Complete</span>'
                + '</div>'
                + lessonHtml
                + '</div>';
        }).join('');
    }

    function printStatus() {
        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            window.print();
            return;
        }
        printWindow.document.write(''
            + '<!DOCTYPE html><html><head><title>Syllabus Status</title><style>'
            + 'body{font-family:Arial,sans-serif;margin:24px;color:#111}'
            + 'h1{font-size:20px;margin:0 0 16px}'
            + '.charts{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:24px}'
            + '.chart{text-align:center;width:140px}'
            + '.title{font-weight:700;margin-bottom:8px}'
            + '.badge{display:inline-block;background:#111;color:#fff;padding:4px 8px;font-size:12px;margin-top:8px}'
            + '.row{display:flex;justify-content:space-between;padding:4px 0}'
            + '.subject{font-weight:700;margin-top:14px}'
            + '.lesson{font-weight:700;padding-left:18px}'
            + '.topic{padding-left:36px;font-style:italic}'
            + '</style></head><body>'
            + '<h1>Syllabus Status</h1>'
            + '<div class="charts">'
            + subjects.map(function (subject) {
                return '<div class="chart"><div class="title">' + escapeHtml(subject.subjectLabel || subject.subjectName)
                    + '</div><div>Complete ' + escapeHtml(String(subject.percent || 0)) + ' %</div></div>';
            }).join('')
            + '</div><h2>Subject - Lesson - Topic Status</h2>'
            + subjects.map(function (subject) {
                var html = '<div class="row subject"><span>' + escapeHtml(subject.subjectLabel || subject.subjectName)
                    + '</span><span>' + escapeHtml(String(subject.percent || 0)) + '% Complete</span></div>';
                (subject.lessons || []).forEach(function (lesson) {
                    html += '<div class="row lesson"><span>' + escapeHtml(lesson.label || lesson.name)
                        + '</span><span>' + escapeHtml(String(lesson.percent || 0)) + '% Complete</span></div>';
                    (lesson.topics || []).forEach(function (topic) {
                        html += '<div class="row topic"><span>' + escapeHtml(topic.label || topic.name)
                            + '</span><span>' + escapeHtml(topic.statusLabel || '') + '</span></div>';
                    });
                });
                return html;
            }).join('')
            + '</body></html>');
        printWindow.document.close();
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
        };
    }

    async function loadStatus() {
        try {
            var response = await fetch('/api/user/syllabus/status');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load syllabus status');
            }
            var data = await response.json();
            subjects = Array.isArray(data.subjects) ? data.subjects : [];
            renderCharts();
            renderList();
        } catch (error) {
            if (chartsEl) {
                chartsEl.innerHTML = '<div class="uss-empty">' + escapeHtml(error.message || 'Failed to load syllabus status') + '</div>';
            }
            if (listEl) {
                listEl.innerHTML = '';
            }
        }
    }

    if (pdfBtn) {
        pdfBtn.addEventListener('click', printStatus);
    }
    if (printBtn) {
        printBtn.addEventListener('click', printStatus);
    }

    loadStatus();
})();
