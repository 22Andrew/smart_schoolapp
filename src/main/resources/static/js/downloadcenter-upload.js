let records = [];
let filteredRecords = [];
let contentTypes = [];
let classes = [];
let masterSections = [];
let currentPage = 1;
let recordsPerPage = 12;
let editingId = null;
let viewMode = 'card';
const selectedIds = new Set();

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('uploadContentBtn')?.addEventListener('click', openUploadModal);
    document.getElementById('shareSelectedBtn')?.addEventListener('click', openShareModal);
    document.getElementById('selectAllCheckbox')?.addEventListener('change', handleSelectAll);
    document.getElementById('listViewBtn')?.addEventListener('click', () => setViewMode('list'));
    document.getElementById('cardViewBtn')?.addEventListener('click', () => setViewMode('card'));

    document.getElementById('uploadModalCloseBtn')?.addEventListener('click', closeUploadModal);
    document.getElementById('uploadModalOverlay')?.addEventListener('click', closeUploadModal);
    document.getElementById('uploadContentForm')?.addEventListener('submit', handleUploadSubmit);

    document.getElementById('shareModalCloseBtn')?.addEventListener('click', closeShareModal);
    document.getElementById('shareModalOverlay')?.addEventListener('click', closeShareModal);
    document.getElementById('shareContentForm')?.addEventListener('submit', handleShareSubmit);
    document.getElementById('shareSendToType')?.addEventListener('change', toggleShareFields);

    document.querySelectorAll('.upload-tab').forEach(tab => {
        tab.addEventListener('click', () => setUploadTab(tab.dataset.tab));
    });

    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    initFileDropzone();
    Promise.all([loadContentTypes(), loadClasses(), loadSections(), loadRecords()]);
});

async function loadContentTypes() {
    try {
        const response = await fetch('/api/download-center/content-types');
        if (!response.ok) throw new Error('Failed to load content types');
        contentTypes = await response.json();
        populateContentTypeSelects();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

async function loadClasses() {
    try {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        populateClassSelect();
    } catch (error) {
        console.error(error);
    }
}

async function loadSections() {
    try {
        const response = await fetch('/api/sections');
        if (!response.ok) throw new Error('Failed to load sections');
        masterSections = await response.json();
    } catch (error) {
        console.error(error);
    }
}

function populateContentTypeSelects() {
    const uploadSelect = document.getElementById('uploadContentType');
    if (!uploadSelect) return;
    uploadSelect.innerHTML = '<option value="">Select</option>';
    contentTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        uploadSelect.appendChild(option);
    });
}

function populateClassSelect() {
    const classSelect = document.getElementById('shareClassSelect');
    if (!classSelect) return;
    classSelect.innerHTML = '<option value="">Select</option>';
    classes.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.className || item.name;
        option.dataset.sections = JSON.stringify(item.sections || []);
        classSelect.appendChild(option);
    });
    classSelect.addEventListener('change', fillSectionSelect);
}

function fillSectionSelect() {
    const classSelect = document.getElementById('shareClassSelect');
    const sectionSelect = document.getElementById('shareSectionSelect');
    if (!classSelect || !sectionSelect) return;

    const selected = classSelect.options[classSelect.selectedIndex];
    let sections = [];
    if (selected?.dataset.sections) {
        try {
            sections = JSON.parse(selected.dataset.sections);
        } catch (error) {
            sections = [];
        }
    }
    if (!sections.length) {
        sections = masterSections.map(item => item.sectionName || item.name);
    }

    sectionSelect.innerHTML = '<option value="">Select</option>';
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionSelect.appendChild(option);
    });
}

async function loadRecords() {
    try {
        const response = await fetch('/api/download-center/content');
        if (!response.ok) throw new Error('Failed to load content');
        records = await response.json();
        filteredRecords = [...records];
        currentPage = 1;
        renderContent();
        updateSummaryStats();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load content' });
    }
}

function setViewMode(mode) {
    viewMode = mode;
    document.getElementById('listViewBtn')?.classList.toggle('active', mode === 'list');
    document.getElementById('cardViewBtn')?.classList.toggle('active', mode === 'card');
    document.getElementById('contentTableWrap')?.classList.toggle('hidden', mode === 'card');
    document.getElementById('contentCardGrid')?.classList.toggle('active', mode === 'card');
    renderContent();
}

function renderContent() {
    if (viewMode === 'card') {
        renderCards();
    } else {
        renderTable();
    }
    updateSelectionBar();
}

