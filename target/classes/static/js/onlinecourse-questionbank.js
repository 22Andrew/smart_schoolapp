document.addEventListener('DOMContentLoaded', function () {
    const filterTag = document.getElementById('filterTag');
    const filterType = document.getElementById('filterType');
    const filterLevel = document.getElementById('filterLevel');
    const filterCreatedBy = document.getElementById('filterCreatedBy');
    const searchBtn = document.getElementById('searchQuestionsBtn');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const tableBody = document.getElementById('questionTableBody');
    const selectAll = document.getElementById('selectAllQuestions');
    const showingInfo = document.querySelector('.onlinecourse-questionbank-page .showing-info');

    const tagModal = document.getElementById('tagModal');
    const questionModal = document.getElementById('questionModal');
    const viewModal = document.getElementById('viewQuestionModal');
    const importModal = document.getElementById('importModal');
    const importDropzone = document.getElementById('importDropzone');
    const importFileInput = document.getElementById('importFileInput');
    const importDropzoneContent = document.getElementById('importDropzoneContent');
    const importFileName = document.getElementById('importFileName');
    const downloadImportTemplateBtn = document.getElementById('downloadImportTemplateBtn');
    const uploadImportBtn = document.getElementById('uploadImportBtn');
    let importFile = null;
    const tagForm = document.getElementById('tagForm');
    const questionForm = document.getElementById('questionForm');
    const tagIdInput = document.getElementById('tagIdInput');
    const tagNameInput = document.getElementById('tagNameInput');
    const tagTableBody = document.getElementById('tagTableBody');
    const tagSearchInput = document.getElementById('tagSearchInput');
    const tagEntriesSelect = document.getElementById('tagEntriesSelect');
    const tagShowingInfo = document.getElementById('tagShowingInfo');
    const tagPagination = document.getElementById('tagPagination');
    const tagColumnBtn = document.getElementById('tagColumnBtn');
    const tagColumnDropdown = document.getElementById('tagColumnDropdown');
    const saveTagBtn = document.getElementById('saveTagBtn');
    const questionIdInput = document.getElementById('questionId');
    const questionTagSelect = document.getElementById('questionTagSelect');
    const questionTypeSelect = document.getElementById('questionTypeSelect');
    const questionLevelSelect = document.getElementById('questionLevelSelect');
    const questionCorrectAnswer = document.getElementById('questionCorrectAnswer');
    const questionOptionsInput = document.getElementById('questionOptionsInput');
    const questionEditor = document.getElementById('questionEditor');
    const questionToolbar = document.getElementById('questionToolbar');
    const questionAddImageBtn = document.getElementById('questionAddImageBtn');
    const questionImageInput = document.getElementById('questionImageInput');
    const optionsGroup = document.getElementById('optionsGroup');
    const viewQuestionBody = document.getElementById('viewQuestionBody');

    let tags = [];
    let rows = [];
    let currentPage = 1;
    let tagPage = 1;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function openModal(modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        if (!document.querySelector('.qb-modal.open')) {
            document.body.style.overflow = '';
        }
    }

    function closeAllModals() {
        [tagModal, questionModal, viewModal, importModal].forEach(closeModal);
    }

    function resetImportModal() {
        importFile = null;
        if (importFileInput) importFileInput.value = '';
        if (importDropzoneContent) importDropzoneContent.hidden = false;
        if (importFileName) {
            importFileName.hidden = true;
            importFileName.textContent = '';
        }
        if (importDropzone) importDropzone.classList.remove('dragover');
        if (uploadImportBtn) uploadImportBtn.disabled = false;
    }

    function setImportFile(file) {
        if (!file) return;
        const name = String(file.name || '').toLowerCase();
        const valid = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
        if (!valid) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid file',
                text: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls).',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        importFile = file;
        if (importDropzoneContent) importDropzoneContent.hidden = true;
        if (importFileName) {
            importFileName.hidden = false;
            importFileName.textContent = file.name;
        }
    }

    function normalizeImportHeader(header) {
        return String(header || '').trim().toLowerCase().replace(/\s+/g, ' ');
    }

    function mapImportRow(headers, row) {
        const obj = {};
        headers.forEach(function (header, index) {
            const key = normalizeImportHeader(header);
            const value = row[index] == null ? '' : String(row[index]).trim();
            if (key === 'question tag' || key === 'tag name' || key === 'tag') obj.tagName = value;
            else if (key === 'question type' || key === 'type') obj.questionType = value;
            else if (key === 'question level' || key === 'level') obj.level = value;
            else if (key === 'question' || key === 'question text') obj.questionText = value;
            else if (key === 'correct answer' || key === 'answer') obj.correctAnswer = value;
            else if (key === 'options' || key === 'options json') obj.optionsJson = value;
        });
        return obj;
    }

    function parseImportFile(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onerror = function () { reject(new Error('Failed to read file')); };
            reader.onload = function (e) {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    if (!sheetName) throw new Error('No sheet found in file');
                    const sheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                    if (!rows.length || rows.length < 2) {
                        throw new Error('File must include a header row and at least one question');
                    }
                    const headers = rows[0];
                    const questions = [];
                    for (let i = 1; i < rows.length; i++) {
                        const mapped = mapImportRow(headers, rows[i] || []);
                        if (!mapped.tagName && !mapped.questionText) continue;
                        questions.push(mapped);
                    }
                    if (!questions.length) throw new Error('No question rows found in file');
                    resolve(questions);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function openImportModal() {
        resetImportModal();
        openModal(importModal);
    }

    function downloadImportTemplate() {
        const headers = ['Question Tag', 'Question Type', 'Question Level', 'Question', 'Correct Answer', 'Options'];
        const sample = [
            ['Science', 'Single Choice', 'Medium', 'Which of the following is a renewable source of energy?', 'Solar', '[{"text":"Solar","correct":true},{"text":"Coal","correct":false}]'],
            ['English', 'Descriptive', 'Low', 'Write a short paragraph about your favourite book.', '', '']
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers].concat(sample));
        ws['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 55 }, { wch: 16 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Questions');
        XLSX.writeFile(wb, 'Question_Import_Template.xlsx');
    }

    async function uploadImportFile() {
        if (!importFile) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please attach a file to import.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        uploadImportBtn.disabled = true;
        try {
            const questions = await parseImportFile(importFile);
            const response = await fetch('/api/online-course-questions/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: questions })
            });
            if (!response.ok) throw new Error(await parseError(response));
            const result = await response.json();
            closeModal(importModal);
            resetImportModal();
            await loadTags();
            await loadQuestions();
            Swal.fire({
                icon: 'success',
                title: 'Imported',
                text: (result.imported || 0) + ' question(s) saved to database'
                    + (result.skipped ? (' (' + result.skipped + ' skipped)') : '') + '.',
                confirmButtonColor: '#8b5cf6'
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Import failed',
                text: error.message || 'Failed to import questions.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            uploadImportBtn.disabled = false;
        }
    }

    function getPageSize() {
        return entriesSelect ? parseInt(entriesSelect.value, 10) || 100 : 100;
    }

    function getFilteredRows() {
        const term = tableSearchInput ? tableSearchInput.value.toLowerCase().trim() : '';
        if (!term) return rows.slice();
        return rows.filter(function (item) {
            return [
                item.id,
                item.questionTag,
                item.questionType,
                item.level,
                item.questionText,
                item.createdBy
            ].join(' ').toLowerCase().indexOf(term) !== -1;
        });
    }

    function updateShowingInfo(start, end, total) {
        if (!showingInfo) return;
        showingInfo.textContent = total === 0
            ? 'Showing 0 to 0 of 0 entries'
            : 'Showing ' + start + ' to ' + end + ' of ' + total + ' entries';
    }

    function renderPagination(total) {
        const pagination = document.querySelector('.onlinecourse-questionbank-page .pagination');
        if (!pagination) return;
        const pageSize = getPageSize();
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        pagination.innerHTML = '';
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'pagination-btn';
        prev.textContent = '<';
        prev.disabled = currentPage <= 1;
        prev.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                renderRows();
            }
        });
        pagination.appendChild(prev);

        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = 'pagination-btn active';
        pageBtn.textContent = String(currentPage);
        pagination.appendChild(pageBtn);

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'pagination-btn';
        next.textContent = '>';
        next.disabled = currentPage >= totalPages || total === 0;
        next.addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                renderRows();
            }
        });
        pagination.appendChild(next);
    }

    function stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html || '';
        return (div.textContent || '').trim();
    }

    function truncateQuestion(text) {
        const value = stripHtml(text);
        if (value.length <= 90) {
            return '<span class="question-preview">' + escapeHtml(value) + '</span>';
        }
        return '<span class="question-preview">' + escapeHtml(value.slice(0, 90))
            + '... <a href="#" class="read-more-link" data-action="view">Read more...</a></span>';
    }

    function getQuestionHtml() {
        return questionEditor ? questionEditor.innerHTML.trim() : '';
    }

    function setQuestionHtml(html) {
        if (questionEditor) questionEditor.innerHTML = html || '';
    }

    function syncChoiceFields() {
        if (!optionsGroup || !questionTypeSelect) return;
        const type = questionTypeSelect.value;
        const show = type === 'Single Choice' || type === 'Multiple Choice' || type === 'True/False';
        optionsGroup.hidden = !show;
    }

    function initQuestionEditor() {
        if (!questionToolbar || !questionEditor) return;

        questionToolbar.addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-cmd]');
            if (!btn) return;
            e.preventDefault();
            const cmd = btn.getAttribute('data-cmd');
            questionEditor.focus();
            if (cmd === 'createLink') {
                const url = window.prompt('Enter URL');
                if (url) document.execCommand('createLink', false, url);
                return;
            }
            document.execCommand(cmd, false, null);
        });

        questionToolbar.addEventListener('change', function (e) {
            const select = e.target.closest('select[data-cmd]');
            if (!select) return;
            const cmd = select.getAttribute('data-cmd');
            const value = select.value;
            questionEditor.focus();
            if (cmd === 'formatBlock') {
                document.execCommand('formatBlock', false, value);
            } else {
                document.execCommand(cmd, false, value);
            }
        });

        if (questionAddImageBtn && questionImageInput) {
            questionAddImageBtn.addEventListener('click', function () {
                questionImageInput.click();
            });
            questionImageInput.addEventListener('change', function () {
                const file = questionImageInput.files && questionImageInput.files[0];
                if (!file) return;
                if (!file.type || file.type.indexOf('image/') !== 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Invalid file',
                        text: 'Please choose an image file.',
                        confirmButtonColor: '#8b5cf6'
                    });
                    return;
                }
                const reader = new FileReader();
                reader.onload = function () {
                    questionEditor.focus();
                    document.execCommand('insertImage', false, reader.result);
                };
                reader.readAsDataURL(file);
                questionImageInput.value = '';
            });
        }

        if (questionTypeSelect) {
            questionTypeSelect.addEventListener('change', syncChoiceFields);
        }
    }

    function actionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action" title="View" data-action="view">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>'
            + '<button type="button" class="btn-action" title="Edit" data-action="edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>'
            + '<button type="button" class="btn-action" title="Delete" data-action="delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';
    }

    function renderRows() {
        const filtered = getFilteredRows();
        const pageSize = getPageSize();
        const total = filtered.length;
        const startIndex = (currentPage - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);

        tableBody.innerHTML = '';
        if (!pageItems.length) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="8" class="loading-cell">No questions found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0);
            if (selectAll) selectAll.checked = false;
            return;
        }

        pageItems.forEach(function (item) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', String(item.id));
            tr.innerHTML = ''
                + '<td><input type="checkbox" class="row-check" value="' + escapeHtml(item.id) + '"></td>'
                + '<td>' + escapeHtml(item.id) + '</td>'
                + '<td>' + escapeHtml(item.questionTag) + '</td>'
                + '<td>' + escapeHtml(item.questionType) + '</td>'
                + '<td>' + escapeHtml(item.level) + '</td>'
                + '<td>' + truncateQuestion(item.questionText) + '</td>'
                + '<td>' + escapeHtml(item.createdBy || '') + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml() + '</td>';
            tableBody.appendChild(tr);
        });

        updateShowingInfo(startIndex + 1, startIndex + pageItems.length, total);
        renderPagination(total);
        if (selectAll) selectAll.checked = false;
    }

    function fillTagSelects() {
        const currentFilter = filterTag.value;
        const currentQuestionTag = questionTagSelect.value;
        const options = '<option value="">Select</option>' + tags.map(function (tag) {
            return '<option value="' + escapeHtml(tag.id) + '">' + escapeHtml(tag.tagName) + '</option>';
        }).join('');
        filterTag.innerHTML = options;
        questionTagSelect.innerHTML = options;
        if (currentFilter) filterTag.value = currentFilter;
        if (currentQuestionTag) questionTagSelect.value = currentQuestionTag;
    }

    function getFilteredTags() {
        const term = tagSearchInput ? tagSearchInput.value.toLowerCase().trim() : '';
        if (!term) return tags.slice();
        return tags.filter(function (tag) {
            return String(tag.id).indexOf(term) !== -1
                || String(tag.tagName || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    function getTagPageSize() {
        return tagEntriesSelect ? parseInt(tagEntriesSelect.value, 10) || 50 : 50;
    }

    function applyTagColumnVisibility() {
        const table = document.getElementById('tagTable');
        if (!table || !tagColumnDropdown) return;
        tagColumnDropdown.querySelectorAll('.tag-column-toggle').forEach(function (checkbox) {
            const colIndex = parseInt(checkbox.getAttribute('data-column'), 10);
            const display = checkbox.checked ? '' : 'none';
            table.querySelectorAll('thead th').forEach(function (th, index) {
                if (index === colIndex) th.style.display = display;
            });
            table.querySelectorAll('tbody tr').forEach(function (row) {
                const cells = row.querySelectorAll('td');
                if (cells[colIndex]) cells[colIndex].style.display = display;
            });
        });
    }

    function renderTagPagination(total) {
        if (!tagPagination) return;
        const pageSize = getTagPageSize();
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (tagPage > totalPages) tagPage = totalPages;

        tagPagination.innerHTML = '';
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'pagination-btn';
        prev.textContent = '<';
        prev.disabled = tagPage <= 1;
        prev.addEventListener('click', function () {
            if (tagPage > 1) {
                tagPage--;
                renderTagTable();
            }
        });
        tagPagination.appendChild(prev);

        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = 'pagination-btn active';
        pageBtn.textContent = String(tagPage);
        tagPagination.appendChild(pageBtn);

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'pagination-btn';
        next.textContent = '>';
        next.disabled = tagPage >= totalPages || total === 0;
        next.addEventListener('click', function () {
            if (tagPage < totalPages) {
                tagPage++;
                renderTagTable();
            }
        });
        tagPagination.appendChild(next);
    }

    function renderTagTable() {
        if (!tagTableBody) return;
        const filtered = getFilteredTags();
        const pageSize = getTagPageSize();
        const total = filtered.length;
        const startIndex = (tagPage - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);

        tagTableBody.innerHTML = '';
        if (!pageItems.length) {
            tagTableBody.innerHTML = '<tr class="no-data-row"><td colspan="3" class="loading-cell">No tags found</td></tr>';
            if (tagShowingInfo) tagShowingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderTagPagination(0);
            return;
        }

        pageItems.forEach(function (tag) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', String(tag.id));
            tr.innerHTML = ''
                + '<td>' + escapeHtml(tag.id) + '</td>'
                + '<td class="tag-name-cell">' + escapeHtml(tag.tagName) + '</td>'
                + '<td class="action-cell">'
                + '<button type="button" class="btn-action" title="Edit" data-tag-action="edit">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>'
                + '<button type="button" class="btn-action" title="Delete" data-tag-action="delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
                + '</td>';
            tagTableBody.appendChild(tr);
        });

        if (tagShowingInfo) {
            tagShowingInfo.textContent = 'Showing ' + (startIndex + 1) + ' to '
                + (startIndex + pageItems.length) + ' of ' + total + ' entries';
        }
        renderTagPagination(total);
        applyTagColumnVisibility();
    }

    function resetTagForm() {
        tagForm.reset();
        if (tagIdInput) tagIdInput.value = '';
        document.getElementById('tagModalTitle').textContent = 'Add Tag';
        if (saveTagBtn) saveTagBtn.textContent = 'Save';
    }

    async function loadTags() {
        const response = await fetch('/api/online-course-question-tags');
        if (!response.ok) throw new Error('Failed to load tags');
        tags = await response.json();
        fillTagSelects();
        renderTagTable();
    }

    async function loadCreatedBy() {
        const response = await fetch('/api/online-course-questions/created-by');
        if (!response.ok) return;
        const list = await response.json();
        const current = filterCreatedBy.value;
        filterCreatedBy.innerHTML = '<option value="">Select</option>';
        (Array.isArray(list) ? list : []).forEach(function (name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            filterCreatedBy.appendChild(option);
        });
        if (current) filterCreatedBy.value = current;
    }

    async function loadQuestions() {
        const params = [];
        if (filterTag.value) params.push('tagId=' + encodeURIComponent(filterTag.value));
        if (filterType.value) params.push('type=' + encodeURIComponent(filterType.value));
        if (filterLevel.value) params.push('level=' + encodeURIComponent(filterLevel.value));
        if (filterCreatedBy.value) params.push('createdBy=' + encodeURIComponent(filterCreatedBy.value));
        const url = '/api/online-course-questions' + (params.length ? '?' + params.join('&') : '');
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load questions');
        rows = await response.json();
        currentPage = 1;
        renderRows();
        await loadCreatedBy();
    }

    async function parseError(response) {
        try {
            const data = await response.json();
            return data.message || 'Request failed';
        } catch (e) {
            return 'Request failed';
        }
    }

    function openTagModal() {
        resetTagForm();
        tagPage = 1;
        if (tagSearchInput) tagSearchInput.value = '';
        openModal(tagModal);
        loadTags().then(function () {
            tagNameInput.focus();
        }).catch(function (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        });
    }

    async function saveTag(e) {
        if (e) e.preventDefault();
        const tagName = tagNameInput.value.trim();
        if (!tagName) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Tag name is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const editingId = tagIdInput ? tagIdInput.value : '';
        try {
            const response = await fetch(editingId
                ? '/api/online-course-question-tags/' + encodeURIComponent(editingId)
                : '/api/online-course-question-tags', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagName: tagName })
            });
            if (!response.ok) throw new Error(await parseError(response));
            resetTagForm();
            await loadTags();
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Updated' : 'Saved',
                text: editingId ? 'Tag updated successfully.' : 'Tag saved to database.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    }

    function openQuestionModal(item) {
        questionForm.reset();
        fillTagSelects();
        setQuestionHtml('');
        if (item) {
            document.getElementById('questionModalTitle').textContent = 'Question';
            questionIdInput.value = String(item.id);
            questionTagSelect.value = item.tagId == null ? '' : String(item.tagId);
            questionTypeSelect.value = item.questionType || '';
            questionLevelSelect.value = item.level || '';
            if (questionCorrectAnswer) questionCorrectAnswer.value = item.correctAnswer || '';
            if (questionOptionsInput) questionOptionsInput.value = item.optionsJson || '';
            setQuestionHtml(item.questionText || '');
        } else {
            document.getElementById('questionModalTitle').textContent = 'Question';
            questionIdInput.value = '';
            if (questionCorrectAnswer) questionCorrectAnswer.value = '';
            if (questionOptionsInput) questionOptionsInput.value = '';
        }
        syncChoiceFields();
        openModal(questionModal);
        setTimeout(function () {
            if (questionEditor) questionEditor.focus();
        }, 50);
    }

    function openViewModal(item) {
        viewQuestionBody.innerHTML = ''
            + '<div class="view-field"><strong>Q. ID:</strong> ' + escapeHtml(item.id) + '</div>'
            + '<div class="view-field"><strong>Question Tag:</strong> ' + escapeHtml(item.questionTag) + '</div>'
            + '<div class="view-field"><strong>Question Type:</strong> ' + escapeHtml(item.questionType) + '</div>'
            + '<div class="view-field"><strong>Level:</strong> ' + escapeHtml(item.level) + '</div>'
            + '<div class="view-field"><strong>Created By:</strong> ' + escapeHtml(item.createdBy || '') + '</div>'
            + '<div class="view-field"><strong>Correct Answer:</strong> ' + escapeHtml(item.correctAnswer || '-') + '</div>'
            + '<div class="view-field"><strong>Question:</strong><div class="view-question-text">' + (item.questionText || '') + '</div></div>';
        openModal(viewModal);
    }

    document.getElementById('addTagBtn').addEventListener('click', openTagModal);
    document.getElementById('addQuestionBtn').addEventListener('click', function () {
        openQuestionModal(null);
    });
    document.getElementById('importBtn').addEventListener('click', openImportModal);

    if (downloadImportTemplateBtn) {
        downloadImportTemplateBtn.addEventListener('click', downloadImportTemplate);
    }
    if (uploadImportBtn) {
        uploadImportBtn.addEventListener('click', uploadImportFile);
    }
    if (importDropzone && importFileInput) {
        importDropzone.addEventListener('click', function () {
            importFileInput.click();
        });
        importFileInput.addEventListener('change', function () {
            const file = importFileInput.files && importFileInput.files[0];
            setImportFile(file);
        });
        importDropzone.addEventListener('dragover', function (e) {
            e.preventDefault();
            importDropzone.classList.add('dragover');
        });
        importDropzone.addEventListener('dragleave', function () {
            importDropzone.classList.remove('dragover');
        });
        importDropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            importDropzone.classList.remove('dragover');
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            setImportFile(file);
        });
    }

    if (tagForm) tagForm.addEventListener('submit', saveTag);

    if (tagTableBody) {
        tagTableBody.addEventListener('click', async function (e) {
            const btn = e.target.closest('[data-tag-action]');
            const row = e.target.closest('tr');
            if (!btn || !row) return;
            const id = row.getAttribute('data-id');
            const tag = tags.find(function (t) { return String(t.id) === String(id); });
            if (!tag) return;

            if (btn.getAttribute('data-tag-action') === 'edit') {
                tagIdInput.value = String(tag.id);
                tagNameInput.value = tag.tagName || '';
                document.getElementById('tagModalTitle').textContent = 'Edit Tag';
                saveTagBtn.textContent = 'Update';
                tagNameInput.focus();
                return;
            }

            if (btn.getAttribute('data-tag-action') === 'delete') {
                const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Delete Tag?',
                    text: '"' + tag.tagName + '" will be deleted from the database.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                });
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/online-course-question-tags/' + encodeURIComponent(id), {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error(await parseError(response));
                    if (tagIdInput.value === String(id)) resetTagForm();
                    await loadTags();
                    Swal.fire({ icon: 'success', title: 'Deleted', timer: 1400, showConfirmButton: false });
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
                }
            }
        });
    }

    if (tagSearchInput) {
        tagSearchInput.addEventListener('input', function () {
            tagPage = 1;
            renderTagTable();
        });
    }
    if (tagEntriesSelect) {
        tagEntriesSelect.addEventListener('change', function () {
            tagPage = 1;
            renderTagTable();
        });
    }
    if (tagColumnBtn && tagColumnDropdown) {
        tagColumnBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            tagColumnDropdown.classList.toggle('active');
        });
        tagColumnDropdown.addEventListener('change', applyTagColumnVisibility);
        document.addEventListener('click', function (e) {
            if (!tagColumnDropdown.contains(e.target) && e.target !== tagColumnBtn) {
                tagColumnDropdown.classList.remove('active');
            }
        });
    }

    function getTagTableData() {
        const headers = ['Tag ID', 'Tag Name'];
        const data = getFilteredTags().map(function (tag) {
            return [String(tag.id), tag.tagName || ''];
        });
        return { headers: headers, data: data };
    }

    const tagCopyBtn = document.getElementById('tagCopyBtn');
    if (tagCopyBtn) {
        tagCopyBtn.addEventListener('click', function () {
            const result = getTagTableData();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied!', timer: 1400, showConfirmButton: false });
            });
        });
    }
    const tagExcelBtn = document.getElementById('tagExcelBtn');
    if (tagExcelBtn) {
        tagExcelBtn.addEventListener('click', function () {
            const result = getTagTableData();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Tags');
            XLSX.writeFile(wb, 'Question_Tags_' + new Date().toISOString().split('T')[0] + '.xlsx');
        });
    }
    const tagCsvBtn = document.getElementById('tagCsvBtn');
    if (tagCsvBtn) {
        tagCsvBtn.addEventListener('click', function () {
            const result = getTagTableData();
            let csv = result.headers.join(',') + '\n';
            result.data.forEach(function (row) {
                csv += row.map(function (cell) {
                    return (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1)
                        ? '"' + cell.replace(/"/g, '""') + '"'
                        : cell;
                }).join(',') + '\n';
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Question_Tags_' + new Date().toISOString().split('T')[0] + '.csv';
            link.click();
        });
    }
    const tagPdfBtn = document.getElementById('tagPdfBtn');
    if (tagPdfBtn) {
        tagPdfBtn.addEventListener('click', function () {
            const result = getTagTableData();
            const doc = new window.jspdf.jsPDF('p', 'pt', 'a4');
            doc.text('Tag List', 40, 40);
            doc.autoTable({ head: [result.headers], body: result.data, startY: 55, styles: { fontSize: 10 } });
            doc.save('Question_Tags_' + new Date().toISOString().split('T')[0] + '.pdf');
        });
    }
    const tagPrintBtn = document.getElementById('tagPrintBtn');
    if (tagPrintBtn) {
        tagPrintBtn.addEventListener('click', function () {
            const result = getTagTableData();
            let html = '<html><head><title>Tag List</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#1e293b;color:#fff}</style></head><body><h1>Tag List</h1><table><thead><tr>';
            result.headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
            html += '</tr></thead><tbody>';
            result.data.forEach(function (row) {
                html += '<tr>';
                row.forEach(function (cell) { html += '<td>' + escapeHtml(cell) + '</td>'; });
                html += '</tr>';
            });
            html += '</tbody></table></body></html>';
            const win = window.open('', '_blank');
            win.document.write(html);
            win.document.close();
            win.print();
        });
    }

    document.getElementById('saveQuestionBtn').addEventListener('click', async function () {
        const questionHtml = getQuestionHtml();
        const questionPlain = stripHtml(questionHtml);
        const payload = {
            tagId: questionTagSelect.value,
            questionType: questionTypeSelect.value,
            level: questionLevelSelect.value,
            questionText: questionHtml,
            correctAnswer: questionCorrectAnswer ? questionCorrectAnswer.value.trim() : '',
            optionsJson: questionOptionsInput ? questionOptionsInput.value.trim() : ''
        };
        if (!payload.tagId || !payload.questionType || !payload.level || !questionPlain) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please fill Tag, Type, Level and Question.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        const editingId = questionIdInput.value;
        try {
            const response = await fetch(editingId
                ? '/api/online-course-questions/' + encodeURIComponent(editingId)
                : '/api/online-course-questions', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(await parseError(response));
            closeModal(questionModal);
            setQuestionHtml('');
            await loadQuestions();
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Updated' : 'Saved',
                text: editingId ? 'Question updated.' : 'Question saved to database.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    document.getElementById('bulkDeleteBtn').addEventListener('click', async function () {
        const ids = Array.from(document.querySelectorAll('.row-check:checked')).map(function (el) {
            return el.value;
        });
        if (!ids.length) {
            Swal.fire({ icon: 'warning', title: 'Select questions', text: 'Choose at least one question to delete.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Bulk Delete?',
            text: ids.length + ' question(s) will be deleted.',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) return;
        try {
            const response = await fetch('/api/online-course-questions/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: ids })
            });
            if (!response.ok) throw new Error(await parseError(response));
            await loadQuestions();
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const actionEl = e.target.closest('[data-action]');
        const row = e.target.closest('tr');
        if (!actionEl || !row) return;
        e.preventDefault();
        const id = row.getAttribute('data-id');
        const item = rows.find(function (r) { return String(r.id) === String(id); });
        if (!item) return;
        const action = actionEl.getAttribute('data-action');
        if (action === 'view') {
            openViewModal(item);
            return;
        }
        if (action === 'edit') {
            openQuestionModal(item);
            return;
        }
        if (action === 'delete') {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Question?',
                text: 'Q. ID ' + item.id + ' will be deleted from the database.',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/online-course-questions/' + encodeURIComponent(id), { method: 'DELETE' });
                if (!response.ok) throw new Error(await parseError(response));
                await loadQuestions();
                Swal.fire({ icon: 'success', title: 'Deleted', timer: 1400, showConfirmButton: false });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            }
        }
    });

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            document.querySelectorAll('.row-check').forEach(function (box) {
                box.checked = selectAll.checked;
            });
        });
    }

    searchBtn.addEventListener('click', function () {
        loadQuestions().catch(function (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        });
    });
    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            currentPage = 1;
            renderRows();
        });
    }
    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            currentPage = 1;
            renderRows();
        });
    }

    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', function () {
            const modal = el.closest('.qb-modal');
            if (modal) closeModal(modal);
        });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAllModals();
    });

    function getTableData() {
        const headers = ['Q. ID', 'Question Tag', 'Question Type', 'Level', 'Question', 'Created By'];
        const data = getFilteredRows().map(function (item) {
            return [
                String(item.id),
                item.questionTag || '',
                item.questionType || '',
                item.level || '',
                stripHtml(item.questionText).replace(/\s+/g, ' '),
                item.createdBy || ''
            ];
        });
        return { headers: headers, data: data };
    }

    document.getElementById('copyBtn').addEventListener('click', function () {
        const result = getTableData();
        let text = result.headers.join('\t') + '\n';
        result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied!', timer: 1400, showConfirmButton: false });
        });
    });
    document.getElementById('excelBtn').addEventListener('click', function () {
        const result = getTableData();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
        XLSX.utils.book_append_sheet(wb, ws, 'Question Bank');
        XLSX.writeFile(wb, 'Question_Bank_' + new Date().toISOString().split('T')[0] + '.xlsx');
    });
    document.getElementById('csvBtn').addEventListener('click', function () {
        const result = getTableData();
        let csv = result.headers.join(',') + '\n';
        result.data.forEach(function (row) {
            csv += row.map(function (cell) {
                return (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1)
                    ? '"' + cell.replace(/"/g, '""') + '"'
                    : cell;
            }).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Question_Bank_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
    });
    document.getElementById('pdfBtn').addEventListener('click', function () {
        const result = getTableData();
        const doc = new window.jspdf.jsPDF('l', 'pt', 'a4');
        doc.text('Question Bank', 40, 40);
        doc.autoTable({ head: [result.headers], body: result.data, startY: 55, styles: { fontSize: 8 } });
        doc.save('Question_Bank_' + new Date().toISOString().split('T')[0] + '.pdf');
    });
    document.getElementById('printBtn').addEventListener('click', function () {
        const result = getTableData();
        let html = '<html><head><title>Question Bank</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#1e293b;color:#fff}</style></head><body><h1>Question Bank</h1><table><thead><tr>';
        result.headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
        html += '</tr></thead><tbody>';
        result.data.forEach(function (row) {
            html += '<tr>';
            row.forEach(function (cell) { html += '<td>' + escapeHtml(cell) + '</td>'; });
            html += '</tr>';
        });
        html += '</tbody></table></body></html>';
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
    });

    initQuestionEditor();

    Promise.all([loadTags(), loadQuestions()]).catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load question bank.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
