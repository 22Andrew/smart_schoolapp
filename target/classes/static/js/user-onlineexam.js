(function () {
    'use strict';

    var tableBody = document.getElementById('uoeTableBody');
    var table = document.getElementById('uoeTable');
    var searchInput = document.getElementById('uoeSearchInput');
    var entriesSelect = document.getElementById('uoeEntriesSelect');
    var showingInfo = document.getElementById('uoeShowingInfo');
    var pagination = document.getElementById('uoePagination');
    var detailModal = document.getElementById('uoeDetailModal');
    var detailOverlay = document.getElementById('uoeDetailOverlay');
    var detailClose = document.getElementById('uoeDetailClose');
    var examOverlay = document.getElementById('uoeExamOverlay');
    var startBtn = document.getElementById('uoeStartBtn');

    var rows = [];
    var currentTab = 'upcoming';
    var currentPage = 1;
    var pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    var tableFilter = '';
    var sortKey = '';
    var sortDir = 'asc';
    var currentExam = null;
    var examState = null;
    var timerId = null;

    function notify(type, title, text) {
        if (window.Swal) {
            return Swal.fire({
                icon: type,
                title: title,
                text: text,
                confirmButtonColor: '#727cf5'
            });
        }
        window.alert(text || title);
        return Promise.resolve();
    }

    async function confirmAction(title, text, confirmText) {
        if (window.Swal) {
            var result = await Swal.fire({
                icon: 'question',
                title: title,
                text: text,
                showCancelButton: true,
                confirmButtonColor: '#727cf5',
                cancelButtonColor: '#64748b',
                confirmButtonText: confirmText || 'Submit'
            });
            return result.isConfirmed;
        }
        return window.confirm(text || title);
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function quizIcon(checked) {
        if (!checked) {
            return '<span class="uoe-quiz-icon uoe-quiz-empty">-</span>';
        }
        return '<svg class="uoe-quiz-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<rect x="3" y="3" width="18" height="18" rx="3"></rect>'
            + '<polyline points="7 12 11 16 17 8"></polyline></svg>';
    }

    function viewBtn(id) {
        return '<button type="button" class="uhw-view-btn" data-id="' + escapeHtml(String(id)) + '" title="View">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>'
            + '<circle cx="12" cy="12" r="3"></circle></svg></button>';
    }

    function getFiltered() {
        var list = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return [
                    row.title, row.quiz ? 'quiz' : '', row.examFrom, row.examTo, row.duration,
                    row.totalAttempt, row.attempted, row.status
                ].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            list.sort(function (a, b) {
                var av = a[sortKey];
                var bv = b[sortKey];
                if (typeof av === 'number' || typeof bv === 'number') {
                    return sortDir === 'asc' ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0);
                }
                var as = String(av == null ? '' : av).toLowerCase();
                var bs = String(bv == null ? '' : bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function emptyStateHtml(message) {
        return '<tr class="ugm-empty-row"><td colspan="9">' + escapeHtml(message) + '</td></tr>';
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        var html = '<button type="button" class="ugm-page-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (var page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="ugm-page-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="ugm-page-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        if (!tableBody) return;
        var filtered = getFiltered();
        var total = filtered.length;
        var totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;
        if (!total) {
            tableBody.innerHTML = emptyStateHtml('No data available in table');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }
        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td class="ugm-col-center">' + quizIcon(!!row.quiz) + '</td>'
                + '<td>' + escapeHtml(row.examFrom || '') + '</td>'
                + '<td>' + escapeHtml(row.examTo || '') + '</td>'
                + '<td>' + escapeHtml(row.duration || '') + '</td>'
                + '<td class="ugm-col-center">' + escapeHtml(row.totalAttempt == null ? '' : row.totalAttempt) + '</td>'
                + '<td class="ugm-col-center">' + escapeHtml(row.attempted == null ? '' : row.attempted) + '</td>'
                + '<td>' + escapeHtml(row.status || '') + '</td>'
                + '<td class="ugm-col-center action-cell">' + viewBtn(row.id) + '</td>'
                + '</tr>';
        }).join('');
        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total
                + (total === 1 ? ' entry' : ' entries');
        }
        renderPagination(total, totalPages);
    }

    function headers() {
        return ['Exam', 'Quiz', 'Date From', 'Date To', 'Duration', 'Total Attempt', 'Attempted', 'Status'];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.title || '',
                row.quiz ? 'Yes' : 'No',
                row.examFrom || '',
                row.examTo || '',
                row.duration || '',
                row.totalAttempt == null ? '' : row.totalAttempt,
                row.attempted == null ? '' : row.attempted,
                row.status || ''
            ];
        });
    }

    function downloadFile(filename, content, mimeType) {
        var blob = new Blob([content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportTable(type) {
        var data = exportRows();
        if (!data.length) return;
        if (type === 'print') {
            window.print();
            return;
        }
        if (type === 'csv') {
            var csv = [headers().join(',')].concat(data.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('online-exam.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(data));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Online Exam');
            window.XLSX.writeFile(workbook, 'online-exam.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({ head: [headers()], body: data });
            doc.save('online-exam.pdf');
        }
    }

    function detailItem(label, value) {
        return '<div class="uoe-detail-item"><strong>' + escapeHtml(label) + '</strong><span>'
            + escapeHtml(value == null ? '' : value) + '</span></div>';
    }

    function legendHtml() {
        return '<div class="uoe-legend">'
            + '<div class="uoe-legend-row"><svg class="uoe-legend-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22c55e"/><path d="M8 12.5l2.5 2.5L16 9" fill="none" stroke="#fff" stroke-width="2"/></svg> Correct Answer</div>'
            + '<div class="uoe-legend-row"><svg class="uoe-legend-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#22c55e" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#22c55e"/></svg> Correct Answer But Not Attempted</div>'
            + '<div class="uoe-legend-row"><svg class="uoe-legend-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ef4444"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2"/></svg> Wrong Answer</div>'
            + '</div>';
    }

    function fillDetail(exam) {
        currentExam = exam;
        var title = (exam.title || '') + (exam.quiz ? ' (Quiz)' : '');
        document.getElementById('uoeExamTitle').textContent = title;
        document.getElementById('uoeDescription').textContent = 'Description: ' + (exam.description || exam.title || '');
        document.getElementById('uoeDetailGrid').innerHTML =
            '<div class="uoe-detail-col">'
            + detailItem('Name', (exam.studentName || '') + ' (' + (exam.admissionNo || '') + ')')
            + detailItem('Total Attempt', exam.totalAttempt)
            + detailItem('Exam From', exam.examFrom)
            + detailItem('Exam To', exam.examTo)
            + detailItem('Duration', exam.duration)
            + detailItem('Answer Word Limit', exam.answerWordLimit)
            + detailItem('Passing (%)', exam.passingPercentage)
            + '</div>'
            + '<div class="uoe-detail-col">'
            + detailItem('Class', exam.classLabel || '')
            + detailItem('Total Questions', exam.totalQuestions)
            + detailItem('Descriptive Questions', exam.descriptiveQuestions)
            + '</div>'
            + '<div class="uoe-detail-col">'
            + detailItem('Father Name', exam.fatherName || '')
            + legendHtml()
            + '</div>';
        if (startBtn) {
            startBtn.hidden = !exam.canStart;
        }
    }

    function openDetail() {
        if (detailModal) detailModal.hidden = false;
    }

    function closeDetail() {
        if (detailModal) detailModal.hidden = true;
    }

    async function showExam(id) {
        var response = await fetch('/api/user/onlineexam/' + encodeURIComponent(id));
        if (!response.ok) {
            var err = {};
            try { err = await response.json(); } catch (e) { err = {}; }
            throw new Error(err.message || 'Failed to load exam details');
        }
        fillDetail(await response.json());
        openDetail();
    }

    function formatTimer(total) {
        var seconds = Math.max(0, total | 0);
        var h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        var m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        var s = String(seconds % 60).padStart(2, '0');
        return h + ':' + m + ':' + s;
    }

    function currentQuestion() {
        return examState && examState.questions[examState.index];
    }

    function answerKey(question) {
        return String(question.id);
    }

    function isAnswered(question) {
        var value = examState.answers[answerKey(question)];
        return value != null && String(value).trim() !== '';
    }

    function renderQuestionMap() {
        var map = document.getElementById('uoeQuestionMap');
        if (!map || !examState) return;
        map.innerHTML = examState.questions.map(function (question, index) {
            var cls = 'uoe-map-btn';
            if (index === examState.index || isAnswered(question)) cls += ' current';
            return '<button type="button" class="' + cls + '" data-index="' + index + '">'
                + escapeHtml(question.number) + '</button>';
        }).join('');
    }

    function renderQuestion() {
        var question = currentQuestion();
        if (!question) return;
        document.getElementById('uoeQuestionHeading').textContent = 'Question: ' + question.number;
        document.getElementById('uoeQuestionText').textContent = question.text || '';
        var optionsEl = document.getElementById('uoeOptions');
        var saved = examState.answers[answerKey(question)];
        if ((question.type || '').toLowerCase() === 'descriptive') {
            optionsEl.innerHTML = '<textarea class="uoe-descriptive" id="uoeDescriptive">'
                + escapeHtml(saved || '') + '</textarea>';
        } else {
            optionsEl.innerHTML = (question.options || []).map(function (option) {
                var checked = saved === option.text ? ' checked' : '';
                return '<label class="uoe-option"><input type="radio" name="uoeOption" value="'
                    + escapeHtml(option.text) + '"' + checked + '> '
                    + escapeHtml(option.text) + '</label>';
            }).join('');
        }
        var nextBtn = document.getElementById('uoeNextBtn');
        if (nextBtn) {
            nextBtn.hidden = examState.index >= examState.questions.length - 1;
        }
        renderQuestionMap();
    }

    function persistAnswerFromUi() {
        var question = currentQuestion();
        if (!question) return;
        if ((question.type || '').toLowerCase() === 'descriptive') {
            var area = document.getElementById('uoeDescriptive');
            examState.answers[answerKey(question)] = area ? area.value : '';
            return;
        }
        var selected = document.querySelector('input[name="uoeOption"]:checked');
        if (selected) {
            examState.answers[answerKey(question)] = selected.value;
        }
    }

    async function saveProgress() {
        if (!examState) return;
        persistAnswerFromUi();
        await fetch('/api/user/onlineexam/' + encodeURIComponent(examState.examId) + '/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                attemptId: examState.attemptId,
                remainingSeconds: examState.remainingSeconds,
                answers: examState.answers
            })
        });
    }

    function stopTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    function startTimer() {
        stopTimer();
        var valueEl = document.getElementById('uoeTimerValue');
        function tick() {
            if (valueEl) valueEl.textContent = formatTimer(examState.remainingSeconds);
            if (examState.remainingSeconds <= 0) {
                stopTimer();
                submitExam(true);
                return;
            }
            examState.remainingSeconds -= 1;
        }
        tick();
        timerId = setInterval(tick, 1000);
    }

    function openExamUi() {
        if (detailModal) detailModal.hidden = true;
        if (examOverlay) examOverlay.hidden = false;
        document.getElementById('uoeExamBarTitle').textContent = examState.title || '';
        renderQuestion();
        startTimer();
    }

    function closeExamUi() {
        stopTimer();
        if (examOverlay) examOverlay.hidden = true;
    }

    async function startExam() {
        if (!currentExam) return;
        var response = await fetch('/api/user/onlineexam/' + encodeURIComponent(currentExam.id) + '/start', {
            method: 'POST'
        });
        var data = {};
        try { data = await response.json(); } catch (e) { data = {}; }
        if (!response.ok) {
            await notify('error', 'Error', data.message || 'Failed to start exam');
            return;
        }
        examState = {
            examId: data.examId,
            attemptId: data.attemptId,
            title: data.title,
            remainingSeconds: data.remainingSeconds,
            questions: Array.isArray(data.questions) ? data.questions : [],
            answers: data.answers || {},
            index: 0
        };
        openExamUi();
    }

    async function submitExam(auto) {
        if (!examState) return;
        persistAnswerFromUi();
        stopTimer();
        var response = await fetch('/api/user/onlineexam/' + encodeURIComponent(examState.examId) + '/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                attemptId: examState.attemptId,
                remainingSeconds: 0,
                answers: examState.answers
            })
        });
        var data = {};
        try { data = await response.json(); } catch (e) { data = {}; }
        closeExamUi();
        examState = null;
        await loadExams();
        if (!response.ok) {
            await notify('error', 'Error', data.message || 'Failed to submit exam');
            return;
        }
        await notify(
            'success',
            'Submitted',
            data.message || 'You have submitted your answers to the online exam.'
        );
    }

    async function loadExams() {
        try {
            var response = await fetch('/api/user/onlineexam?tab=' + encodeURIComponent(currentTab));
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load online exams');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load online exams');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    function bindEvents() {
        document.querySelectorAll('.uhw-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.uhw-tab').forEach(function (item) {
                    item.classList.toggle('active', item === tab);
                });
                currentTab = tab.getAttribute('data-tab') || 'upcoming';
                currentPage = 1;
                loadExams();
            });
        });
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                tableFilter = searchInput.value;
                currentPage = 1;
                renderTable();
            });
        }
        if (entriesSelect) {
            entriesSelect.addEventListener('change', function () {
                pageSize = parseInt(entriesSelect.value, 10) || 50;
                currentPage = 1;
                renderTable();
            });
        }
        if (table) {
            table.querySelectorAll('th[data-sort]').forEach(function (th) {
                th.addEventListener('click', function () {
                    var key = th.getAttribute('data-sort');
                    if (sortKey === key) {
                        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortKey = key;
                        sortDir = 'asc';
                    }
                    renderTable();
                });
            });
        }
        if (pagination) {
            pagination.addEventListener('click', function (event) {
                var btn = event.target.closest('.ugm-page-btn');
                if (!btn || btn.disabled) return;
                if (btn.dataset.nav === 'prev') currentPage -= 1;
                else if (btn.dataset.nav === 'next') currentPage += 1;
                else if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
                renderTable();
            });
        }
        if (tableBody) {
            tableBody.addEventListener('click', function (event) {
                var button = event.target.closest('.uhw-view-btn');
                if (!button) return;
                showExam(button.getAttribute('data-id')).catch(function (error) {
                    notify('error', 'Error', error.message || 'Failed to load exam details');
                });
            });
        }
        ['uoeExcelBtn', 'uoePdfBtn', 'uoeCsvBtn', 'uoePrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'excel';
                if (id === 'uoePdfBtn') type = 'pdf';
                else if (id === 'uoeCsvBtn') type = 'csv';
                else if (id === 'uoePrintBtn') type = 'print';
                exportTable(type);
            });
        });
        if (detailOverlay) detailOverlay.addEventListener('click', closeDetail);
        if (detailClose) detailClose.addEventListener('click', closeDetail);
        if (startBtn) startBtn.addEventListener('click', startExam);
        document.getElementById('uoeDetailPrint').addEventListener('click', function () {
            window.print();
        });
        document.getElementById('uoeNextBtn').addEventListener('click', function () {
            persistAnswerFromUi();
            saveProgress();
            if (examState.index < examState.questions.length - 1) {
                examState.index += 1;
                renderQuestion();
            }
        });
        document.getElementById('uoeQuestionMap').addEventListener('click', function (event) {
            var btn = event.target.closest('[data-index]');
            if (!btn) return;
            persistAnswerFromUi();
            saveProgress();
            examState.index = parseInt(btn.getAttribute('data-index'), 10) || 0;
            renderQuestion();
        });
        document.getElementById('uoeOptions').addEventListener('change', function () {
            persistAnswerFromUi();
            saveProgress();
        });
        document.getElementById('uoeSubmitBtn').addEventListener('click', async function () {
            var confirmed = await confirmAction(
                'Submit answers?',
                'Your answers will be submitted to the online exam.',
                'Submit'
            );
            if (confirmed) {
                submitExam(false);
            }
        });
        document.getElementById('uoeExamClose').addEventListener('click', function () {
            saveProgress().finally(function () {
                closeExamUi();
            });
        });
    }

    bindEvents();
    loadExams();
})();
