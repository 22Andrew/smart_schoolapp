document.addEventListener('DOMContentLoaded', function () {
    const criteriaForm = document.getElementById('criteriaForm');
    const criteriaClassSelect = document.getElementById('criteriaClassSelect');
    const criteriaSectionSelect = document.getElementById('criteriaSectionSelect');
    const criteriaSubjectGroupSelect = document.getElementById('criteriaSubjectGroupSelect');
    const criteriaSubjectSelect = document.getElementById('criteriaSubjectSelect');

    const modalClassSelect = document.getElementById('modalClassSelect');
    const modalSectionSelect = document.getElementById('modalSectionSelect');
    const modalSubjectGroupSelect = document.getElementById('modalSubjectGroupSelect');
    const modalSubjectSelect = document.getElementById('modalSubjectSelect');

    const addHomeworkBtn = document.getElementById('addHomeworkBtn');
    const homeworkModal = document.getElementById('homeworkModal');
    const homeworkModalOverlay = document.getElementById('homeworkModalOverlay');
    const homeworkModalCloseBtn = document.getElementById('homeworkModalCloseBtn');
    const homeworkForm = document.getElementById('homeworkForm');
    const homeworkIdInput = document.getElementById('homeworkId');
    const homeworkModalTitle = document.getElementById('homeworkModalTitle');
    const saveHomeworkBtn = document.getElementById('saveHomeworkBtn');
    const documentInput = document.getElementById('documentInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileUploadLabel = document.getElementById('fileUploadLabel');

    const homeworkTableBody = document.getElementById('homeworkTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const homeworkTabs = document.querySelectorAll('.homework-tab');

    const evaluateHomeworkModal = document.getElementById('evaluateHomeworkModal');
    const evaluateHomeworkOverlay = document.getElementById('evaluateHomeworkOverlay');
    const evaluateHomeworkCloseBtn = document.getElementById('evaluateHomeworkCloseBtn');
    const evaluateHomeworkForm = document.getElementById('evaluateHomeworkForm');
    const evaluateHomeworkIdInput = document.getElementById('evaluateHomeworkId');
    const evaluateStudentsBody = document.getElementById('evaluateStudentsBody');
    const evaluateMarksHeader = document.getElementById('evaluateMarksHeader');
    const evaluationDateInput = document.getElementById('evaluationDateInput');
    const saveEvaluationBtn = document.getElementById('saveEvaluationBtn');

    let classes = [];
    let masterSections = [];
    let subjectGroups = [];
    let masterSubjects = [];
    let rows = [];
    let filteredRows = [];
    let currentTab = 'upcoming';
    let currentPage = 1;
    let pageSize = 50;
    let isEditMode = false;
    let evaluateStudents = [];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length !== 3) return value;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function formatMarks(value) {
        if (value == null || value === '') return '';
        const num = Number(value);
        if (Number.isNaN(num)) return String(value);
        return num.toFixed(2);
    }

    function summaryText(value) {
        return value == null || value === '' ? '-' : String(value);
    }

    function getCurrentEvaluatorName() {
        const profileName = document.querySelector('.profile-name');
        return profileName && profileName.textContent.trim()
            ? profileName.textContent.trim()
            : 'Joe Black (9000)';
    }

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6',
            timer: 1800,
            showConfirmButton: false
        });
    }

    function todayIso() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return now.getFullYear() + '-' + month + '-' + day;
    }

    function renderClassOptions(selectEl, selectedId) {
        selectEl.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
        if (selectedId) {
            selectEl.value = String(selectedId);
        }
    }

    function populateSectionOptions(classId, selectEl, selectedSection) {
        const schoolClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        if (!schoolClass) {
            selectEl.innerHTML = '<option value="">Select class first</option>';
            selectEl.disabled = true;
            return;
        }
        const classSections = Array.isArray(schoolClass.sections) ? schoolClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (section) {
                return section.sectionName || section.name || section;
            }).filter(Boolean);
        if (!sections.length) {
            selectEl.innerHTML = '<option value="">No sections found</option>';
            selectEl.disabled = true;
            return;
        }
        selectEl.disabled = false;
        selectEl.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
        if (selectedSection) {
            selectEl.value = selectedSection;
        }
    }

    function getGroupClassId(group) {
        if (group.schoolClass && group.schoolClass.id != null) {
            return String(group.schoolClass.id);
        }
        if (group.classId != null) {
            return String(group.classId);
        }
        return '';
    }

    function getFilteredSubjectGroups(classId, section) {
        let filtered = subjectGroups.slice();
        if (classId) {
            filtered = filtered.filter(function (group) {
                return getGroupClassId(group) === String(classId);
            });
        }
        if (section) {
            const upper = String(section).toUpperCase();
            const bySection = filtered.filter(function (group) {
                const sections = (group.sections || []).map(function (item) {
                    return String(item).toUpperCase();
                });
                return !sections.length || sections.indexOf(upper) !== -1;
            });
            if (bySection.length) {
                filtered = bySection;
            }
        }
        return filtered;
    }

    function populateSubjectGroupOptions(classId, section, selectEl, selectedGroupId) {
        const filtered = getFilteredSubjectGroups(classId, section);
        if (!filtered.length) {
            selectEl.innerHTML = '<option value="">No subject groups found</option>';
            selectEl.disabled = true;
            return;
        }
        selectEl.disabled = false;
        selectEl.innerHTML = '<option value="">Select</option>' + filtered.map(function (group) {
            return '<option value="' + group.id + '">' + escapeHtml(group.name) + '</option>';
        }).join('');
        if (selectedGroupId) {
            selectEl.value = String(selectedGroupId);
        }
    }

    function asSubjectList(subjects) {
        if (!subjects) return [];
        return Array.isArray(subjects) ? subjects : Array.from(subjects);
    }

    function populateSubjectOptions(groupId, selectEl, selectedSubjectId) {
        const group = subjectGroups.find(function (item) {
            return String(item.id) === String(groupId);
        });
        if (!group) {
            selectEl.innerHTML = '<option value="">Select subject group first</option>';
            selectEl.disabled = true;
            return;
        }
        let subjects = asSubjectList(group.subjects);
        if (!subjects.length && group.subjectIds && group.subjectIds.length) {
            subjects = masterSubjects.filter(function (subject) {
                return group.subjectIds.indexOf(subject.id) !== -1;
            });
        }
        if (!subjects.length) {
            selectEl.innerHTML = '<option value="">No subjects found</option>';
            selectEl.disabled = true;
            return;
        }
        selectEl.disabled = false;
        selectEl.innerHTML = '<option value="">Select</option>' + subjects.map(function (subject) {
            const label = (subject.name || '') + (subject.subjectCode ? ' (' + subject.subjectCode + ')' : '');
            return '<option value="' + subject.id + '">' + escapeHtml(label) + '</option>';
        }).join('');
        if (selectedSubjectId) {
            selectEl.value = String(selectedSubjectId);
        }
    }

    function bindCascade(classSelect, sectionSelect, groupSelect, subjectSelect) {
        classSelect.addEventListener('change', function () {
            populateSectionOptions(classSelect.value, sectionSelect, '');
            populateSubjectGroupOptions(classSelect.value, '', groupSelect, '');
            populateSubjectOptions('', subjectSelect, '');
        });
        sectionSelect.addEventListener('change', function () {
            populateSubjectGroupOptions(classSelect.value, sectionSelect.value, groupSelect, '');
            populateSubjectOptions('', subjectSelect, '');
        });
        groupSelect.addEventListener('change', function () {
            populateSubjectOptions(groupSelect.value, subjectSelect, '');
        });
    }

    async function loadMasterData() {
        const [classesRes, sectionsRes, groupsRes, subjectsRes] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups'),
            fetch('/api/subjects')
        ]);
        classes = classesRes.ok ? await classesRes.json() : [];
        masterSections = sectionsRes.ok ? await sectionsRes.json() : [];
        subjectGroups = groupsRes.ok ? await groupsRes.json() : [];
        masterSubjects = subjectsRes.ok ? await subjectsRes.json() : [];

        renderClassOptions(criteriaClassSelect, '');
        renderClassOptions(modalClassSelect, '');
        criteriaSectionSelect.innerHTML = '<option value="">Select</option>';
        criteriaSubjectGroupSelect.innerHTML = '<option value="">Select</option>';
        criteriaSubjectSelect.innerHTML = '<option value="">Select</option>';
        modalSectionSelect.innerHTML = '<option value="">Select</option>';
        modalSubjectGroupSelect.innerHTML = '<option value="">Select</option>';
        modalSubjectSelect.innerHTML = '<option value="">Select</option>';
    }

    function getSearchParams() {
        const params = new URLSearchParams();
        params.set('tab', currentTab);
        if (criteriaClassSelect.value) params.set('classId', criteriaClassSelect.value);
        if (criteriaSectionSelect.value) params.set('section', criteriaSectionSelect.value);
        if (criteriaSubjectGroupSelect.value) params.set('subjectGroupId', criteriaSubjectGroupSelect.value);
        if (criteriaSubjectSelect.value) params.set('subjectId', criteriaSubjectSelect.value);
        return params;
    }

    async function loadHomeworkRows() {
        const response = await fetch('/api/homework?' + getSearchParams().toString());
        if (!response.ok) {
            throw new Error('Failed to load homework list');
        }
        rows = await response.json();
        applyLocalFilters();
    }

    function applyLocalFilters() {
        const keyword = (searchInput.value || '').trim().toLowerCase();
        filteredRows = rows.filter(function (row) {
            if (!keyword) return true;
            const haystack = [
                row.className,
                row.section,
                row.subjectGroupName,
                row.subjectName,
                row.createdBy,
                row.description
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        });
        currentPage = 1;
        renderTable();
    }

    function renderTable() {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        const total = filteredRows.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const pageRows = filteredRows.slice(start, start + pageSize);

        if (!pageRows.length) {
            homeworkTableBody.innerHTML = ''
                + '<tr><td colspan="9" class="empty-state-cell">'
                + '<div class="empty-message">No data available in table</div>'
                + '<div class="empty-illustration">📁</div>'
                + '<div class="empty-hint">&larr; Add new record or search with different criteria.</div>'
                + '</td></tr>';
        } else {
            homeworkTableBody.innerHTML = pageRows.map(function (row) {
                return ''
                    + '<tr data-id="' + row.id + '">'
                    + '<td>' + escapeHtml(row.className) + '</td>'
                    + '<td>' + escapeHtml(row.section) + '</td>'
                    + '<td>' + escapeHtml(row.subjectGroupName) + '</td>'
                    + '<td>' + escapeHtml(row.subjectName) + '</td>'
                    + '<td>' + escapeHtml(formatDate(row.homeworkDate)) + '</td>'
                    + '<td>' + escapeHtml(formatDate(row.submissionDate)) + '</td>'
                    + '<td>' + escapeHtml(formatDate(row.evaluationDate)) + '</td>'
                    + '<td>' + escapeHtml(row.createdBy || '') + '</td>'
                    + '<td>'
                    + '<button type="button" class="btn-action btn-evaluate" title="Evaluate"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></button>'
                    + '<button type="button" class="btn-action btn-edit" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>'
                    + '<button type="button" class="btn-action btn-delete" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
                    + '</td>'
                    + '</tr>';
            }).join('');
        }

        const from = total ? start + 1 : 0;
        const to = Math.min(start + pageSize, total);
        showingInfo.textContent = 'Showing ' + from + ' to ' + to + ' of ' + total + ' entries';

        pagination.innerHTML = '';
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = currentPage <= 1;
        prevBtn.addEventListener('click', function () {
            currentPage -= 1;
            renderTable();
        });
        pagination.appendChild(prevBtn);

        for (let page = 1; page <= totalPages; page += 1) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = 'pagination-btn' + (page === currentPage ? ' active' : '');
            pageBtn.textContent = String(page);
            pageBtn.addEventListener('click', function () {
                currentPage = page;
                renderTable();
            });
            pagination.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.addEventListener('click', function () {
            currentPage += 1;
            renderTable();
        });
        pagination.appendChild(nextBtn);
    }

    function openModal() {
        homeworkModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        homeworkModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openEvaluateModal() {
        evaluateHomeworkModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeEvaluateModal() {
        evaluateHomeworkModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function populateEvaluateSummary(homework) {
        document.getElementById('summaryHomeworkDate').textContent = formatDate(homework.homeworkDate) || '-';
        document.getElementById('summarySubmissionDate').textContent = formatDate(homework.submissionDate) || '-';
        document.getElementById('summaryEvaluationDate').textContent = homework.evaluationDate
            ? formatDate(homework.evaluationDate)
            : '';
        document.getElementById('summaryCreatedBy').textContent = summaryText(homework.createdBy);
        document.getElementById('summaryEvaluatedBy').textContent = homework.evaluatedBy
            ? String(homework.evaluatedBy)
            : '';
        document.getElementById('summaryClass').textContent = summaryText(homework.className);
        document.getElementById('summarySection').textContent = summaryText(homework.section);
        document.getElementById('summarySubjectGroup').textContent = summaryText(homework.subjectGroupName);
        document.getElementById('summarySubject').textContent = summaryText(homework.subjectName);
        document.getElementById('summaryTotalMarks').textContent = homework.maxMarks != null
            ? formatMarks(homework.maxMarks)
            : '-';
        document.getElementById('summaryDescription').textContent = summaryText(homework.description);

        const maxMarksLabel = homework.maxMarks != null ? formatMarks(homework.maxMarks) : '';
        evaluateMarksHeader.textContent = maxMarksLabel ? 'Marks (' + maxMarksLabel + ')' : 'Marks';
    }

    function renderEvaluateStudents(students, maxMarks) {
        if (!students || !students.length) {
            evaluateStudentsBody.innerHTML = ''
                + '<tr><td colspan="4" class="empty-state-cell">'
                + '<div class="empty-message">No students found for this class and section.</div>'
                + '</td></tr>';
            return;
        }

        evaluateStudentsBody.innerHTML = students.map(function (student) {
            const documentCell = student.documentPath
                ? '<a class="document-link" href="' + escapeHtml(student.documentPath) + '" target="_blank" rel="noopener">'
                    + escapeHtml(student.documentName || 'View document') + '</a>'
                : '';
            const marksValue = student.marks != null && student.marks !== '' ? String(student.marks) : '';
            const maxAttr = maxMarks != null ? ' max="' + escapeHtml(String(maxMarks)) + '"' : '';
            return ''
                + '<tr data-student-id="' + student.studentAdmissionId + '">'
                + '<td>' + escapeHtml(student.studentName) + '</td>'
                + '<td class="message-cell">' + escapeHtml(student.message || '') + '</td>'
                + '<td class="document-cell">' + documentCell + '</td>'
                + '<td><input type="number" class="marks-input" step="0.01" min="0"' + maxAttr
                + ' value="' + escapeHtml(marksValue) + '" data-student-id="' + student.studentAdmissionId + '"></td>'
                + '</tr>';
        }).join('');
    }

    function populateEvaluateView(data) {
        const homework = data.homework || {};
        evaluateStudents = data.students || [];
        evaluateHomeworkIdInput.value = homework.id || '';
        populateEvaluateSummary(homework);
        renderEvaluateStudents(evaluateStudents, homework.maxMarks);
        evaluationDateInput.value = homework.evaluationDate || todayIso();
    }

    async function openEvaluateModalById(id) {
        try {
            const response = await fetch('/api/homework/' + id + '/evaluation');
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to load homework evaluation');
            }
            populateEvaluateView(result.data || {});
            openEvaluateModal();
        } catch (error) {
            showError(error.message);
        }
    }

    function collectEvaluationEntries(students) {
        return students.map(function (student) {
            const input = evaluateStudentsBody.querySelector(
                '.marks-input[data-student-id="' + student.studentAdmissionId + '"]'
            );
            const marksRaw = input ? input.value.trim() : '';
            return {
                studentAdmissionId: student.studentAdmissionId,
                studentName: student.studentName,
                message: student.message || '',
                documentPath: student.documentPath || '',
                documentName: student.documentName || '',
                marks: marksRaw === '' ? null : Number(marksRaw)
            };
        });
    }

    async function saveEvaluation(event) {
        event.preventDefault();
        const homeworkId = evaluateHomeworkIdInput.value;
        if (!homeworkId) {
            showError('Homework record not found.');
            return;
        }
        if (!evaluationDateInput.value) {
            showError('Evaluation date is required.');
            return;
        }

        const payload = {
            evaluationDate: evaluationDateInput.value,
            evaluatedBy: getCurrentEvaluatorName(),
            entries: collectEvaluationEntries(evaluateStudents)
        };

        saveEvaluationBtn.disabled = true;
        try {
            const response = await fetch('/api/homework/' + homeworkId + '/evaluation', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save evaluation');
            }
            showSuccess(result.message || 'Homework evaluation saved successfully!');
            populateEvaluateView(result.data || {});
            await loadHomeworkRows();
        } catch (error) {
            showError(error.message);
        } finally {
            saveEvaluationBtn.disabled = false;
        }
    }

    function resetModalForm() {
        isEditMode = false;
        homeworkIdInput.value = '';
        homeworkModalTitle.textContent = 'Add Homework';
        saveHomeworkBtn.textContent = 'Save';
        homeworkForm.reset();
        document.getElementById('homeworkDate').value = todayIso();
        document.getElementById('submissionDate').value = todayIso();
        documentInput.value = '';
        fileUploadLabel.textContent = 'Drag and drop a file here or click';
        renderClassOptions(modalClassSelect, '');
        modalSectionSelect.innerHTML = '<option value="">Select</option>';
        modalSubjectGroupSelect.innerHTML = '<option value="">Select</option>';
        modalSubjectSelect.innerHTML = '<option value="">Select</option>';
    }

    function getSelectedLabel(selectEl) {
        const option = selectEl.options[selectEl.selectedIndex];
        return option ? option.textContent.trim() : '';
    }

    function buildPayload() {
        return {
            classId: modalClassSelect.value ? Number(modalClassSelect.value) : null,
            className: getSelectedLabel(modalClassSelect),
            section: modalSectionSelect.value,
            subjectGroupId: modalSubjectGroupSelect.value ? Number(modalSubjectGroupSelect.value) : null,
            subjectGroupName: getSelectedLabel(modalSubjectGroupSelect),
            subjectId: modalSubjectSelect.value ? Number(modalSubjectSelect.value) : null,
            subjectName: getSelectedLabel(modalSubjectSelect),
            homeworkDate: document.getElementById('homeworkDate').value,
            submissionDate: document.getElementById('submissionDate').value,
            maxMarks: document.getElementById('maxMarks').value || null,
            description: document.getElementById('description').value.trim()
        };
    }

    async function saveHomework(event) {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload.className || !payload.section || !payload.subjectGroupName || !payload.subjectName) {
            showError('Please fill all required fields.');
            return;
        }
        if (!payload.homeworkDate || !payload.submissionDate) {
            showError('Homework date and submission date are required.');
            return;
        }
        if (!payload.description) {
            showError('Description is required.');
            return;
        }

        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (documentInput.files && documentInput.files[0]) {
            formData.append('document', documentInput.files[0]);
        }

        const url = isEditMode && homeworkIdInput.value
            ? '/api/homework/' + homeworkIdInput.value
            : '/api/homework';
        const method = isEditMode && homeworkIdInput.value ? 'PUT' : 'POST';

        saveHomeworkBtn.disabled = true;
        try {
            const response = await fetch(url, { method: method, body: formData });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save homework');
            }
            showSuccess(result.message || 'Homework saved successfully!');
            closeModal();
            await loadHomeworkRows();
        } catch (error) {
            showError(error.message);
        } finally {
            saveHomeworkBtn.disabled = false;
        }
    }

    async function openEditModal(id) {
        const response = await fetch('/api/homework/' + id);
        if (!response.ok) {
            showError('Homework record not found.');
            return;
        }
        const row = await response.json();
        isEditMode = true;
        homeworkIdInput.value = row.id;
        homeworkModalTitle.textContent = 'Edit Homework';
        saveHomeworkBtn.textContent = 'Update';
        renderClassOptions(modalClassSelect, row.classId);
        populateSectionOptions(row.classId, modalSectionSelect, row.section);
        populateSubjectGroupOptions(row.classId, row.section, modalSubjectGroupSelect, row.subjectGroupId);
        populateSubjectOptions(row.subjectGroupId, modalSubjectSelect, row.subjectId);
        document.getElementById('homeworkDate').value = row.homeworkDate || todayIso();
        document.getElementById('submissionDate').value = row.submissionDate || todayIso();
        document.getElementById('maxMarks').value = row.maxMarks != null ? row.maxMarks : '';
        document.getElementById('description').value = row.description || '';
        fileUploadLabel.textContent = row.documentName || 'Drag and drop a file here or click';
        openModal();
    }

    async function deleteHomework(id) {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete homework?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete'
        });
        if (!confirm.isConfirmed) return;

        const response = await fetch('/api/homework/' + id, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok || !result.success) {
            showError(result.message || 'Failed to delete homework');
            return;
        }
        showSuccess(result.message || 'Homework deleted successfully!');
        await loadHomeworkRows();
    }

    addHomeworkBtn.addEventListener('click', function () {
        resetModalForm();
        openModal();
    });

    homeworkModalCloseBtn.addEventListener('click', closeModal);
    homeworkModalOverlay.addEventListener('click', closeModal);
    homeworkForm.addEventListener('submit', saveHomework);

    evaluateHomeworkCloseBtn.addEventListener('click', closeEvaluateModal);
    evaluateHomeworkOverlay.addEventListener('click', closeEvaluateModal);
    evaluateHomeworkForm.addEventListener('submit', saveEvaluation);

    criteriaForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loadHomeworkRows().catch(function (error) {
            showError(error.message);
        });
    });

    searchInput.addEventListener('input', applyLocalFilters);
    entriesSelect.addEventListener('change', renderTable);

    homeworkTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            homeworkTabs.forEach(function (item) { item.classList.remove('active'); });
            tab.classList.add('active');
            currentTab = tab.dataset.tab || 'upcoming';
            loadHomeworkRows().catch(function (error) {
                showError(error.message);
            });
        });
    });

    homeworkTableBody.addEventListener('click', function (event) {
        const evaluateBtn = event.target.closest('.btn-evaluate');
        const editBtn = event.target.closest('.btn-edit');
        const deleteBtn = event.target.closest('.btn-delete');
        const row = event.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        if (evaluateBtn) {
            openEvaluateModalById(id);
        } else if (editBtn) {
            openEditModal(id);
        } else if (deleteBtn) {
            deleteHomework(id);
        }
    });

    documentInput.addEventListener('change', function () {
        if (documentInput.files && documentInput.files[0]) {
            fileUploadLabel.textContent = documentInput.files[0].name;
        }
    });

    bindCascade(criteriaClassSelect, criteriaSectionSelect, criteriaSubjectGroupSelect, criteriaSubjectSelect);
    bindCascade(modalClassSelect, modalSectionSelect, modalSubjectGroupSelect, modalSubjectSelect);

    loadMasterData()
        .then(loadHomeworkRows)
        .catch(function (error) {
            showError(error.message);
        });
});