function renderTable() {
    const tbody = document.getElementById('recordTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    tbody.innerHTML = '';

    if (!pageRecords.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;">No content found</td></tr>';
    } else {
        pageRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="content-checkbox" data-id="${record.id}" ${selectedIds.has(record.id) ? 'checked' : ''}></td>
                <td>${escapeHtml(record.title)}</td>
                <td>${escapeHtml(record.contentType)}</td>
                <td>${escapeHtml(record.uploadType === 'YOUTUBE' ? 'YouTube' : 'File')}</td>
                <td>${escapeHtml(record.fileName || record.youtubeUrl || '-')}</td>
                <td>
                    <div class="content-actions">
                        <button type="button" class="btn-content-action" onclick="openContent(${record.id})" title="Open">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </button>
                        <button type="button" class="btn-content-action" onclick="editRecord(${record.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                            </svg>
                        </button>
                        <button type="button" class="btn-content-action" onclick="deleteRecord(${record.id})" title="Delete">
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

    bindCheckboxEvents();
    updatePagination(filteredRecords.length);
}

function renderCards() {
    const grid = document.getElementById('contentCardGrid');
    if (!grid) return;

    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    grid.innerHTML = '';

    if (!pageRecords.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">No content found</div>';
    } else {
        pageRecords.forEach(record => {
            const card = document.createElement('div');
            card.className = 'content-file-card';
            card.innerHTML = `
                <div class="content-file-thumb">${getFileThumbHtml(record)}</div>
                <div class="content-file-body">
                    <div class="content-file-title" onclick="openContent(${record.id})">${escapeHtml(record.title)}</div>
                    <div class="content-file-meta">${escapeHtml(record.uploadedBy || 'Joe Black (9000)')}<br>${escapeHtml(formatDisplayDate(record.createdAt))}</div>
                </div>
                <input type="checkbox" class="content-checkbox card-checkbox" data-id="${record.id}" ${selectedIds.has(record.id) ? 'checked' : ''}>
                <div class="content-file-actions">
                    <button type="button" class="btn-file-action download" onclick="openContent(${record.id})" title="Download">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button type="button" class="btn-file-action delete" onclick="deleteRecord(${record.id})" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                    </button>
                </div>`;
            grid.appendChild(card);
        });
    }

    bindCheckboxEvents();
    updatePagination(filteredRecords.length);
}

function getFileThumbHtml(record) {
    if (record.uploadType === 'YOUTUBE' && record.youtubeUrl) {
        const videoId = extractYoutubeId(record.youtubeUrl);
        if (videoId) {
            return `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="">`;
        }
    }
    if (record.filePath && /\.(png|jpe?g|gif|webp)$/i.test(record.fileName || record.filePath)) {
        return `<img src="${escapeHtml(record.filePath)}" alt="">`;
    }
    if ((record.fileName || '').toLowerCase().endsWith('.pdf')) {
        return '<span class="file-icon-pdf">PDF</span>';
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
}

function extractYoutubeId(url) {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : '';
}

function updateSummaryStats() {
    const totalDocuments = document.getElementById('totalDocuments');
    const totalSize = document.getElementById('totalSize');
    if (!totalDocuments || !totalSize) return;

    totalDocuments.textContent = records.length;
    const bytes = records.reduce((sum, record) => sum + (Number(record.fileSize) || 0), 0);
    totalSize.textContent = formatFileSize(bytes);
}

function formatFileSize(bytes) {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
}

function formatDisplayDate(value) {
    if (!value) return '-';
    const date = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return value;
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    return `${mm}/${dd}/${yyyy} ${hh}:${min}:${sec}`;
}

function bindCheckboxEvents() {
    document.querySelectorAll('.content-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', event => {
            const id = parseInt(event.target.dataset.id, 10);
            if (event.target.checked) {
                selectedIds.add(id);
            } else {
                selectedIds.delete(id);
            }
            updateSelectionBar();
        });
    });
}

function handleSelectAll(event) {
    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    pageRecords.forEach(record => {
        if (event.target.checked) {
            selectedIds.add(record.id);
        } else {
            selectedIds.delete(record.id);
        }
    });
    renderContent();
}

function updateSelectionBar() {
    const bar = document.getElementById('selectionBar');
    const countEl = document.getElementById('selectedCount');
    const shareBtn = document.getElementById('shareSelectedBtn');
    if (!bar || !countEl || !shareBtn) return;

    const count = selectedIds.size;
    countEl.textContent = count;
    bar.classList.toggle('visible', count > 0);
    shareBtn.disabled = count === 0;
}

function openUploadModal() {
    editingId = null;
    document.getElementById('uploadModalTitle').textContent = 'Upload Content';
    document.getElementById('uploadContentForm')?.reset();
    resetFileLabel();
    setUploadTab('file');
    document.getElementById('uploadModal')?.classList.add('active');
}

function editRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    editingId = id;
    document.getElementById('uploadModalTitle').textContent = 'Edit Content';
    document.getElementById('uploadTitle').value = record.title || '';
    document.getElementById('uploadContentType').value = record.contentType || '';
    if (record.uploadType === 'YOUTUBE') {
        setUploadTab('youtube');
        document.getElementById('uploadYoutubeUrl').value = record.youtubeUrl || '';
    } else {
        setUploadTab('file');
        resetFileLabel(record.fileName ? `Current file: ${record.fileName}` : '');
    }
    document.getElementById('uploadModal')?.classList.add('active');
}

