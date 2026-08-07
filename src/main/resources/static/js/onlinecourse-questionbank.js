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
    const tagForm = document.getElementById('tagForm');
    const questionForm = document.getElementById('questionForm');
    const tagNameInput = document.getElementById('tagNameInput');
    const questionIdInput = document.getElementById('questionId');
    const questionTagSelect = document.getElementById('questionTagSelect');
    const questionTypeSelect = document.getElementById('questionTypeSelect');
    const questionLevelSelect = document.getElementById('questionLevelSelect');
    const questionCorrectAnswer = document.getElementById('questionCorrectAnswer');
    const questionTextInput = document.getElementById('questionTextInput');
    const questionOptionsInput = document.getElementById('questionOptionsInput');
    const viewQuestionBody = document.getElementById('viewQuestionBody');

    let tags = [];
    let rows = [];
    let currentPage = 1;

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
        [tagModal, questionModal, viewModal].forEach(closeModal);
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

    function truncateQuestion(text) {
        const value = String(text || '');
        if (value.length <= 90) {
            return '<span class="question-preview">' + escapeHtml(value) + '</span>';
        }
        return '<span class="question-preview">' + escapeHtml(value.slice(0, 90))
            + '... <a href="#" class="read-more-link" data-action="view">Read more...</a></span>';
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
        const options = '<option value="">Select</option>' + tags.map(function (tag) {
            return '<option value="' + escapeHtml(tag.id) + '">' + escapeHtml(tag.tagName) + '</option>';
        }).join('');
        filterTag.innerHTML = options;
        questionTagSelect.innerHTML = options;
    }

    async function loadTags() {
        const response = await fetch('/api/online-course-question-tags');
        if (!response.ok) throw new Error('Failed to load tags');
        tags = await response.json();
        fillTagSelects();
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
        tagForm.reset();
        document.getElementById('tagModalTitle').textContent = 'Add Tag';
        openModal(tagModal);
        tagNameInput.focus();
    }

    function openQuestionModal(item) {
        questionForm.reset();
        fillTagSelects();
        if (item) {
            document.getElementById('questionModalTitle').textContent = 'Edit Question';
            questionIdInput.value = String(item.id);
            questionTagSelect.value = item.tagId == null ? '' : String(item.tagId);
            questionTypeSelect.value = item.questionType || '';
            questionLevelSelect.value = item.level || '';
            questionCorrectAnswer.value = item.correctAnswer || '';
            questionTextInput.value = item.questionText || '';
            questionOptionsInput.value = item.optionsJson || '';
        } else {
            document.getElementById('questionModalTitle').textContent = 'Add Question';
            questionIdInput.value = '';
        }
        openModal(questionModal);
    }

    function openViewModal(item) {
        viewQuestionBody.innerHTML = ''
            + '<div class="view-field"><strong>Q. ID:</strong> ' + escapeHtml(item.id) + '</div>'
            + '<div class="view-field"><strong>Question Tag:</strong> ' + escapeHtml(item.questionTag) + '</div>'
            + '<div class="view-field"><strong>Question Type:</strong> ' + escapeHtml(item.questionType) + '</div>'
            + '<div class="view-field"><strong>Level:</strong> ' + escapeHtml(item.level) + '</div>'
            + '<div class="view-field"><strong>Created By:</strong> ' + escapeHtml(item.createdBy || '') + '</div>'
            + '<div class="view-field"><strong>Correct Answer:</strong> ' + escapeHtml(item.correctAnswer || '-') + '</div>'
            + '<div class="view-field"><strong>Question:</strong><div class="view-question-text">' + escapeHtml(item.questionText) + '</div></div>';
        openModal(viewModal);
    }

    document.getElementById('addTagBtn').addEventListener('click', openTagModal);
    document.getElementById('addQuestionBtn').addEventListener('click', function () {
        openQuestionModal(null);
    });
    document.getElementById('importBtn').addEventListener('click', function () {
        Swal.fire({
            icon: 'info',
            title: 'Import',
            text: 'CSV import will be available in a later update. Use Add Question for now.',
            confirmButtonColor: '#8b5cf6'
        });
    });

    document.getElementById('saveTagBtn').addEventListener('click', async function () {
        const tagName = tagNameInput.value.trim();
        if (!tagName) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Tag name is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const response = await fetch('/api/online-course-question-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagName: tagName })
            });
            if (!response.ok) throw new Error(await parseError(response));
            closeModal(tagModal);
            await loadTags();
            Swal.fire({ icon: 'success', title: 'Saved', text: 'Tag saved to database.', timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    document.getElementById('saveQuestionBtn').addEventListener('click', async function () {
        const payload = {
            tagId: questionTagSelect.value,
            questionType: questionTypeSelect.value,
            level: questionLevelSelect.value,
            questionText: questionTextInput.value.trim(),
            correctAnswer: questionCorrectAnswer.value.trim(),
            optionsJson: questionOptionsInput.value.trim()
        };
        if (!payload.tagId || !payload.questionType || !payload.level || !payload.questionText) {
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
                String(item.questionText || '').replace(/\s+/g, ' '),
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

    Promise.all([loadTags(), loadQuestions()]).catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load question bank.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
