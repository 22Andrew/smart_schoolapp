let records = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('addTemplateBtn')?.addEventListener('click', openAddModal);
    document.getElementById('smsTemplateModalCloseBtn')?.addEventListener('click', closeModal);
    document.getElementById('smsTemplateModalOverlay')?.addEventListener('click', closeModal);
    document.getElementById('smsTemplateForm')?.addEventListener('submit', handleSubmit);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);
    loadRecords();
});

async function loadRecords() {
    try {
        const response = await fetch('/api/communicate/sms-templates');
        if (!response.ok) throw new Error('Failed to load SMS templates');
        records = await response.json();
        filteredRecords = [...records];
        currentPage = 1;
        renderTable();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load templates' });
    }
}

function renderTable() {
    const tbody = document.getElementById('recordTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    tbody.innerHTML = '';

    if (!pageRecords.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:40px;">No templates found</td></tr>';
    } else {
        pageRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.title)}</td>
                <td class="template-message">${escapeHtml(truncate(record.templateBody, 180))}</td>
                <td>
                    <div class="email-template-actions">
                        <button type="button" class="btn-template-action" onclick="editRecord(${record.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                            </svg>
                        </button>
                        <button type="button" class="btn-template-action" onclick="deleteRecord(${record.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </td>`;
            tbody.appendChild(row);
        });
    }
    updatePagination(filteredRecords.length);
}

function openAddModal() {
    editingId = null;
    document.getElementById('smsTemplateModalTitle').textContent = 'Add SMS Template';
    document.getElementById('smsTemplateForm')?.reset();
    document.getElementById('smsTemplateModal')?.classList.add('active');
}

function editRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    editingId = id;
    document.getElementById('smsTemplateModalTitle').textContent = 'Edit SMS Template';
    document.getElementById('templateTitle').value = record.title || '';
    document.getElementById('templateBody').value = record.templateBody || '';
    document.getElementById('smsTemplateModal')?.classList.add('active');
}

function closeModal() {
    document.getElementById('smsTemplateModal')?.classList.remove('active');
}

async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
        title: document.getElementById('templateTitle').value.trim(),
        templateBody: document.getElementById('templateBody').value.trim()
    };

    if (!payload.title || !payload.templateBody) {
        Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Title and Message are required.' });
        return;
    }

    const url = editingId
        ? `/api/communicate/sms-templates/${editingId}`
        : '/api/communicate/sms-templates';
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
        closeModal();
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save template' });
    }
}

async function deleteRecord(id) {
    const confirmed = await Swal.fire({
        title: 'Delete template?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch(`/api/communicate/sms-templates/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1800, showConfirmButton: false });
        if (editingId === id) closeModal();
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

function handleSearch(event) {
    const term = event.target.value.toLowerCase();
    filteredRecords = records.filter(record =>
        (record.title && record.title.toLowerCase().includes(term)) ||
        (record.templateBody && record.templateBody.toLowerCase().includes(term))
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
        Title: record.title || '',
        Message: record.templateBody || ''
    }));
}

function handleCopy() {
    const headers = ['Title', 'Message'];
    const rows = exportRows().map(row => [row.Title, row.Message].join('\t'));
    navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n')).then(() => {
        Swal.fire({ icon: 'success', title: 'Copied!', timer: 1500, showConfirmButton: false });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SMS Templates');
    XLSX.writeFile(wb, 'sms-templates.xlsx');
}

function handleCSVExport() {
    const headers = ['Title', 'Message'];
    const csvData = [headers, ...exportRows().map(row => [row.Title, row.Message])];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sms-templates.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [['Title', 'Message']];
    const body = exportRows().map(row => [row.Title, row.Message]);
    doc.autoTable({ head: headers, body, styles: { fontSize: 8 }, headStyles: { fillColor: [112, 94, 200] } });
    doc.save('sms-templates.pdf');
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

function truncate(text, max) {
    if (!text) return '';
    return text.length <= max ? text : `${text.slice(0, max)}...`;
}

window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
