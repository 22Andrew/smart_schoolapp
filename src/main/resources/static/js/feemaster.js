document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('feeMasterForm');
    const feeMasterIdInput = document.getElementById('feeMasterId');
    const sessionYearInput = document.getElementById('sessionYear');
    const feeGroupSelect = document.getElementById('feeGroupSelect');
    const feeTypeSelect = document.getElementById('feeTypeSelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const amountInput = document.getElementById('amountInput');
    const percentageInput = document.getElementById('percentageInput');
    const fixAmountInput = document.getElementById('fixAmountInput');
    const percentageLabel = document.getElementById('percentageLabel');
    const saveBtn = document.getElementById('saveBtn');
    const table = document.getElementById('feeMasterTable');
    const tableBody = document.getElementById('feeMasterTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.querySelector('.showing-info');

    let groups = [];
    let types = [];
    let masters = [];
    let flatItems = [];
    let currentPage = 1;
    let pageSize = 50;

    const sessionYear = sessionYearInput ? sessionYearInput.value : '2026-27';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        if (window.AppCurrency) return window.AppCurrency.formatCurrency(value);
        const num = Number(value);
        if (Number.isNaN(num)) return '$0.00';
        return '$' + num.toFixed(2);
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length !== 3) return value;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function getSelectedFineType() {
        const checked = form.querySelector('input[name="fineType"]:checked');
        return checked ? checked.value : 'NONE';
    }

    function setSelectedFineType(type) {
        const value = type || 'NONE';
        const radio = form.querySelector('input[name="fineType"][value="' + value + '"]');
        if (radio) radio.checked = true;
        updatePercentageLabel();
    }

    function updatePercentageLabel() {
        if (!percentageLabel) return;
        if (getSelectedFineType() === 'CUMULATIVE') {
            percentageLabel.innerHTML = 'Days <span class="required">*</span>';
        } else {
            percentageLabel.innerHTML = 'Percentage (%) <span class="required">*</span>';
        }
    }

    function resetForm() {
        form.reset();
        feeMasterIdInput.value = '';
        setSelectedFineType('NONE');
        percentageInput.value = '0';
        fixAmountInput.value = '0';
        saveBtn.textContent = 'Save';
    }

    function populateSelect(select, items, valueKey, labelFn) {
        const current = select.value;
        select.innerHTML = '<option value="">Select</option>';
        items.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = labelFn(item);
            select.appendChild(option);
        });
        if (current) select.value = current;
    }

    async function loadLookups() {
        const [groupsRes, typesRes] = await Promise.all([
            fetch('/api/fee-groups'),
            fetch('/api/fee-types')
        ]);
        if (!groupsRes.ok || !typesRes.ok) throw new Error('Failed to load fees group/type lists');
        groups = await groupsRes.json();
        types = await typesRes.json();
        populateSelect(feeGroupSelect, groups, 'id', function (g) { return g.name; });
        populateSelect(feeTypeSelect, types, 'id', function (t) {
            return t.name + (t.feesCode ? ' (' + t.feesCode + ')' : '');
        });
    }

    function rebuildFlatItems() {
        flatItems = [];
        masters.forEach(function (group) {
            const items = Array.isArray(group.items) ? group.items : [];
            items.forEach(function (item, index) {
                flatItems.push({
                    group: group,
                    item: item,
                    isFirst: index === 0,
                    groupSize: items.length
                });
            });
        });
    }

    function getFilteredGroups() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return masters.slice();
        return masters.map(function (group) {
            const items = (group.items || []).filter(function (item) {
                const haystack = [
                    group.feeGroupName,
                    item.feeTypeName,
                    item.feesCode,
                    item.amount,
                    item.fineTypeLabel,
                    item.dueDate,
                    item.daysFineAmount
                ].join(' ').toLowerCase();
                return haystack.indexOf(term) !== -1;
            });
            if (!items.length && String(group.feeGroupName || '').toLowerCase().indexOf(term) === -1) {
                return null;
            }
            return {
                feeGroupId: group.feeGroupId,
                feeGroupName: group.feeGroupName,
                sessionYear: group.sessionYear,
                items: items.length ? items : (group.items || [])
            };
        }).filter(Boolean);
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
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function rowActionButtons(itemId) {
        return ''
            + '<button type="button" class="btn-action btn-edit" data-id="' + escapeHtml(String(itemId)) + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>'
            + '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" data-id="' + escapeHtml(String(itemId)) + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line>'
            + '<line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function groupActionButtons(groupId) {
        return ''
            + '<button type="button" class="btn-action btn-group-view" data-group-id="' + escapeHtml(String(groupId)) + '" title="View Group">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>'
            + '<circle cx="12" cy="12" r="3"></circle>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-group-delete" data-group-id="' + escapeHtml(String(groupId)) + '" title="Delete Group">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line>'
            + '<line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function renderMasters() {
        const filtered = getFilteredGroups();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="8" style="text-align:center;color:#94a3b8;">No fees master records found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageGroups = filtered.slice(startIndex, endIndex);

        let html = '';
        pageGroups.forEach(function (group) {
            const items = group.items || [];
            items.forEach(function (item, index) {
                html += '<tr data-id="' + escapeHtml(String(item.id)) + '" data-group-id="' + escapeHtml(String(group.feeGroupId)) + '">';
                if (index === 0) {
                    html += '<td class="group-name" rowspan="' + items.length + '">'
                        + '<div class="group-cell">'
                        + '<span>' + escapeHtml(group.feeGroupName || '') + '</span>'
                        + '<div class="group-actions">' + groupActionButtons(group.feeGroupId) + '</div>'
                        + '</div></td>';
                }
                html += '<td class="fees-code-cell">'
                    + '<span class="code-icon">☰</span> '
                    + escapeHtml((item.feeTypeName || '') + '(' + (item.feesCode || '') + ')')
                    + '</td>'
                    + '<td>' + escapeHtml(formatMoney(item.amount)) + '</td>'
                    + '<td>' + escapeHtml(item.fineTypeLabel || '') + '</td>'
                    + '<td>' + escapeHtml(formatDate(item.dueDate)) + '</td>'
                    + '<td>' + (item.perDay ? 'Yes' : 'No') + '</td>'
                    + '<td>' + escapeHtml(item.daysFineAmount || '') + '</td>'
                    + '<td class="action-cell">' + rowActionButtons(item.id) + '</td>'
                    + '</tr>';
            });
        });

        tableBody.innerHTML = html;
        updateShowingInfo(startIndex + 1, endIndex, total);
        renderPagination(total, totalPages);
    }

    async function loadMasters() {
        const response = await fetch('/api/fee-masters?sessionYear=' + encodeURIComponent(sessionYear));
        if (!response.ok) throw new Error('Failed to load fees masters');
        masters = await response.json();
        rebuildFlatItems();
        currentPage = 1;
        renderMasters();
    }

    async function parseErrorMessage(response) {
        try {
            const data = await response.json();
            return data.message || 'Request failed';
        } catch (e) {
            return 'Request failed';
        }
    }

    function findItemById(id) {
        for (let i = 0; i < masters.length; i++) {
            const items = masters[i].items || [];
            for (let j = 0; j < items.length; j++) {
                if (String(items[j].id) === String(id)) return items[j];
            }
        }
        return null;
    }

    if (form) {
        form.querySelectorAll('input[name="fineType"]').forEach(function (radio) {
            radio.addEventListener('change', updatePercentageLabel);
        });

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const feeGroupId = feeGroupSelect.value;
            const feeTypeId = feeTypeSelect.value;
            const amount = amountInput.value.trim();
            const percentage = percentageInput.value.trim();
            const fixAmount = fixAmountInput.value.trim();

            if (!feeGroupId || !feeTypeId) {
                Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select fees group and fees type.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            if (amount === '') {
                Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter amount.', confirmButtonColor: '#8b5cf6' });
                return;
            }

            const payload = {
                feeGroupId: feeGroupId,
                feeTypeId: feeTypeId,
                sessionYear: sessionYear,
                dueDate: dueDateInput.value || null,
                amount: amount,
                fineType: getSelectedFineType(),
                percentage: percentage === '' ? 0 : percentage,
                fixAmount: fixAmount === '' ? 0 : fixAmount
            };

            const editingId = feeMasterIdInput.value;
            try {
                let response;
                if (editingId) {
                    response = await fetch('/api/fee-masters/' + editingId, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await fetch('/api/fee-masters', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }
                if (!response.ok) throw new Error(await parseErrorMessage(response));
                resetForm();
                await loadMasters();
                Swal.fire({
                    icon: 'success',
                    title: editingId ? 'Updated' : 'Saved',
                    text: editingId ? 'Fees master updated successfully.' : 'Fees master saved to database.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save fees master.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const groupDeleteBtn = e.target.closest('.btn-group-delete');
            const groupViewBtn = e.target.closest('.btn-group-view');

            if (groupViewBtn) {
                const groupId = groupViewBtn.getAttribute('data-group-id');
                window.location.href = '/feemaster/assign/' + encodeURIComponent(groupId);
                return;
            }

            if (groupDeleteBtn) {
                const groupId = groupDeleteBtn.getAttribute('data-group-id');
                const group = masters.find(function (g) { return String(g.feeGroupId) === String(groupId); });
                const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Delete Fees Group Master?',
                    text: '"' + (group ? group.feeGroupName : 'This group') + '" and all its fees codes will be deleted.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                });
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/fee-masters/group/' + groupId + '?sessionYear=' + encodeURIComponent(sessionYear), {
                        method: 'DELETE'
                    });
                    if (!response.ok && response.status !== 204) throw new Error(await parseErrorMessage(response));
                    await loadMasters();
                    Swal.fire({ icon: 'success', title: 'Deleted', text: 'Fees master group deleted.', timer: 1400, showConfirmButton: false });
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to delete group.', confirmButtonColor: '#8b5cf6' });
                }
                return;
            }

            if (editBtn) {
                const item = findItemById(editBtn.getAttribute('data-id'));
                if (!item) return;
                feeMasterIdInput.value = item.id;
                feeGroupSelect.value = item.feeGroupId;
                feeTypeSelect.value = item.feeTypeId;
                dueDateInput.value = item.dueDate || '';
                amountInput.value = item.amount != null ? item.amount : '';
                setSelectedFineType(item.fineType || 'NONE');
                percentageInput.value = item.percentage != null ? item.percentage : 0;
                fixAmountInput.value = item.fixAmount != null ? item.fixAmount : 0;
                saveBtn.textContent = 'Update';
                feeGroupSelect.focus();
                return;
            }

            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                const item = findItemById(id);
                const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Delete Fees Master?',
                    text: item ? (item.feeTypeName + ' will be deleted.') : 'This record will be deleted.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                });
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/fee-masters/' + id, { method: 'DELETE' });
                    if (!response.ok && response.status !== 204) throw new Error(await parseErrorMessage(response));
                    if (feeMasterIdInput.value === String(id)) resetForm();
                    await loadMasters();
                    Swal.fire({ icon: 'success', title: 'Deleted', text: 'Fees master deleted.', timer: 1400, showConfirmButton: false });
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to delete.', confirmButtonColor: '#8b5cf6' });
                }
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderMasters();
        });
    }

    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderMasters();
        });
    }

    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFilteredGroups();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (btn.getAttribute('data-nav') === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (btn.getAttribute('data-page')) currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            renderMasters();
        });
    }

    function getExportRows() {
        const rows = [];
        getFilteredGroups().forEach(function (group) {
            (group.items || []).forEach(function (item) {
                rows.push([
                    group.feeGroupName || '',
                    (item.feeTypeName || '') + '(' + (item.feesCode || '') + ')',
                    formatMoney(item.amount),
                    item.fineTypeLabel || '',
                    formatDate(item.dueDate),
                    item.perDay ? 'Yes' : 'No',
                    item.daysFineAmount || ''
                ]);
            });
        });
        return {
            headers: ['Fees Group', 'Fees Code', 'Amount', 'Fine Type', 'Due Date', 'Per Day', 'Days-Fine Amount'],
            data: rows
        };
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getExportRows();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied!', text: 'Table data copied to clipboard', timer: 2000, showConfirmButton: false });
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getExportRows();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Fees Master');
            XLSX.writeFile(wb, 'Fees_Master_' + new Date().toISOString().split('T')[0] + '.xlsx');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getExportRows();
            const lines = [result.headers.join(',')].concat(result.data.map(function (row) {
                return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(',');
            }));
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Fees_Master.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    ['pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', function () { window.print(); });
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
        columnVisibilityDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
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

    updatePercentageLabel();
    Promise.all([loadLookups(), loadMasters()]).catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load fees master page data.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
