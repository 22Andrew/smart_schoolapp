let records = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;

const CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('deleteAllLogsBtn')?.addEventListener('click', deleteAllRecords);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    document.addEventListener('click', function(event) {
        const menuBtn = event.target.closest('.btn-action-menu');
        if (menuBtn) {
            event.stopPropagation();
            const menu = menuBtn.closest('.action-menu');
            document.querySelectorAll('.action-menu.open').forEach(item => {
                if (item !== menu) item.classList.remove('open');
            });
            menu?.classList.toggle('open');
            return;
        }

        const deleteBtn = event.target.closest('.btn-delete-log-item');
        if (deleteBtn) {
            event.stopPropagation();
            deleteRecord(parseInt(deleteBtn.dataset.id, 10));
            return;
        }

        document.querySelectorAll('.action-menu.open').forEach(item => item.classList.remove('open'));
    });

    loadRecords();
});

async function loadRecords() {
    try {
        const response = await fetch('/api/communicate/messages');
        if (!response.ok) throw new Error('Failed to load message logs');
        records = await response.json();
        filteredRecords = [...records];
        currentPage = 1;
        renderTable();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load logs' });
    }
}

function renderTable() {
    const tbody = document.getElementById('recordTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    tbody.innerHTML = '';

    if (!pageRecords.length) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;">No logs found</td></tr>';
    } else {
        pageRecords.forEach(record => {
            const row = document.createElement('tr');
            const messageType = String(record.messageType || '').toUpperCase();
            const recipientType = String(record.recipientType || '');
            const displayDate = formatDisplayDate(record.sentAt || record.createdAt);

            row.innerHTML = `
                <td>${escapeHtml(record.title)}</td>
                <td class="log-description">${escapeHtml(truncate(record.message, 120))}</td>
                <td>${escapeHtml(displayDate)}</td>
                <td>${escapeHtml(formatDisplayDate(record.scheduledAt))}</td>
                <td class="col-check">${messageType === 'EMAIL' ? `<span class="log-check">${CHECK_ICON}</span>` : ''}</td>
                <td class="col-check">${messageType === 'SMS' ? `<span class="log-check">${CHECK_ICON}</span>` : ''}</td>
                <td class="col-check">${recipientType === 'Group' ? `<span class="log-check">${CHECK_ICON}</span>` : ''}</td>
                <td class="col-check">${recipientType === 'Individual' ? `<span class="log-check">${CHECK_ICON}</span>` : ''}</td>
                <td class="col-check">${recipientType === 'Class' ? `<span class="log-check">${CHECK_ICON}</span>` : ''}</td>
                <td>
                    <div class="action-menu">
                        <button type="button" class="btn-action-menu" title="Actions" aria-label="Actions">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <div class="action-dropdown">
                            <button type="button" class="btn-delete-log-item" data-id="${record.id}">Delete</button>
                        </div>
                    </div>
                </td>`;
            tbody.appendChild(row);
        });
    }
    updatePagination(filteredRecords.length);
}

async function deleteRecord(id) {
    const confirmed = await Swal.fire({
        title: 'Delete log?',
        text: 'This message log will be permanently removed.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch(`/api/communicate/messages/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1800, showConfirmButton: false });
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

async function deleteAllRecords() {
    const confirmed = await Swal.fire({
        title: 'Delete all logs?',
        text: 'All email and SMS logs will be permanently removed.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete All',
        confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch('/api/communicate/messages', { method: 'DELETE' });
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
        (record.message && record.message.toLowerCase().includes(term)) ||
        (record.recipientType && record.recipientType.toLowerCase().includes(term)) ||
        (record.recipientDetails && record.recipientDetails.toLowerCase().includes(term))
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

    const maxButtons = Math.min(totalPages, 5);
    for (let i = 1; i <= maxButtons; i++) {
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
        Description: record.message || '',
        Date: formatDisplayDate(record.sentAt || record.createdAt),
        'Schedule Date': formatDisplayDate(record.scheduledAt),
        Email: String(record.messageType || '').toUpperCase() === 'EMAIL' ? 'Yes' : '',
        SMS: String(record.messageType || '').toUpperCase() === 'SMS' ? 'Yes' : '',
        Group: record.recipientType === 'Group' ? 'Yes' : '',
        Individual: record.recipientType === 'Individual' ? 'Yes' : '',
        Class: record.recipientType === 'Class' ? 'Yes' : ''
    }));
}

function handleCopy() {
    const headers = ['Title', 'Description', 'Date', 'Schedule Date', 'Email', 'SMS', 'Group', 'Individual', 'Class'];
    const rows = exportRows().map(row => headers.map(key => row[key]).join('\t'));
    const text = [headers.join('\t'), ...rows].join('\n');

    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({ icon: 'success', title: 'Copied!', text: 'Table data copied to clipboard', timer: 1500, showConfirmButton: false });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Email SMS Log');
    XLSX.writeFile(wb, 'email-sms-log.xlsx');
}

function handleCSVExport() {
    const headers = ['Title', 'Description', 'Date', 'Schedule Date', 'Email', 'SMS', 'Group', 'Individual', 'Class'];
    const csvData = [headers, ...exportRows().map(row => headers.map(key => row[key]))];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'email-sms-log.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    const headers = [['Title', 'Description', 'Date', 'Schedule Date', 'Email', 'SMS', 'Group', 'Individual', 'Class']];
    const body = exportRows().map(row => [
        row.Title, row.Description, row.Date, row['Schedule Date'],
        row.Email, row.SMS, row.Group, row.Individual, row.Class
    ]);

    doc.autoTable({ head: headers, body, styles: { fontSize: 8 }, headStyles: { fillColor: [112, 94, 200] } });
    doc.save('email-sms-log.pdf');
}

function handlePrint() {
    window.print();
}

function formatDisplayDate(value) {
    if (!value) return '';
    const parsed = parseBackendDate(value);
    if (!parsed) return value;

    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const year = parsed.getFullYear();
    let hours = parsed.getHours();
    const minutes = String(parsed.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    return `${month}/${day}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

function parseBackendDate(value) {
    if (!value) return null;
    const normalized = String(value).trim();
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) {
        const fallback = new Date(normalized);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
    }

    return new Date(
        parseInt(match[1], 10),
        parseInt(match[2], 10) - 1,
        parseInt(match[3], 10),
        parseInt(match[4] || '0', 10),
        parseInt(match[5] || '0', 10),
        parseInt(match[6] || '0', 10)
    );
}

function truncate(text, maxLength) {
    if (!text) return '';
    return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.deleteRecord = deleteRecord;
