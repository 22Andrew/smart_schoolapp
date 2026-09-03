document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('hrReportRoot');
    if (!root) return;

    const reportKey = root.dataset.reportKey || 'staffreport';
    const apiUrl = root.dataset.apiUrl || '';
    const activeNav = root.dataset.activeNav || 'staff';
    const listTitle = root.dataset.listTitle || 'Staff Report';

    const criteriaForm = document.getElementById('hrCriteriaForm');
    const tableHead = document.getElementById('reportTableHead');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const resultsHeading = document.getElementById('resultsHeading');

    const searchTypeBySelect = document.getElementById('searchTypeBySelect');
    const staffStatusSelect = document.getElementById('staffStatusSelect');
    const staffRoleSelect = document.getElementById('staffRoleSelect');
    const designationSelect = document.getElementById('designationSelect');
    const payrollRoleSelect = document.getElementById('payrollRoleSelect');
    const payrollMonthSelect = document.getElementById('payrollMonthSelect');
    const payrollYearSelect = document.getElementById('payrollYearSelect');
    const leaveFromDate = document.getElementById('leaveFromDate');
    const leaveToDate = document.getElementById('leaveToDate');
    const leaveJoiningDate = document.getElementById('leaveJoiningDate');
    const leaveStaffSelect = document.getElementById('leaveStaffSelect');
    const leaveStatusSelect = document.getElementById('leaveStatusSelect');
    const myLeaveFromDate = document.getElementById('myLeaveFromDate');
    const myLeaveToDate = document.getElementById('myLeaveToDate');
    const myLeaveStatusSelect = document.getElementById('myLeaveStatusSelect');

    let rows = [];
    let columns = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    const COLUMN_SETS = {
        staffreport: [
            { key: 'staffId', label: 'Staff ID' },
            { key: 'role', label: 'Role' },
            { key: 'designation', label: 'Designation' },
            { key: 'department', label: 'Department' },
            { key: 'name', label: 'Name' },
            { key: 'fatherName', label: 'Father Name' },
            { key: 'motherName', label: 'Mother Name' },
            { key: 'email', label: 'Email' },
            { key: 'gender', label: 'Gender' },
            { key: 'dateOfBirth', label: 'Date Of Birth' },
            { key: 'dateOfJoining', label: 'Date Of Joining' },
            { key: 'phone', label: 'Phone' },
            { key: 'emergencyContactNumber', label: 'Emergency Contact Number' }
        ],
        payrollreport: [
            { key: 'name', label: 'Staff' },
            { key: 'role', label: 'Role' },
            { key: 'designation', label: 'Designation' },
            { key: 'monthYear', label: 'Month - Year' },
            { key: 'payslipNo', label: 'Payslip #' },
            { key: 'basicSalary', label: 'Basic Salary ($)', numeric: true },
            { key: 'earning', label: 'Earning ($)', numeric: true },
            { key: 'deduction', label: 'Deduction ($)', numeric: true },
            { key: 'grossSalary', label: 'Gross Salary ($)', numeric: true },
            { key: 'tax', label: 'Tax ($)', numeric: true },
            { key: 'netSalary', label: 'Net Salary ($)', numeric: true }
        ],
        leaverequestreport: [
            { key: 'staff', label: 'Staff' },
            { key: 'leaveType', label: 'Leave Type' },
            { key: 'halfDay', label: 'Half Day' },
            { key: 'dateOfJoining', label: 'Date Of Joining' },
            { key: 'applyDate', label: 'Apply Date' },
            { key: 'leaveDate', label: 'Leave Date' },
            { key: 'days', label: 'Days', numeric: true },
            { key: 'status', label: 'Status', status: true }
        ],
        myleaverequestreport: [
            { key: 'staff', label: 'Staff' },
            { key: 'leaveType', label: 'Leave Type' },
            { key: 'halfDay', label: 'Half Day' },
            { key: 'applyDate', label: 'Apply Date' },
            { key: 'leaveDate', label: 'Leave Date' },
            { key: 'days', label: 'Days', numeric: true },
            { key: 'status', label: 'Status', status: true }
        ]
    };

    columns = COLUMN_SETS[reportKey] || COLUMN_SETS.staffreport;
    if (resultsHeading) {
        resultsHeading.textContent = listTitle;
    }

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

    function statusBadgeClass(status) {
        const value = String(status || '').toLowerCase();
        if (value === 'approved') return 'status-badge status-badge--approved';
        if (value === 'pending') return 'status-badge status-badge--pending';
        if (value === 'disapproved') return 'status-badge status-badge--disapproved';
        return 'status-badge';
    }

    function renderHead() {
        if (!tableHead) return;
        tableHead.innerHTML = '<tr>' + columns.map(function (col) {
            return '<th data-sort="' + escapeHtml(col.key) + '">'
                + escapeHtml(col.label)
                + ' <span class="sort-icon">↑↓</span></th>';
        }).join('') + '</tr>';

        tableHead.querySelectorAll('th[data-sort]').forEach(function (th) {
            th.addEventListener('click', function () {
                const key = th.getAttribute('data-sort');
                if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                else {
                    sortKey = key;
                    sortDir = 'asc';
                }
                renderTable();
            });
        });
    }

    function cellValue(row, col) {
        const value = row[col.key];
        if (col.status) {
            const text = value == null ? '' : String(value);
            if (!text) return '';
            return '<span class="' + statusBadgeClass(text) + '">' + escapeHtml(text) + '</span>';
        }
        if (col.numeric && value != null && value !== '') {
            const num = Number(value);
            if (!Number.isNaN(num)) {
                return num.toFixed(2);
            }
        }
        return escapeHtml(value == null ? '' : String(value));
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return columns.map(function (col) {
                    return row[col.key];
                }).join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            list.sort(function (a, b) {
                const av = a[sortKey];
                const bv = b[sortKey];
                if (av == null && bv == null) return 0;
                if (av == null) return 1;
                if (bv == null) return -1;
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return list;
    }

    function renderPagination(el, page, totalPages, total) {
        if (!el) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (page <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let p = 1; p <= totalPages; p++) {
            html += '<button type="button" class="pagination-btn'
                + (p === page ? ' active' : '') + '" data-nav-page="' + p + '">' + p + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (page >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        el.innerHTML = html;
    }

    function renderEmptyTable() {
        const colspan = Math.max(columns.length, 1);
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="' + colspan + '">'
            + '<div class="empty-state">'
            + '<p class="empty-message">No data available in table</p>'
            + '<div class="empty-illustration" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<p class="empty-hint">← Add new record or search with different criteria.</p>'
            + '</div></td></tr>';
        if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        renderPagination(pagination, 1, 1, 0);
    }

    function renderTable() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            renderEmptyTable();
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            const cells = columns.map(function (col) {
                const content = cellValue(row, col);
                if (col.status) {
                    return '<td>' + content + '</td>';
                }
                return '<td>' + content + '</td>';
            }).join('');
            return '<tr>' + cells + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(pagination, currentPage, totalPages, total);
    }

    function fillSelect(select, items, valueKey, labelKey) {
        if (!select) return;
        select.innerHTML = '<option value="">Select</option>' + items.map(function (item) {
            const value = typeof item === 'string' ? item : item[valueKey];
            const label = typeof item === 'string' ? item : item[labelKey];
            return '<option value="' + escapeHtml(String(value)) + '">' + escapeHtml(String(label)) + '</option>';
        }).join('');
    }

    function populateYearSelect(select) {
        if (!select) return;
        const currentYear = new Date().getFullYear();
        let html = '<option value="">Select</option>';
        for (let year = currentYear + 1; year >= currentYear - 5; year -= 1) {
            html += '<option value="' + year + '">' + year + '</option>';
        }
        select.innerHTML = html;
        select.value = String(currentYear);
    }

    async function loadLookups() {
        const requests = [
            fetch('/api/payroll/roles'),
            fetch('/api/payroll/months'),
            fetch('/api/staff/form-options')
        ];
        if (activeNav === 'leave') {
            requests.push(fetch('/api/staff-leave-requests/staff'));
        }

        const responses = await Promise.all(requests);
        if (responses.some(function (res) { return !res.ok; })) {
            throw new Error('Failed to load report filters');
        }

        const roles = await responses[0].json();
        const months = await responses[1].json();
        const formOptions = await responses[2].json();
        const designations = Array.isArray(formOptions.designations) ? formOptions.designations : [];

        fillSelect(staffRoleSelect, roles);
        fillSelect(payrollRoleSelect, roles);
        fillSelect(designationSelect, designations);

        if (payrollMonthSelect) {
            payrollMonthSelect.innerHTML = months.map(function (month) {
                return '<option value="' + month.value + '">' + escapeHtml(month.label) + '</option>';
            }).join('');
        }
        populateYearSelect(payrollYearSelect);

        if (activeNav === 'leave' && leaveStaffSelect) {
            const staffMembers = await responses[3].json();
            leaveStaffSelect.innerHTML = '<option value="">Select</option>' + staffMembers.map(function (staff) {
                const name = staff.name || staff.staffId || 'Staff';
                const label = name + (staff.staffId ? ' (' + staff.staffId + ')' : '');
                return '<option value="' + staff.id + '">' + escapeHtml(label) + '</option>';
            }).join('');
        }
    }

    function buildQueryParams() {
        const query = new URLSearchParams();

        if (reportKey === 'staffreport') {
            if (searchTypeBySelect && searchTypeBySelect.value) {
                query.set('searchTypeBy', searchTypeBySelect.value);
            }
            if (staffStatusSelect && staffStatusSelect.value) {
                query.set('status', staffStatusSelect.value);
            }
            if (staffRoleSelect && staffRoleSelect.value) {
                query.set('role', staffRoleSelect.value);
            }
            if (designationSelect && designationSelect.value) {
                query.set('designation', designationSelect.value);
            }
        } else if (reportKey === 'payrollreport') {
            if (payrollRoleSelect && payrollRoleSelect.value) {
                query.set('role', payrollRoleSelect.value);
            }
            if (payrollMonthSelect && payrollMonthSelect.value) {
                query.set('month', payrollMonthSelect.value);
            }
            if (!payrollYearSelect || !payrollYearSelect.value) {
                throw new Error('Year is required.');
            }
            query.set('year', payrollYearSelect.value);
        } else if (reportKey === 'leaverequestreport') {
            if (leaveFromDate && leaveFromDate.value) query.set('dateFrom', leaveFromDate.value);
            if (leaveToDate && leaveToDate.value) query.set('dateTo', leaveToDate.value);
            if (leaveJoiningDate && leaveJoiningDate.value) query.set('joiningDate', leaveJoiningDate.value);
            if (leaveStaffSelect && leaveStaffSelect.value) query.set('staffMemberId', leaveStaffSelect.value);
            if (leaveStatusSelect && leaveStatusSelect.value) query.set('status', leaveStatusSelect.value);
        } else if (reportKey === 'myleaverequestreport') {
            if (myLeaveFromDate && myLeaveFromDate.value) query.set('dateFrom', myLeaveFromDate.value);
            if (myLeaveToDate && myLeaveToDate.value) query.set('dateTo', myLeaveToDate.value);
            if (myLeaveStatusSelect && myLeaveStatusSelect.value) query.set('status', myLeaveStatusSelect.value);
        }

        return query;
    }

    async function loadReport() {
        const query = buildQueryParams();
        const response = await fetch(apiUrl + '?' + query.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load report');
        }
        rows = await response.json();
        currentPage = 1;
        renderTable();
    }

    function exportRows(format) {
        const filtered = getFilteredRows();
        if (!filtered.length) {
            showError('No data to export.');
            return;
        }
        const headers = columns.map(function (col) { return col.label; });
        const data = filtered.map(function (row) {
            return columns.map(function (col) {
                const value = row[col.key];
                return value == null ? '' : value;
            });
        });

        if (format === 'copy') {
            const text = [headers.join('\t')].concat(data.map(function (row) {
                return row.join('\t');
            })).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied', timer: 1200, showConfirmButton: false });
            }).catch(function () {
                showError('Unable to copy data.');
            });
            return;
        }

        if (format === 'csv') {
            const csv = [headers.join(',')].concat(data.map(function (row) {
                return row.map(function (cell) {
                    const text = String(cell).replace(/"/g, '""');
                    return '"' + text + '"';
                }).join(',');
            })).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = reportKey + '.csv';
            link.click();
            return;
        }

        if (format === 'excel' && window.XLSX) {
            const sheetData = [headers].concat(data);
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            XLSX.writeFile(workbook, reportKey + '.xlsx');
            return;
        }

        if (format === 'print' || format === 'pdf') {
            window.print();
        }
    }

    criteriaForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loadReport().catch(function (error) {
            showError(error.message);
        });
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
            if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            else if (btn.dataset.navPage) currentPage = parseInt(btn.dataset.navPage, 10);
            renderTable();
        });
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () { exportRows('copy'); });
    document.getElementById('csvBtn')?.addEventListener('click', function () { exportRows('csv'); });
    document.getElementById('excelBtn')?.addEventListener('click', function () { exportRows('excel'); });
    document.getElementById('pdfBtn')?.addEventListener('click', function () { exportRows('pdf'); });
    document.getElementById('printBtn')?.addEventListener('click', function () { exportRows('print'); });

    renderHead();
    renderEmptyTable();
    loadLookups().catch(function (error) {
        showError(error.message);
    });
});
