let records = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let editingId = null;
let templateEditor = null;
let editorInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('addTemplateBtn')?.addEventListener('click', openAddModal);
    document.getElementById('emailTemplateModalCloseBtn')?.addEventListener('click', closeModal);
    document.getElementById('emailTemplateModalOverlay')?.addEventListener('click', closeModal);
    document.getElementById('emailTemplateForm')?.addEventListener('submit', handleSubmit);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    initAttachmentDropzone();
    loadRecords();
});

async function loadRecords() {
    try {
        const response = await fetch('/api/communicate/email-templates');
        if (!response.ok) throw new Error('Failed to load email templates');
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
                <td class="template-message">${escapeHtml(stripHtml(truncate(record.templateBody, 180)))}</td>
                <td>
                    <div class="email-template-actions">
                        <button type="button" class="btn-template-action" onclick="downloadTemplate(${record.id})" title="Download">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
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
    document.getElementById('emailTemplateModalTitle').textContent = 'Add Email Template';
    document.getElementById('emailTemplateForm')?.reset();
    resetAttachmentLabel();
    openModal();
    setEditorContent('');
}

function editRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    editingId = id;
    document.getElementById('emailTemplateModalTitle').textContent = 'Edit Email Template';
    document.getElementById('templateTitle').value = record.title || '';
    resetAttachmentLabel(record.attachmentPath ? 'Current attachment saved' : '');
    openModal();
    setEditorContent(record.templateBody || '');
}

function openModal() {
    document.getElementById('emailTemplateModal')?.classList.add('active');
    initCKEditor();
}

function closeModal() {
    document.getElementById('emailTemplateModal')?.classList.remove('active');
}

function initCKEditor() {
    if (editorInitialized || typeof CKEDITOR === 'undefined') return;
    const textarea = document.getElementById('templateBody');
    if (!textarea) return;

    CKEDITOR.replace('templateBody', {
        height: 280,
        removePlugins: 'elementspath',
        resize_enabled: false
    });
    templateEditor = CKEDITOR.instances.templateBody;
    editorInitialized = true;
}

function setEditorContent(content) {
    if (templateEditor) {
        templateEditor.setData(content || '');
    } else {
        const textarea = document.getElementById('templateBody');
        if (textarea) textarea.value = content || '';
    }
}

function getEditorContent() {
    if (templateEditor) {
        return templateEditor.getData().trim();
    }
    return document.getElementById('templateBody')?.value.trim() || '';
}

function initAttachmentDropzone() {
    const dropzone = document.getElementById('templateAttachmentDropzone');
    const fileInput = document.getElementById('templateAttachment');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => updateAttachmentLabel(fileInput.files[0]?.name || ''));

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, event => {
            event.preventDefault();
            dropzone.classList.add('dragover');
        });
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, event => {
            event.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });
    dropzone.addEventListener('drop', event => {
        if (event.dataTransfer?.files?.length) {
            fileInput.files = event.dataTransfer.files;
            updateAttachmentLabel(fileInput.files[0].name);
        }
    });
}

function updateAttachmentLabel(name) {
    const label = document.getElementById('templateAttachmentName');
    if (label) label.textContent = name || '';
}

function resetAttachmentLabel(text) {
    const fileInput = document.getElementById('templateAttachment');
    if (fileInput) fileInput.value = '';
    updateAttachmentLabel(text || '');
}

async function handleSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('templateTitle').value.trim();
    const templateBody = getEditorContent();
    if (!title || !templateBody) {
        Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Title and Message are required.' });
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('templateBody', templateBody);

    const attachment = document.getElementById('templateAttachment')?.files?.[0];
    if (attachment) {
        formData.append('attachment', attachment);
    }

    const url = editingId
        ? `/api/communicate/email-templates/${editingId}`
        : '/api/communicate/email-templates';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, body: formData });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1800, showConfirmButton: false });
        closeModal();
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save template' });
    }
}

function downloadTemplate(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    if (record.attachmentPath) {
        window.open(record.attachmentPath, '_blank');
        return;
    }

    const blob = new Blob([record.templateBody || ''], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (record.title || 'email-template').replace(/\s+/g, '-') + '.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        const response = await fetch(`/api/communicate/email-templates/${id}`, { method: 'DELETE' });
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
        (record.templateBody && stripHtml(record.templateBody).toLowerCase().includes(term))
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
        Message: stripHtml(record.templateBody || '')
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
    XLSX.utils.book_append_sheet(wb, ws, 'Email Templates');
    XLSX.writeFile(wb, 'email-templates.xlsx');
}

function handleCSVExport() {
    const headers = ['Title', 'Message'];
    const csvData = [headers, ...exportRows().map(row => [row.Title, row.Message])];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'email-templates.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [['Title', 'Message']];
    const body = exportRows().map(row => [row.Title, row.Message]);
    doc.autoTable({ head: headers, body, styles: { fontSize: 8 }, headStyles: { fillColor: [112, 94, 200] } });
    doc.save('email-templates.pdf');
}

function handlePrint() {
    window.print();
}

function stripHtml(value) {
    if (!value) return '';
    const div = document.createElement('div');
    div.innerHTML = value;
    return div.textContent || div.innerText || '';
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
window.downloadTemplate = downloadTemplate;
