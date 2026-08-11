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
                const rowId = row.getAttribute('data-id');
                const groupName = row.getAttribute('data-name') || 'this group';
                Swal.fire({
                    title: 'Add Exam',
                    input: 'text',
                    inputLabel: 'Exam name for "' + groupName + '"',
                    inputPlaceholder: 'Enter exam name',
                    showCancelButton: true,
                    confirmButtonColor: '#8b5cf6',
                    cancelButtonColor: '#64748b',
                    inputValidator: function (value) {
                        if (!value || !value.trim()) {
                            return 'Exam name is required';
                        }
                        return null;
                    }
                }).then(async function (result) {
                    if (!result.isConfirmed) return;
                    try {
                        const response = await fetch('/api/exam-groups/' + rowId + '/exams', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: result.value.trim() })
                        });
                        const data = await response.json().catch(function () { return {}; });
                        if (!response.ok || !data.success) {
                            throw new Error(data.message || 'Failed to add exam');
                        }
                        await loadGroups();
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
