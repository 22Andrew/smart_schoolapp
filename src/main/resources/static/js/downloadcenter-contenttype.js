let records = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('contentTypeForm')?.addEventListener('submit', handleSubmit);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);
    loadRecords();
});

async function loadRecords() {
    try {
        const response = await fetch('/api/download-center/content-types');
        if (!response.ok) throw new Error('Failed to load content types');
        records = await response.json();
        filteredRecords = [...records];
        currentPage = 1;
        renderTable();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load content types' });
    }
}

function renderTable() {
    const tbody = document.getElementById('recordTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    tbody.innerHTML = '';

    if (!pageRecords.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:40px;">No content types found</td></tr>';
    } else {
        pageRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.name)}</td>
                <td class="template-message">${escapeHtml(record.description || 'No Description')}</td>
                <td>
                    <div class="content-actions">
                        <button type="button" class="btn-content-action" onclick="editRecord(${record.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                            </svg>
                        </button>
                        <button type="button" class="btn-content-action delete" onclick="deleteRecord(${record.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            </svg>
                        </button>
                    </div>
                </td>`;
            tbody.appendChild(row);
        });
    }
    updatePagination(filteredRecords.length);
}

function resetForm() {
    editingId = null;
    document.getElementById('formTitle').textContent = 'Add Content Type';
    document.getElementById('contentTypeForm')?.reset();
}

function editRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    editingId = id;
    document.getElementById('formTitle').textContent = 'Edit Content Type';
    document.getElementById('typeName').value = record.name || '';
    document.getElementById('typeDescription').value = record.description || '';
    document.getElementById('typeName')?.focus();
}

async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById('typeName').value.trim(),
        description: document.getElementById('typeDescription').value.trim()
    };

    if (!payload.name) {
        Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Name is required.' });
        return;
    }

    const url = editingId
        ? `/api/download-center/content-types/${editingId}`
        : '/api/download-center/content-types';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1800, showConfirmButton: false });
        resetForm();
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save content type' });
    }
}

async function deleteRecord(id) {
    const confirmed = await Swal.fire({
        title: 'Delete content type?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch(`/api/download-center/content-types/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1800, showConfirmButton: false });
        if (editingId === id) resetForm();
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

function handleSearch(event) {
    const term = event.target.value.toLowerCase();
    filteredRecords = records.filter(record =>
        (record.name && record.name.toLowerCase().includes(term)) ||
        (record.description && record.description.toLowerCase().includes(term))
    );
    currentPage = 1;
    renderTable();
}

function handleEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderTable();
}

function updatePagination(totalRecords) {
    document.getElementById('showingStart').textContent = totalRecords ? (currentPage - 1) * recordsPerPage + 1 : 0;
    document.getElementById('showingEnd').textContent = Math.min(currentPage * recordsPerPage, totalRecords);
    document.getElementById('totalEntries').textContent = totalRecords;

    const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;
    paginationDiv.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
    paginationDiv.appendChild(prevBtn);

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => { currentPage = i; renderTable(); };
        paginationDiv.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages || totalRecords === 0;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderTable(); } };
    paginationDiv.appendChild(nextBtn);
}

function exportRows() {
    return filteredRecords.map(record => ({
        Name: record.name || '',
        Description: record.description || 'No Description'
    }));
}

function handleCopy() {
    const headers = ['Name', 'Description'];
    const rows = exportRows().map(row => Object.values(row).join('\t'));
    navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n')).then(() => {
        Swal.fire({ icon: 'success', title: 'Copied!', timer: 1500, showConfirmButton: false });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Content Types');
    XLSX.writeFile(wb, 'content-types.xlsx');
}

function handleCSVExport() {
    const headers = ['Name', 'Description'];
    const csvData = [headers, ...exportRows().map(row => [row.Name, row.Description])];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-types.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [['Name', 'Description']];
    const body = exportRows().map(row => [row.Name, row.Description]);
    doc.autoTable({ head: headers, body, styles: { fontSize: 8 }, headStyles: { fillColor: [112, 94, 200] } });
    doc.save('content-types.pdf');
}

function handlePrint() {
    window.print();
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
