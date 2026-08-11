document.addEventListener('DOMContentLoaded', function () {
    let exams = [];
    let formOptions = {};
    let schoolClasses = [];
    let currentExamId = null;
    let currentPage = 1;
    let pageSize = 50;

    const tableBody = document.getElementById('examTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeModal(el.closest('.cbse-modal'));
        });
    });

    function fillSelect(select, items, selected) {
        if (!select) return;
        select.innerHTML = '<option value="">Select</option>' + (items || []).map(function (item) {
            return '<option value="' + escapeHtml(item) + '"' + (item === selected ? ' selected' : '') + '>' + escapeHtml(item) + '</option>';
        }).join('');
    }

    function fillClassSelect(prefix, selectedClassId) {
        const classSelect = document.getElementById(prefix + 'ExamClass');
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

    function fillSectionSelect(prefix, selectedSection) {
        const classSelect = document.getElementById(prefix + 'ExamClass');
        const sectionSelect = document.getElementById(prefix + 'ExamSection');
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

    function resolveClassId(data) {
        if (data && data.classId) {
            return data.classId;
        }
        if (data && data.className) {
            const match = schoolClasses.find(function (item) {
                return item.name === data.className;
            });
            if (match) {
                return match.id;
            }
        }
        return '';
    }

    function populateFormSelects(prefix, data) {
        fillSelect(document.getElementById(prefix + 'ExamTerm'), formOptions.terms, data ? data.term : '');
        fillClassSelect(prefix, resolveClassId(data));
        fillSectionSelect(prefix, data && data.sections ? String(data.sections).split(',')[0].trim() : '');
        fillSelect(document.getElementById(prefix + 'ExamAssessment'), formOptions.assessments, data ? data.assessment : '');
        fillSelect(document.getElementById(prefix + 'ExamGrade'), formOptions.grades, data ? data.grade : '');
        fillSelect(document.getElementById(prefix + 'ExamCategory'), formOptions.categories, data ? data.categoryName : '');
    }

    async function refreshSchoolClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        schoolClasses = await response.json();
        formOptions.classes = schoolClasses;
    }

    function actionBtn(className, title, svg) {
        return '<button type="button" class="btn-action ' + className + '" title="' + escapeHtml(title) + '">' + svg + '</button>';
    }

    const icons = {
        assign: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
        subject: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        marks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
        attendance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><polyline points="9 14 11 16 15 12"></polyline></svg>',
        remarks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
        rank: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
        del: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    };

    function createActionsHtml() {
        return '<div class="action-buttons">'
            + actionBtn('btn-assign', 'Assign / View Student', icons.assign)
            + actionBtn('btn-subject', 'Exam Subject', icons.subject)
            + actionBtn('btn-marks', 'Exam Marks', icons.marks)
            + actionBtn('btn-attendance', 'Exam Attendance', icons.attendance)
            + actionBtn('btn-remarks', 'Teacher Remarks', icons.remarks)
            + actionBtn('btn-edit', 'Edit', icons.edit)
            + actionBtn('btn-rank', 'Generate Rank', icons.rank)
            + actionBtn('btn-delete', 'Delete', icons.del)
            + '</div>';
    }

    function getFilteredExams() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return exams.slice();
        return exams.filter(function (item) {
            return [item.examName, item.classSections, item.term, item.categoryName, item.description]
                .join(' ').toLowerCase().indexOf(term) !== -1;
        });
    }

    function renderExams() {
        const filtered = getFilteredExams();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="10"><div class="empty-state"><p class="empty-message">No data available in table</p></div></td></tr>';
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            pagination.innerHTML = '';
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (item) {
            return '<tr data-id="' + item.id + '">'
                + '<td>' + escapeHtml(item.examName) + '</td>'
                + '<td>' + escapeHtml(item.classSections) + '</td>'
                + '<td>' + escapeHtml(item.term) + '</td>'
                + '<td>' + escapeHtml(String(item.subjectsIncluded || 0)) + '</td>'
                + '<td><input type="checkbox" class="status-check"' + (item.published ? ' checked' : '') + ' disabled></td>'
                + '<td><input type="checkbox" class="status-check"' + (item.publishResult ? ' checked' : '') + ' disabled></td>'
                + '<td>' + escapeHtml(item.categoryName) + '</td>'
                + '<td>' + escapeHtml(item.description || '') + '</td>'
                + '<td>' + escapeHtml(item.createdAt || '') + '</td>'
                + '<td class="action-cell">' + createActionsHtml() + '</td>'
                + '</tr>';
        }).join('');

        showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        let pHtml = '<button type="button" class="pagination-btn" data-nav="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let p = 1; p <= totalPages; p++) {
            pHtml += '<button type="button" class="pagination-btn' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        pHtml += '<button type="button" class="pagination-btn" data-nav="next"' + (currentPage >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = pHtml;
    }

    async function loadOptions() {
        const response = await fetch('/api/cbse-exams/options');
        if (!response.ok) throw new Error('Failed to load options');
        formOptions = await response.json();
        schoolClasses = formOptions.classes || [];
        fillSelect(document.getElementById('editExamMailTemplate'), formOptions.mailTemplates);
    }

    async function loadExams() {
        const response = await fetch('/api/cbse-exams');
        if (!response.ok) throw new Error('Failed to load exams');
        exams = await response.json();
        renderExams();
    }

    function buildExamPayload(prefix) {
        return {
            examName: document.getElementById(prefix + 'ExamName').value.trim(),
            description: document.getElementById(prefix + 'ExamDescription').value.trim(),
            published: document.getElementById(prefix + 'ExamPublished').checked,
            publishResult: prefix === 'edit' ? document.getElementById('editExamPublishResult').checked : false,
            term: document.getElementById(prefix + 'ExamTerm').value,
            classId: document.getElementById(prefix + 'ExamClass').value,
            sections: document.getElementById(prefix + 'ExamSection').value,
            assessment: document.getElementById(prefix + 'ExamAssessment').value,
            grade: document.getElementById(prefix + 'ExamGrade').value,
            categoryName: document.getElementById(prefix + 'ExamCategory').value,
            admitCardRollType: prefix === 'edit' ? (document.querySelector('input[name="editRollType"]:checked') || {}).value : 'PROFILE',
            mailTemplate: prefix === 'edit' ? document.getElementById('editExamMailTemplate').value : ''
        };
    }

    document.getElementById('addExamBtn')?.addEventListener('click', async function () {
        document.getElementById('addExamForm').reset();
        try {
            await refreshSchoolClasses();
            populateFormSelects('add', null);
            openModal('addExamModal');
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('addExamClass')?.addEventListener('change', function () {
        fillSectionSelect('add', '');
    });

    document.getElementById('editExamClass')?.addEventListener('change', function () {
        fillSectionSelect('edit', '');
    });

    document.getElementById('addExamForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
            const response = await fetch('/api/cbse-exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildExamPayload('add'))
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save exam');
            closeModal(document.getElementById('addExamModal'));
            await loadExams();
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1500, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    document.getElementById('editExamForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
            const response = await fetch('/api/cbse-exams/' + currentExamId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildExamPayload('edit'))
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to update exam');
            closeModal(document.getElementById('editExamModal'));
            await loadExams();
            Swal.fire({ icon: 'success', title: 'Updated', text: result.message, timer: 1500, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    async function openEditModal(id) {
        await refreshSchoolClasses();
        const response = await fetch('/api/cbse-exams/' + id);
        if (!response.ok) throw new Error('Failed to load exam');
        const data = await response.json();
        document.getElementById('editExamId').value = id;
        document.getElementById('editExamName').value = data.examName || '';
        document.getElementById('editExamDescription').value = data.description || '';
        document.getElementById('editExamPublished').checked = !!data.published;
        document.getElementById('editExamPublishResult').checked = !!data.publishResult;
        populateFormSelects('edit', data);
        fillSelect(document.getElementById('editExamMailTemplate'), formOptions.mailTemplates, data.mailTemplate);
        const rollType = data.admitCardRollType || 'PROFILE';
        document.querySelectorAll('input[name="editRollType"]').forEach(function (r) {
            r.checked = r.value === rollType;
        });
        openModal('editExamModal');
    }

    async function openAssignModal(id) {
        currentExamId = id;
        const response = await fetch('/api/cbse-exams/' + id + '/students');
        if (!response.ok) throw new Error('Failed to load students');
        const rows = await response.json();
        const tbody = document.getElementById('assignStudentTableBody');
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">No students found</td></tr>';
        } else {
            tbody.innerHTML = rows.map(function (row) {
                return '<tr><td><input type="checkbox" class="student-assign-check" data-id="' + row.id + '"' + (row.assigned ? ' checked' : '') + '></td>'
                    + '<td>' + escapeHtml(row.studentName) + '</td>'
                    + '<td>' + escapeHtml(row.admissionNo) + '</td>'
                    + '<td>' + escapeHtml(row.classSection) + '</td>'
                    + '<td>' + escapeHtml(row.fatherName || '') + '</td>'
                    + '<td>' + escapeHtml(row.category || '') + '</td>'
                    + '<td>' + escapeHtml(row.gender || '') + '</td></tr>';
            }).join('');
        }
        openModal('assignStudentModal');
    }

    document.getElementById('assignAllStudents')?.addEventListener('change', function () {
        const checked = this.checked;
        document.querySelectorAll('.student-assign-check').forEach(function (cb) { cb.checked = checked; });
    });

    document.getElementById('saveAssignStudentsBtn')?.addEventListener('click', async function () {
        const ids = Array.from(document.querySelectorAll('.student-assign-check:checked')).map(function (cb) { return parseInt(cb.dataset.id, 10); });
        try {
            const response = await fetch('/api/cbse-exams/' + currentExamId + '/students', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentIds: ids })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save');
            closeModal(document.getElementById('assignStudentModal'));
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    function buildAssessmentCheckboxes(selected) {
        const selectedList = (selected || '').split(',').map(function (s) { return s.trim(); });
        return '<div class="assessment-list">' + (formOptions.subjectAssessments || []).map(function (a) {
            return '<label><input type="checkbox" class="subject-assessment-check" value="' + escapeHtml(a) + '"' + (selectedList.indexOf(a) !== -1 ? ' checked' : '') + '> ' + escapeHtml(a) + '</label>';
        }).join('') + '</div>';
    }

    function buildSubjectRow(row) {
        const subjectOptions = (formOptions.subjects || []).map(function (s) {
            return '<option value="' + escapeHtml(s) + '"' + (row && row.subjectName === s ? ' selected' : '') + '>' + escapeHtml(s) + '</option>';
        }).join('');
        return '<tr class="subject-row">'
            + '<td><select class="subject-name-select"><option value="">Select</option>' + subjectOptions + '</select></td>'
            + '<td>' + buildAssessmentCheckboxes(row ? row.assessments : '') + '</td>'
            + '<td><input type="date" class="subject-date" value="' + escapeHtml(toInputDate(row ? row.examDate : '')) + '"></td>'
            + '<td><input type="time" class="subject-time" value="' + escapeHtml(toInputTime(row ? row.startTime : '')) + '" step="1"></td>'
            + '<td><input type="number" class="subject-duration" value="' + escapeHtml(row && row.durationMinutes != null ? row.durationMinutes : '60') + '"></td>'
            + '<td><input type="text" class="subject-room" value="' + escapeHtml(row ? row.roomNo || '' : '') + '"></td>'
            + '<td><button type="button" class="btn-remove-row">&times;</button></td></tr>';
    }

    function toInputDate(value) {
        if (!value) return '';
        if (value.indexOf('-') === 4) return value;
        const parts = value.split('/');
        if (parts.length === 3) return parts[2] + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
        return '';
    }

    function toInputTime(value) {
        if (!value) return '';
        return value.length >= 5 ? value.substring(0, 8) : value;
    }

    async function openSubjectModal(id) {
        currentExamId = id;
        const response = await fetch('/api/cbse-exams/' + id + '/subjects');
        if (!response.ok) throw new Error('Failed to load subjects');
        const data = await response.json();
        document.getElementById('subjectModalExamName').textContent = data.examName || '';
        document.getElementById('subjectModalClassSections').textContent = data.classSections || '';
        const tbody = document.getElementById('examSubjectEntryBody');
        const rows = data.subjects || [];
        tbody.innerHTML = rows.length ? rows.map(buildSubjectRow).join('') : buildSubjectRow(null);
        openModal('examSubjectModal');
    }

    document.getElementById('addSubjectRowBtn')?.addEventListener('click', function () {
        document.getElementById('examSubjectEntryBody').insertAdjacentHTML('beforeend', buildSubjectRow(null));
    });

    document.getElementById('examSubjectEntryBody')?.addEventListener('click', function (e) {
        if (e.target.closest('.btn-remove-row')) {
            const row = e.target.closest('.subject-row');
            if (row) row.remove();
        }
    });

    document.getElementById('saveExamSubjectsBtn')?.addEventListener('click', async function () {
        const subjects = Array.from(document.querySelectorAll('#examSubjectEntryBody .subject-row')).map(function (row) {
            const assessments = Array.from(row.querySelectorAll('.subject-assessment-check:checked')).map(function (cb) { return cb.value; }).join(', ');
            return {
                subjectName: row.querySelector('.subject-name-select').value,
                assessments: assessments,
                examDate: row.querySelector('.subject-date').value,
                startTime: row.querySelector('.subject-time').value,
                durationMinutes: row.querySelector('.subject-duration').value,
                roomNo: row.querySelector('.subject-room').value
            };
        }).filter(function (s) { return s.subjectName; });

        try {
            const response = await fetch('/api/cbse-exams/' + currentExamId + '/subjects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects: subjects })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save subjects');
            closeModal(document.getElementById('examSubjectModal'));
            await loadExams();
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    async function openMarksModal(id) {
        const response = await fetch('/api/cbse-exams/' + id + '/marks');
        if (!response.ok) throw new Error('Failed to load marks view');
        const data = await response.json();
        document.getElementById('marksModalExamName').textContent = data.examName || '';
        document.getElementById('marksModalClassSections').textContent = data.classSections || '';
        const tbody = document.getElementById('examMarksTableBody');
        const rows = data.subjects || [];
        tbody.innerHTML = rows.length ? rows.map(function (row) {
            return '<tr><td>' + escapeHtml(row.subjectName) + '</td><td>' + escapeHtml(row.examDate) + '</td><td>' + escapeHtml(row.startTime) + '</td><td>' + escapeHtml(row.roomNo || '') + '</td><td><button type="button" class="btn-action btn-marks-entry" title="Enter Marks">' + icons.marks + '</button></td></tr>';
        }).join('') : '<tr><td colspan="5" style="text-align:center;padding:24px;color:#94a3b8;">No subjects found</td></tr>';
        openModal('examMarksModal');
    }

    async function openAttendanceModal(id) {
        currentExamId = id;
        document.getElementById('attendanceFromDate').value = '';
        document.getElementById('attendanceToDate').value = '';
        document.getElementById('attendanceResultBanner').textContent = 'No Record Found';
        openModal('examAttendanceModal');
    }

    document.getElementById('searchAttendanceBtn')?.addEventListener('click', async function () {
        const fromDate = document.getElementById('attendanceFromDate').value;
        const toDate = document.getElementById('attendanceToDate').value;
        if (!fromDate || !toDate) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select from and to dates.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const response = await fetch('/api/cbse-exams/' + currentExamId + '/attendance?fromDate=' + encodeURIComponent(fromDate) + '&toDate=' + encodeURIComponent(toDate));
            const data = await response.json();
            document.getElementById('attendanceResultBanner').textContent = data.message || 'No Record Found';
        } catch (error) { showError(error); }
    });

    async function openRemarksModal(id) {
        const response = await fetch('/api/cbse-exams/' + id + '/teacher-remarks');
        if (!response.ok) throw new Error('Failed to load remarks');
        const data = await response.json();
        document.getElementById('teacherRemarksBanner').textContent = data.message || 'No Record Found';
        openModal('teacherRemarksModal');
    }

    async function openRankModal(id) {
        currentExamId = id;
        const response = await fetch('/api/cbse-exams/' + id + '/generate-rank');
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load rank data');
        }
        document.getElementById('generateRankTitle').textContent = 'Generate Rank : ' + (data.examName || '');
        const banner = document.getElementById('generateRankBanner');
        if (data.rankGenerated) {
            banner.hidden = false;
            banner.textContent = 'Rank has been generated, further you can update regenerated rank.';
        } else {
            banner.hidden = true;
        }
        const tbody = document.getElementById('generateRankTableBody');
        const rows = data.rows || [];
        tbody.innerHTML = rows.length ? rows.map(function (row, index) {
            const rankValue = row.rank !== '' && row.rank != null ? row.rank : (data.rankGenerated ? '' : index + 1);
            const studentNameCell = row.id
                ? '<a class="rank-student-link" href="/student/view/' + encodeURIComponent(String(row.id)) + '">' + escapeHtml(row.studentName || '') + '</a>'
                : escapeHtml(row.studentName || '');
            return '<tr><td>' + escapeHtml(row.admissionNo || '') + '</td><td>' + studentNameCell + '</td><td>' + escapeHtml(row.className || '') + '</td><td>' + escapeHtml(row.fatherName || '') + '</td><td>' + escapeHtml(row.dateOfBirth || '') + '</td><td>' + escapeHtml(row.gender || '') + '</td><td>' + escapeHtml(row.mobileNo || '') + '</td><td>' + escapeHtml(String(rankValue)) + '</td></tr>';
        }).join('') : '<tr><td colspan="8" style="text-align:center;padding:24px;color:#94a3b8;">No students assigned. Assign students first.</td></tr>';
        openModal('generateRankModal');
    }

    document.getElementById('generateRankBtn')?.addEventListener('click', async function () {
        if (!currentExamId) {
            showError(new Error('No exam selected'));
            return;
        }
        try {
            const response = await fetch('/api/cbse-exams/' + currentExamId + '/generate-rank', { method: 'POST' });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to generate rank');
            }
            await openRankModal(currentExamId);
            Swal.fire({ icon: 'success', title: 'Generated', text: result.message || 'Rank generated successfully.', timer: 1400, showConfirmButton: false });
        } catch (error) { showError(error); }
    });

    tableBody?.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        if (e.target.closest('.btn-assign')) { try { await openAssignModal(id); } catch (err) { showError(err); } return; }
        if (e.target.closest('.btn-subject')) { try { await openSubjectModal(id); } catch (err) { showError(err); } return; }
        if (e.target.closest('.btn-marks')) { try { await openMarksModal(id); } catch (err) { showError(err); } return; }
        if (e.target.closest('.btn-attendance')) { openAttendanceModal(id); return; }
        if (e.target.closest('.btn-remarks')) { try { await openRemarksModal(id); } catch (err) { showError(err); } return; }
        if (e.target.closest('.btn-edit')) { try { currentExamId = id; await openEditModal(id); } catch (err) { showError(err); } return; }
        if (e.target.closest('.btn-rank')) { try { await openRankModal(id); } catch (err) { showError(err); } return; }
        if (e.target.closest('.btn-delete')) {
            Swal.fire({ icon: 'warning', title: 'Delete Exam?', showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b', confirmButtonText: 'Delete' })
                .then(async function (result) {
                    if (!result.isConfirmed) return;
                    const response = await fetch('/api/cbse-exams/' + id, { method: 'DELETE' });
                    const data = await response.json();
                    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete');
                    await loadExams();
                    Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
                }).catch(showError);
        }
    });

    searchInput?.addEventListener('input', function () { currentPage = 1; renderExams(); });
    entriesSelect?.addEventListener('change', function () { pageSize = parseInt(entriesSelect.value, 10) || 50; currentPage = 1; renderExams(); });
    pagination?.addEventListener('click', function (e) {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        const totalPages = Math.max(1, Math.ceil(getFilteredExams().length / pageSize) || 1);
        if (btn.dataset.nav === 'prev') currentPage = Math.max(1, currentPage - 1);
        else if (btn.dataset.nav === 'next') currentPage = Math.min(totalPages, currentPage + 1);
        else if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10) || 1;
        renderExams();
    });

    function exportRows() {
        return getFilteredExams().map(function (item) {
            return { 'Exam Name': item.examName, 'Class (Sections)': item.classSections, Term: item.term, 'Subjects Included': item.subjectsIncluded, 'Category Name': item.categoryName, Description: item.description, 'Created At': item.createdAt };
        });
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        navigator.clipboard.writeText(headers.join('\t') + '\n' + rows.map(function (r) { return headers.map(function (h) { return r[h]; }).join('\t'); }).join('\n'));
    });
    document.getElementById('excelBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.XLSX) return;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Exams');
        XLSX.writeFile(wb, 'cbse-exams.xlsx');
    });
    document.getElementById('csvBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const csv = headers.join(',') + '\n' + rows.map(function (r) { return headers.map(function (h) { return '"' + String(r[h] || '').replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        link.download = 'cbse-exams.csv';
        link.click();
    });
    document.getElementById('pdfBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.jspdf) return;
        const doc = new window.jspdf.jsPDF({ orientation: 'landscape' });
        doc.text('Exam List', 14, 16);
        doc.autoTable({ startY: 22, head: [['Exam Name', 'Class', 'Term', 'Subjects', 'Category', 'Created At']], body: rows.map(function (r) { return [r['Exam Name'], r['Class (Sections)'], r.Term, r['Subjects Included'], r['Category Name'], r['Created At']]; }) });
        doc.save('cbse-exams.pdf');
    });
    document.getElementById('printBtn')?.addEventListener('click', function () { window.print(); });

    Promise.all([loadOptions(), loadExams()]).catch(showError);
});
