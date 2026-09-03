document.addEventListener('DOMContentLoaded', function () {
    const criteriaForm = document.getElementById('criteriaForm');
    const staffKeyword = document.getElementById('staffKeyword');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('staffMemberTable');
    const tableBody = document.getElementById('staffMemberTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');

    let staffMembers = [];
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

    function pageSize() {
        return parseInt(entriesSelect && entriesSelect.value ? entriesSelect.value : '50', 10) || 50;
    }

    function visibleColumnCount() {
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        if (!toggles.length) return 8;
        let count = 0;
        toggles.forEach(function (toggle) {
            if (toggle.checked) count++;
        });
        return Math.max(1, count);
    }

    function applyColumnVisibility() {
        if (!table) return;
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        const visibleCount = visibleColumnCount();
        toggles.forEach(function (toggle) {
            const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
            const headerCells = table.querySelectorAll('thead th');
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = toggle.checked ? '' : 'none';
            }
        });
        table.querySelectorAll('tbody tr').forEach(function (row) {
            const emptyCell = row.querySelector('.empty-state-cell');
            if (emptyCell) {
                emptyCell.colSpan = visibleCount;
                return;
            }
            const cells = row.querySelectorAll('td');
            toggles.forEach(function (toggle) {
                const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = toggle.checked ? '' : 'none';
                }
            });
        });
    }

    function filteredStaff() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!keyword) return staffMembers.slice();
        return staffMembers.filter(function (row) {
            return [
                row.memberId, row.libraryCardNo, row.staffId, row.name, row.email, row.dateOfBirth, row.phone
            ].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function emptyRowHtml() {
        return ''
            + '<tr><td colspan="' + visibleColumnCount() + '" class="empty-state-cell">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</td></tr>';
    }

    function actionButton(row) {
        if (row.isMember) {
            return ''
                + '<button type="button" class="btn-member-action btn-surrender" data-staff-id="'
                + escapeHtml(row.staffMemberId) + '" title="Surrender Membership">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="1 4 1 10 7 10"></polyline>'
                + '<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>'
                + '</svg></button>';
        }
        return ''
            + '<button type="button" class="btn-member-action btn-add-member" data-staff-id="'
            + escapeHtml(row.staffMemberId) + '" title="Add Membership">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="12" y1="5" x2="12" y2="19"></line>'
            + '<line x1="5" y1="12" x2="19" y2="12"></line>'
            + '</svg></button>';
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
        const rows = filteredStaff();
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
                    + '<tr class="' + (row.isMember ? 'is-member' : '') + '">'
                    + '<td>' + escapeHtml(display(row.memberId)) + '</td>'
                    + '<td>' + escapeHtml(display(row.libraryCardNo)) + '</td>'
                    + '<td>' + escapeHtml(display(row.staffId)) + '</td>'
                    + '<td>' + escapeHtml(display(row.name)) + '</td>'
                    + '<td>' + escapeHtml(display(row.email)) + '</td>'
                    + '<td>' + escapeHtml(display(row.dateOfBirth)) + '</td>'
                    + '<td>' + escapeHtml(display(row.phone)) + '</td>'
                    + '<td>' + actionButton(row) + '</td>'
                    + '</tr>';
            }).join('');
        }

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + rows.length + ' entries';
        }
        renderPagination(rows.length, pages);
        applyColumnVisibility();
    }

    async function loadStaffMembers() {
        const keyword = staffKeyword ? staffKeyword.value.trim() : '';
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        const query = params.toString();
        const response = await fetch('/api/library/staff-members' + (query ? '?' + query : ''));
        const data = await response.json().catch(function () { return []; });
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load staff members');
        }
        staffMembers = Array.isArray(data) ? data : [];
        currentPage = 1;
        renderTable();
    }

    if (criteriaForm) {
        criteriaForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            try {
                await loadStaffMembers();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to search staff members.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const addBtn = e.target.closest('.btn-add-member');
            const surrenderBtn = e.target.closest('.btn-surrender');
            if (addBtn) {
                const staffMemberId = addBtn.getAttribute('data-staff-id');
                try {
                    const response = await fetch('/api/library/staff-members', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ staffMemberId: staffMemberId })
                    });
                    const data = await response.json().catch(function () { return {}; });
                    if (!response.ok || data.success === false) {
                        throw new Error(data.message || 'Failed to add membership');
                    }
                    await loadStaffMembers();
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved',
                        text: data.message || 'Staff added as library member.',
                        timer: 1400,
                        showConfirmButton: false
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to add membership.',
                        confirmButtonColor: '#8b5cf6'
                    });
                }
                return;
            }

            if (!surrenderBtn) return;
            const staffMemberId = surrenderBtn.getAttribute('data-staff-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Are You Sure You Want To Surrender Membership?',
                showCancelButton: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/library/staff-members/' + encodeURIComponent(staffMemberId) + '/surrender', {
                    method: 'POST'
                });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to surrender membership');
                }
                await loadStaffMembers();
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: data.message || 'Membership surrendered successfully.',
                    timer: 1400,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to surrender membership.',
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

    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function (e) {
            if (!columnVisibilityDropdown.contains(e.target) && !columnVisibilityBtn.contains(e.target)) {
                columnVisibilityDropdown.classList.remove('active');
            }
        });
        columnVisibilityDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (toggle) {
            toggle.addEventListener('change', applyColumnVisibility);
        });
    }

    ['copyBtn', 'excelBtn', 'csvBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'printBtn' || id === 'pdfBtn') {
                window.print();
                return;
            }
            const text = [['Member ID', 'Library Card No.', 'Staff ID', 'Name', 'Email', 'Date Of Birth', 'Phone'].join('\t')]
                .concat(filteredStaff().map(function (row) {
                    return [row.memberId, row.libraryCardNo, row.staffId, row.name, row.email, row.dateOfBirth, row.phone].join('\t');
                })).join('\n');
            if (id === 'copyBtn') {
                navigator.clipboard.writeText(text).then(function () {
                    Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
                });
                return;
            }
            const csv = text.split('\n').map(function (line) {
                return line.split('\t').map(function (value) {
                    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
                }).join(',');
            }).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'staff-members.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    });

    loadStaffMembers().catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load staff members.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
