let roleRecords = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let editingId = null;
let sortKey = null;
let sortDir = 'asc';

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadRoles();
});

function setupEventListeners() {
    document.getElementById('roleForm')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);

    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    document.querySelectorAll('#roleTable thead th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            document.querySelectorAll('#roleTable thead th.sortable').forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            applyFilters();
        });
    });

    setupColumnVisibility();
}

async function loadRoles() {
    try {
        const response = await fetch('/api/roles');
        if (!response.ok) throw new Error('Failed to fetch roles');

        roleRecords = await response.json();
        applyFilters();
    } catch (error) {
        console.error('Error loading roles:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load roles',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function applyFilters() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    filteredRecords = roleRecords.filter(record =>
        (record.name && record.name.toLowerCase().includes(searchTerm)) ||
        (record.roleType && record.roleType.toLowerCase().includes(searchTerm))
    );

    if (sortKey) {
        filteredRecords.sort((a, b) => {
            const left = String(a[sortKey] || '').toLowerCase();
            const right = String(b[sortKey] || '').toLowerCase();
            if (left < right) return sortDir === 'asc' ? -1 : 1;
            if (left > right) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    currentPage = 1;
    renderTable();
}

function renderTable(records = filteredRecords) {
    const tbody = document.getElementById('roleTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (paginatedRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 40px;">No roles found</td>
            </tr>
        `;
    } else {
        paginatedRecords.forEach(record => {
            const row = document.createElement('tr');
            const actions = record.superAdmin ? '' : `
                <div class="action-buttons">
                    <button type="button" class="btn-action" onclick="assignPermission(${record.id})" title="Assign Permission">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                    </button>
                    <button type="button" class="btn-action" onclick="editRole(${record.id})" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        </svg>
                    </button>
                </div>
            `;
            row.innerHTML = `
                <td>${escapeHtml(record.name)}</td>
                <td>${escapeHtml(record.roleType)}</td>
                <td>${actions}</td>
            `;
            tbody.appendChild(row);
        });
    }

    applyColumnVisibility();
    updatePaginationInfo(records.length);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('roleName').value.trim();
    if (!name) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Name is required',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    const payload = { name };
    const url = editingId ? `/api/roles/${editingId}` : '/api/roles';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
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
            resetForm();
            loadRoles();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save role',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function editRole(id) {
    const record = roleRecords.find(item => item.id === id);
    if (!record || record.superAdmin) return;

    editingId = id;
    document.getElementById('roleId').value = id;
    document.getElementById('roleName').value = record.name;
    document.getElementById('roleName').focus();
}

function assignPermission(id) {
    const record = roleRecords.find(item => item.id === id);
    if (!record) return;
    Swal.fire({
        icon: 'info',
        title: record.name,
        text: 'Assign module permissions for this role from here.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#8b5cf6'
    });
}

function resetForm() {
    editingId = null;
    document.getElementById('roleForm')?.reset();
    document.getElementById('roleId').value = '';
}

function handleSearch() {
    applyFilters();
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

function exportRows() {
    return filteredRecords.map(record => ({
        Role: record.name,
        Type: record.roleType
    }));
}

function handleCopy() {
    const tableData = exportRows().map(row => `${row.Role}\t${row.Type}`).join('\n');
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
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roles');
    XLSX.writeFile(wb, 'Roles.xlsx');
}

function handleCSVExport() {
    const csvData = [['Role', 'Type'], ...exportRows().map(row => [row.Role, row.Type])];
    const csvContent = csvData.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Roles.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableData = exportRows().map(row => [row.Role, row.Type]);

    doc.autoTable({
        head: [['Role', 'Type']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save('Roles.pdf');
}

function handlePrint() {
    window.print();
}

function setupColumnVisibility() {
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');

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

    document.querySelectorAll('.column-toggle').forEach(toggle => {
        toggle.addEventListener('change', applyColumnVisibility);
    });
}

function applyColumnVisibility() {
    const table = document.getElementById('roleTable');
    if (!table) return;

    document.querySelectorAll('.column-toggle').forEach(toggle => {
        const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
        const isVisible = toggle.checked;
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
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.editRole = editRole;
window.assignPermission = assignPermission;
