document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('meetingReportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const staffViewModal = document.getElementById('staffViewModal');
    const invitedStaffTableBody = document.getElementById('invitedStaffTableBody');
    const invitedStaffSearchInput = document.getElementById('invitedStaffSearchInput');
    const invitedStaffEntriesSelect = document.getElementById('invitedStaffEntriesSelect');
    const invitedStaffShowingInfo = document.getElementById('invitedStaffShowingInfo');
    const invitedStaffPagination = document.getElementById('invitedStaffPagination');
    const invitedStaffCopyBtn = document.getElementById('invitedStaffCopyBtn');
    const invitedStaffExcelBtn = document.getElementById('invitedStaffExcelBtn');
    const invitedStaffCsvBtn = document.getElementById('invitedStaffCsvBtn');
    const invitedStaffPdfBtn = document.getElementById('invitedStaffPdfBtn');
    const invitedStaffPrintBtn = document.getElementById('invitedStaffPrintBtn');
    const invitedStaffColumnBtn = document.getElementById('invitedStaffColumnBtn');
    const invitedStaffColumnDropdown = document.getElementById('invitedStaffColumnDropdown');
    const copyBtn = document.getElementById('copyBtn');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');

    let reportRows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';
    let columnVisibility = {
        meetingTitle: true,
        description: true,
        dateTime: true,
        createdBy: true,
        totalJoin: true,
        action: true
    };

    let invitedStaffRows = [];
    let staffCurrentPage = 1;
    let staffPageSize = parseInt(invitedStaffEntriesSelect && invitedStaffEntriesSelect.value, 10) || 50;
    let staffTableFilter = '';
    let staffSortKey = '';
    let staffSortDir = 'asc';
    let staffColumnVisibility = { staff: true, staffId: true, role: true };

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function sortValue(row, key) {
        switch (key) {
            case 'meetingTitle': return row.meetingTitle || '';
            case 'description': return row.description || '';
            case 'dateTime': return row.dateTime || '';
            case 'createdBy': return row.createdBy || '';
            case 'totalJoin': return row.totalJoin || 0;
            default: return '';
        }
    }

    function getFiltered() {
        let rows = reportRows.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.meetingTitle,
                    row.description,
                    row.dateTime,
                    row.createdBy,
                    row.totalJoin
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
                const av = sortValue(a, sortKey);
                const bv = sortValue(b, sortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function applyColumnVisibility() {
        document.querySelectorAll('#meetingReportTable [data-col]').forEach(function (el) {
            const col = el.dataset.col;
            if (columnVisibility[col]) {
                el.classList.remove('hidden-col');
            } else {
                el.classList.add('hidden-col');
            }
        });
    }

    function actionButtonHtml(row) {
        const id = escapeHtml(String(row.id));
        return ''
            + '<button type="button" class="btn-view-users" data-view="' + id + '" title="View Join List">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="8" y1="6" x2="21" y2="6"></line>'
            + '<line x1="8" y1="12" x2="21" y2="12"></line>'
            + '<line x1="8" y1="18" x2="21" y2="18"></line>'
            + '<line x1="3" y1="6" x2="3.01" y2="6"></line>'
            + '<line x1="3" y1="12" x2="3.01" y2="12"></line>'
            + '<line x1="3" y1="18" x2="3.01" y2="18"></line>'
            + '</svg></button>';
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

    function renderTable() {
        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = ''
                + '<tr class="empty-row"><td colspan="6">'
                + '<div class="empty-state"><p class="empty-message">No data available in table</p></div>'
                + '</td></tr>';
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            applyColumnVisibility();
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td data-col="meetingTitle">' + escapeHtml(row.meetingTitle || '') + '</td>'
                + '<td data-col="description">' + escapeHtml(row.description || '') + '</td>'
                + '<td data-col="dateTime">' + escapeHtml(row.dateTime || '') + '</td>'
                + '<td data-col="createdBy">' + escapeHtml(row.createdBy || '') + '</td>'
                + '<td data-col="totalJoin">' + escapeHtml(row.totalJoin == null ? '0' : row.totalJoin) + '</td>'
                + '<td data-col="action" class="action-cell">' + actionButtonHtml(row) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            const label = total === 1 ? 'entry' : 'entries';
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' ' + label;
        }
        renderPagination(total, totalPages);
        applyColumnVisibility();
    }

    function getExportRows() {
        const headers = [];
        const keys = [];
        if (columnVisibility.meetingTitle) { headers.push('Meeting Title'); keys.push('meetingTitle'); }
        if (columnVisibility.description) { headers.push('Description'); keys.push('description'); }
        if (columnVisibility.dateTime) { headers.push('Date Time'); keys.push('dateTime'); }
        if (columnVisibility.createdBy) { headers.push('Created By'); keys.push('createdBy'); }
        if (columnVisibility.totalJoin) { headers.push('Total Join'); keys.push('totalJoin'); }

        const rows = getFiltered().map(function (row) {
            return keys.map(function (key) { return row[key] == null ? '' : row[key]; });
        });
        return { headers: headers, rows: rows };
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportTable(type) {
        const exportData = getExportRows();
        if (!exportData.rows.length) {
            Swal.fire({
                icon: 'info',
                title: 'No data',
                text: 'There is no data to export.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        if (type === 'copy') {
            let text = exportData.headers.join('\t') + '\n';
            exportData.rows.forEach(function (row) {
                text += row.join('\t') + '\n';
            });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Report data copied to clipboard',
                    timer: 2000,
                    showConfirmButton: false,
                    confirmButtonColor: '#8b5cf6'
                });
            });
            return;
        }

        if (type === 'print') {
            window.print();
            return;
        }

        if (type === 'csv') {
            const csv = [exportData.headers.join(',')].concat(exportData.rows.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('live-meeting-report.csv', csv, 'text/csv');
            return;
        }

        if (type === 'excel' && window.XLSX) {
            const worksheet = XLSX.utils.aoa_to_sheet([exportData.headers].concat(exportData.rows));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Meeting Report');
            XLSX.writeFile(workbook, 'live-meeting-report.xlsx');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({ head: [exportData.headers], body: exportData.rows });
            doc.save('live-meeting-report.pdf');
        }
    }

    async function loadReport() {
        const response = await fetch('/api/gmeet/live-meetings/report');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load live meeting report');
        }
        reportRows = await response.json();
        renderTable();
    }

    function closeStaffViewModal() {
        staffViewModal.hidden = true;
        document.body.style.overflow = '';
        if (invitedStaffColumnDropdown) {
            invitedStaffColumnDropdown.classList.remove('active');
        }
    }

    function getInvitedStaffFromRow(row) {
        return (row.invitedStaff || []).map(function (item) {
            return {
                staff: item.staff || '',
                staffId: item.staffId == null ? '' : String(item.staffId),
                role: item.role || ''
            };
        });
    }

    function getFilteredInvitedStaff() {
        let rows = invitedStaffRows.slice();
        const filter = staffTableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [row.staff, row.staffId, row.role].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (staffSortKey) {
            rows.sort(function (a, b) {
                const av = String(a[staffSortKey] || '').toLowerCase();
                const bv = String(b[staffSortKey] || '').toLowerCase();
                if (av < bv) return staffSortDir === 'asc' ? -1 : 1;
                if (av > bv) return staffSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function renderInvitedStaffPagination(total, totalPages) {
        if (!invitedStaffPagination) return;
        let html = '<button type="button" class="pagination-btn" data-staff-nav="prev"'
            + (staffCurrentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === staffCurrentPage ? ' active' : '')
                + '" data-staff-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-staff-nav="next"'
            + (staffCurrentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        invitedStaffPagination.innerHTML = html;
    }

    function applyInvitedStaffColumnVisibility() {
        document.querySelectorAll('#invitedStaffTable [data-col]').forEach(function (el) {
            const col = el.dataset.col;
            if (staffColumnVisibility[col]) {
                el.classList.remove('hidden-col');
            } else {
                el.classList.add('hidden-col');
            }
        });
    }

    function renderInvitedStaffTable() {
        if (!invitedStaffTableBody) return;

        const filtered = getFilteredInvitedStaff();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / staffPageSize) || 1);
        if (staffCurrentPage > totalPages) staffCurrentPage = totalPages;

        if (!total) {
            invitedStaffTableBody.innerHTML = ''
                + '<tr class="empty-row"><td colspan="3">'
                + '<div class="empty-state"><p class="empty-message">No staff assigned</p></div>'
                + '</td></tr>';
            if (invitedStaffShowingInfo) invitedStaffShowingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderInvitedStaffPagination(0, 1);
            applyInvitedStaffColumnVisibility();
            return;
        }

        const start = (staffCurrentPage - 1) * staffPageSize;
        const end = Math.min(start + staffPageSize, total);
        const pageRows = filtered.slice(start, end);

        invitedStaffTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr>'
                + '<td data-col="staff">' + escapeHtml(row.staff) + '</td>'
                + '<td data-col="staffId">' + escapeHtml(row.staffId) + '</td>'
                + '<td data-col="role">' + escapeHtml(row.role) + '</td>'
                + '</tr>';
        }).join('');

        if (invitedStaffShowingInfo) {
            invitedStaffShowingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderInvitedStaffPagination(total, totalPages);
        applyInvitedStaffColumnVisibility();
    }

    function viewJoinList(id) {
        const row = reportRows.find(function (item) {
            return String(item.id) === String(id);
        });
        if (!row || !staffViewModal) return;

        invitedStaffRows = getInvitedStaffFromRow(row);
        staffCurrentPage = 1;
        staffTableFilter = '';
        staffSortKey = '';
        staffSortDir = 'asc';
        if (invitedStaffSearchInput) invitedStaffSearchInput.value = '';
        renderInvitedStaffTable();
        staffViewModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function exportInvitedStaff(type) {
        const headers = [];
        const keys = [];
        if (staffColumnVisibility.staff) { headers.push('Staff'); keys.push('staff'); }
        if (staffColumnVisibility.staffId) { headers.push('Staff ID'); keys.push('staffId'); }
        if (staffColumnVisibility.role) { headers.push('Role'); keys.push('role'); }

        const rows = getFilteredInvitedStaff().map(function (row) {
            return keys.map(function (key) { return row[key] || ''; });
        });

        if (!rows.length) {
            Swal.fire({
                icon: 'info',
                title: 'No data',
                text: 'There is no staff data to export.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        if (type === 'copy') {
            let text = headers.join('\t') + '\n';
            rows.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text);
            return;
        }
        if (type === 'print') { window.print(); return; }
        if (type === 'csv') {
            const csv = [headers.join(',')].concat(rows.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('invited-staff.csv', csv, 'text/csv');
        }
    }

    staffViewModal && staffViewModal.querySelectorAll('[data-close-staff-modal]').forEach(function (el) {
        el.addEventListener('click', closeStaffViewModal);
    });

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            tableFilter = tableSearchInput.value;
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

    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
            else if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            renderTable();
        });
    }

    document.querySelectorAll('#meetingReportTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.dataset.sort;
            if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortKey = key; sortDir = 'asc'; }
            renderTable();
        });
    });

    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            const viewBtn = event.target.closest('[data-view]');
            if (viewBtn) viewJoinList(viewBtn.dataset.view);
        });
    }

    if (copyBtn) copyBtn.addEventListener('click', function () { exportTable('copy'); });
    if (excelBtn) excelBtn.addEventListener('click', function () { exportTable('excel'); });
    if (csvBtn) csvBtn.addEventListener('click', function () { exportTable('csv'); });
    if (pdfBtn) pdfBtn.addEventListener('click', function () { exportTable('pdf'); });
    if (printBtn) printBtn.addEventListener('click', function () { exportTable('print'); });

    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        columnVisibilityDropdown.addEventListener('click', function (event) { event.stopPropagation(); });
        document.addEventListener('click', function () {
            columnVisibilityDropdown.classList.remove('active');
        });
        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const col = checkbox.dataset.col;
                columnVisibility[col] = checkbox.checked;
                const visibleCount = Object.keys(columnVisibility).filter(function (key) {
                    return columnVisibility[key];
                }).length;
                if (!visibleCount) {
                    columnVisibility[col] = true;
                    checkbox.checked = true;
                    return;
                }
                applyColumnVisibility();
            });
        });
    }

    if (invitedStaffSearchInput) {
        invitedStaffSearchInput.addEventListener('input', function () {
            staffTableFilter = invitedStaffSearchInput.value;
            staffCurrentPage = 1;
            renderInvitedStaffTable();
        });
    }

    if (invitedStaffEntriesSelect) {
        invitedStaffEntriesSelect.addEventListener('change', function () {
            staffPageSize = parseInt(invitedStaffEntriesSelect.value, 10) || 50;
            staffCurrentPage = 1;
            renderInvitedStaffTable();
        });
    }

    if (invitedStaffPagination) {
        invitedStaffPagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.staffPage) staffCurrentPage = parseInt(btn.dataset.staffPage, 10);
            else if (btn.dataset.staffNav === 'prev') staffCurrentPage -= 1;
            else if (btn.dataset.staffNav === 'next') staffCurrentPage += 1;
            renderInvitedStaffTable();
        });
    }

    document.querySelectorAll('#invitedStaffTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.dataset.sort;
            if (staffSortKey === key) staffSortDir = staffSortDir === 'asc' ? 'desc' : 'asc';
            else { staffSortKey = key; staffSortDir = 'asc'; }
            renderInvitedStaffTable();
        });
    });

    if (invitedStaffCopyBtn) invitedStaffCopyBtn.addEventListener('click', function () { exportInvitedStaff('copy'); });
    if (invitedStaffExcelBtn) invitedStaffExcelBtn.addEventListener('click', function () { exportInvitedStaff('excel'); });
    if (invitedStaffCsvBtn) invitedStaffCsvBtn.addEventListener('click', function () { exportInvitedStaff('csv'); });
    if (invitedStaffPdfBtn) invitedStaffPdfBtn.addEventListener('click', function () { exportInvitedStaff('pdf'); });
    if (invitedStaffPrintBtn) invitedStaffPrintBtn.addEventListener('click', function () { exportInvitedStaff('print'); });

    if (invitedStaffColumnBtn && invitedStaffColumnDropdown) {
        invitedStaffColumnBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            invitedStaffColumnDropdown.classList.toggle('active');
        });
        invitedStaffColumnDropdown.addEventListener('click', function (event) { event.stopPropagation(); });
        document.addEventListener('click', function () {
            invitedStaffColumnDropdown.classList.remove('active');
        });
        invitedStaffColumnDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const col = checkbox.dataset.col;
                staffColumnVisibility[col] = checkbox.checked;
                applyInvitedStaffColumnVisibility();
            });
        });
    }

    loadReport().catch(showError);
});
