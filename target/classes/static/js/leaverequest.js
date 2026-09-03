let leaveRecords = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let roles = [];
let leaveTypes = [];

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadFormOptions();
    loadLeaveRecords();

    const today = new Date().toISOString().split('T')[0];
    const applyDateInput = document.getElementById('addApplyDate');
    if (applyDateInput) {
        applyDateInput.value = today;
    }
});

function setupEventListeners() {
    document.getElementById('addLeaveBtn')?.addEventListener('click', openAddModal);
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);

    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    setupColumnVisibility();
    setupModalCloseHandlers();
    setupFileUpload();

    document.getElementById('leaveDetailsForm')?.addEventListener('submit', handleDetailsSave);
    document.getElementById('leaveAddForm')?.addEventListener('submit', handleAddSave);
    document.getElementById('addRole')?.addEventListener('change', loadStaffForRole);
}

function setupModalCloseHandlers() {
    document.querySelectorAll('[data-close-modal]').forEach(el => {
        el.addEventListener('click', closeAllModals);
    });
}

function setupFileUpload() {
    const fileUploadArea = document.getElementById('addFileUploadArea');
    const fileInput = document.getElementById('addDocument');

    if (!fileUploadArea || !fileInput) return;

    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#8b5cf6';
    });

    fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#475569';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#475569';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            displayFileName(files[0].name);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            displayFileName(e.target.files[0].name);
        }
    });
}

function displayFileName(fileName) {
    const fileNameDisplay = document.getElementById('addFileName');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = `Selected: ${fileName}`;
        fileNameDisplay.classList.add('active');
    }
}

async function loadFormOptions() {
    try {
        const [rolesRes, typesRes] = await Promise.all([
            fetch('/api/staff-leave-requests/roles'),
            fetch('/api/staff-leave-requests/leave-types')
        ]);

        roles = rolesRes.ok ? await rolesRes.json() : [];
        leaveTypes = typesRes.ok ? await typesRes.json() : [];

        populateSelect(document.getElementById('addRole'), roles, 'Select');
        populateSelect(document.getElementById('addLeaveType'), leaveTypes, 'Select');
    } catch (error) {
        console.error('Failed to load form options:', error);
    }
}

async function loadStaffForRole() {
    const roleSelect = document.getElementById('addRole');
    const staffSelect = document.getElementById('addStaff');
    if (!roleSelect || !staffSelect) return;

    const role = roleSelect.value;
    staffSelect.innerHTML = '<option value="">Select</option>';

    try {
        const url = role ? `/api/staff-leave-requests/staff?role=${encodeURIComponent(role)}` : '/api/staff-leave-requests/staff';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load staff');

        const staffList = await response.json();
        staffList.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = staff.name;
            option.dataset.role = staff.role || '';
            staffSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load staff:', error);
    }
}

