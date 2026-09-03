document.addEventListener('DOMContentLoaded', function () {
    const addBtn = document.getElementById('addIssueItemBtn');
    const issueModal = document.getElementById('issueItemModal');
    const issueForm = document.getElementById('issueItemForm');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const tableBody = document.getElementById('issueItemTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const userTypeSelect = document.getElementById('userType');
    const issueToSelect = document.getElementById('issueToId');
    const issuedBySelect = document.getElementById('issuedById');
    const categorySelect = document.getElementById('itemCategoryId');
    const itemSelect = document.getElementById('itemId');

    let issues = [];
    let formOptions = { userTypes: [], staff: [], students: [], categories: [] };
    let currentPage = 1;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        if (value == null || String(value).trim() === '') return '';
        return String(value);
    }

    function todayIso() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return now.getFullYear() + '-' + month + '-' + day;
    }

    function pageSize() {
        return parseInt(entriesSelect && entriesSelect.value ? entriesSelect.value : '50', 10) || 50;
    }

    function filteredIssues() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!keyword) return issues.slice();
        return issues.filter(function (row) {
            return [
                row.itemName, row.note, row.itemCategory, row.issueReturn,
                row.issueTo, row.issuedBy, row.quantity, row.status
            ].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function emptyRowHtml() {
        return ''
            + '<tr><td colspan="9" class="empty-state-cell">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</td></tr>';
    }

    function statusCell(row) {
        if (row.returned) {
            return '<span class="status-returned">Returned</span>';
        }
        return '<button type="button" class="btn-return" data-id="' + escapeHtml(row.id) + '">Click To Return</button>';
    }

    function actionButtons(id) {
        return ''
            + '<div class="action-buttons">'
            + '<button type="button" class="btn-action btn-delete" data-id="' + escapeHtml(id) + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>'
            + '</div>';
    }

    function renderPagination(total, pages) {
        if (!pagination) return;
        if (!total) {
            pagination.innerHTML = ''
                + '<button type="button" class="pagination-btn" disabled>&lt;</button>'
                + '<button type="button" class="pagination-btn active">1</button>'
                + '<button type="button" class="pagination-btn" disabled>&gt;</button>';
            return;
        }
        let html = '<button type="button" class="pagination-btn" data-page="' + (currentPage - 1) + '"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let page = 1; page <= pages; page++) {
            html += '<button type="button" class="pagination-btn' + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="' + (currentPage + 1) + '"'
            + (currentPage >= pages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        if (!tableBody) return;
        const rows = filteredIssues();
        const size = pageSize();
        const pages = Math.max(1, Math.ceil(rows.length / size));
        if (currentPage > pages) currentPage = pages;
        const startIndex = rows.length ? (currentPage - 1) * size : 0;
        const pageRows = rows.slice(startIndex, startIndex + size);
        const start = rows.length ? startIndex + 1 : 0;
        const end = startIndex + pageRows.length;

        if (!pageRows.length) {
            tableBody.innerHTML = emptyRowHtml();
        } else {
            tableBody.innerHTML = pageRows.map(function (row) {
                return ''
                    + '<tr data-id="' + escapeHtml(row.id) + '">'
                    + '<td>' + escapeHtml(display(row.itemName)) + '</td>'
                    + '<td>' + escapeHtml(display(row.note)) + '</td>'
                    + '<td>' + escapeHtml(display(row.itemCategory)) + '</td>'
                    + '<td>' + escapeHtml(display(row.issueReturn)) + '</td>'
                    + '<td>' + escapeHtml(display(row.issueTo)) + '</td>'
                    + '<td>' + escapeHtml(display(row.issuedBy)) + '</td>'
                    + '<td>' + escapeHtml(display(row.quantity)) + '</td>'
                    + '<td>' + statusCell(row) + '</td>'
                    + '<td>' + actionButtons(row.id) + '</td>'
                    + '</tr>';
            }).join('');
        }

        if (showingInfo) {
            showingInfo.textContent = 'Records: ' + start + ' to ' + end + ' of ' + rows.length;
        }
        renderPagination(rows.length, pages);
    }

    function fillSelect(select, options, placeholder) {
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">' + placeholder + '</option>';
        (options || []).forEach(function (option) {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.textContent = option.label || option.name;
            select.appendChild(opt);
        });
        if (current && Array.from(select.options).some(function (opt) { return opt.value === current; })) {
            select.value = current;
        }
    }

    function fillIssueTo() {
        const userType = userTypeSelect ? userTypeSelect.value : '';
        const options = userType === 'Staff' ? formOptions.staff : (userType === 'Student' ? formOptions.students : []);
        fillSelect(issueToSelect, options, 'Select');
        if (!userType && issueToSelect) issueToSelect.value = '';
    }

    async function loadItemsForCategory(categoryId) {
        if (!itemSelect) return;
        itemSelect.innerHTML = '<option value="">Select</option>';
        if (!categoryId) return;
        try {
            const response = await fetch('/api/inventory/items?categoryId=' + encodeURIComponent(categoryId));
            if (!response.ok) throw new Error('Failed to load items');
            const items = await response.json();
            fillSelect(itemSelect, Array.isArray(items) ? items : [], 'Select');
        } catch (error) {
            console.error(error);
        }
    }

    async function loadIssues() {
        try {
            const response = await fetch('/api/inventory/issue-items');
            if (!response.ok) throw new Error('Failed to load issue items');
            const data = await response.json();
            issues = Array.isArray(data) ? data : [];
            renderTable();
        } catch (error) {
            console.error(error);
            issues = [];
            renderTable();
        }
    }

    async function loadFormOptions() {
        try {
            const response = await fetch('/api/inventory/issue-options');
            if (!response.ok) throw new Error('Failed to load form options');
            const data = await response.json();
            formOptions = data || formOptions;
            fillSelect(userTypeSelect, (formOptions.userTypes || []).map(function (type) {
                return { id: type, name: type };
            }), 'Select');
            fillSelect(issuedBySelect, formOptions.staff || [], 'Select');
            fillSelect(categorySelect, formOptions.categories || [], 'Select');
            fillIssueTo();
        } catch (error) {
            console.error(error);
        }
    }

    function openIssueModal() {
        if (!issueModal || !issueForm) return;
        issueForm.reset();
        fillIssueTo();
        if (itemSelect) itemSelect.innerHTML = '<option value="">Select</option>';
        const issueDate = document.getElementById('issueDate');
        if (issueDate) issueDate.value = todayIso();
        issueModal.classList.add('active');
        issueModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (userTypeSelect) userTypeSelect.focus();
    }

    function closeIssueModal() {
        if (!issueModal) return;
        issueModal.classList.remove('active');
        issueModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function formPayload() {
        return {
            userType: userTypeSelect ? userTypeSelect.value : '',
            issueToId: issueToSelect ? issueToSelect.value : '',
            issuedById: issuedBySelect ? issuedBySelect.value : '',
            issueDate: document.getElementById('issueDate').value,
            returnDate: document.getElementById('returnDate').value,
            note: document.getElementById('issueNote').value,
            itemCategoryId: categorySelect ? categorySelect.value : '',
            itemId: itemSelect ? itemSelect.value : '',
            quantity: document.getElementById('quantity').value
        };
    }

    if (addBtn) {
        addBtn.addEventListener('click', openIssueModal);
    }

    const overlay = document.getElementById('issueItemModalOverlay');
    if (overlay) overlay.addEventListener('click', closeIssueModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && issueModal && issueModal.classList.contains('active')) {
            closeIssueModal();
        }
    });

    if (userTypeSelect) {
        userTypeSelect.addEventListener('change', fillIssueTo);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            loadItemsForCategory(categorySelect.value);
        });
    }

    if (issueForm) {
        issueForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const payload = formPayload();
            if (!payload.userType || !payload.issueToId || !payload.issuedById || !payload.issueDate
                || !payload.itemId || !payload.quantity) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Please complete all required fields.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            try {
                const response = await fetch('/api/inventory/issue-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to issue item');
                }
                closeIssueModal();
                await loadIssues();
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: data.message || 'Item issued successfully!',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to issue item.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const returnBtn = e.target.closest('.btn-return');
            const deleteBtn = e.target.closest('.btn-delete');
            if (returnBtn) {
                const id = returnBtn.getAttribute('data-id');
                try {
                    const response = await fetch('/api/inventory/issue-items/' + encodeURIComponent(id) + '/return', {
                        method: 'POST'
                    });
                    const data = await response.json().catch(function () { return {}; });
                    if (!response.ok || data.success === false) {
                        throw new Error(data.message || 'Failed to return item');
                    }
                    await loadIssues();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to return item.',
                        confirmButtonColor: '#8b5cf6'
                    });
                }
                return;
            }
            if (!deleteBtn) return;
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Issue Item?',
                text: 'This issued item record will be removed.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/inventory/issue-items/' + encodeURIComponent(id), { method: 'DELETE' });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to delete issue item');
                }
                await loadIssues();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    timer: 1200,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete issue item.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const page = parseInt(btn.getAttribute('data-page'), 10);
            if (!page || page === currentPage) return;
            currentPage = page;
            renderTable();
        });
    }

    function exportRows() {
        const headers = ['Item', 'Note', 'Item Category', 'Issue - Return', 'Issue To', 'Issued By', 'Quantity', 'Status'];
        const lines = [headers.join('\t')].concat(filteredIssues().map(function (row) {
            return [
                row.itemName, row.note, row.itemCategory, row.issueReturn,
                row.issueTo, row.issuedBy, row.quantity, row.status
            ].join('\t');
        }));
        return lines.join('\n');
    }

    function downloadCsv(filename) {
        const csv = exportRows().split('\n').map(function (line) {
            return line.split('\t').map(function (value) {
                return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    ['copyBtn', 'excelBtn', 'csvBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'printBtn' || id === 'pdfBtn') {
                window.print();
                return;
            }
            const text = exportRows();
            if (id === 'copyBtn') {
                navigator.clipboard.writeText(text).then(function () {
                    Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
                });
                return;
            }
            downloadCsv(id === 'excelBtn' ? 'issue-item-list.xls' : 'issue-item-list.csv');
        });
    });

    loadFormOptions();
    loadIssues();
});
