document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const subjectGroupSelect = document.getElementById('subjectGroupSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const lessonSelect = document.getElementById('lessonSelect');
    const topicForm = document.getElementById('topicForm');
    const lessonIdInput = document.getElementById('lessonId');
    const topicNameRows = document.getElementById('topicNameRows');
    const addTopicRowBtn = document.getElementById('addTopicRowBtn');
    const saveBtn = document.getElementById('saveBtn');
    const topicTableBody = document.getElementById('topicTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');

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

    function resetTopicNameRows(values) {
        const names = values && values.length ? values : [''];
        topicNameRows.innerHTML = names.map(function (name) {
            return '<div class="topic-name-row">'
                + '<input type="text" class="form-control topic-name-input" placeholder="Topic Name" value="' + escapeHtml(name) + '" required>'
                + '<button type="button" class="btn-remove-topic" aria-label="Remove topic">&times;</button>'
                + '</div>';
        }).join('');
        updateRemoveButtons();
    }

    function updateRemoveButtons() {
        const rowEls = topicNameRows.querySelectorAll('.topic-name-row');
        rowEls.forEach(function (row) {
            const btn = row.querySelector('.btn-remove-topic');
            if (btn) {
                btn.hidden = rowEls.length <= 1;
            }
        });
    }

    function getTopicNamesFromForm() {
        return Array.from(topicNameRows.querySelectorAll('.topic-name-input'))
            .map(function (input) { return input.value.trim(); })
            .filter(function (value) { return value.length > 0; });
    }

    function resetForm() {
        isEditMode = false;
        topicForm.reset();
        lessonIdInput.value = '';
        saveBtn.textContent = 'Save';
        resetTopicNameRows(['']);
        sectionSelect.innerHTML = '<option value="">Select class first</option>';
        sectionSelect.disabled = true;
        subjectGroupSelect.innerHTML = '<option value="">Select section first</option>';
        subjectGroupSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
        lessonSelect.innerHTML = '<option value="">Select subject first</option>';
        lessonSelect.disabled = true;
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

    async function loadLessons(selectedLessonId) {
        const classId = classSelect.value;
        const section = sectionSelect.value;
        const subjectGroupId = subjectGroupSelect.value;
        const subjectId = subjectSelect.value;

        if (!classId || !section || !subjectGroupId || !subjectId) {
            lessonSelect.innerHTML = '<option value="">Select subject first</option>';
            lessonSelect.disabled = true;
            return;
        }

        try {
            const url = '/api/lesson-plan/lessons?classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section)
                + '&subjectGroupId=' + encodeURIComponent(subjectGroupId)
                + '&subjectId=' + encodeURIComponent(subjectId);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load lessons');
            }
            const lessons = await response.json();
            if (!lessons.length) {
                lessonSelect.innerHTML = '<option value="">No lessons found</option>';
                lessonSelect.disabled = true;
                return;
            }
            lessonSelect.disabled = false;
            lessonSelect.innerHTML = '<option value="">Select</option>' + lessons.map(function (lesson) {
                return '<option value="' + lesson.id + '">' + escapeHtml(lesson.lessonName) + '</option>';
            }).join('');
            if (selectedLessonId) {
                lessonSelect.value = String(selectedLessonId);
            }
        } catch (error) {
            showError(error.message);
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
                row.lessonName,
                (row.topics || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.includes(term);
        });
    }

    function renderTopicCell(topics) {
        if (!topics || !topics.length) {
            return '';
        }
        return '<div class="topic-cell-list">' + topics.map(function (topic) {
            return '<span>' + escapeHtml(topic) + '</span>';
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
            topicTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#94a3b8;">No topics found</td></tr>';
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filtered.slice(startIndex, endIndex);

        topicTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.className) + '</td>'
                + '<td>' + escapeHtml(row.section) + '</td>'
                + '<td>' + escapeHtml(row.subjectGroupName) + '</td>'
                + '<td>' + escapeHtml(row.subjectLabel) + '</td>'
                + '<td>' + escapeHtml(row.lessonName) + '</td>'
                + '<td>' + renderTopicCell(row.topics) + '</td>'
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
        const [classesResponse, sectionsResponse, groupsResponse, subjectsResponse, topicsResponse] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections'),
            fetch('/api/subject-groups'),
            fetch('/api/subjects'),
            fetch('/api/lesson-plan/topics')
        ]);

        if (!classesResponse.ok || !sectionsResponse.ok || !groupsResponse.ok
                || !subjectsResponse.ok || !topicsResponse.ok) {
            throw new Error('Failed to load page data');
        }

        classes = await classesResponse.json();
        masterSections = await sectionsResponse.json();
        subjectGroups = await groupsResponse.json();
        masterSubjects = await subjectsResponse.json();
        rows = await topicsResponse.json();
        renderClassOptions();
        renderTable();
    }

    async function populateFormForEdit(id) {
        const response = await fetch('/api/lesson-plan/lessons/' + id);
        if (!response.ok) {
            throw new Error('Failed to load topic details');
        }
        const detail = await response.json();

        isEditMode = true;
        lessonIdInput.value = detail.id;
        saveBtn.textContent = 'Update';
        classSelect.value = String(detail.classId || '');
        populateSectionOptions(detail.classId, detail.section);
        populateSubjectGroupOptions(detail.subjectGroupId);
        populateSubjectOptions(detail.subjectId);
        await loadLessons(detail.id);
        resetTopicNameRows(detail.topicNames || detail.topics || ['']);
    }

    classSelect.addEventListener('change', function () {
        populateSectionOptions(classSelect.value, '');
        subjectGroupSelect.innerHTML = '<option value="">Select section first</option>';
        subjectGroupSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
        lessonSelect.innerHTML = '<option value="">Select subject first</option>';
        lessonSelect.disabled = true;
    });

    sectionSelect.addEventListener('change', function () {
        populateSubjectGroupOptions('');
        subjectSelect.innerHTML = '<option value="">Select subject group first</option>';
        subjectSelect.disabled = true;
        lessonSelect.innerHTML = '<option value="">Select subject first</option>';
        lessonSelect.disabled = true;
    });

    subjectGroupSelect.addEventListener('change', function () {
        populateSubjectOptions('');
        lessonSelect.innerHTML = '<option value="">Select subject first</option>';
        lessonSelect.disabled = true;
    });

    subjectSelect.addEventListener('change', function () {
        loadLessons('');
    });

    addTopicRowBtn.addEventListener('click', function () {
        const row = document.createElement('div');
        row.className = 'topic-name-row';
        row.innerHTML = ''
            + '<input type="text" class="form-control topic-name-input" placeholder="Topic Name" required>'
            + '<button type="button" class="btn-remove-topic" aria-label="Remove topic">&times;</button>';
        topicNameRows.appendChild(row);
        updateRemoveButtons();
        row.querySelector('.topic-name-input').focus();
    });

    topicNameRows.addEventListener('click', function (event) {
        const removeBtn = event.target.closest('.btn-remove-topic');
        if (!removeBtn) {
            return;
        }
        const row = removeBtn.closest('.topic-name-row');
        if (row && topicNameRows.querySelectorAll('.topic-name-row').length > 1) {
            row.remove();
            updateRemoveButtons();
        }
    });

    topicForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const topicNames = getTopicNamesFromForm();
        if (!topicNames.length) {
            showError('Please enter at least one topic name.');
            return;
        }

        const selectedLesson = lessonSelect.options[lessonSelect.selectedIndex];
        const payload = {
            classId: Number(classSelect.value),
            section: sectionSelect.value,
            subjectGroupId: Number(subjectGroupSelect.value),
            subjectId: Number(subjectSelect.value),
            topicNames: topicNames
        };

        if (isEditMode && lessonIdInput.value) {
            payload.lessonName = selectedLesson ? selectedLesson.textContent.trim() : '';
        } else if (lessonSelect.value) {
            payload.lessonId = Number(lessonSelect.value);
        } else {
            showError('Please select a lesson.');
            return;
        }

        try {
            const editingId = isEditMode ? lessonIdInput.value : '';
            const url = editingId ? '/api/lesson-plan/lessons/' + editingId : '/api/lesson-plan/topics';
            const method = editingId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save topic');
            }
            resetForm();
            rows = await fetch('/api/lesson-plan/topics').then(function (res) { return res.json(); });
            renderTable();
            showSuccess(result.message || 'Topic saved successfully!');
        } catch (error) {
            showError(error.message);
        }
    });

    topicTableBody.addEventListener('click', async function (event) {
        const editBtn = event.target.closest('.btn-edit');
        const deleteBtn = event.target.closest('.btn-delete');
        const row = event.target.closest('tr');
        if (!row || !row.dataset.id) {
            return;
        }

        if (editBtn) {
            try {
                await populateFormForEdit(row.dataset.id);
            } catch (error) {
                showError(error.message);
            }
            return;
        }

        if (deleteBtn) {
            const confirm = await Swal.fire({
                icon: 'warning',
                title: 'Delete topic?',
                text: 'This will delete the lesson and all its topics.',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!confirm.isConfirmed) {
                return;
            }
            try {
                const response = await fetch('/api/lesson-plan/lessons/' + row.dataset.id, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to delete topic');
                }
                if (lessonIdInput.value === row.dataset.id) {
                    resetForm();
                }
                rows = await fetch('/api/lesson-plan/topics').then(function (res) { return res.json(); });
                renderTable();
                showSuccess(result.message || 'Topic deleted successfully!');
            } catch (error) {
                showError(error.message);
            }
        }
    });

    searchInput.addEventListener('input', function () {
        currentPage = 1;
        renderTable();
    });

    entriesSelect.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderTable();
    });

    document.getElementById('copyBtn')?.addEventListener('click', function () {
        const exportRows = getFilteredRows().map(function (row) {
            return [row.className, row.section, row.subjectGroupName, row.subjectLabel, row.lessonName, (row.topics || []).join(', ')].join('\t');
        });
        if (!exportRows.length) {
            return;
        }
        navigator.clipboard.writeText(exportRows.join('\n'));
        showSuccess('Copied to clipboard.');
    });

    document.getElementById('excelBtn')?.addEventListener('click', function () {
        const exportRows = getFilteredRows().map(function (row) {
            return {
                Class: row.className,
                Section: row.section,
                'Subject Group': row.subjectGroupName,
                Subject: row.subjectLabel,
                Lesson: row.lessonName,
                Topic: (row.topics || []).join(', ')
            };
        });
        if (!exportRows.length || !window.XLSX) {
            return;
        }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportRows);
        XLSX.utils.book_append_sheet(wb, ws, 'Topics');
        XLSX.writeFile(wb, 'lesson-plan-topics.xlsx');
    });

    document.getElementById('pdfBtn')?.addEventListener('click', function () {
        const exportRows = getFilteredRows();
        if (!exportRows.length || !window.jspdf) {
            return;
        }
        const doc = new window.jspdf.jsPDF({ orientation: 'landscape' });
        doc.text('Topic List', 14, 15);
        doc.autoTable({
            startY: 22,
            head: [['Class', 'Section', 'Subject Group', 'Subject', 'Lesson', 'Topic']],
            body: exportRows.map(function (row) {
                return [
                    row.className,
                    row.section,
                    row.subjectGroupName,
                    row.subjectLabel,
                    row.lessonName,
                    (row.topics || []).join(', ')
                ];
            })
        });
        doc.save('lesson-plan-topics.pdf');
    });

    document.getElementById('printBtn')?.addEventListener('click', function () {
        window.print();
    });

    loadInitialData().catch(function (error) {
        showError(error.message);
    });
});
