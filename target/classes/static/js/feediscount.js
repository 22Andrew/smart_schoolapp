document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('feeDiscountTable');
    const tableBody = document.getElementById('feeDiscountTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput');
    const feeDiscountForm = document.getElementById('feeDiscountForm');
    const feeDiscountIdInput = document.getElementById('feeDiscountId');
    const feeDiscountNameInput = document.getElementById('feeDiscountName');
    const feeDiscountCodeInput = document.getElementById('feeDiscountCode');
    const feeDiscountPercentageInput = document.getElementById('feeDiscountPercentage');
    const feeDiscountAmountInput = document.getElementById('feeDiscountAmount');
    const feeDiscountUseCountInput = document.getElementById('feeDiscountUseCount');
    const feeDiscountExpiryInput = document.getElementById('feeDiscountExpiry');
    const feeDiscountDescriptionInput = document.getElementById('feeDiscountDescription');
    const saveBtn = document.getElementById('saveBtn');
    const entriesSelect = document.getElementById('entriesSelect');

    let discounts = [];
    let currentPage = 1;
    let pageSize = 50;

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-assign" title="Assign">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>'
            + '<line x1="7" y1="7" x2="7.01" y2="7"></line>'
            + '</svg></button>'
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

    function getSelectedDiscountType() {
        const checked = feeDiscountForm.querySelector('input[name="discountType"]:checked');
        return checked ? checked.value : 'PERCENTAGE';
    }

    function setSelectedDiscountType(type) {
        const value = type === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE';
        const radio = feeDiscountForm.querySelector('input[name="discountType"][value="' + value + '"]');
        if (radio) radio.checked = true;
    }

    function resetForm() {
        feeDiscountForm.reset();
        feeDiscountIdInput.value = '';
        setSelectedDiscountType('PERCENTAGE');
        saveBtn.textContent = 'Save';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatNumber(value) {
        if (value == null || value === '') return '';
        const num = Number(value);
        if (Number.isNaN(num)) return '';
        return num.toFixed(2);
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length !== 3) return value;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function getFilteredDiscounts() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!searchTerm) return discounts.slice();
        return discounts.filter(function (item) {
            const haystack = [
                item.name,
                item.discountCode,
                item.percentage,
                item.amount,
                item.numberOfUseCount,
                item.expiryDate,
                item.description
            ].join(' ').toLowerCase();
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

    function renderDiscounts() {
        const filtered = getFilteredDiscounts();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="7" style="text-align:center;color:#94a3b8;">No fees discounts found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filtered.slice(startIndex, endIndex);

        tableBody.innerHTML = pageRows.map(function (item) {
            const isPercentage = item.discountType === 'PERCENTAGE';
            const percentageDisplay = isPercentage ? formatNumber(item.percentage) : '';
            const amountDisplay = !isPercentage ? formatNumber(item.amount) : '';

            return '<tr data-id="' + escapeHtml(String(item.id)) + '">'
                + '<td class="disc-name">' + escapeHtml(item.name) + '</td>'
                + '<td class="disc-code">' + escapeHtml(item.discountCode || '') + '</td>'
                + '<td class="disc-percentage">' + escapeHtml(percentageDisplay) + '</td>'
                + '<td class="disc-amount">' + escapeHtml(amountDisplay) + '</td>'
                + '<td class="disc-use-count">' + escapeHtml(item.numberOfUseCount == null ? '' : String(item.numberOfUseCount)) + '</td>'
                + '<td class="disc-expiry">' + escapeHtml(formatDate(item.expiryDate)) + '</td>'
                + '<td class="action-cell">' + createActionButtonsHtml() + '</td>'
                + '</tr>';
        }).join('');

        updateShowingInfo(startIndex + 1, endIndex, total);
        renderPagination(total, totalPages);
    }

    async function loadDiscounts() {
        try {
            const response = await fetch('/api/fee-discounts');
            if (!response.ok) throw new Error('Failed to load fees discounts');
            discounts = await response.json();
            currentPage = 1;
            renderDiscounts();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load fees discounts from database.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    async function parseErrorMessage(response) {
        try {
            const data = await response.json();
            return data.message || 'Request failed';
        } catch (e) {
            return 'Request failed';
        }
    }

    if (feeDiscountForm) {
        feeDiscountForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = feeDiscountNameInput.value.trim();
            const discountCode = feeDiscountCodeInput.value.trim();
            const discountType = getSelectedDiscountType();
            const percentage = feeDiscountPercentageInput.value.trim();
            const amount = feeDiscountAmountInput.value.trim();
            const numberOfUseCount = feeDiscountUseCountInput.value.trim();
            const expiryDate = feeDiscountExpiryInput.value;
            const description = feeDiscountDescriptionInput.value.trim();

            if (!name) {
                Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter a discount name.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            if (!discountCode) {
                Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter a discount code.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            if (percentage === '') {
                Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter a percentage.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            if (amount === '') {
                Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter an amount.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            if (numberOfUseCount === '') {
                Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter number of use count.', confirmButtonColor: '#8b5cf6' });
                return;
            }

            const editingId = feeDiscountIdInput.value;
            const payload = {
                name: name,
                discountCode: discountCode,
                discountType: discountType,
                percentage: percentage,
                amount: amount,
                numberOfUseCount: numberOfUseCount,
                expiryDate: expiryDate || null,
                description: description
            };

            try {
                let response;
                if (editingId) {
                    response = await fetch('/api/fee-discounts/' + editingId, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await fetch('/api/fee-discounts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok) {
                    throw new Error(await parseErrorMessage(response));
                }

                resetForm();
                await loadDiscounts();
                Swal.fire({
                    icon: 'success',
                    title: editingId ? 'Updated' : 'Saved',
                    text: editingId ? 'Fees discount updated successfully.' : 'Fees discount saved to database.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save fees discount.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const assignBtn = e.target.closest('.btn-assign');
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const row = e.target.closest('tr');
            if (!row || row.classList.contains('no-data-row')) return;

            if (assignBtn) {
                const name = row.querySelector('.disc-name').textContent.trim();
                Swal.fire({
                    icon: 'info',
                    title: 'Assign Discount',
                    text: 'Assign "' + name + '" to students will be available in a later step.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            if (editBtn) {
                const rowId = row.getAttribute('data-id');
                const item = discounts.find(function (d) { return String(d.id) === String(rowId); });
                feeDiscountIdInput.value = rowId || '';
                feeDiscountNameInput.value = item ? (item.name || '') : '';
                feeDiscountCodeInput.value = item ? (item.discountCode || '') : '';
                setSelectedDiscountType(item ? item.discountType : 'PERCENTAGE');
                feeDiscountPercentageInput.value = item && item.percentage != null ? item.percentage : '';
                feeDiscountAmountInput.value = item && item.amount != null ? item.amount : '';
                feeDiscountUseCountInput.value = item && item.numberOfUseCount != null ? item.numberOfUseCount : '';
                feeDiscountExpiryInput.value = item && item.expiryDate ? item.expiryDate : '';
                feeDiscountDescriptionInput.value = item ? (item.description || '') : '';
                saveBtn.textContent = 'Update';
                feeDiscountNameInput.focus();
                return;
            }

            if (deleteBtn) {
                const name = row.querySelector('.disc-name').textContent.trim();
                const rowId = row.getAttribute('data-id');

                Swal.fire({
                    icon: 'warning',
                    title: 'Delete Fees Discount?',
                    text: '"' + name + '" will be deleted from the database.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                }).then(async function (result) {
                    if (!result.isConfirmed) return;
                    try {
                        const response = await fetch('/api/fee-discounts/' + rowId, { method: 'DELETE' });
                        if (!response.ok && response.status !== 204) {
                            throw new Error('Failed to delete fees discount');
                        }
                        if (feeDiscountIdInput.value === rowId) resetForm();
                        await loadDiscounts();
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Fees discount deleted from database.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to delete fees discount.',
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
            renderDiscounts();
        });
    }

    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderDiscounts();
        });
    }

    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFilteredDiscounts();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') {
                currentPage = Math.max(1, currentPage - 1);
            } else if (btn.getAttribute('data-nav') === 'next') {
                currentPage = Math.min(totalPages, currentPage + 1);
            } else if (btn.getAttribute('data-page')) {
                currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            }
            renderDiscounts();
        });
    }

    function getVisibleRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(function (row) {
            return !row.classList.contains('no-data-row');
        });
    }

    function getTableData() {
        const headers = ['Name', 'Discount Code', 'Percentage (%)', 'Amount ($)', 'Number Of Use Count', 'Expiry Date'];
        const data = [];
        getVisibleRows().forEach(function (row) {
            data.push([
                row.querySelector('.disc-name').textContent.trim(),
                row.querySelector('.disc-code').textContent.trim(),
                row.querySelector('.disc-percentage').textContent.trim(),
                row.querySelector('.disc-amount').textContent.trim(),
                row.querySelector('.disc-use-count').textContent.trim(),
                row.querySelector('.disc-expiry').textContent.trim()
            ]);
        });
        return { headers: headers, data: data };
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getTableData();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Table data copied to clipboard',
                    timer: 2000,
                    showConfirmButton: false
                });
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getTableData();
            const wsData = [result.headers].concat(result.data);
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Fees Discounts');
            XLSX.writeFile(wb, 'Fees_Discounts_' + new Date().toISOString().split('T')[0] + '.xlsx');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getTableData();
            const lines = [result.headers.join(',')].concat(result.data.map(function (row) {
                return row.map(function (value) {
                    return '"' + String(value).replace(/"/g, '""') + '"';
                }).join(',');
            }));
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Fees_Discounts.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    ['pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () { window.print(); });
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

    loadDiscounts();
});