function closeUploadModal() {
    document.getElementById('uploadModal')?.classList.remove('active');
}

function setUploadTab(tab) {
    document.querySelectorAll('.upload-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });
    document.getElementById('uploadFilePanel')?.classList.toggle('active', tab === 'file');
    document.getElementById('uploadYoutubePanel')?.classList.toggle('active', tab === 'youtube');
}

function openShareModal() {
    if (!selectedIds.size) return;

    const selectedRecords = records.filter(record => selectedIds.has(record.id));
    const list = document.getElementById('selectedContentList');
    if (list) {
        list.innerHTML = selectedRecords.map(record => `<li>${escapeHtml(record.title)}</li>`).join('');
    }

    document.getElementById('shareContentForm')?.reset();
    document.getElementById('shareDate').value = new Date().toISOString().slice(0, 10);
    toggleShareFields();
    document.getElementById('shareModal')?.classList.add('active');
}

function closeShareModal() {
    document.getElementById('shareModal')?.classList.remove('active');
}

function toggleShareFields() {
    const sendToType = document.getElementById('shareSendToType')?.value || '';
    document.getElementById('shareGroupFields')?.classList.toggle('visible', sendToType === 'Group');
    document.getElementById('shareClassFields')?.classList.toggle('visible', sendToType === 'Class');
    document.getElementById('shareIndividualFields')?.classList.toggle('visible', sendToType === 'Individual');
}

function initFileDropzone() {
    const dropzone = document.getElementById('uploadFileDropzone');
    const fileInput = document.getElementById('uploadFile');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => updateFileLabel(fileInput.files[0]?.name || ''));

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
            updateFileLabel(fileInput.files[0].name);
        }
    });
}

function updateFileLabel(name) {
    const label = document.getElementById('uploadFileName');
    if (label) label.textContent = name || '';
}

function resetFileLabel(text) {
    const fileInput = document.getElementById('uploadFile');
    if (fileInput) fileInput.value = '';
    updateFileLabel(text || '');
}

async function handleUploadSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('uploadTitle').value.trim();
    const contentType = document.getElementById('uploadContentType').value;
    const activeTab = document.querySelector('.upload-tab.active')?.dataset.tab || 'file';

    if (!title || !contentType) {
        Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Title and Content Type are required.' });
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('contentType', contentType);

    if (activeTab === 'youtube') {
        const youtubeUrl = document.getElementById('uploadYoutubeUrl').value.trim();
        if (!youtubeUrl) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'YouTube URL is required.' });
            return;
        }
        formData.append('uploadType', 'YOUTUBE');
        formData.append('youtubeUrl', youtubeUrl);
    } else {
        const file = document.getElementById('uploadFile')?.files?.[0];
        if (!file && !editingId) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please select a file to upload.' });
            return;
        }
        formData.append('uploadType', 'FILE');
        if (file) formData.append('file', file);
    }

    const url = editingId ? `/api/download-center/content/${editingId}` : '/api/download-center/content';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, body: formData });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1800, showConfirmButton: false });
        closeUploadModal();
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save content' });
    }
}

