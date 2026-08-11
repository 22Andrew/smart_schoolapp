document.addEventListener('DOMContentLoaded', function () {
    const lessonForm = document.getElementById('lessonForm');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const subjectGroupSelect = document.getElementById('subjectGroupSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const originalClassIdInput = document.getElementById('originalClassId');
    const originalSectionInput = document.getElementById('originalSection');
    const originalSubjectGroupIdInput = document.getElementById('originalSubjectGroupId');
    const originalSubjectIdInput = document.getElementById('originalSubjectId');
    const lessonNameRows = document.getElementById('lessonNameRows');
    const addLessonRowBtn = document.getElementById('addLessonRowBtn');
    const saveBtn = document.getElementById('saveBtn');
    const lessonTableBody = document.getElementById('lessonTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const copyBtn = document.getElementById('copyBtn');
    const excelBtn = document.getElementById('excelBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let classes = [];
    let masterSections = [];
    let subjectGroups = [];
    let masterSubjects = [];
    let rows = [];
    let currentPage = 1;
    let pageSize = 50;
    let isEditMode = false;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
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
            timer: 1500,
            showConfirmButton: false
        });
    }

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>'
            + '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line>'
            + '<line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function resetLessonNameRows(values) {
        const names = values && values.length ? values : [''];
        lessonNameRows.innerHTML = names.map(function (name) {
            return '<div class="lesson-name-row">'
                + '<input type="text" class="form-control lesson-name-input" placeholder="Lesson Name" value="' + escapeHtml(name) + '" required>'
                + '<button type="button" class="btn-remove-lesson" aria-label="Remove lesson">&times;</button>'
                + '</div>';
        }).join('');
        updateRemoveButtons();
    }

    function updateRemoveButtons() {
        const rowEls = lessonNameRows.querySelectorAll('.lesson-name-row');
        rowEls.forEach(function (row) {
            const btn = row.querySelector('.btn-remove-lesson');
            if (btn) {
                btn.hidden = rowEls.length <= 1;
            }
        });
    }

    function getLessonNamesFromForm() {
        return Array.from(lessonNameRows.querySelectorAll('.lesson-name-input'))
            .map(function (input) { return input.value.trim(); })
            .filter(function (value) { return value.length > 0; });
    }

    function resetForm() {
        isEditMode = false;
        lessonForm.reset();
        originalClassIdInput.value = '';
        originalSectionInput.value = '';
        originalSubjectGroupIdInput.value = '';
        originalSubjectIdInput.value = '';
        saveBtn.textContent = 'Save';
        resetLessonNameRows(['']);
        sectionSelect.innerHTML = '<option value="">Select class first</option>';
        sectionSelect.disabled = true;
        subjectGroupSelect.innerHTML = '<option value="">Select section first</option>';
        subjectGroupSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
    }

    function renderClassOptions() {
        classSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateSectionOptions(classId, selectedSection) {
        const schoolClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        if (!schoolClass) {
            sectionSelect.innerHTML = '<option value="">Select class first</option>';
            sectionSelect.disabled = true;
            return;
        }

        const classSections = Array.isArray(schoolClass.sections) ? schoolClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (section) {
                return section.sectionName || section.name || section;
            }).filter(Boolean);

        if (!sections.length) {
            sectionSelect.innerHTML = '<option value="">No sections found</option>';
            sectionSelect.disabled = true;
            return;
        }

        sectionSelect.disabled = false;
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
        if (selectedSection) {
            sectionSelect.value = selectedSection;
        }
    }

    function asSubjectList(subjects) {
        if (!subjects) {
            return [];
        }
        if (Array.isArray(subjects)) {
            return subjects;
        }
        return Array.from(subjects);
    }

    function subjectLabel(subject) {
        if (!subject) {
            return '';
        }
        const code = subject.subjectCode ? ' (' + subject.subjectCode + ')' : '';
        return (subject.name || '') + code;
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

    function getFilteredSubjectGroups() {
        const classId = classSelect.value;
        const section = sectionSelect.value
            ? String(sectionSelect.value).toUpperCase()
            : '';

        let filtered = subjectGroups.slice();

        if (classId) {
            filtered = filtered.filter(function (group) {
                return getGroupClassId(group) === String(classId);
            });
        }

        if (section) {
            const bySection = filtered.filter(function (group) {
                const sections = (group.sections || []).map(function (item) {
                    return String(item).toUpperCase();
                });
                return !sections.length || sections.indexOf(section) !== -1;
            });
            if (bySection.length) {
                filtered = bySection;
            }
        }

        return filtered;
    }

    function populateSubjectGroupOptions(selectedGroupId) {
        const filtered = getFilteredSubjectGroups();
        if (!filtered.length) {
            subjectGroupSelect.innerHTML = '<option value="">No subject groups found</option>';
            subjectGroupSelect.disabled = true;
            return;
        }
        subjectGroupSelect.disabled = false;
        subjectGroupSelect.innerHTML = '<option value="">Select</option>' + filtered.map(function (group) {
            return '<option value="' + group.id + '">' + escapeHtml(group.name) + '</option>';
        }).join('');
        if (selectedGroupId) {
            subjectGroupSelect.value = String(selectedGroupId);
        }
    }

    function populateSubjectOptions(selectedSubjectId) {
        const group = subjectGroups.find(function (item) {
            return String(item.id) === String(subjectGroupSelect.value);
        });
        const groupSubjects = asSubjectList(group && group.subjects);
        const subjects = groupSubjects.length ? groupSubjects : masterSubjects;

        if (!subjects.length) {
            subjectSelect.innerHTML = '<option value="">No subjects found</option>';
            subjectSelect.disabled = true;
            return;
        }
        subjectSelect.disabled = false;
        subjectSelect.innerHTML = '<option value="">Select</option>' + subjects.map(function (subject) {
            return '<option value="' + subject.id + '">' + escapeHtml(subjectLabel(subject)) + '</option>';
        }).join('');
        if (selectedSubjectId) {
            subjectSelect.value = String(selectedSubjectId);
        }
    }

    function getFilteredRows() {
        const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!term) {
            return rows.slice();
        }
        return rows.filter(function (row) {
            const haystack = [
                row.className,
                row.section,
                row.subjectGroupName,
                row.subjectLabel,
                (row.lessonNames || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.includes(term);
        });
    }

    function renderLessonCell(lessonNames) {
        if (!lessonNames || !lessonNames.length) {
            return '';
        }
        return '<div class="lesson-cell-list">' + lessonNames.map(function (name) {
            return '<span>' + escapeHtml(name) + '</span>';
        }).join('') + '</div>';
    }

    function renderTable() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        if (!total) {
            lessonTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">No lessons found</td></tr>';
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filtered.slice(startIndex, endIndex);

        lessonTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr'
                + ' data-class-id="' + escapeHtml(String(row.classId)) + '"'
                + ' data-section="' + escapeHtml(row.section) + '"'
                + ' data-subject-group-id="' + escapeHtml(String(row.subjectGroupId)) + '"'
                + ' data-subject-id="' + escapeHtml(String(row.subjectId)) + '"'
                + '>'
                + '<td>' + escapeHtml(row.className) + '</td>'
                + '<td>' + escapeHtml(row.section) + '</td>'
                + '<td>' + escapeHtml(row.subjectGroupName) + '</td>'
                + '<td>' + escapeHtml(row.subjectLabel) + '</td>'
                + '<td>' + renderLessonCell(row.lessonNames) + '</td>'
                + '<td><div class="action-buttons">' + createActionButtonsHtml() + '</div></td>'
                + '</tr>';
        }).join('');

        showingInfo.textContent = 'Showing ' + (startIndex + 1) + ' to ' + endIndex + ' of ' + total + ' entries';
        renderPagination(total, totalPages);
    }

    function renderPagination(total, totalPages) {
        pagination.innerHTML = '';
        if (totalPages <= 1) {
            return;
        }

        function addButton(label, page, disabled, active) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = label;
            btn.className = 'pagination-btn' + (active ? ' active' : '');
            btn.disabled = !!disabled;
            btn.addEventListener('click', function () {
                currentPage = page;
                renderTable();
            });
            pagination.appendChild(btn);
        }

        addButton('‹', currentPage - 1, currentPage === 1, false);
        for (let page = 1; page <= totalPages; page += 1) {
            addButton(String(page), page, false, page === currentPage);
        }
        addButton('›', currentPage + 1, currentPage === totalPages, false);
    }

    async function loadInitialData() {
        const [classesResponse, sectionsResponse, groupsResponse, subjectsResponse, lessonsResponse] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups'),
            fetch('/api/subjects'),
            fetch('/api/lesson-plan/lesson-groups')
        ]);

        if (!classesResponse.ok || !sectionsResponse.ok || !groupsResponse.ok
                || !subjectsResponse.ok || !lessonsResponse.ok) {
            throw new Error('Failed to load page data');
        }

        classes = await classesResponse.json();
        masterSections = await sectionsResponse.json();
        subjectGroups = await groupsResponse.json();
        masterSubjects = await subjectsResponse.json();
        rows = await lessonsResponse.json();
        renderClassOptions();
        renderTable();
    }

    async function populateFormForEdit(rowEl) {
        const classId = rowEl.getAttribute('data-class-id');
        const section = rowEl.getAttribute('data-section');
        const subjectGroupId = rowEl.getAttribute('data-subject-group-id');
        const subjectId = rowEl.getAttribute('data-subject-id');

        const url = '/api/lesson-plan/lesson-groups/detail?classId=' + encodeURIComponent(classId)
            + '&section=' + encodeURIComponent(section)
            + '&subjectGroupId=' + encodeURIComponent(subjectGroupId)
            + '&subjectId=' + encodeURIComponent(subjectId);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load lesson details');
        }
        const detail = await response.json();

        isEditMode = true;
        originalClassIdInput.value = detail.originalClassId || detail.classId || '';
        originalSectionInput.value = detail.originalSection || detail.section || '';
        originalSubjectGroupIdInput.value = detail.originalSubjectGroupId || detail.subjectGroupId || '';
        originalSubjectIdInput.value = detail.originalSubjectId || detail.subjectId || '';
        saveBtn.textContent = 'Update';

        classSelect.value = String(detail.classId || '');
        populateSectionOptions(detail.classId, detail.section);
        populateSubjectGroupOptions(detail.subjectGroupId);
        populateSubjectOptions(detail.subjectId);
        resetLessonNameRows(detail.lessonNames || ['']);
    }

    async function saveLessonGroup(payload, isUpdate) {
        const response = await fetch('/api/lesson-plan/lesson-groups', {
            method: isUpdate ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to save lesson');
        }
        return result;
    }

    async function deleteLessonGroup(rowEl) {
        const classId = rowEl.getAttribute('data-class-id');
        const section = rowEl.getAttribute('data-section');
        const subjectGroupId = rowEl.getAttribute('data-subject-group-id');
        const subjectId = rowEl.getAttribute('data-subject-id');

        const url = '/api/lesson-plan/lesson-groups?classId=' + encodeURIComponent(classId)
            + '&section=' + encodeURIComponent(section)
            + '&subjectGroupId=' + encodeURIComponent(subjectGroupId)
            + '&subjectId=' + encodeURIComponent(subjectId);
        const response = await fetch(url, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete lesson');
        }
    }

    classSelect.addEventListener('change', function () {
        populateSectionOptions(classSelect.value, '');
        subjectGroupSelect.innerHTML = '<option value="">Select section first</option>';
        subjectGroupSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
    });

    sectionSelect.addEventListener('change', function () {
        populateSubjectGroupOptions('');
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
    });

    subjectGroupSelect.addEventListener('change', function () {
        populateSubjectOptions('');
    });

    addLessonRowBtn.addEventListener('click', function () {
        const row = document.createElement('div');
        row.className = 'lesson-name-row';
        row.innerHTML = ''
            + '<input type="text" class="form-control lesson-name-input" placeholder="Lesson Name" required>'
            + '<button type="button" class="btn-remove-lesson" aria-label="Remove lesson">&times;</button>';
        lessonNameRows.appendChild(row);
        updateRemoveButtons();
    });

    lessonNameRows.addEventListener('click', function (event) {
        const removeBtn = event.target.closest('.btn-remove-lesson');
        if (!removeBtn) {
            return;
        }
        const row = removeBtn.closest('.lesson-name-row');
        if (row && lessonNameRows.querySelectorAll('.lesson-name-row').length > 1) {
            row.remove();
            updateRemoveButtons();
        }
    });

    lessonForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const lessonNames = getLessonNamesFromForm();
        if (!lessonNames.length) {
            showError('At least one lesson name is required');
            return;
        }

        const payload = {
            classId: classSelect.value,
            section: sectionSelect.value,
            subjectGroupId: subjectGroupSelect.value,
            subjectId: subjectSelect.value,
            lessonNames: lessonNames
        };

        if (isEditMode) {
            payload.originalClassId = originalClassIdInput.value;
            payload.originalSection = originalSectionInput.value;
            payload.originalSubjectGroupId = originalSubjectGroupIdInput.value;
            payload.originalSubjectId = originalSubjectIdInput.value;
        }

        try {
            const result = await saveLessonGroup(payload, isEditMode);
            showSuccess(result.message);
            resetForm();
            await loadInitialData();
        } catch (error) {
            showError(error.message);
        }
    });

    lessonTableBody.addEventListener('click', function (event) {
        const editBtn = event.target.closest('.btn-edit');
        const deleteBtn = event.target.closest('.btn-delete');
        const rowEl = event.target.closest('tr');
        if (!rowEl) {
            return;
        }

        if (editBtn) {
            populateFormForEdit(rowEl).catch(showError);
            return;
        }

        if (deleteBtn) {
            Swal.fire({
                icon: 'warning',
                title: 'Delete Lesson?',
                text: 'This will delete all lessons for the selected class, section, subject group, and subject.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            }).then(async function (result) {
                if (!result.isConfirmed) {
                    return;
                }
                try {
                    await deleteLessonGroup(rowEl);
                    showSuccess('Lesson deleted successfully!');
                    await loadInitialData();
                } catch (error) {
                    showError(error.message);
                }
            });
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
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

    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const filtered = getFilteredRows();
            const text = filtered.map(function (row) {
                return [
                    row.className,
                    row.section,
                    row.subjectGroupName,
                    row.subjectLabel,
                    (row.lessonNames || []).join(', ')
                ].join('\t');
            }).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                showSuccess('Copied to clipboard');
            }).catch(function () {
                showError('Failed to copy');
            });
        });
    }

    if (excelBtn && window.XLSX) {
        excelBtn.addEventListener('click', function () {
            const exportRows = getFilteredRows().map(function (row) {
                return {
                    Class: row.className,
                    Section: row.section,
                    'Subject Group': row.subjectGroupName,
                    Subject: row.subjectLabel,
                    Lesson: (row.lessonNames || []).join(', ')
                };
            });
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportRows);
            XLSX.utils.book_append_sheet(wb, ws, 'Lessons');
            XLSX.writeFile(wb, 'lessons.xlsx');
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    if (pdfBtn && window.jspdf && window.jspdf.jsPDF) {
        pdfBtn.addEventListener('click', function () {
            const doc = new window.jspdf.jsPDF();
            const filtered = getFilteredRows();
            let y = 10;
            doc.setFontSize(12);
            doc.text('Lesson List', 10, y);
            y += 10;
            filtered.forEach(function (row) {
                const line = row.className + ' | ' + row.section + ' | '
                    + row.subjectGroupName + ' | ' + row.subjectLabel + ' | '
                    + (row.lessonNames || []).join(', ');
                doc.text(line, 10, y);
                y += 8;
                if (y > 280) {
                    doc.addPage();
                    y = 10;
                }
            });
            doc.save('lessons.pdf');
        });
    }

    loadInitialData().catch(function (error) {
        showError(error.message);
    });
});
