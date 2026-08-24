document.addEventListener('DOMContentLoaded', function () {
    const roleSelect = document.getElementById('roleSelect');
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const payrollFilterForm = document.getElementById('payrollFilterForm');
    const staffListPanel = document.getElementById('staffListPanel');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const staffTableWrap = document.getElementById('staffTableWrap');
    const staffTableBody = document.getElementById('staffTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const entriesInfo = document.getElementById('entriesInfo');
    const pagination = document.getElementById('pagination');

    const payslipModal = document.getElementById('payrollPayslipModal');
    const payslipOverlay = document.getElementById('payrollPayslipOverlay');
    const payslipCloseBtn = document.getElementById('payrollPayslipCloseBtn');
    const payslipDocument = document.getElementById('payrollPayslipDocument');

    const editModal = document.getElementById('payrollEditModal');
    const editOverlay = document.getElementById('payrollEditOverlay');
    const editCloseBtn = document.getElementById('payrollEditCloseBtn');
    const editTitle = document.getElementById('payrollEditTitle');
    const editStaffGrid = document.getElementById('payrollEditStaffGrid');
    const editPhoto = document.getElementById('payrollEditPhoto');
    const editAttendanceBody = document.getElementById('payrollEditAttendanceBody');
    const earningList = document.getElementById('earningList');
    const deductionList = document.getElementById('deductionList');
    const addEarningBtn = document.getElementById('addEarningBtn');
    const addDeductionBtn = document.getElementById('addDeductionBtn');
    const calculatePayrollBtn = document.getElementById('calculatePayrollBtn');
    const savePayrollBtn = document.getElementById('savePayrollBtn');

    const proceedModal = document.getElementById('payrollProceedModal');
    const proceedOverlay = document.getElementById('payrollProceedOverlay');
    const proceedCloseBtn = document.getElementById('payrollProceedCloseBtn');
    const proceedStaffName = document.getElementById('proceedStaffName');
    const proceedPaymentAmount = document.getElementById('proceedPaymentAmount');
    const proceedMonthYear = document.getElementById('proceedMonthYear');
    const proceedPaymentMode = document.getElementById('proceedPaymentMode');
    const proceedPaymentDate = document.getElementById('proceedPaymentDate');
    const proceedNote = document.getElementById('proceedNote');
    const saveProceedPayBtn = document.getElementById('saveProceedPayBtn');

    let payrollRows = [];
    let filteredRows = [];
    let currentPage = 1;
    let pageSize = 50;
    let currentMonth = null;
    let currentYear = null;
    let currentRole = '';
    let activePayslipDetail = null;
    let activeEditRecord = null;
    let activeProceedRecord = null;

    function formatTodayUs() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return month + '/' + day + '/' + today.getFullYear();
    }

    function parseAmountValue(value) {
        if (value == null) {
            return 0;
        }
        return Number(String(value).replace(/,/g, '')) || 0;
    }

    function openProceedToPayModal(detail) {
        activeProceedRecord = detail;
        const staffLabel = detail.staffName + ' (' + detail.staffId + ')';
        proceedStaffName.value = staffLabel;
        proceedPaymentAmount.value = formatAmount(detail.netSalary || 0);
        proceedMonthYear.value = (detail.monthLabel || '') + '-' + (detail.year || '');
        proceedPaymentMode.value = detail.paymentMode && detail.paymentMode !== 'Cash' ? detail.paymentMode : '';
        proceedPaymentDate.value = detail.paymentDate || formatTodayUs();
        proceedNote.value = detail.paymentNote || '';
        proceedModal.hidden = false;
    }

    function closeProceedToPayModal() {
        proceedModal.hidden = true;
        activeProceedRecord = null;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatAmount(value) {
        return window.formatCurrency(value);
    }

    function canShowEditIcon(row) {
        if (row.canEdit != null) {
            return !!row.canEdit;
        }
        const status = String(row.status || 'Paid').trim().toLowerCase();
        return !!row.reverted || status !== 'paid';
    }

    function renderEditButton(row) {
        if (!canShowEditIcon(row)) {
            return '';
        }
        return '<button type="button" class="payroll-edit-icon-btn" data-action="edit" data-payroll-id="' + escapeHtml(row.payrollId) + '" title="Edit Payroll">'
            + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path>'
            + '<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
            + '</svg></button>';
    }

    function isGeneratedStatus(status) {
        return String(status || '').trim().toLowerCase() === 'generated';
    }

    function renderStatusBadge(status) {
        const label = status || 'Paid';
        const normalized = String(label).trim().toLowerCase();
        let badgeClass = 'status-badge';
        if (normalized === 'generated') {
            badgeClass += ' status-badge-generated';
        } else if (normalized === 'paid') {
            badgeClass += ' status-badge-paid';
        } else {
            badgeClass += ' status-badge-pending';
        }
        return '<span class="' + badgeClass + '">' + escapeHtml(label) + '</span>';
    }

    function renderPayActionButton(row) {
        if (isGeneratedStatus(row.status)) {
            return '<button type="button" class="payroll-process-pay-btn" data-action="process" data-payroll-id="' + escapeHtml(row.payrollId) + '">Proceed To Pay</button>';
        }
        return '<button type="button" class="payroll-view-payslip-btn" data-action="payslip" data-payroll-id="' + escapeHtml(row.payrollId) + '">View Payslip</button>';
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                /* fallback below */
            }
        }
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        let copied = false;
        try {
            copied = document.execCommand('copy');
        } catch (err) {
            copied = false;
        }
        document.body.removeChild(textarea);
        return copied;
    }

    function populateRoleSelect(roles) {
        roleSelect.innerHTML = '<option value="">Select</option>' + (roles || []).map(function (role) {
            return '<option value="' + escapeHtml(role) + '">' + escapeHtml(role) + '</option>';
        }).join('');
    }

    function populateMonthSelect(months) {
        monthSelect.innerHTML = (months || []).map(function (month) {
            return '<option value="' + escapeHtml(month.value) + '">' + escapeHtml(month.label) + '</option>';
        }).join('');
    }

    function populateYearSelect() {
        const current = new Date().getFullYear();
        const years = [];
        for (let year = current + 1; year >= current - 5; year -= 1) {
            years.push('<option value="' + year + '">' + year + '</option>');
        }
        yearSelect.innerHTML = years.join('');
        yearSelect.value = String(current);
    }

    function setDefaultMonth() {
        monthSelect.value = String(new Date().getMonth() + 1);
    }

    function applyFilters() {
        const query = (searchInput.value || '').trim().toLowerCase();
        filteredRows = payrollRows.filter(function (row) {
            if (!query) return true;
            return [
                row.staffId,
                row.staffName,
                row.role,
                row.department,
                row.designation,
                row.phone,
                row.status
            ].some(function (value) {
                return String(value || '').toLowerCase().includes(query);
            });
        });
        currentPage = 1;
        renderTable();
    }

    function renderTable() {
        if (!filteredRows.length) {
            noRecordBanner.hidden = false;
            staffTableWrap.hidden = true;
            staffTableBody.innerHTML = '';
            entriesInfo.textContent = 'Showing 0 to 0 of 0 entries';
            pagination.innerHTML = '';
            return;
        }

        noRecordBanner.hidden = true;
        staffTableWrap.hidden = false;

        const total = filteredRows.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filteredRows.slice(startIndex, endIndex);

        staffTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-payroll-id="' + escapeHtml(row.payrollId) + '">'
                + '<td>' + escapeHtml(row.staffId) + '</td>'
                + '<td>' + escapeHtml(row.staffName) + '</td>'
                + '<td>' + escapeHtml(row.role) + '</td>'
                + '<td>' + escapeHtml(row.department) + '</td>'
                + '<td>' + escapeHtml(row.designation) + '</td>'
                + '<td>' + escapeHtml(row.phone) + '</td>'
                + '<td>' + renderStatusBadge(row.status) + '</td>'
                + '<td><div class="payroll-action-cell">'
                + '<button type="button" class="payroll-action-icon-btn payroll-revert-icon-btn" data-action="revert" data-payroll-id="' + escapeHtml(row.payrollId) + '" title="Revert Payroll">'
                + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="1 4 1 10 7 10"></polyline>'
                + '<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>'
                + '</svg></button>'
                + renderEditButton(row)
                + renderPayActionButton(row)
                + '</div></td>'
                + '</tr>';
        }).join('');

        entriesInfo.textContent = 'Showing ' + (startIndex + 1) + ' to ' + endIndex + ' of ' + total + ' entries';
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        pagination.innerHTML = '';
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'payroll-pagination-btn';
        prevBtn.textContent = '‹';
        prevBtn.disabled = currentPage <= 1;
        prevBtn.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage -= 1;
                renderTable();
            }
        });
        pagination.appendChild(prevBtn);

        for (let page = 1; page <= totalPages; page += 1) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = 'payroll-pagination-btn' + (page === currentPage ? ' active' : '');
            pageBtn.textContent = String(page);
            pageBtn.addEventListener('click', function () {
                currentPage = page;
                renderTable();
            });
            pagination.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'payroll-pagination-btn';
        nextBtn.textContent = '›';
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage += 1;
                renderTable();
            }
        });
        pagination.appendChild(nextBtn);
    }

    function getExportRows() {
        return filteredRows.map(function (row) {
            return {
                'Staff ID': row.staffId,
                'Name': row.staffName,
                'Role': row.role,
                'Department': row.department,
                'Designation': row.designation,
                'Phone': row.phone,
                'Status': row.status
            };
        });
    }

    function handleCopy() {
        const rows = getExportRows();
        if (!rows.length) return;
        const text = rows.map(function (row) {
            return Object.values(row).join('\t');
        }).join('\n');
        copyTextToClipboard(text).then(function (copied) {
            Swal.fire({
                icon: copied ? 'success' : 'error',
                title: copied ? 'Copied!' : 'Copy failed',
                text: copied ? 'Table data copied to clipboard' : 'Could not copy table data',
                confirmButtonColor: '#8b5cf6',
                timer: copied ? 1500 : undefined,
                timerProgressBar: copied
            });
        });
    }

    function handleExcelExport() {
        const rows = getExportRows();
        if (!rows.length || !window.XLSX) return;
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
        XLSX.writeFile(workbook, 'payroll_staff_list.xlsx');
    }

    function handleCSVExport() {
        const rows = getExportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(',')].concat(rows.map(function (row) {
            return headers.map(function (header) {
                return '"' + String(row[header] || '').replace(/"/g, '""') + '"';
            }).join(',');
        })).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'payroll_staff_list.csv';
        link.click();
    }

    function handlePDFExport() {
        const rows = getExportRows();
        if (!rows.length || !window.jspdf) return;
        const doc = new window.jspdf.jsPDF();
        const tableData = rows.map(function (row) {
            return [row['Staff ID'], row.Name, row.Role, row.Department, row.Designation, row.Phone, row.Status];
        });
        doc.autoTable({
            head: [['Staff ID', 'Name', 'Role', 'Department', 'Designation', 'Phone', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] }
        });
        doc.save('payroll_staff_list.pdf');
    }

    function handlePrint() {
        window.print();
    }

    function setupColumnVisibility() {
        const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
        const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
        const columnToggles = document.querySelectorAll('.column-toggle');
        if (!columnVisibilityBtn || !columnVisibilityDropdown) return;

        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn) {
                columnVisibilityDropdown.classList.remove('active');
            }
        });

        columnVisibilityDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        columnToggles.forEach(function (toggle) {
            toggle.addEventListener('change', function () {
                const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
                const isVisible = toggle.checked;
                const table = document.getElementById('payrollTable');
                if (!table) return;
                const headerCells = table.querySelectorAll('thead th');
                if (headerCells[columnIndex]) {
                    headerCells[columnIndex].style.display = isVisible ? '' : 'none';
                }
                table.querySelectorAll('tbody tr').forEach(function (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells[columnIndex]) {
                        cells[columnIndex].style.display = isVisible ? '' : 'none';
                    }
                });
            });
        });
    }

    function buildPayslipDetail(detail) {
        return {
            payslipNo: detail.payslipNo,
            periodLabel: detail.monthYear || ((detail.monthLabel || '') + ' ' + (detail.year || '')),
            paymentDate: detail.paymentDate || '-',
            staffId: detail.staffId || '-',
            staffName: detail.staffName || '-',
            department: detail.department || '-',
            designation: detail.designation || '-',
            paymentMode: detail.paymentMode ? String(detail.paymentMode) : '',
            basicSalary: Number(detail.basicSalary) || 0,
            grossSalary: Number(detail.grossSalary) || 0,
            netSalary: Number(detail.netSalary) || 0,
            totalEarning: Number(detail.totalEarning) || 0,
            totalDeduction: Number(detail.totalDeduction) || 0,
            earnings: detail.earnings || [],
            deductions: detail.deductions || []
        };
    }

    function renderPayslipDocument(detail) {
        const payslip = buildPayslipDetail(detail);

        return ''
            + '<div class="staff-payslip-sheet" id="payrollPayslipPrintArea">'
            + '<div class="staff-payslip-sheet-header">'
            + '<div class="staff-payslip-brand">'
            + '<div class="staff-payslip-logo">'
            + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="42" height="42">'
            + '<rect x="8" y="10" width="34" height="32" fill="#f39c12" rx="2"></rect>'
            + '<rect x="10" y="12" width="30" height="28" fill="#f6c544" rx="1"></rect>'
            + '<path d="M 25 12 L 25 40" stroke="#f39c12" stroke-width="2"></path>'
            + '</svg>'
            + '<span>SMART SCHOOL</span>'
            + '</div>'
            + '<h4 class="staff-payslip-school-name">Your School Name Here</h4>'
            + '</div>'
            + '<div class="staff-payslip-school-contact">'
            + '<div>Address: 25 Kings Street, CA</div>'
            + '<div>Phone No.: 89562423934</div>'
            + '<div>Email: yourschool@gmail.com</div>'
            + '<div>Website: www.yoursite.in</div>'
            + '</div>'
            + '</div>'
            + '<div class="staff-payslip-title-bar">Payslip</div>'
            + '<div class="staff-payslip-sheet-body">'
            + '<h4 class="staff-payslip-period-title">Payslip For The Period Of ' + escapeHtml(payslip.periodLabel) + '</h4>'
            + '<div class="staff-payslip-meta-row">'
            + '<span>Payslip #' + escapeHtml(payslip.payslipNo) + '</span>'
            + '<span>Payment Date: ' + escapeHtml(payslip.paymentDate) + '</span>'
            + '</div>'
            + '<div class="staff-payslip-staff-grid">'
            + '<div class="staff-payslip-info-row"><span>Staff ID</span><strong>' + escapeHtml(payslip.staffId) + '</strong></div>'
            + '<div class="staff-payslip-info-row"><span>Name</span><strong>' + escapeHtml(payslip.staffName) + '</strong></div>'
            + '<div class="staff-payslip-info-row"><span>Department</span><strong>' + escapeHtml(payslip.department) + '</strong></div>'
            + '<div class="staff-payslip-info-row"><span>Designation</span><strong>' + escapeHtml(payslip.designation) + '</strong></div>'
            + '</div>'
            + '<div class="staff-payslip-ledger">'
            + '<div class="staff-payslip-ledger-col">'
            + '<table class="staff-payslip-ledger-table">'
            + '<thead><tr><th>Earning</th><th class="text-end">Amount ($)</th></tr></thead>'
            + '<tbody>'
            + '<tr><td>&nbsp;</td><td class="text-end">' + formatAmount(payslip.totalEarning) + '</td></tr>'
            + '<tr class="staff-payslip-total-row"><td>Total Earning</td><td class="text-end">' + formatAmount(payslip.totalEarning) + '</td></tr>'
            + '</tbody></table>'
            + '</div>'
            + '<div class="staff-payslip-ledger-col">'
            + '<table class="staff-payslip-ledger-table">'
            + '<thead><tr><th>Deduction</th><th class="text-end">Amount ($)</th></tr></thead>'
            + '<tbody>'
            + '<tr><td>&nbsp;</td><td class="text-end">' + formatAmount(payslip.totalDeduction) + '</td></tr>'
            + '<tr class="staff-payslip-total-row"><td>Total Deduction</td><td class="text-end">' + formatAmount(payslip.totalDeduction) + '</td></tr>'
            + '</tbody></table>'
            + '</div>'
            + '</div>'
            + '<div class="staff-payslip-summary">'
            + '<div class="staff-payslip-summary-row"><span>Payment Mode</span><strong>' + escapeHtml(payslip.paymentMode) + '</strong></div>'
            + '<div class="staff-payslip-summary-row"><span>Basic Salary ($)</span><strong>' + formatAmount(payslip.basicSalary) + '</strong></div>'
            + '<div class="staff-payslip-summary-row"><span>Gross Salary ($)</span><strong>' + formatAmount(payslip.grossSalary) + '</strong></div>'
            + '<div class="staff-payslip-summary-row"><span>Net Salary ($)</span><strong>' + formatAmount(payslip.netSalary) + '</strong></div>'
            + '</div>'
            + '<p class="staff-payslip-note">This payslip is computer generated hence no signature is required.</p>'
            + '</div>'
            + '</div>';
    }

    function openPayslipModal(detail) {
        activePayslipDetail = detail;
        payslipDocument.innerHTML = renderPayslipDocument(detail);
        payslipModal.hidden = false;
    }

    function closePayslipModal() {
        payslipModal.hidden = true;
        activePayslipDetail = null;
    }

    function renderLineRow(type, amount, listType) {
        return '<div class="payroll-line-row" data-list="' + listType + '">'
            + '<input type="text" class="payroll-line-type" value="' + escapeHtml(type || '') + '" placeholder="Type">'
            + '<input type="number" class="payroll-line-amount" step="0.01" min="0" value="' + escapeHtml(amount != null ? amount : '0') + '">'
            + '<button type="button" class="payroll-line-remove-btn" title="Remove">&times;</button>'
            + '</div>';
    }

    function renderEditStaffGrid(detail) {
        const items = [
            ['Name', detail.staffName],
            ['Staff ID', detail.staffId],
            ['Phone', detail.phone],
            ['Email', detail.email],
            ['EPF No.', detail.epfNo],
            ['Role', detail.role],
            ['Department', detail.department],
            ['Designation', detail.designation]
        ];
        editStaffGrid.innerHTML = items.map(function (item) {
            return '<div class="payroll-edit-staff-item"><span>' + escapeHtml(item[0]) + '</span><strong>' + escapeHtml(item[1] || '') + '</strong></div>';
        }).join('');

        if (detail.photoPath) {
            editPhoto.innerHTML = '<img src="' + escapeHtml(detail.photoPath) + '" alt="Staff photo">';
        } else {
            editPhoto.innerHTML = '<span>NO IMAGE<br>AVAILABLE</span>';
        }
    }

    function renderAttendanceSummary(summary) {
        editAttendanceBody.innerHTML = (summary || []).map(function (row) {
            return '<tr>'
                + '<td class="attendance-label-col">' + escapeHtml(row.month) + '</td>'
                + '<td>' + escapeHtml(row.P) + '</td>'
                + '<td>' + escapeHtml(row.L) + '</td>'
                + '<td>' + escapeHtml(row.A) + '</td>'
                + '<td>' + escapeHtml(row.F) + '</td>'
                + '<td>' + escapeHtml(row.H) + '</td>'
                + '<td>' + escapeHtml(row.SH) + '</td>'
                + '<td>' + escapeHtml(row.V) + '</td>'
                + '</tr>';
        }).join('');
    }

    function renderLineLists(detail) {
        const earnings = detail.earnings && detail.earnings.length ? detail.earnings : [{ type: String(Math.round(detail.basicSalary || 0)), amount: 0 }];
        const deductions = detail.deductions && detail.deductions.length ? detail.deductions : [{ type: '', amount: 0 }];
        earningList.innerHTML = earnings.map(function (item) {
            return renderLineRow(item.type, item.amount, 'earning');
        }).join('');
        deductionList.innerHTML = deductions.map(function (item) {
            return renderLineRow(item.type, item.amount, 'deduction');
        }).join('');
        updateSummaryFromInputs(detail);
    }

    function collectLineItems(listEl) {
        return Array.from(listEl.querySelectorAll('.payroll-line-row')).map(function (row) {
            return {
                type: row.querySelector('.payroll-line-type').value.trim(),
                amount: Number(row.querySelector('.payroll-line-amount').value) || 0
            };
        });
    }

    function updateSummaryFromInputs(detail) {
        const basicSalary = Number(detail && detail.basicSalary) || 0;
        const earnings = collectLineItems(earningList);
        const deductions = collectLineItems(deductionList);
        const totalEarning = earnings.reduce(function (sum, item) { return sum + item.amount; }, 0);
        const totalDeduction = deductions.reduce(function (sum, item) { return sum + item.amount; }, 0);
        const tax = Number(detail && detail.tax) || 0;
        const grossSalary = basicSalary + totalEarning;
        const netSalary = grossSalary - totalDeduction - tax;

        document.getElementById('summaryBasicSalary').textContent = formatAmount(basicSalary);
        document.getElementById('summaryEarning').textContent = formatAmount(totalEarning);
        document.getElementById('summaryDeduction').textContent = formatAmount(totalDeduction);
        document.getElementById('summaryGrossSalary').textContent = formatAmount(grossSalary);
        document.getElementById('summaryTax').textContent = formatAmount(tax);
        document.getElementById('summaryNetSalary').textContent = formatAmount(netSalary);

        return { basicSalary, totalEarning, totalDeduction, tax, grossSalary, netSalary, earnings, deductions };
    }

    function openEditModal(detail) {
        activeEditRecord = detail;
        editTitle.textContent = 'Edit Payroll For : ' + (detail.monthLabel || '');
        renderEditStaffGrid(detail);
        renderAttendanceSummary(detail.attendanceSummary);
        renderLineLists(detail);
        editModal.hidden = false;
    }

    function closeEditModal() {
        editModal.hidden = true;
        activeEditRecord = null;
    }

    async function loadInitialData() {
        const roles = await fetchJson('/api/payroll/roles');
        const months = await fetchJson('/api/payroll/months');
        populateRoleSelect(roles);
        populateMonthSelect(months);
        populateYearSelect();
        setDefaultMonth();
    }

    payrollFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        currentRole = roleSelect.value;
        currentMonth = parseInt(monthSelect.value, 10);
        currentYear = parseInt(yearSelect.value, 10);

        try {
            const query = '/api/payroll/staff?month=' + encodeURIComponent(currentMonth)
                + '&year=' + encodeURIComponent(currentYear)
                + (currentRole ? '&role=' + encodeURIComponent(currentRole) : '');
            payrollRows = await fetchJson(query);
            staffListPanel.hidden = false;
            applyFilters();
        } catch (error) {
            showError(error);
        }
    });

    searchInput.addEventListener('input', applyFilters);
    entriesSelect.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderTable();
    });

    document.getElementById('copyBtn').addEventListener('click', handleCopy);
    document.getElementById('excelBtn').addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn').addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn').addEventListener('click', handlePDFExport);
    document.getElementById('printBtn').addEventListener('click', handlePrint);

    staffTableBody.addEventListener('click', async function (event) {
        const editBtn = event.target.closest('[data-action="edit"]');
        const payslipBtn = event.target.closest('[data-action="payslip"]');
        const processBtn = event.target.closest('[data-action="process"]');
        const revertBtn = event.target.closest('[data-action="revert"]');
        const actionBtn = editBtn || payslipBtn || processBtn || revertBtn;
        if (!actionBtn) return;

        const payrollId = actionBtn.dataset.payrollId;

        if (revertBtn) {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Revert Payroll?',
                text: 'This will reset payroll values to the default basic salary for this staff member.',
                showCancelButton: true,
                confirmButtonText: 'Revert',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#8b5cf6'
            });
            if (!result.isConfirmed) {
                return;
            }
            try {
                const response = await fetchJson('/api/payroll/records/' + encodeURIComponent(payrollId) + '/revert', {
                    method: 'POST'
                });
                showSuccess(response.message || 'Payroll reverted successfully!');
                const query = '/api/payroll/staff?month=' + encodeURIComponent(currentMonth)
                    + '&year=' + encodeURIComponent(currentYear)
                    + (currentRole ? '&role=' + encodeURIComponent(currentRole) : '');
                payrollRows = await fetchJson(query);
                applyFilters();
            } catch (error) {
                showError(error);
            }
            return;
        }

        if (processBtn) {
            try {
                const detail = await fetchJson('/api/payroll/records/' + encodeURIComponent(payrollId));
                if (!isGeneratedStatus(detail.status)) {
                    showError({ message: 'Only Generated payroll records can proceed to pay.' });
                    return;
                }
                openProceedToPayModal(detail);
            } catch (error) {
                showError(error);
            }
            return;
        }

        try {
            const detail = await fetchJson('/api/payroll/records/' + encodeURIComponent(payrollId));
            if (editBtn) {
                if (!canShowEditIcon(detail)) {
                    showError({ message: 'Edit is only available for reverted or unpaid payroll records.' });
                    return;
                }
                openEditModal(detail);
            } else if (payslipBtn) {
                openPayslipModal(detail);
            }
        } catch (error) {
            showError(error);
        }
    });

    payslipCloseBtn.addEventListener('click', closePayslipModal);
    payslipOverlay.addEventListener('click', closePayslipModal);
    editCloseBtn.addEventListener('click', closeEditModal);
    editOverlay.addEventListener('click', closeEditModal);

    proceedCloseBtn.addEventListener('click', closeProceedToPayModal);
    proceedOverlay.addEventListener('click', closeProceedToPayModal);

    saveProceedPayBtn.addEventListener('click', async function () {
        if (!activeProceedRecord) {
            return;
        }
        const paymentMode = proceedPaymentMode.value.trim();
        const paymentDate = proceedPaymentDate.value.trim();
        if (!paymentMode) {
            showError({ message: 'Payment mode is required.' });
            return;
        }
        if (!paymentDate) {
            showError({ message: 'Payment date is required.' });
            return;
        }

        try {
            const response = await fetchJson('/api/payroll/records/' + encodeURIComponent(activeProceedRecord.payrollId) + '/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMode: paymentMode,
                    paymentDate: paymentDate,
                    paymentAmount: parseAmountValue(proceedPaymentAmount.value),
                    note: proceedNote.value.trim()
                })
            });
            showSuccess(response.message || 'Payroll processed to pay successfully!');
            closeProceedToPayModal();
            const query = '/api/payroll/staff?month=' + encodeURIComponent(currentMonth)
                + '&year=' + encodeURIComponent(currentYear)
                + (currentRole ? '&role=' + encodeURIComponent(currentRole) : '');
            payrollRows = await fetchJson(query);
            applyFilters();
        } catch (error) {
            showError(error);
        }
    });

    function getPayslipPrintStyles() {
        return ''
            + 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #111; }'
            + '.staff-payslip-sheet-header { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 0; }'
            + '.staff-payslip-brand { display: flex; align-items: center; gap: 12px; }'
            + '.staff-payslip-logo { display: flex; flex-direction: column; align-items: center; gap: 4px; font-weight: 700; font-size: 10px; }'
            + '.staff-payslip-school-name { margin: 0; font-size: 28px; font-family: Georgia, \"Times New Roman\", serif; }'
            + '.staff-payslip-school-contact { text-align: right; font-size: 12px; line-height: 1.5; }'
            + '.staff-payslip-title-bar { background: #111; color: #fff; text-align: center; padding: 6px; margin-top: 0; font-weight: 600; }'
            + '.staff-payslip-sheet-body { background: #243447; color: #fff; padding: 16px; }'
            + '.staff-payslip-period-title { text-align: center; margin: 0 0 12px; font-size: 22px; font-weight: 400; }'
            + '.staff-payslip-meta-row { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 13px; }'
            + '.staff-payslip-staff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 14px; font-size: 13px; }'
            + '.staff-payslip-info-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding: 6px 0; }'
            + '.staff-payslip-info-row span { color: #cbd5e1; }'
            + '.staff-payslip-ledger { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 14px; }'
            + '.staff-payslip-ledger-table { width: 100%; border-collapse: collapse; font-size: 13px; }'
            + '.staff-payslip-ledger-table th, .staff-payslip-ledger-table td { border: 1px solid rgba(255,255,255,0.12); padding: 8px; }'
            + '.staff-payslip-ledger-table th { background: rgba(255,255,255,0.08); text-align: left; }'
            + '.text-end { text-align: right; }'
            + '.staff-payslip-total-row td { font-weight: 600; }'
            + '.staff-payslip-summary { width: 100%; font-size: 13px; }'
            + '.staff-payslip-summary-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding: 6px 0; }'
            + '.staff-payslip-summary-row span { color: #cbd5e1; }'
            + '.staff-payslip-note { font-size: 11px; margin-top: 16px; opacity: 0.85; }';
    }

    function printPayslipArea() {
        const printArea = document.getElementById('payrollPayslipPrintArea');
        if (!printArea) {
            showError({ message: 'No payslip content to print.' });
            return;
        }

        const printHtml = '<!DOCTYPE html><html><head><title>Payslip</title><style>'
            + getPayslipPrintStyles()
            + '</style></head><body>'
            + printArea.outerHTML
            + '</body></html>';

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('aria-hidden', 'true');
            iframe.style.position = 'fixed';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            document.body.appendChild(iframe);
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(printHtml);
            iframeDoc.close();
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(function () {
                document.body.removeChild(iframe);
            }, 1000);
            return;
        }

        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = function () {
                printWindow.close();
            };
        };
        setTimeout(function () {
            if (!printWindow.closed) {
                printWindow.focus();
                printWindow.print();
            }
        }, 300);
    }

    const payslipHeaderPrintBtn = document.getElementById('payrollPayslipHeaderPrintBtn');
    if (payslipHeaderPrintBtn) {
        payslipHeaderPrintBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            printPayslipArea();
        });
    }

    addEarningBtn.addEventListener('click', function () {
        earningList.insertAdjacentHTML('beforeend', renderLineRow('', 0, 'earning'));
    });

    addDeductionBtn.addEventListener('click', function () {
        deductionList.insertAdjacentHTML('beforeend', renderLineRow('', 0, 'deduction'));
    });

    earningList.addEventListener('click', function (event) {
        const removeBtn = event.target.closest('.payroll-line-remove-btn');
        if (!removeBtn) return;
        const row = removeBtn.closest('.payroll-line-row');
        if (row) row.remove();
        updateSummaryFromInputs(activeEditRecord);
    });

    deductionList.addEventListener('click', function (event) {
        const removeBtn = event.target.closest('.payroll-line-remove-btn');
        if (!removeBtn) return;
        const row = removeBtn.closest('.payroll-line-row');
        if (row) row.remove();
        updateSummaryFromInputs(activeEditRecord);
    });

    earningList.addEventListener('input', function () {
        updateSummaryFromInputs(activeEditRecord);
    });

    deductionList.addEventListener('input', function () {
        updateSummaryFromInputs(activeEditRecord);
    });

    calculatePayrollBtn.addEventListener('click', function () {
        updateSummaryFromInputs(activeEditRecord);
    });

    savePayrollBtn.addEventListener('click', async function () {
        if (!activeEditRecord) return;
        const summary = updateSummaryFromInputs(activeEditRecord);
        try {
            const response = await fetchJson('/api/payroll/records/' + encodeURIComponent(activeEditRecord.payrollId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    basicSalary: summary.basicSalary,
                    earnings: summary.earnings,
                    deductions: summary.deductions,
                    tax: summary.tax,
                    paymentMode: activeEditRecord.paymentMode || 'Cash'
                })
            });
            showSuccess(response.message || 'Payroll saved successfully!');
            closeEditModal();

            const query = '/api/payroll/staff?month=' + encodeURIComponent(currentMonth)
                + '&year=' + encodeURIComponent(currentYear)
                + (currentRole ? '&role=' + encodeURIComponent(currentRole) : '');
            payrollRows = await fetchJson(query);
            applyFilters();
        } catch (error) {
            showError(error);
        }
    });

    setupColumnVisibility();
    loadInitialData().catch(showError);
});