function populateSelect(select, items, placeholder) {
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

async function loadLeaveRecords() {
    try {
        const response = await fetch('/api/staff-leave-requests');
        if (!response.ok) throw new Error('Failed to fetch leave requests');

        leaveRecords = await response.json();
        filteredRecords = [...leaveRecords];
        currentPage = 1;
        renderTable();
    } catch (error) {
        console.error('Error loading leave requests:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load leave requests',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTable(records = filteredRecords) {
    const tbody = document.getElementById('leaveRequestTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (paginatedRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">No leave requests found</td>
            </tr>
        `;
    } else {
        paginatedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.staff)}</td>
                <td>${escapeHtml(record.leaveType)}</td>
                <td>${escapeHtml(record.halfDay || '')}</td>
                <td>${escapeHtml(record.leaveDate)}</td>
                <td>${escapeHtml(record.days)}</td>
                <td>${escapeHtml(record.applyDate)}</td>
                <td>${renderStatusBadge(record.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn-action" onclick="viewLeave(${record.id})" title="View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>
                        <button type="button" class="btn-action btn-action-delete" onclick="deleteLeave(${record.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updatePaginationInfo(records.length);
}

function renderStatusBadge(status) {
    const normalized = (status || 'Pending').toLowerCase();
    let className = 'status-badge-pending';
    if (normalized === 'approved') {
        className = 'status-badge-approved';
    } else if (normalized === 'disapproved') {
        className = 'status-badge-disapproved';
    }
    return `<span class="status-badge ${className}">${escapeHtml(status || 'Pending')}</span>`;
}

async function viewLeave(id) {
    try {
        const response = await fetch(`/api/staff-leave-requests/${id}`);
        if (!response.ok) throw new Error('Leave request not found');
        const leave = await response.json();

        document.getElementById('detailsLeaveId').value = leave.id;
        document.getElementById('detailStaffName').textContent = leave.staffName || '-';
        document.getElementById('detailStaffId').textContent = leave.staffIdCode || '-';
        document.getElementById('detailSubmittedBy').textContent = leave.submittedBy || '-';
        document.getElementById('detailLeaveType').textContent = leave.leaveType || '-';
        document.getElementById('detailLeaveSummary').textContent = leave.leaveSummary || '-';
        document.getElementById('detailApplyDate').textContent = leave.applyDate || '-';
        document.getElementById('detailsReason').value = leave.reason || '';
        document.getElementById('detailsNote').value = leave.note || '';

        const status = leave.status || 'Pending';
        document.querySelectorAll('input[name="detailsStatus"]').forEach(radio => {
            radio.checked = radio.value === status;
        });

        openModal('leaveDetailsModal');
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load leave details',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleDetailsSave(event) {
    event.preventDefault();

    const id = document.getElementById('detailsLeaveId').value;
    const statusRadio = document.querySelector('input[name="detailsStatus"]:checked');
    const payload = {
        status: statusRadio ? statusRadio.value : 'Pending',
        reason: document.getElementById('detailsReason').value.trim(),
        note: document.getElementById('detailsNote').value.trim()
    };

    try {
        const response = await fetch(`/api/staff-leave-requests/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: result.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
            closeAllModals();
            loadLeaveRecords();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to update leave request',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function openAddModal() {
    document.getElementById('leaveAddForm')?.reset();
    document.getElementById('addFileName').textContent = '';
    document.getElementById('addFileName').classList.remove('active');
    document.getElementById('addDocument').value = '';

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('addApplyDate').value = today;

    const pendingRadio = document.querySelector('input[name="addStatus"][value="Pending"]');
    if (pendingRadio) pendingRadio.checked = true;

    document.querySelectorAll('input[name="addHalfDay"]').forEach(radio => {
        radio.checked = false;
    });

    const staffSelect = document.getElementById('addStaff');
    if (staffSelect) {
        staffSelect.innerHTML = '<option value="">Select</option>';
    }

    openModal('leaveAddModal');
}

async function handleAddSave(event) {
    event.preventDefault();

    const staffSelect = document.getElementById('addStaff');
    const roleSelect = document.getElementById('addRole');
    const halfDayRadio = document.querySelector('input[name="addHalfDay"]:checked');
    const statusRadio = document.querySelector('input[name="addStatus"]:checked');

    const payload = {
        staffMemberId: staffSelect.value,
        role: roleSelect.value,
        leaveType: document.getElementById('addLeaveType').value,
        applyDate: formatDateForApi(document.getElementById('addApplyDate').value),
        fromDate: formatDateForApi(document.getElementById('addFromDate').value),
        toDate: formatDateForApi(document.getElementById('addToDate').value),
        halfDay: halfDayRadio ? halfDayRadio.value : '',
        reason: document.getElementById('addReason').value.trim(),
        note: document.getElementById('addNote').value.trim(),
        status: statusRadio ? statusRadio.value : 'Pending'
    };

    if (!payload.staffMemberId || !payload.leaveType || !payload.applyDate || !payload.fromDate || !payload.toDate) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please fill in all required fields',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    const documentInput = document.getElementById('addDocument');
    if (documentInput?.files?.length > 0) {
        formData.append('document', documentInput.files[0]);
    }

    try {
        const response = await fetch('/api/staff-leave-requests', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: result.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
            closeAllModals();
            loadLeaveRecords();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save leave request',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function deleteLeave(id) {
    const result = await Swal.fire({
        title: 'Delete Leave Request?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/api/staff-leave-requests/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: data.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
            loadLeaveRecords();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete leave request',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.hidden = false;
}

function closeAllModals() {
    document.querySelectorAll('.leave-modal').forEach(modal => {
        modal.hidden = true;
    });
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();

    filteredRecords = leaveRecords.filter(record => {
        return (
            (record.staff && record.staff.toLowerCase().includes(searchTerm)) ||
            (record.leaveType && record.leaveType.toLowerCase().includes(searchTerm)) ||
            (record.halfDay && record.halfDay.toLowerCase().includes(searchTerm)) ||
            (record.leaveDate && record.leaveDate.toLowerCase().includes(searchTerm)) ||
            (record.days && String(record.days).includes(searchTerm)) ||
            (record.applyDate && record.applyDate.toLowerCase().includes(searchTerm)) ||
            (record.status && record.status.toLowerCase().includes(searchTerm))
        );
    });

    currentPage = 1;
    renderTable();
}

function handleEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderTable();
}

function updatePaginationInfo(totalRecords) {
    const startIndex = totalRecords > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0;
    const endIndex = Math.min(currentPage * recordsPerPage, totalRecords);

    document.getElementById('showingStart').textContent = startIndex;
    document.getElementById('showingEnd').textContent = endIndex;
    document.getElementById('totalEntries').textContent = totalRecords;

    const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
    const paginationDiv = document.getElementById('pagination');

    if (!paginationDiv) return;
    paginationDiv.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    };
    paginationDiv.appendChild(prevBtn);

    const maxButtons = Math.min(totalPages, 5);
    for (let i = 1; i <= maxButtons; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderTable();
        };
        paginationDiv.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages || totalRecords === 0;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    };
    paginationDiv.appendChild(nextBtn);
}

function handleCopy() {
    const tableData = filteredRecords.map(record =>
        `${record.staff}\t${record.leaveType}\t${record.halfDay || ''}\t${record.leaveDate}\t${record.days}\t${record.applyDate}\t${record.status}`
    ).join('\n');

    navigator.clipboard.writeText(tableData).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Table data copied to clipboard',
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    });
}

function handleExcelExport() {
    const data = filteredRecords.map(record => ({
        Staff: record.staff,
        'Leave Type': record.leaveType,
        'Half Day': record.halfDay || '',
        'Leave Date': record.leaveDate,
        Days: record.days,
        'Apply Date': record.applyDate,
        Status: record.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
    XLSX.writeFile(wb, 'staff_leave_requests.xlsx');
}

function handleCSVExport() {
    const headers = ['Staff', 'Leave Type', 'Half Day', 'Leave Date', 'Days', 'Apply Date', 'Status'];
    const csvData = [headers];

    filteredRecords.forEach(record => {
        csvData.push([
            record.staff,
            record.leaveType,
            record.halfDay || '',
            record.leaveDate,
            record.days,
            record.applyDate,
            record.status
        ]);
    });

    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_leave_requests.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    const tableData = filteredRecords.map(record => [
        record.staff,
        record.leaveType,
        record.halfDay || '',
        record.leaveDate,
        record.days,
        record.applyDate,
        record.status
    ]);

    doc.autoTable({
        head: [['Staff', 'Leave Type', 'Half Day', 'Leave Date', 'Days', 'Apply Date', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 8 }
    });

    doc.save('staff_leave_requests.pdf');
}

function handlePrint() {
    window.print();
}

function setupColumnVisibility() {
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    const columnToggles = document.querySelectorAll('.column-toggle');

    if (!columnVisibilityBtn || !columnVisibilityDropdown) return;

    columnVisibilityBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        columnVisibilityDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn) {
            columnVisibilityDropdown.classList.remove('active');
        }
    });

    columnVisibilityDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    columnToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const columnIndex = parseInt(this.getAttribute('data-column'), 10);
            const isVisible = this.checked;
            const table = document.getElementById('leaveRequestTable');
            if (!table) return;

            const headerCells = table.querySelectorAll('thead th');
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = isVisible ? '' : 'none';
            }

            table.querySelectorAll('tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = isVisible ? '' : 'none';
                }
            });
        });
    });
}

function formatDateForApi(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${month}/${day}/${year}`;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.viewLeave = viewLeave;
window.deleteLeave = deleteLeave;
