let records = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('viewModalCloseBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('viewModalOverlay')?.addEventListener('click', closeViewModal);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);
    loadRecords();
});

async function loadRecords() {
    try {
        const response = await fetch('/api/download-center/share-logs');
        if (!response.ok) throw new Error('Failed to load share list');
        records = await response.json();
        filteredRecords = [...records];
        currentPage = 1;
        renderTable();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load share list' });
    }
}

function renderTable() {
    const tbody = document.getElementById('recordTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    tbody.innerHTML = '';

    if (!pageRecords.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">No shared content found</td></tr>';
    } else {
        pageRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.title)}</td>
                <td>${escapeHtml(record.sendToType || '-')}</td>
                <td>${escapeHtml(formatDisplayDateOnly(record.shareDate))}</td>
                <td>${escapeHtml(formatDisplayDateOnly(record.validUntil))}</td>
                <td>${escapeHtml(record.sharedBy || 'Joe Black (9000)')}</td>
                <td>${escapeHtml(record.description || 'No Description')}</td>
                <td>
                    <div class="content-actions">
                        <button type="button" class="btn-content-action view" onclick="viewRecord(${record.id})" title="View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
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

function formatSendTo(record) {
    const details = record.sendToDetails ? ` (${record.sendToDetails})` : '';
    return `${record.sendToType || ''}${details}`.trim();
}

function viewRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    document.getElementById('viewTitle').textContent = record.title || '-';
    document.getElementById('viewShareDate').textContent = record.shareDate || '-';
    document.getElementById('viewValidUntil').textContent = record.validUntil || '-';
    document.getElementById('viewSendTo').textContent = formatSendTo(record) || '-';
    document.getElementById('viewRoles').textContent = record.recipientRoles || '-';
    document.getElementById('viewDescription').textContent = record.description || '-';
    document.getElementById('viewContentTitles').textContent = record.contentTitles || '-';
    document.getElementById('viewCreatedAt').textContent = record.createdAt || '-';
    document.getElementById('viewModal')?.classList.add('active');
}

function closeViewModal() {
    document.getElementById('viewModal')?.classList.remove('active');
}

async function deleteRecord(id) {
    const confirmed = await Swal.fire({
        title: 'Delete share record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch(`/api/download-center/share-logs/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1800, showConfirmButton: false });
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

function handleSearch(event) {
    const term = event.target.value.toLowerCase();
    filteredRecords = records.filter(record =>
        (record.title && record.title.toLowerCase().includes(term)) ||
        (record.contentTitles && record.contentTitles.toLowerCase().includes(term)) ||
        (record.sendToType && record.sendToType.toLowerCase().includes(term)) ||
        (record.sendToDetails && record.sendToDetails.toLowerCase().includes(term)) ||
        (record.recipientRoles && record.recipientRoles.toLowerCase().includes(term))
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
        'Send To': record.sendToType || '',
        'Share Date': formatDisplayDateOnly(record.shareDate),
        'Valid Upto': formatDisplayDateOnly(record.validUntil),
        'Shared By': record.sharedBy || 'Joe Black (9000)',
        Description: record.description || 'No Description'
    }));
}

function handleCopy() {
    const headers = ['Title', 'Send To', 'Share Date', 'Valid Upto', 'Shared By', 'Description'];
    const rows = exportRows().map(row => Object.values(row).join('\t'));
    navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n')).then(() => {
        Swal.fire({ icon: 'success', title: 'Copied!', timer: 1500, showConfirmButton: false });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Content Share List');
    XLSX.writeFile(wb, 'content-share-list.xlsx');
}

function handleCSVExport() {
    const headers = ['Title', 'Send To', 'Share Date', 'Valid Upto', 'Shared By', 'Description'];
    const csvData = [headers, ...exportRows().map(row => [row.Title, row['Send To'], row['Share Date'], row['Valid Upto'], row['Shared By'], row.Description])];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-share-list.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [['Title', 'Send To', 'Share Date', 'Valid Upto', 'Shared By', 'Description']];
    const body = exportRows().map(row => [row.Title, row['Send To'], row['Share Date'], row['Valid Upto'], row['Shared By'], row.Description]);
    doc.autoTable({ head: headers, body, styles: { fontSize: 8 }, headStyles: { fillColor: [112, 94, 200] } });
    doc.save('content-share-list.pdf');
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

function formatDisplayDateOnly(value) {
    if (!value) return '-';
    const parts = String(value).split('-');
    if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return value;
}

window.viewRecord = viewRecord;
window.deleteRecord = deleteRecord;
