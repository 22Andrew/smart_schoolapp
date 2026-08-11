document.addEventListener('DOMContentLoaded', function () {
    const addExamBtn = document.getElementById('addExamBtn');
    const examTableBody = document.getElementById('examTableBody');
    const examTableHead = document.getElementById('examTableHead');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const closedBulkBar = document.getElementById('closedBulkBar');
    const selectAllExams = document.getElementById('selectAllExams');
    const bulkDeleteExamsBtn = document.getElementById('bulkDeleteExamsBtn');
    const examTabs = document.querySelectorAll('.exam-tab');
    const examForm = document.getElementById('examForm');
    const examModal = document.getElementById('examModal');
    const assignStudentModal = document.getElementById('assignStudentModal');
    const selectQuestionsModal = document.getElementById('selectQuestionsModal');
    const examQuestionsListModal = document.getElementById('examQuestionsListModal');
    const assignFilterForm = document.getElementById('assignFilterForm');
    const assignClassSelect = document.getElementById('assignClassSelect');
    const assignSectionSelect = document.getElementById('assignSectionSelect');
    const assignStudentSection = document.getElementById('assignStudentSection');
    const assignStudentTableBody = document.getElementById('assignStudentTableBody');
    const assignSelectAll = document.getElementById('assignSelectAll');
    const saveAssignBtn = document.getElementById('saveAssignBtn');
    const assignExamName = document.getElementById('assignExamName');
    const assignExamIdInput = document.getElementById('assignExamId');
    const sqSearchBtn = document.getElementById('sqSearchBtn');
    const selectQuestionsList = document.getElementById('selectQuestionsList');
    const saveSelectedQuestionsBtn = document.getElementById('saveSelectedQuestionsBtn');
    const selectQuestionsExamId = document.getElementById('selectQuestionsExamId');
    const selectQuestionsInfo = document.getElementById('selectQuestionsInfo');
    const examQuestionsList = document.getElementById('examQuestionsList');
    const subjectFilterTabs = document.getElementById('subjectFilterTabs');
    const examQuestionsListExamId = document.getElementById('examQuestionsListExamId');
    const examQuestionsListModalTitle = document.getElementById('examQuestionsListModalTitle');
    const sqSubject = document.getElementById('sqSubject');
    const sqClassSelect = document.getElementById('sqClassSelect');
    const sqSectionSelect = document.getElementById('sqSectionSelect');
    const examDescriptionEditor = document.getElementById('examDescriptionEditor');
    const examDescriptionToolbar = document.getElementById('examDescriptionToolbar');

    let currentTab = 'upcoming';
    let exams = [];
    let classes = [];
    let tags = [];
    let assignStudents = [];
    let selectQuestions = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    function showSuccess(message) {
        Swal.fire({ icon: 'success', title: 'Success', text: message, confirmButtonColor: '#8b5cf6' });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(data.message || 'Request failed');
        return data;
    }

    function openModal(modal) { if (modal) modal.hidden = false; }
    function closeModal(modal) { if (modal) modal.hidden = true; }

    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeModal(el.closest('.oe-modal'));
        });
    });

    function statusIcon(checked) {
        return checked
            ? '<span class="status-icon checked">✓</span>'
            : '<span class="status-icon info">!</span>';
    }

    function actionBtn(title, svg, attrs) {
        return '<button type="button" class="btn-action-icon" title="' + escapeHtml(title) + '" ' + (attrs || '') + '>' + svg + '</button>';
    }

    const actionIcons = {
        report: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',
        assign: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
        addQuestion: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
        questionList: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
        delete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        remove: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
    };

    function actionButtons(row) {
        const id = escapeHtml(String(row.id));
        const title = escapeHtml(row.title);
        return '<div class="action-icon-group">'
            + actionBtn('Report', actionIcons.report, 'data-action="report" data-id="' + id + '"')
            + actionBtn('Assign Student', actionIcons.assign, 'data-action="assign" data-id="' + id + '" data-title="' + title + '"')
            + actionBtn('Add Question', actionIcons.addQuestion, 'data-action="addQuestion" data-id="' + id + '"')
            + actionBtn('Edit', actionIcons.edit, 'data-action="edit" data-id="' + id + '"')
            + actionBtn('Exam Questions List', actionIcons.questionList, 'data-action="questionList" data-id="' + id + '" data-title="' + title + '"')
            + actionBtn('Delete', actionIcons.delete, 'data-action="delete" data-id="' + id + '"')
            + '</div>';
    }

    function renderTableHead() {
        if (currentTab === 'closed') {
            examTableHead.innerHTML = '<tr><th><input type="checkbox" id="selectAllRows"></th><th>#</th><th>Exam</th><th>Quiz</th><th>Questions</th><th>Attempt</th><th>Exam From</th><th>Exam To</th><th>Duration</th><th>Exam Published</th><th>Result Published</th><th>Description</th><th>Action</th></tr>';
            const selectAllRows = document.getElementById('selectAllRows');
            if (selectAllRows) {
                selectAllRows.addEventListener('change', function () {
                    document.querySelectorAll('.exam-row-check').forEach(function (cb) { cb.checked = selectAllRows.checked; });
                });
            }
        } else {
            examTableHead.innerHTML = '<tr><th>Exam</th><th>Quiz</th><th>Questions</th><th>Attempt</th><th>Exam From</th><th>Exam To</th><th>Duration</th><th>Exam Published</th><th>Result Published</th><th>Description</th><th>Action</th></tr>';
        }
    }

    function getFiltered() {
        let rows = exams.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            rows = rows.filter(function (row) {
                return [row.title, row.questionsDisplay, row.examFrom, row.examTo, row.description].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        return rows;
    }

    function renderPagination(total, totalPages) {
        let html = '<button type="button" class="pagination-btn" data-nav="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn' + (page === currentPage ? ' active' : '') + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"' + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        renderTableHead();
        closedBulkBar.hidden = currentTab !== 'closed';
        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            noRecordBanner.hidden = false;
            examTableBody.innerHTML = '';
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }
        noRecordBanner.hidden = true;
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        examTableBody.innerHTML = pageRows.map(function (row, index) {
            const common = ''
                + '<td class="exam-title-cell">' + escapeHtml(row.title) + '</td>'
                + '<td>' + (row.quiz ? '✓' : '') + '</td>'
                + '<td>' + escapeHtml(row.questionsDisplay || '0 (Descriptive: 0)') + '</td>'
                + '<td>' + escapeHtml(String(row.attempt || 0)) + '</td>'
                + '<td>' + escapeHtml(row.examFrom || '') + '</td>'
                + '<td>' + escapeHtml(row.examTo || '') + '</td>'
                + '<td>' + escapeHtml(row.timeDuration || '') + '</td>'
                + '<td>' + statusIcon(row.publishExam) + '</td>'
                + '<td>' + statusIcon(row.publishResult) + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td class="action-cell">' + actionButtons(row) + '</td>';
            if (currentTab === 'closed') {
                return '<tr data-id="' + escapeHtml(String(row.id)) + '"><td><input type="checkbox" class="exam-row-check" value="' + escapeHtml(String(row.id)) + '"></td><td>' + (start + index + 1) + '</td>' + common + '</tr>';
            }
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">' + common + '</tr>';
        }).join('');

        showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        renderPagination(total, totalPages);
    }

    async function loadExams() {
        exams = await fetchJson('/api/online-exams?status=' + encodeURIComponent(currentTab));
        currentPage = 1;
        renderTable();
    }

    function populateClassSelect(selectEl) {
        selectEl.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateSectionSelect(selectEl, classId) {
        const selectedClass = classes.find(function (item) { return String(item.id) === String(classId); });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        selectEl.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
    }

    function populateTagSelect() {
        sqSubject.innerHTML = '<option value="">Select</option>' + tags.map(function (tag) {
            return '<option value="' + tag.id + '">' + escapeHtml(tag.tagName || tag.name || tag.questionTag) + '</option>';
        }).join('');
    }

    function resetExamForm() {
        document.getElementById('examId').value = '';
        document.getElementById('examTitle').value = '';
        document.getElementById('examQuiz').checked = false;
        document.getElementById('examFrom').value = '';
        document.getElementById('examTo').value = '';
        document.getElementById('autoResultPublishDate').value = '';
        document.getElementById('timeDuration').value = '01:00:00';
        document.getElementById('examAttempt').value = '1';
        document.getElementById('passingPercentage').value = '40';
        document.getElementById('answerWordLimit').value = '-1';
        document.getElementById('publishExam').checked = false;
        document.getElementById('publishResult').checked = false;
        document.getElementById('negativeMarking').checked = false;
        document.getElementById('displayMarksInExam').checked = false;
        document.getElementById('randomQuestionOrder').checked = false;
        if (examDescriptionEditor) examDescriptionEditor.innerHTML = '';
    }

    async function openExamModal(mode, examId) {
        resetExamForm();
        document.getElementById('examModalTitle').textContent = mode === 'edit' ? 'Exam' : 'Exam';
        if (mode === 'edit' && examId) {
            const exam = await fetchJson('/api/online-exams/' + encodeURIComponent(examId));
            document.getElementById('examId').value = String(exam.id);
            document.getElementById('examTitle').value = exam.title || '';
            document.getElementById('examQuiz').checked = !!exam.quiz;
            document.getElementById('examFrom').value = exam.examFromInput || '';
            document.getElementById('examTo').value = exam.examToInput || '';
            document.getElementById('autoResultPublishDate').value = exam.autoResultPublishDateInput || '';
            document.getElementById('timeDuration').value = exam.timeDuration || '01:00:00';
            document.getElementById('examAttempt').value = String(exam.attempt || 1);
            document.getElementById('passingPercentage').value = String(exam.passingPercentage || 40);
            document.getElementById('answerWordLimit').value = String(exam.answerWordLimit != null ? exam.answerWordLimit : -1);
            document.getElementById('publishExam').checked = !!exam.publishExam;
            document.getElementById('publishResult').checked = !!exam.publishResult;
            document.getElementById('negativeMarking').checked = !!exam.negativeMarking;
            document.getElementById('displayMarksInExam').checked = !!exam.displayMarksInExam;
            document.getElementById('randomQuestionOrder').checked = !!exam.randomQuestionOrder;
            if (examDescriptionEditor) examDescriptionEditor.innerHTML = exam.description || '';
        }
        openModal(examModal);
    }

    examForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = {
            title: document.getElementById('examTitle').value.trim(),
            quiz: document.getElementById('examQuiz').checked,
            examFrom: document.getElementById('examFrom').value,
            examTo: document.getElementById('examTo').value,
            autoResultPublishDate: document.getElementById('autoResultPublishDate').value,
            timeDuration: document.getElementById('timeDuration').value.trim(),
            attempt: document.getElementById('examAttempt').value,
            passingPercentage: document.getElementById('passingPercentage').value,
            answerWordLimit: document.getElementById('answerWordLimit').value,
            publishExam: document.getElementById('publishExam').checked,
            publishResult: document.getElementById('publishResult').checked,
            negativeMarking: document.getElementById('negativeMarking').checked,
            displayMarksInExam: document.getElementById('displayMarksInExam').checked,
            randomQuestionOrder: document.getElementById('randomQuestionOrder').checked,
            description: examDescriptionEditor ? examDescriptionEditor.innerHTML : ''
        };
        const examId = document.getElementById('examId').value;
        const url = examId ? '/api/online-exams/' + encodeURIComponent(examId) : '/api/online-exams';
        const method = examId ? 'PUT' : 'POST';
        try {
            const response = await fetchJson(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            showSuccess(response.message || 'Exam saved successfully!');
            closeModal(examModal);
            await loadExams();
        } catch (error) { showError(error); }
    });

    function openAssignModal(examId, title) {
        assignExamIdInput.value = String(examId);
        assignExamName.textContent = title || '';
        assignStudentSection.hidden = true;
        assignStudentTableBody.innerHTML = '';
        populateClassSelect(assignClassSelect);
        populateSectionSelect(assignSectionSelect, '');
        openModal(assignStudentModal);
    }

    assignClassSelect.addEventListener('change', function () {
        populateSectionSelect(assignSectionSelect, assignClassSelect.value);
    });
    sqClassSelect.addEventListener('change', function () {
        populateSectionSelect(sqSectionSelect, sqClassSelect.value);
    });

    assignFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const classId = assignClassSelect.value;
        const section = assignSectionSelect.value || '';
        if (!classId) { showError({ message: 'Class is required.' }); return; }
        try {
            assignStudents = await fetchJson('/api/online-exams/' + encodeURIComponent(assignExamIdInput.value)
                + '/students?classId=' + encodeURIComponent(classId) + '&section=' + encodeURIComponent(section));
            assignStudentSection.hidden = false;
            assignStudentTableBody.innerHTML = assignStudents.map(function (student) {
                return '<tr><td><input type="checkbox" class="assign-student-check" value="' + escapeHtml(String(student.id)) + '"' + (student.assigned ? ' checked' : '') + '></td>'
                    + '<td>' + escapeHtml(student.admissionNo) + '</td><td>' + escapeHtml(student.studentName) + '</td><td>' + escapeHtml(student.classDisplay) + '</td>'
                    + '<td>' + escapeHtml(student.fatherName) + '</td><td>' + escapeHtml(student.category) + '</td><td>' + escapeHtml(student.gender) + '</td></tr>';
            }).join('');
        } catch (error) { showError(error); }
    });

    assignSelectAll.addEventListener('change', function () {
        document.querySelectorAll('.assign-student-check').forEach(function (cb) { cb.checked = assignSelectAll.checked; });
    });

    saveAssignBtn.addEventListener('click', async function () {
        const studentIds = Array.from(document.querySelectorAll('.assign-student-check:checked')).map(function (cb) {
            return parseInt(cb.value, 10);
        }).filter(function (id) { return !isNaN(id); });
        if (!studentIds.length) {
            showError({ message: 'Select at least one student.' });
            return;
        }
        try {
            const response = await fetchJson('/api/online-exams/' + encodeURIComponent(assignExamIdInput.value) + '/students', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentIds: studentIds })
            });
            showSuccess(response.message || 'Students assigned successfully!');
            closeModal(assignStudentModal);
        } catch (error) { showError(error); }
    });

    async function openSelectQuestionsModal(examId) {
        selectQuestionsExamId.value = String(examId);
        selectQuestions = [];
        selectQuestionsList.innerHTML = '';
        selectQuestionsInfo.textContent = 'Showing 0 questions';
        populateTagSelect();
        populateClassSelect(sqClassSelect);
        populateSectionSelect(sqSectionSelect, '');
        openModal(selectQuestionsModal);
        await searchSelectQuestions();
    }

    async function searchSelectQuestions() {
        const filters = {
            keyword: document.getElementById('sqKeyword').value.trim(),
            questionType: document.getElementById('sqQuestionType').value,
            questionLevel: document.getElementById('sqQuestionLevel').value,
            tagId: sqSubject.value || null,
            classId: sqClassSelect.value || null,
            section: sqSectionSelect.value || null
        };
        selectQuestions = await fetchJson('/api/online-exams/questions/search', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filters)
        });
        selectQuestionsList.innerHTML = selectQuestions.map(function (q) {
            return '<div class="select-question-item"><label><input type="checkbox" class="select-question-check" value="' + escapeHtml(String(q.id)) + '"><div><strong>Q. ID: ' + escapeHtml(String(q.id)) + '</strong><div>' + escapeHtml(q.questionText) + '</div><div class="question-meta-row"><span>Marks: ' + escapeHtml(String(q.marks)) + '</span><span>Negative Marks: ' + escapeHtml(String(q.negativeMarks)) + '</span><span>Question Type: ' + escapeHtml(q.questionType) + '</span><span>Level: ' + escapeHtml(q.level) + '</span><span>Subject: ' + escapeHtml(q.subjectDisplay || q.subject) + '</span></div></div></label></div>';
        }).join('');
        selectQuestionsInfo.textContent = 'Showing 1 To ' + selectQuestions.length + ' Of ' + selectQuestions.length + ' Search';
    }

    sqSearchBtn.addEventListener('click', function () { searchSelectQuestions().catch(showError); });

    saveSelectedQuestionsBtn.addEventListener('click', async function () {
        const selectedIds = Array.from(document.querySelectorAll('.select-question-check:checked')).map(function (cb) { return cb.value; });
        const questions = selectedIds.map(function (id) {
            const q = selectQuestions.find(function (item) { return String(item.id) === String(id); });
            return q ? { questionId: q.id, marks: q.marks, negativeMarks: q.negativeMarks, subject: q.subject } : { questionId: id };
        });
        if (!questions.length) { showError({ message: 'Select at least one question.' }); return; }
        try {
            const response = await fetchJson('/api/online-exams/' + encodeURIComponent(selectQuestionsExamId.value) + '/questions', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questions: questions })
            });
            showSuccess(response.message || 'Questions added successfully!');
            closeModal(selectQuestionsModal);
            await loadExams();
        } catch (error) { showError(error); }
    });

    async function openExamQuestionsListModal(examId, title) {
        examQuestionsListExamId.value = String(examId);
        examQuestionsListModalTitle.textContent = title || 'General Test';
        const subjects = await fetchJson('/api/online-exams/' + encodeURIComponent(examId) + '/question-subjects');
        subjectFilterTabs.innerHTML = '<button type="button" class="subject-tab active" data-subject="All">All</button>'
            + subjects.map(function (subject) {
                return '<button type="button" class="subject-tab" data-subject="' + escapeHtml(subject) + '">' + escapeHtml(subject) + '</button>';
            }).join('');
        openModal(examQuestionsListModal);
        await loadExamQuestionsList('All');
    }

    async function loadExamQuestionsList(subject) {
        const rows = await fetchJson('/api/online-exams/' + encodeURIComponent(examQuestionsListExamId.value) + '/questions?subject=' + encodeURIComponent(subject || 'All'));
        examQuestionsList.innerHTML = rows.map(function (q) {
            return '<div class="exam-question-item"><div class="exam-question-row"><button type="button" class="btn-action-icon" data-remove-question="' + escapeHtml(String(q.questionId)) + '" title="Delete">' + actionIcons.remove + '</button><div><strong>Q. ID : ' + escapeHtml(String(q.questionId)) + '</strong><div>' + escapeHtml(q.questionText) + '</div><div class="question-meta-row"><span>Question Type: ' + escapeHtml(q.questionType) + '</span><span>Level: ' + escapeHtml(q.level) + '</span><span>Subject: ' + escapeHtml(q.subjectDisplay || q.subject) + '</span></div></div></div></div>';
        }).join('');
    }

    subjectFilterTabs.addEventListener('click', function (event) {
        const tab = event.target.closest('.subject-tab');
        if (!tab) return;
        document.querySelectorAll('.subject-tab').forEach(function (el) { el.classList.remove('active'); });
        tab.classList.add('active');
        loadExamQuestionsList(tab.getAttribute('data-subject')).catch(showError);
    });

    examQuestionsList.addEventListener('click', async function (event) {
        const btn = event.target.closest('[data-remove-question]');
        if (!btn) return;
        const questionId = btn.getAttribute('data-remove-question');
        try {
            await fetchJson('/api/online-exams/' + encodeURIComponent(examQuestionsListExamId.value) + '/questions/' + encodeURIComponent(questionId), { method: 'DELETE' });
            const active = document.querySelector('.subject-tab.active');
            await loadExamQuestionsList(active ? active.getAttribute('data-subject') : 'All');
            await loadExams();
        } catch (error) { showError(error); }
    });

    examTableBody.addEventListener('click', async function (event) {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title') || '';
        if (action === 'edit') openExamModal('edit', id).catch(showError);
        else if (action === 'assign') openAssignModal(id, title);
        else if (action === 'addQuestion') openSelectQuestionsModal(id).catch(showError);
        else if (action === 'questionList') openExamQuestionsListModal(id, title).catch(showError);
        else if (action === 'delete') {
            const result = await Swal.fire({ icon: 'warning', title: 'Delete exam?', showCancelButton: true, confirmButtonColor: '#8b5cf6' });
            if (!result.isConfirmed) return;
            try {
                const response = await fetchJson('/api/online-exams/' + encodeURIComponent(id), { method: 'DELETE' });
                showSuccess(response.message || 'Exam deleted successfully!');
                await loadExams();
            } catch (error) { showError(error); }
        }
    });

    bulkDeleteExamsBtn.addEventListener('click', async function () {
        const ids = Array.from(document.querySelectorAll('.exam-row-check:checked')).map(function (cb) { return parseInt(cb.value, 10); });
        if (!ids.length) { showError({ message: 'Select at least one exam.' }); return; }
        const result = await Swal.fire({ icon: 'warning', title: 'Delete selected exams?', showCancelButton: true, confirmButtonColor: '#8b5cf6' });
        if (!result.isConfirmed) return;
        try {
            const response = await fetchJson('/api/online-exams/bulk-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ids }) });
            showSuccess(response.message || 'Exams deleted successfully!');
            await loadExams();
        } catch (error) { showError(error); }
    });

    selectAllExams.addEventListener('change', function () {
        document.querySelectorAll('.exam-row-check').forEach(function (cb) { cb.checked = selectAllExams.checked; });
    });

    examTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            examTabs.forEach(function (el) { el.classList.remove('active'); });
            tab.classList.add('active');
            currentTab = tab.getAttribute('data-tab');
            loadExams().catch(showError);
        });
    });

    addExamBtn.addEventListener('click', function () { openExamModal('add').catch(showError); });
    tableSearchInput.addEventListener('input', function () { tableFilter = tableSearchInput.value; currentPage = 1; renderTable(); });
    entriesSelect.addEventListener('change', function () { pageSize = parseInt(entriesSelect.value, 10) || 50; currentPage = 1; renderTable(); });
    pagination.addEventListener('click', function (event) {
        const pageBtn = event.target.closest('[data-page]');
        const navBtn = event.target.closest('[data-nav]');
        const filtered = getFiltered();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
        if (pageBtn) { currentPage = parseInt(pageBtn.getAttribute('data-page'), 10); renderTable(); }
        else if (navBtn) {
            if (navBtn.getAttribute('data-nav') === 'prev' && currentPage > 1) { currentPage -= 1; renderTable(); }
            else if (navBtn.getAttribute('data-nav') === 'next' && currentPage < totalPages) { currentPage += 1; renderTable(); }
        }
    });

    if (examDescriptionToolbar) {
        examDescriptionToolbar.addEventListener('click', function (event) {
            const btn = event.target.closest('[data-cmd]');
            if (!btn) return;
            document.execCommand(btn.getAttribute('data-cmd'), false, null);
            examDescriptionEditor.focus();
        });
    }

    async function loadInitialData() {
        classes = await fetchJson('/api/classes');
        tags = await fetchJson('/api/online-course-question-tags').catch(function () { return []; });
        populateClassSelect(assignClassSelect);
        populateClassSelect(sqClassSelect);
        populateTagSelect();
        await loadExams();
    }

    loadInitialData().catch(showError);
});