async function handleShareSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('shareTitle').value.trim();
    const shareDate = document.getElementById('shareDate').value;
    const validUntil = document.getElementById('shareValidUntil').value;
    const description = document.getElementById('shareDescription').value.trim();
    const sendToType = document.getElementById('shareSendToType').value;

    if (!title || !shareDate || !validUntil || !sendToType) {
        Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Please fill all required share fields.' });
        return;
    }

    const roles = Array.from(document.querySelectorAll('.share-role:checked')).map(input => input.value);
    if (!roles.length) {
        Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Select at least one role.' });
        return;
    }

    let sendToDetails = '';
    if (sendToType === 'Class') {
        const classSelect = document.getElementById('shareClassSelect');
        const sectionSelect = document.getElementById('shareSectionSelect');
        const className = classSelect?.options[classSelect.selectedIndex]?.textContent || '';
        const sectionName = sectionSelect?.value || '';
        if (!className || className === 'Select') {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Select class and section.' });
            return;
        }
        sendToDetails = sectionName ? `${className} - ${sectionName}` : className;
    } else if (sendToType === 'Individual') {
        sendToDetails = document.getElementById('shareIndividualDetails').value.trim();
        if (!sendToDetails) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Enter individual recipient details.' });
            return;
        }
    } else if (sendToType === 'Group') {
        sendToDetails = document.getElementById('shareGroupDetails').value.trim();
    }

    const payload = {
        title,
        shareDate,
        validUntil,
        description,
        sendToType,
        sendToDetails,
        recipientRoles: roles.join(', '),
        contentIds: Array.from(selectedIds)
    };

    try {
        const response = await fetch('/api/download-center/content/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Shared', text: result.message, timer: 1800, showConfirmButton: false });
        selectedIds.clear();
        document.getElementById('selectAllCheckbox').checked = false;
        closeShareModal();
        renderContent();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to share content' });
    }
}

function openContent(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;
    if (record.uploadType === 'YOUTUBE' && record.youtubeUrl) {
        window.open(record.youtubeUrl, '_blank');
        return;
    }
    if (record.filePath) {
        window.open(record.filePath, '_blank');
    }
}

async function deleteRecord(id) {
    const confirmed = await Swal.fire({
        title: 'Delete content?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch(`/api/download-center/content/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        selectedIds.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1800, showConfirmButton: false });
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

function handleSearch(event) {
    const term = (event?.target?.value ?? document.getElementById('searchInput')?.value ?? '').toLowerCase();
    filteredRecords = records.filter(record =>
        (record.title && record.title.toLowerCase().includes(term)) ||
        (record.contentType && record.contentType.toLowerCase().includes(term)) ||
        (record.fileName && record.fileName.toLowerCase().includes(term)) ||
        (record.youtubeUrl && record.youtubeUrl.toLowerCase().includes(term)) ||
        (record.uploadedBy && record.uploadedBy.toLowerCase().includes(term))
    );
    currentPage = 1;
    renderContent();
}

function handleEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderContent();
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
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderContent(); } };
    paginationDiv.appendChild(prevBtn);

    const maxPages = Math.min(totalPages, 4);
    for (let i = 1; i <= maxPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => { currentPage = i; renderContent(); };
        paginationDiv.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages || totalRecords === 0;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderContent(); } };
    paginationDiv.appendChild(nextBtn);
}

function exportRows() {
    return filteredRecords.map(record => ({
        Title: record.title || '',
        'Content Type': record.contentType || '',
        Type: record.uploadType === 'YOUTUBE' ? 'YouTube' : 'File',
        Source: record.fileName || record.youtubeUrl || '',
        'Uploaded At': record.createdAt || ''
    }));
}

function handleCopy() {
    const headers = ['Title', 'Content Type', 'Type', 'Source', 'Uploaded At'];
    const rows = exportRows().map(row => Object.values(row).join('\t'));
    navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n')).then(() => {
        Swal.fire({ icon: 'success', title: 'Copied!', timer: 1500, showConfirmButton: false });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Content');
    XLSX.writeFile(wb, 'download-center-content.xlsx');
}

function handleCSVExport() {
    const headers = Object.keys(exportRows()[0] || { Title: '', 'Content Type': '', Type: '', Source: '', 'Uploaded At': '' });
    const csvData = [headers, ...exportRows().map(row => headers.map(key => row[key]))];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'download-center-content.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [['Title', 'Content Type', 'Type', 'Source']];
    const body = exportRows().map(row => [row.Title, row['Content Type'], row.Type, row.Source]);
    doc.autoTable({ head: headers, body, styles: { fontSize: 8 }, headStyles: { fillColor: [112, 94, 200] } });
    doc.save('download-center-content.pdf');
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
window.openContent = openContent;
