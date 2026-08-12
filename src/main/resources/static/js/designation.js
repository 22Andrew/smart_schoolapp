let designationRecords = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadDesignations();
});

function setupEventListeners() {
    document.getElementById('designationForm')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);

    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    setupColumnVisibility();
}

async function loadDesignations() {
    try {
        const response = await fetch('/api/designations');
        if (!response.ok) throw new Error('Failed to fetch designations');

        designationRecords = await response.json();
        filteredRecords = [...designationRecords];
        currentPage = 1;
        renderTable();
    } catch (error) {
        console.error('Error loading Designations:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load designations',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTable(records = filteredRecords) {
    const tbody = document.getElementById('designationTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (paginatedRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align: center; padding: 40px;">No Designations found</td>
            </tr>
        `;
    } else {
        paginatedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.name)}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn-action" onclick="editDesignation(${record.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            </svg>
                        </button>
                        <button type="button" class="btn-action" onclick="deleteDesignation(${record.id})" title="Delete">
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

async function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('designationName').value.trim();
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
    const url = editingId ? `/api/designations/${editingId}` : '/api/designations';
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
            loadDesignations();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save Designation',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function editDesignation(id) {
    const record = designationRecords.find(item => item.id === id);
    if (!record) return;

    editingId = id;
    document.getElementById('designationId').value = id;
    document.getElementById('designationName').value = record.name;
    document.querySelector('.add-designation-panel .panel-title').textContent = 'Edit Designation';
    document.getElementById('designationName').focus();
}

async function deleteDesignation(id) {
    const result = await Swal.fire({
        title: 'Delete Designation?',
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
        const response = await fetch(`/api/designations/${id}`, { method: 'DELETE' });
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
            if (editingId === id) resetForm();
            loadDesignations();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete Designation',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function resetForm() {
    editingId = null;
    document.getElementById('designationForm')?.reset();
    document.getElementById('designationId').value = '';
    document.querySelector('.add-designation-panel .panel-title').textContent = 'Add Designation';
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filteredRecords = designationRecords.filter(record =>
        record.name && record.name.toLowerCase().includes(searchTerm)
    );
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
    const tableData = filteredRecords.map(record => record.name).join('\n');
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
    const data = filteredRecords.map(record => ({ Designation: record.name }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Designations');
    XLSX.writeFile(wb, 'Designations.xlsx');
}

function handleCSVExport() {
    const csvData = [['Designation'], ...filteredRecords.map(record => [record.name])];
    const csvContent = csvData.map(row => `"${String(row[0]).replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Designations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableData = filteredRecords.map(record => [record.name]);

    doc.autoTable({
        head: [['Designation']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save('Designations.pdf');
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
            const table = document.getElementById('designationTable');
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

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.editDesignation = editDesignation;
window.deleteDesignation = deleteDesignation;
