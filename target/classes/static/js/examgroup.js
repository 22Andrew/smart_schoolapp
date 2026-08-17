document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('examGroupTable');
    const tableBody = document.getElementById('examGroupTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput');
    const examGroupForm = document.getElementById('examGroupForm');
    const examGroupNameInput = document.getElementById('examGroupName');
    const examGroupTypeInput = document.getElementById('examGroupType');
    const examGroupDescriptionInput = document.getElementById('examGroupDescription');
    const examGroupIdInput = document.getElementById('examGroupId');
    const saveBtn = document.getElementById('saveBtn');
    const entriesSelect = document.getElementById('entriesSelect');
    const pagination = document.getElementById('pagination');

    let groups = [];
    let currentPage = 1;
    let pageSize = 50;
    let activeGroupId = null;
    let activeGroupExamId = null;
    let groupExams = [];
    let schoolClasses = [];
    let formOptions = { subjects: [], sessions: [], marksheetTemplates: [] };
    let activeSubjectEntryId = null;
    let enterMarksRows = [];
    let enterMarksFilteredRows = [];

    const examListModal = document.getElementById('examListModal');
    const newExamModal = document.getElementById('newExamModal');
    const assignStudentModal = document.getElementById('assignStudentModal');
    const examListTableBody = document.getElementById('examListTableBody');
    const newExamForm = document.getElementById('newExamForm');
    const newExamNameInput = document.getElementById('newExamNameInput');

    const examListActionIcons = {
        assign: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
        subject: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        marks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
        remarks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
        rank: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
        del: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    };

    function examListActionBtn(className, title, icon) {
        return '<button type="button" class="btn-action ' + className + '" title="' + escapeHtml(title) + '">' + icon + '</button>';
    }

    function createExamListActionsHtml(examId) {
        return '<div class="action-buttons">'
            + examListActionBtn('btn-assign-student', 'Assign / View Student', examListActionIcons.assign)
            + examListActionBtn('btn-exam-subject', 'Exam Subject', examListActionIcons.subject)
            + examListActionBtn('btn-exam-marks', 'Exam Marks', examListActionIcons.marks)
            + examListActionBtn('btn-exam-remarks', 'Teacher Remarks', examListActionIcons.remarks)
            + examListActionBtn('btn-exam-edit', 'Edit', examListActionIcons.edit)
            + examListActionBtn('btn-exam-rank', 'Generate Rank', examListActionIcons.rank)
            + examListActionBtn('btn-exam-delete', 'Delete', examListActionIcons.del)
            + '</div>';
    }

    function closeExamListModal() {
        if (examListModal) examListModal.hidden = true;
        document.body.style.overflow = '';
    }

    function closeNewExamModal() {
        if (newExamModal) newExamModal.hidden = true;
        if (newExamForm) newExamForm.reset();
    }

    function openNewExamModal() {
        if (!newExamModal) return;
        if (newExamForm) newExamForm.reset();
        newExamModal.hidden = false;
        newExamNameInput?.focus();
    }

    async function loadGroupExams(groupId) {
        const response = await fetch('/api/exam-groups/' + groupId + '/exams');
        if (!response.ok) throw new Error('Failed to load exams');
        groupExams = await response.json();
    }

    function renderExamListTable() {
        if (!examListTableBody) return;
        if (!groupExams.length) {
            examListTableBody.innerHTML = '<tr><td colspan="7"><div class="exam-list-empty">No exams found for this group.</div></td></tr>';
            return;
        }
        examListTableBody.innerHTML = groupExams.map(function (exam) {
            return '<tr data-exam-id="' + escapeHtml(String(exam.id)) + '">'
                + '<td>' + escapeHtml(exam.name || '') + '</td>'
                + '<td>' + escapeHtml(exam.session || '2026-27') + '</td>'
                + '<td>' + escapeHtml(String(exam.subjectsIncluded != null ? exam.subjectsIncluded : 0)) + '</td>'
                + '<td><input type="checkbox" class="publish-check" ' + (exam.publishExam ? 'checked' : '') + ' disabled></td>'
                + '<td><input type="checkbox" class="publish-check" ' + (exam.publishResult ? 'checked' : '') + ' disabled></td>'
                + '<td>' + escapeHtml(exam.description || '') + '</td>'
                + '<td>' + createExamListActionsHtml(exam.id) + '</td>'
                + '</tr>';
        }).join('');
    }

    async function openExamListModal(row) {
        activeGroupId = row.getAttribute('data-id');
        document.getElementById('examListGroupName').textContent = row.getAttribute('data-name') || '';
        document.getElementById('examListGroupType').textContent = row.getAttribute('data-exam-type') || '';
        const description = row.getAttribute('data-description') || '';
        document.getElementById('examListGroupDescription').textContent = description.trim() ? description : '—';
        try {
            await loadGroupExams(activeGroupId);
            renderExamListTable();
            if (examListModal) {
                examListModal.hidden = false;
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load exam list.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    document.querySelectorAll('[data-close-exam-list]').forEach(function (el) {
        el.addEventListener('click', closeExamListModal);
    });

    document.querySelectorAll('[data-close-new-exam]').forEach(function (el) {
        el.addEventListener('click', closeNewExamModal);
    });

    async function loadSchoolClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        schoolClasses = await response.json();
    }

    function fillAssignClassSelect(selectedClassId) {
        const classSelect = document.getElementById('assignClassSelect');
        if (!classSelect) return;
        classSelect.innerHTML = '<option value="">Select</option>';
        schoolClasses.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            if (selectedClassId && String(item.id) === String(selectedClassId)) {
                option.selected = true;
            }
            classSelect.appendChild(option);
        });
    }

    function fillAssignSectionSelect(selectedSection) {
        const classSelect = document.getElementById('assignClassSelect');
        const sectionSelect = document.getElementById('assignSectionSelect');
        if (!classSelect || !sectionSelect) return;

        const selectedClass = schoolClasses.find(function (item) {
            return String(item.id) === String(classSelect.value);
        });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];

        sectionSelect.innerHTML = '<option value="">Select</option>';
        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            if (selectedSection && value.toLowerCase() === String(selectedSection).toLowerCase()) {
                option.selected = true;
            }
            sectionSelect.appendChild(option);
        });
    }

    function renderAssignStudentTable(rows) {
        const tbody = document.getElementById('assignStudentTableBody');
        const assignAll = document.getElementById('assignAllStudents');
        if (assignAll) assignAll.checked = false;
        if (!tbody) return;

        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">No students found</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map(function (row) {
            return '<tr><td><input type="checkbox" class="student-assign-check" data-id="' + row.id + '"' + (row.assigned ? ' checked' : '') + '></td>'
                + '<td>' + escapeHtml(row.admissionNo) + '</td>'
                + '<td>' + escapeHtml(row.studentName) + '</td>'
                + '<td>' + escapeHtml(row.fatherName || '') + '</td>'
                + '<td>' + escapeHtml(row.category || '') + '</td>'
                + '<td>' + escapeHtml(row.gender || '') + '</td></tr>';
        }).join('');
    }

    async function loadAssignStudents() {
        const classSelect = document.getElementById('assignClassSelect');
        const sectionSelect = document.getElementById('assignSectionSelect');
        const classId = classSelect ? classSelect.value : '';
        const section = sectionSelect ? sectionSelect.value : '';
        if (!activeGroupId || !activeGroupExamId || !classId || !section) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select class and section.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        const url = '/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId
            + '/students?classId=' + encodeURIComponent(classId) + '&section=' + encodeURIComponent(section);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load students');
        renderAssignStudentTable(await response.json());
    }

    async function openAssignStudentModal(examId) {
        activeGroupExamId = examId;
        if (!schoolClasses.length) {
            await loadSchoolClasses();
        }

        const defaultClass = schoolClasses.length ? schoolClasses[0] : null;
        fillAssignClassSelect(defaultClass ? defaultClass.id : '');
        const defaultSection = defaultClass && defaultClass.sections && defaultClass.sections.length
            ? defaultClass.sections[0] : '';
        fillAssignSectionSelect(defaultSection);

        if (assignStudentModal) {
            assignStudentModal.hidden = false;
        }

        if (defaultClass && defaultSection) {
            await loadAssignStudents();
        } else {
            renderAssignStudentTable([]);
        }
    }

    function closeAssignStudentModal() {
        if (assignStudentModal) assignStudentModal.hidden = true;
        activeGroupExamId = null;
    }

    document.querySelectorAll('[data-close-assign-modal]').forEach(function (el) {
        el.addEventListener('click', closeAssignStudentModal);
    });

    document.getElementById('assignClassSelect')?.addEventListener('change', function () {
        fillAssignSectionSelect('');
    });

    document.getElementById('searchAssignStudentsBtn')?.addEventListener('click', async function () {
        try {
            await loadAssignStudents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load students.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    document.getElementById('assignAllStudents')?.addEventListener('change', function () {
        const checked = this.checked;
        document.querySelectorAll('#assignStudentTableBody .student-assign-check').forEach(function (cb) {
            cb.checked = checked;
        });
    });

    document.getElementById('saveAssignStudentsBtn')?.addEventListener('click', async function () {
        if (!activeGroupId || !activeGroupExamId) return;
        const ids = Array.from(document.querySelectorAll('#assignStudentTableBody .student-assign-check:checked'))
            .map(function (cb) { return parseInt(cb.dataset.id, 10); });
        try {
            const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId + '/students', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentIds: ids })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save');
            closeAssignStudentModal();
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save students.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function openEgModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.hidden = false;
    }

    function closeEgModal(modal) {
        if (modal) modal.hidden = true;
    }

    document.querySelectorAll('[data-close-eg-modal]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeEgModal(el.closest('.cbse-modal'));
        });
    });

    document.querySelectorAll('[data-close-enter-marks]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeEgModal(document.getElementById('enterMarksModal'));
            activeSubjectEntryId = null;
            enterMarksRows = [];
            enterMarksFilteredRows = [];
        });
    });

    async function ensureFormOptions() {
        if (formOptions.subjects && formOptions.subjects.length) return;
        const response = await fetch('/api/exam-groups/form-options');
        if (!response.ok) throw new Error('Failed to load form options');
        formOptions = await response.json();
    }

    function fillSelectOptions(select, items, valueKey, labelKey, selected) {
        if (!select) return;
        select.innerHTML = '<option value="">Select</option>';
        (items || []).forEach(function (item) {
            const option = document.createElement('option');
            if (typeof item === 'string') {
                option.value = item;
                option.textContent = item;
                if (selected && item === selected) option.selected = true;
            } else {
                option.value = String(item[valueKey]);
                option.textContent = item[labelKey];
                if (selected && String(item[valueKey]) === String(selected)) option.selected = true;
            }
            select.appendChild(option);
        });
    }

    function buildSubjectRow(row) {
        const subjectOptions = (formOptions.subjects || []).map(function (s) {
            return '<option value="' + escapeHtml(s) + '"' + (row && row.subjectName === s ? ' selected' : '') + '>' + escapeHtml(s) + '</option>';
        }).join('');
        return '<tr class="subject-row">'
            + '<td><select class="subject-name-select"><option value="">Select</option>' + subjectOptions + '</select></td>'
            + '<td><input type="date" class="subject-date" value="' + escapeHtml(row && row.examDate ? row.examDate : '') + '"></td>'
            + '<td><input type="time" class="subject-time" value="' + escapeHtml(row && row.startTime ? row.startTime.substring(0, 8) : '') + '" step="1"></td>'
            + '<td><input type="number" class="subject-duration" value="' + escapeHtml(row && row.durationMinutes != null ? row.durationMinutes : '60') + '"></td>'
            + '<td><input type="number" class="subject-credit" step="0.01" value="' + escapeHtml(row && row.creditHours ? row.creditHours : '1.00') + '"></td>'
            + '<td><input type="text" class="subject-room" value="' + escapeHtml(row && row.roomNo ? row.roomNo : '') + '"></td>'
            + '<td><input type="number" class="subject-max" step="0.01" value="' + escapeHtml(row && row.marksMax ? row.marksMax : '100.00') + '"></td>'
            + '<td><input type="number" class="subject-min" step="0.01" value="' + escapeHtml(row && row.marksMin ? row.marksMin : '33.00') + '"></td>'
            + '<td><button type="button" class="btn-remove-row">&times;</button></td></tr>';
    }

    async function openSubjectModal(examId) {
        activeGroupExamId = examId;
        await ensureFormOptions();
        const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + examId + '/subjects');
        if (!response.ok) throw new Error('Failed to load exam subjects');
        const data = await response.json();
        document.getElementById('subjectModalExamName').textContent = data.examName || '';
        document.getElementById('subjectModalExamGroup').textContent = data.examGroupName || '';
        const rows = data.subjects || [];
        const tbody = document.getElementById('examSubjectEntryBody');
        tbody.innerHTML = rows.length ? rows.map(buildSubjectRow).join('') : buildSubjectRow(null);
        openEgModal('examSubjectModal');
    }

    document.getElementById('addSubjectRowBtn')?.addEventListener('click', function () {
        document.getElementById('examSubjectEntryBody').insertAdjacentHTML('beforeend', buildSubjectRow(null));
    });

    document.getElementById('examSubjectEntryBody')?.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.btn-remove-row');
        if (removeBtn) {
            const row = e.target.closest('.subject-row');
            if (row) row.remove();
        }
    });

    document.getElementById('saveExamSubjectsBtn')?.addEventListener('click', async function () {
        if (!activeGroupId || !activeGroupExamId) return;
        const subjects = Array.from(document.querySelectorAll('#examSubjectEntryBody .subject-row')).map(function (row) {
            return {
                subjectName: row.querySelector('.subject-name-select').value,
                examDate: row.querySelector('.subject-date').value,
                startTime: row.querySelector('.subject-time').value,
                durationMinutes: row.querySelector('.subject-duration').value,
                creditHours: row.querySelector('.subject-credit').value,
                roomNo: row.querySelector('.subject-room').value,
                marksMax: row.querySelector('.subject-max').value,
                marksMin: row.querySelector('.subject-min').value
            };
        }).filter(function (s) { return s.subjectName; });
        try {
            const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId + '/subjects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects: subjects })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save subjects');
            closeEgModal(document.getElementById('examSubjectModal'));
            await loadGroupExams(activeGroupId);
            renderExamListTable();
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    const marksEntryIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>';

    async function openMarksModal(examId) {
        activeGroupExamId = examId;
        const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + examId + '/marks-view');
        if (!response.ok) throw new Error('Failed to load exam marks view');
        const data = await response.json();
        document.getElementById('marksModalExamName').textContent = data.examName || '';
        document.getElementById('marksModalExamGroup').textContent = data.examGroupName || '';
        const rows = data.subjects || [];
        document.getElementById('examMarksTableBody').innerHTML = rows.length ? rows.map(function (row) {
            return '<tr data-subject-id="' + escapeHtml(String(row.id)) + '"><td>' + escapeHtml(row.subject) + '</td><td>' + escapeHtml(row.dateFrom) + '</td><td>' + escapeHtml(row.startTime) + '</td><td>' + escapeHtml(row.duration != null ? row.duration : '') + '</td><td>' + escapeHtml(row.roomNo || '') + '</td><td>' + escapeHtml(row.marksMax || '') + '</td><td>' + escapeHtml(row.marksMin || '') + '</td><td><button type="button" class="btn-action btn-marks-entry" title="Enter Marks">' + marksEntryIcon + '</button></td></tr>';
        }).join('') : '<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748b;">No subjects found</td></tr>';
        openEgModal('examMarksModal');
    }

    document.getElementById('examMarksTableBody')?.addEventListener('click', async function (e) {
        const btn = e.target.closest('.btn-marks-entry');
        if (!btn || !activeGroupId || !activeGroupExamId) return;
        const row = e.target.closest('tr[data-subject-id]');
        if (!row) return;
        activeSubjectEntryId = row.getAttribute('data-subject-id');
        try {
            await openEnterMarksModal();
        } catch (error) { showError(error); }
    });

    function fillEnterMarksClassSelect(selectedClassId) {
        const classSelect = document.getElementById('enterMarksClassSelect');
        if (!classSelect) return;
        classSelect.innerHTML = '<option value="">Select</option>';
        schoolClasses.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            if (selectedClassId && String(item.id) === String(selectedClassId)) {
                option.selected = true;
            }
            classSelect.appendChild(option);
        });
    }

    function fillEnterMarksSectionSelect(selectedSection) {
        const classSelect = document.getElementById('enterMarksClassSelect');
        const sectionSelect = document.getElementById('enterMarksSectionSelect');
        if (!classSelect || !sectionSelect) return;
        const selectedClass = schoolClasses.find(function (item) {
            return String(item.id) === String(classSelect.value);
        });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        sectionSelect.innerHTML = '<option value="">Select</option>';
        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            if (selectedSection && value.toLowerCase() === String(selectedSection).toLowerCase()) {
                option.selected = true;
            }
            sectionSelect.appendChild(option);
        });
    }

    function fillEnterMarksSessionSelect(selectedSession) {
        fillSelectOptions(document.getElementById('enterMarksSessionSelect'), formOptions.sessions, null, null, selectedSession);
    }

    function buildEnterMarksRowHtml(item) {
        const absent = !!item.absent;
        return '<tr data-student-id="' + escapeHtml(String(item.studentId)) + '" data-admission-no="' + escapeHtml(item.admissionNo || '') + '">'
            + '<td>' + escapeHtml(item.admissionNo || '') + '</td>'
            + '<td>' + escapeHtml(item.rollNumber || '-') + '</td>'
            + '<td>' + escapeHtml(item.studentName || '') + '</td>'
            + '<td>' + escapeHtml(item.fatherName || '') + '</td>'
            + '<td>' + escapeHtml(item.category || '') + '</td>'
            + '<td>' + escapeHtml(item.gender || '') + '</td>'
            + '<td class="attendance-cell"><label><input type="checkbox" class="absent-check"' + (absent ? ' checked' : '') + '> Absent</label></td>'
            + '<td><input type="number" class="marks-cell-input" step="0.01" value="' + escapeHtml(absent ? '' : (item.marksObtained || '')) + '"' + (absent ? ' disabled' : '') + '></td>'
            + '<td><input type="text" class="note-cell-input" value="' + escapeHtml(item.note || '') + '"' + (absent ? ' disabled' : '') + '></td>'
            + '</tr>';
    }

    function syncEnterMarksFromDom() {
        document.querySelectorAll('#enterMarksTableBody tr[data-student-id]').forEach(function (row) {
            const studentId = parseInt(row.getAttribute('data-student-id'), 10);
            const index = enterMarksRows.findIndex(function (item) { return item.studentId === studentId; });
            if (index === -1) return;
            const absentCheck = row.querySelector('.absent-check');
            const absent = absentCheck ? absentCheck.checked : false;
            enterMarksRows[index] = Object.assign({}, enterMarksRows[index], {
                absent: absent,
                marksObtained: absent ? '' : (row.querySelector('.marks-cell-input')?.value || ''),
                note: absent ? '' : (row.querySelector('.note-cell-input')?.value || '')
            });
        });
    }

    function renderEnterMarksTable() {
        syncEnterMarksFromDom();
        const tbody = document.getElementById('enterMarksTableBody');
        const info = document.getElementById('enterMarksShowingInfo');
        const searchTerm = (document.getElementById('enterMarksTableSearch')?.value || '').toLowerCase().trim();
        enterMarksFilteredRows = enterMarksRows.filter(function (row) {
            if (!searchTerm) return true;
            const haystack = [row.admissionNo, row.rollNumber, row.studentName, row.fatherName, row.category, row.gender, row.note]
                .join(' ').toLowerCase();
            return haystack.indexOf(searchTerm) !== -1;
        });
        if (!tbody) return;
        if (!enterMarksFilteredRows.length) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">No students found</td></tr>';
        } else {
            tbody.innerHTML = enterMarksFilteredRows.map(buildEnterMarksRowHtml).join('');
        }
        if (info) {
            const total = enterMarksFilteredRows.length;
            info.textContent = total
                ? 'Showing 1 to ' + total + ' of ' + total + ' entries'
                : 'Showing 0 to 0 of 0 entries';
        }
    }

    function bindEnterMarksRowEvents() {
        document.getElementById('enterMarksTableBody')?.querySelectorAll('.absent-check').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const tr = checkbox.closest('tr');
                const marksInput = tr.querySelector('.marks-cell-input');
                const noteInput = tr.querySelector('.note-cell-input');
                if (checkbox.checked) {
                    marksInput.value = '';
                    marksInput.disabled = true;
                    noteInput.value = '';
                    noteInput.disabled = true;
                } else {
                    marksInput.disabled = false;
                    noteInput.disabled = false;
                }
            });
        });
    }

    async function loadEnterMarksRows() {
        const classId = document.getElementById('enterMarksClassSelect')?.value;
        const section = document.getElementById('enterMarksSectionSelect')?.value;
        const session = document.getElementById('enterMarksSessionSelect')?.value;
        if (!activeGroupId || !activeGroupExamId || !activeSubjectEntryId || !classId || !section || !session) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select class, section and session.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const url = '/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId
            + '/subjects/' + activeSubjectEntryId + '/marks?classId=' + encodeURIComponent(classId)
            + '&section=' + encodeURIComponent(section) + '&sessionYear=' + encodeURIComponent(session);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load marks entry');
        const data = await response.json();
        document.getElementById('enterMarksModalTitle').textContent = data.subjectName || 'Enter Marks';
        enterMarksRows = data.rows || [];
        renderEnterMarksTable();
        bindEnterMarksRowEvents();
    }

    async function openEnterMarksModal() {
        if (!schoolClasses.length) {
            await loadSchoolClasses();
        }
        await ensureFormOptions();
        const defaultClass = schoolClasses.length ? schoolClasses[0] : null;
        fillEnterMarksClassSelect(defaultClass ? defaultClass.id : '');
        const defaultSection = defaultClass && defaultClass.sections && defaultClass.sections.length
            ? defaultClass.sections[0] : '';
        fillEnterMarksSectionSelect(defaultSection);
        fillEnterMarksSessionSelect('2026-27');
        document.getElementById('enterMarksTableSearch').value = '';
        document.getElementById('enterMarksFileInput').value = '';
        openEgModal('enterMarksModal');
        if (defaultClass && defaultSection) {
            await loadEnterMarksRows();
        } else {
            enterMarksRows = [];
            renderEnterMarksTable();
        }
    }

    document.getElementById('enterMarksClassSelect')?.addEventListener('change', function () {
        fillEnterMarksSectionSelect('');
    });

    document.getElementById('searchEnterMarksBtn')?.addEventListener('click', async function () {
        try {
            await loadEnterMarksRows();
        } catch (error) { showError(error); }
    });

    document.getElementById('enterMarksTableSearch')?.addEventListener('input', function () {
        renderEnterMarksTable();
        bindEnterMarksRowEvents();
    });

    document.getElementById('exportEnterMarksSampleBtn')?.addEventListener('click', function () {
        const classId = document.getElementById('enterMarksClassSelect')?.value;
        const section = document.getElementById('enterMarksSectionSelect')?.value;
        const session = document.getElementById('enterMarksSessionSelect')?.value;
        if (!activeGroupId || !activeGroupExamId || !activeSubjectEntryId || !classId || !section || !session) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select class, section and session.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const url = '/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId
            + '/subjects/' + activeSubjectEntryId + '/marks/sample?classId=' + encodeURIComponent(classId)
            + '&section=' + encodeURIComponent(section) + '&sessionYear=' + encodeURIComponent(session);
        window.location.href = url;
    });

    (function initEnterMarksUpload() {
        const dropZone = document.getElementById('enterMarksDropZone');
        const fileInput = document.getElementById('enterMarksFileInput');
        if (!dropZone || !fileInput) return;

        dropZone.addEventListener('click', function () { fileInput.click(); });
        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });
        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
            }
        });

        document.getElementById('submitEnterMarksFileBtn')?.addEventListener('click', function () {
            const file = fileInput.files && fileInput.files[0];
            if (!file) {
                Swal.fire({ icon: 'warning', title: 'No file', text: 'Please choose a CSV file first.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    applyEnterMarksCsv(String(reader.result || ''));
                    Swal.fire({ icon: 'success', title: 'Imported', text: 'Marks loaded from file. Click Save to persist.', timer: 1600, showConfirmButton: false });
                } catch (error) {
                    showError(error);
                }
            };
            reader.readAsText(file);
        });
    })();

    function applyEnterMarksCsv(text) {
        const lines = text.split(/\r?\n/).filter(function (line) { return line.trim(); });
        if (lines.length < 2) throw new Error('CSV file is empty');
        const headers = lines[0].split(',').map(function (h) { return h.trim().toLowerCase(); });
        const admissionIdx = headers.indexOf('admission no');
        const absentIdx = headers.indexOf('absent');
        const marksIdx = headers.indexOf('marks');
        const noteIdx = headers.indexOf('note');
        if (admissionIdx === -1) throw new Error('CSV must include Admission No column');

        const importMap = {};
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            const admissionNo = cols[admissionIdx] ? cols[admissionIdx].trim() : '';
            if (!admissionNo) continue;
            importMap[admissionNo.toLowerCase()] = {
                absent: absentIdx !== -1 && String(cols[absentIdx] || '').trim().toLowerCase() === 'yes',
                marksObtained: marksIdx !== -1 ? (cols[marksIdx] || '').trim() : '',
                note: noteIdx !== -1 ? (cols[noteIdx] || '').trim() : ''
            };
        }

        enterMarksRows = enterMarksRows.map(function (row) {
            const imported = importMap[String(row.admissionNo || '').toLowerCase()];
            if (!imported) return row;
            return {
                studentId: row.studentId,
                studentName: row.studentName,
                admissionNo: row.admissionNo,
                rollNumber: row.rollNumber,
                fatherName: row.fatherName,
                category: row.category,
                gender: row.gender,
                absent: imported.absent,
                marksObtained: imported.absent ? '' : imported.marksObtained,
                note: imported.absent ? '' : imported.note
            };
        });
        renderEnterMarksTable();
        bindEnterMarksRowEvents();
    }

    function collectEnterMarksRowsFromTable() {
        syncEnterMarksFromDom();
        return enterMarksRows.map(function (row) {
            return {
                studentId: row.studentId,
                absent: !!row.absent,
                marksObtained: row.absent ? '' : (row.marksObtained || ''),
                note: row.absent ? '' : (row.note || '')
            };
        });
    }

    document.getElementById('saveEnterMarksBtn')?.addEventListener('click', async function () {
        if (!activeGroupId || !activeGroupExamId || !activeSubjectEntryId) return;
        const sessionYear = document.getElementById('enterMarksSessionSelect')?.value || '';
        const rows = collectEnterMarksRowsFromTable();
        try {
            const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId + '/subjects/' + activeSubjectEntryId + '/marks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionYear: sessionYear, rows: rows })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save marks');
            closeEgModal(document.getElementById('enterMarksModal'));
            activeSubjectEntryId = null;
            enterMarksRows = [];
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    async function openRemarksModal(examId) {
        activeGroupExamId = examId;
        const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + examId + '/teacher-remarks');
        if (!response.ok) throw new Error('Failed to load teacher remarks');
        const data = await response.json();
        document.getElementById('remarksModalExamName').textContent = data.examName || '';
        document.getElementById('remarksModalExamGroup').textContent = data.examGroupName || '';
        document.getElementById('teacherRemarksTableBody').innerHTML = (data.rows || []).map(function (row) {
            return '<tr data-student-id="' + escapeHtml(String(row.studentId)) + '"><td>' + escapeHtml(row.studentName) + '</td><td>' + escapeHtml(row.admissionNo) + '</td><td>' + escapeHtml(row.className) + '</td><td>' + escapeHtml(row.section) + '</td><td>' + escapeHtml(row.rollNumber || '') + '</td><td><input type="text" class="teacher-remark-input" value="' + escapeHtml(row.remark || '') + '"></td></tr>';
        }).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">Assign students first</td></tr>';
        openEgModal('teacherRemarksModal');
    }

    document.getElementById('saveTeacherRemarksBtn')?.addEventListener('click', async function () {
        if (!activeGroupId || !activeGroupExamId) return;
        const rows = Array.from(document.querySelectorAll('#teacherRemarksTableBody tr[data-student-id]')).map(function (row) {
            return {
                studentId: parseInt(row.getAttribute('data-student-id'), 10),
                remark: row.querySelector('.teacher-remark-input').value
            };
        });
        try {
            const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId + '/teacher-remarks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: rows })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save remarks');
            closeEgModal(document.getElementById('teacherRemarksModal'));
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    async function openEditExamModal(examId) {
        activeGroupExamId = examId;
        await ensureFormOptions();
        const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + examId);
        if (!response.ok) throw new Error('Failed to load exam');
        const data = await response.json();
        document.getElementById('editExamName').value = data.name || '';
        fillSelectOptions(document.getElementById('editExamSession'), formOptions.sessions, null, null, data.session);
        document.getElementById('editExamPublish').checked = !!data.publishExam;
        document.getElementById('editExamPublishResult').checked = !!data.publishResult;
        document.querySelectorAll('input[name="editRollType"]').forEach(function (radio) {
            radio.checked = radio.value === (data.rollType || 'PROFILE');
        });
        fillSelectOptions(document.getElementById('editExamMarksheetTemplate'), formOptions.marksheetTemplates, 'id', 'name', data.marksheetTemplateId);
        document.getElementById('editExamDescription').value = data.description || '';
        openEgModal('editExamModal');
    }

    document.getElementById('editExamForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!activeGroupId || !activeGroupExamId) return;
        const rollTypeEl = document.querySelector('input[name="editRollType"]:checked');
        const payload = {
            name: document.getElementById('editExamName').value.trim(),
            session: document.getElementById('editExamSession').value,
            publishExam: document.getElementById('editExamPublish').checked,
            publishResult: document.getElementById('editExamPublishResult').checked,
            rollType: rollTypeEl ? rollTypeEl.value : 'PROFILE',
            marksheetTemplateId: document.getElementById('editExamMarksheetTemplate').value || null,
            description: document.getElementById('editExamDescription').value.trim()
        };
        try {
            const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to update exam');
            closeEgModal(document.getElementById('editExamModal'));
            await loadGroupExams(activeGroupId);
            renderExamListTable();
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    async function openRankModal(examId) {
        activeGroupExamId = examId;
        const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + examId + '/rank');
        if (!response.ok) throw new Error('Failed to load rank data');
        const data = await response.json();
        document.getElementById('generateRankTitle').textContent = 'Student Exam Rank : ' + (data.examName || '');
        const banner = document.getElementById('generateRankBanner');
        if (data.rankGenerated) {
            banner.hidden = false;
        } else {
            banner.hidden = true;
        }
        document.getElementById('generateRankTableBody').innerHTML = (data.rows || []).map(function (row) {
            return '<tr><td>' + escapeHtml(row.admissionNo || '') + '</td><td>' + escapeHtml(row.rollNumber || '') + '</td><td>' + escapeHtml(row.className || '') + '</td><td>' + escapeHtml(row.section || '') + '</td><td>' + escapeHtml(row.studentName || '') + '</td><td>' + escapeHtml(row.result || '') + '</td><td>' + escapeHtml(row.percent || '') + '</td><td>' + escapeHtml(row.rank != null ? String(row.rank) : '') + '</td></tr>';
        }).join('') || '<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748b;">Assign students first</td></tr>';
        openEgModal('generateRankModal');
    }

    document.getElementById('generateRankBtn')?.addEventListener('click', async function () {
        if (!activeGroupId || !activeGroupExamId) return;
        try {
            const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams/' + activeGroupExamId + '/rank', { method: 'POST' });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to generate rank');
            await openRankModal(activeGroupExamId);
            Swal.fire({ icon: 'success', title: 'Generated', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    examListTableBody?.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-exam-id]');
        if (!row) return;
        const examId = row.getAttribute('data-exam-id');
        const handlers = [
            ['.btn-assign-student', openAssignStudentModal],
            ['.btn-exam-subject', openSubjectModal],
            ['.btn-exam-marks', openMarksModal],
            ['.btn-exam-remarks', openRemarksModal],
            ['.btn-exam-edit', openEditExamModal],
            ['.btn-exam-rank', openRankModal]
        ];
        for (let i = 0; i < handlers.length; i++) {
            if (e.target.closest(handlers[i][0])) {
                try {
                    await handlers[i][1](examId);
                } catch (error) {
                    showError(error);
                }
                return;
            }
        }
    });

    document.getElementById('newExamInListBtn')?.addEventListener('click', openNewExamModal);

    document.getElementById('linkExamsInListBtn')?.addEventListener('click', function () {
        Swal.fire({
            icon: 'info',
            title: 'Link Exams',
            text: 'Link exams for this group will be available in a later update.',
            confirmButtonColor: '#8b5cf6'
        });
    });

    newExamForm?.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!activeGroupId) return;
        const name = newExamNameInput ? newExamNameInput.value.trim() : '';
        if (!name) return;
        try {
            const response = await fetch('/api/exam-groups/' + activeGroupId + '/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name })
            });
            const data = await response.json().catch(function () { return {}; });
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to add exam');
            }
            closeNewExamModal();
            await loadGroups();
            await loadGroupExams(activeGroupId);
            renderExamListTable();
            Swal.fire({
                icon: 'success',
                title: 'Added',
                text: 'Exam added successfully.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add exam.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-add" title="Add Exam">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="12" y1="5" x2="12" y2="19"></line>'
            + '<line x1="5" y1="12" x2="19" y2="12"></line>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path>'
            + '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line>'
            + '<line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function resetForm() {
        if (!examGroupForm) return;
        examGroupForm.reset();
        examGroupIdInput.value = '';
        if (examGroupTypeInput) examGroupTypeInput.value = '';
        saveBtn.textContent = 'Save';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function getFilteredGroups() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!searchTerm) return groups.slice();
        return groups.filter(function (item) {
            const haystack = [item.name, item.examType, item.description, item.examCount].join(' ').toLowerCase();
            return haystack.indexOf(searchTerm) !== -1;
        });
    }

    function updateShowingInfo(start, end, total) {
        if (!showingInfo) return;
        if (total === 0) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        showingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + total + ' entries';
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;

        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';

        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }

        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderGroups() {
        const filtered = getFilteredGroups();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#94a3b8;">No exam groups found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filtered.slice(startIndex, endIndex);

        tableBody.innerHTML = pageRows.map(function (item) {
            return '<tr data-id="' + escapeHtml(String(item.id)) + '"'
                + ' data-name="' + escapeHtml(item.name) + '"'
                + ' data-exam-type="' + escapeHtml(item.examType) + '"'
                + ' data-description="' + escapeHtml(item.description || '') + '">'
                + '<td class="group-name">' + escapeHtml(item.name) + '</td>'
                + '<td class="group-exam-count">' + escapeHtml(String(item.examCount || 0)) + '</td>'
                + '<td class="group-exam-type">' + escapeHtml(item.examType) + '</td>'
                + '<td><div class="action-buttons">' + createActionButtonsHtml() + '</div></td>'
                + '</tr>';
        }).join('');

        updateShowingInfo(startIndex + 1, endIndex, total);
        renderPagination(total, totalPages);
    }

    async function loadExamTypes() {
        if (!examGroupTypeInput) return;
        try {
            const response = await fetch('/api/exam-groups/types');
            if (!response.ok) throw new Error('Failed to load exam types');
            const types = await response.json();
            examGroupTypeInput.innerHTML = '<option value="">Select</option>' + types.map(function (type) {
                return '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>';
            }).join('');
        } catch (error) {
            console.error(error);
        }
    }

    async function loadGroups() {
        try {
            const response = await fetch('/api/exam-groups');
            if (!response.ok) throw new Error('Failed to load exam groups');
            groups = await response.json();
            currentPage = 1;
            renderGroups();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load exam groups.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    if (examGroupForm) {
        examGroupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const name = examGroupNameInput.value.trim();
            const examType = examGroupTypeInput.value.trim();
            const description = examGroupDescriptionInput.value.trim();

            if (!name) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Please enter a name.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            if (!examType) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Please select an exam type.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const editingId = examGroupIdInput.value;
            const payload = {
                name: name,
                examType: examType,
                description: description || null
            };

            try {
                const url = editingId ? '/api/exam-groups/' + editingId : '/api/exam-groups';
                const method = editingId ? 'PUT' : 'POST';
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to save exam group');
                }

                resetForm();
                await loadGroups();
                Swal.fire({
                    icon: 'success',
                    title: editingId ? 'Updated' : 'Saved',
                    text: result.message || 'Exam group saved successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save exam group.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const addBtn = e.target.closest('.btn-add');
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const row = e.target.closest('tr');
            if (!row || !row.dataset.id) return;

            if (addBtn) {
                openExamListModal(row);
                return;
            }

            if (editBtn) {
                examGroupIdInput.value = row.getAttribute('data-id') || '';
                examGroupNameInput.value = row.getAttribute('data-name') || '';
                examGroupTypeInput.value = row.getAttribute('data-exam-type') || '';
                examGroupDescriptionInput.value = row.getAttribute('data-description') || '';
                saveBtn.textContent = 'Update';
                examGroupNameInput.focus();
                return;
            }

            if (deleteBtn) {
                const name = row.getAttribute('data-name') || '';
                const rowId = row.getAttribute('data-id');

                Swal.fire({
                    icon: 'warning',
                    title: 'Delete Exam Group?',
                    text: '"' + name + '" will be deleted.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                }).then(async function (result) {
                    if (!result.isConfirmed) return;
                    try {
                        const response = await fetch('/api/exam-groups/' + rowId, { method: 'DELETE' });
                        const data = await response.json().catch(function () { return {}; });
                        if (!response.ok || !data.success) {
                            throw new Error(data.message || 'Failed to delete exam group');
                        }
                        if (examGroupIdInput.value === rowId) resetForm();
                        await loadGroups();
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Exam group deleted successfully.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to delete exam group.',
                            confirmButtonColor: '#8b5cf6'
                        });
                    }
                });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderGroups();
        });
    }

    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderGroups();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFilteredGroups();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') {
                currentPage = Math.max(1, currentPage - 1);
            } else if (btn.getAttribute('data-nav') === 'next') {
                currentPage = Math.min(totalPages, currentPage + 1);
            } else if (btn.getAttribute('data-page')) {
                currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            }
            renderGroups();
        });
    }

    function exportRows() {
        return getFilteredGroups().map(function (item) {
            return {
                Name: item.name || '',
                'No Of Exams': item.examCount || 0,
                'Exam Type': item.examType || ''
            };
        });
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        let text = headers.join('\t') + '\n';
        rows.forEach(function (row) {
            text += headers.map(function (key) { return row[key]; }).join('\t') + '\n';
        });
        navigator.clipboard.writeText(text);
        Swal.fire({ icon: 'success', title: 'Copied!', text: 'Exam group list copied to clipboard', timer: 1500, showConfirmButton: false });
    });

    document.getElementById('excelBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.XLSX) return;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Exam Groups');
        XLSX.writeFile(wb, 'exam-groups.xlsx');
    });

    document.getElementById('csvBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        let csv = headers.join(',') + '\n';
        rows.forEach(function (row) {
            csv += headers.map(function (key) {
                const value = String(row[key] || '').replace(/"/g, '""');
                return '"' + value + '"';
            }).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'exam-groups.csv';
        link.click();
    });

    document.getElementById('pdfBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.jspdf) return;
        const doc = new window.jspdf.jsPDF();
        doc.text('Exam Group List', 14, 16);
        doc.autoTable({
            startY: 24,
            head: [['Name', 'No Of Exams', 'Exam Type']],
            body: rows.map(function (row) {
                return [row.Name, row['No Of Exams'], row['Exam Type']];
            })
        });
        doc.save('exam-groups.pdf');
    });

    document.getElementById('printBtn')?.addEventListener('click', function () {
        window.print();
    });

    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function () {
            columnVisibilityDropdown.classList.remove('active');
        });
        columnVisibilityDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const columnIndex = parseInt(checkbox.getAttribute('data-column'), 10);
                if (!table) return;
                table.querySelectorAll('tr').forEach(function (row) {
                    const cell = row.children[columnIndex];
                    if (cell) cell.style.display = checkbox.checked ? '' : 'none';
                });
            });
        });
    }

    loadExamTypes().then(loadGroups);
});
