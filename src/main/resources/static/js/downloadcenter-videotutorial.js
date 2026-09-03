let records = [];
let filteredRecords = [];
let classes = [];
let masterSections = [];
let currentPage = 1;
let recordsPerPage = 50;
let editingId = null;
let viewingId = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('filterClassSelect')?.addEventListener('change', handleFilter);
    document.getElementById('filterSectionSelect')?.addEventListener('change', handleFilter);
    document.getElementById('addTutorialBtn')?.addEventListener('click', openAddModal);
    document.getElementById('tutorialModalCloseBtn')?.addEventListener('click', closeModal);
    document.getElementById('tutorialModalOverlay')?.addEventListener('click', closeModal);
    document.getElementById('viewModalCloseBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('viewModalOverlay')?.addEventListener('click', closeViewModal);
    document.getElementById('openVideoBtn')?.addEventListener('click', openViewedVideo);
    document.getElementById('editVideoBtn')?.addEventListener('click', editViewedVideo);
    document.getElementById('deleteVideoBtn')?.addEventListener('click', deleteViewedVideo);
    document.getElementById('tutorialForm')?.addEventListener('submit', handleSubmit);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    Promise.all([loadClasses(), loadSections(), loadRecords()]);
});

async function loadClasses() {
    try {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        populateClassSelects();
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

function populateClassSelects() {
    ['filterClassSelect', 'tutorialClassSelect'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '<option value="">Select</option>';
        classes.forEach(item => {
            const option = document.createElement('option');
            option.value = item.className || item.name;
            option.textContent = item.className || item.name;
            option.dataset.sections = JSON.stringify(item.sections || []);
            select.appendChild(option);
        });
    });

    document.getElementById('tutorialClassSelect')?.addEventListener('change', () => fillSectionSelect('tutorialClassSelect', 'tutorialSectionSelect'));
    document.getElementById('filterClassSelect')?.addEventListener('change', () => {
        fillSectionSelect('filterClassSelect', 'filterSectionSelect');
        handleFilter();
    });
}

function fillSectionSelect(classSelectId, sectionSelectId) {
    const classSelect = document.getElementById(classSelectId);
    const sectionSelect = document.getElementById(sectionSelectId);
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
        const response = await fetch('/api/download-center/video-tutorials');
        if (!response.ok) throw new Error('Failed to load video tutorials');
        records = await response.json();
        applyFilters();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load video tutorials' });
    }
}

function applyFilters() {
    const term = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const className = document.getElementById('filterClassSelect')?.value || '';
    const section = document.getElementById('filterSectionSelect')?.value || '';

    filteredRecords = records.filter(record => {
        const matchesSearch = !term ||
            (record.title && record.title.toLowerCase().includes(term)) ||
            (record.description && record.description.toLowerCase().includes(term));
        const matchesClass = !className || record.className === className;
        const matchesSection = !section || record.section === section;
        return matchesSearch && matchesClass && matchesSection;
    });

    currentPage = 1;
    renderVideoGrid();
}

function renderVideoGrid() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    grid.innerHTML = '';

    if (!pageRecords.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">No video tutorials found</div>';
    } else {
        pageRecords.forEach(record => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-card-thumb">
                    <img src="${getYoutubeThumbnail(record.videoLink)}" alt="${escapeHtml(record.title)}">
                </div>
                <div class="video-card-title">${escapeHtml(record.title)}</div>`;
            card.addEventListener('click', () => viewRecord(record.id));
            grid.appendChild(card);
        });
    }
    updatePagination(filteredRecords.length);
}

function getYoutubeThumbnail(url) {
    const videoId = extractYoutubeId(url);
    return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
}

function extractYoutubeId(url) {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : '';
}

function openAddModal() {
    editingId = null;
    document.getElementById('tutorialModalTitle').textContent = 'Add Video Tutorial';
    document.getElementById('tutorialForm')?.reset();
    document.getElementById('tutorialModal')?.classList.add('active');
}

function editRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    editingId = id;
    document.getElementById('tutorialModalTitle').textContent = 'Edit Video Tutorial';
    document.getElementById('tutorialClassSelect').value = record.className || '';
    fillSectionSelect('tutorialClassSelect', 'tutorialSectionSelect');
    document.getElementById('tutorialSectionSelect').value = record.section || '';
    document.getElementById('tutorialTitle').value = record.title || '';
    document.getElementById('tutorialVideoLink').value = record.videoLink || '';
    document.getElementById('tutorialDescription').value = record.description || '';
    document.getElementById('tutorialModal')?.classList.add('active');
}

function viewRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    viewingId = id;
    document.getElementById('viewClassName').textContent = record.className || '-';
    document.getElementById('viewSection').textContent = record.section || '-';
    document.getElementById('viewTitle').textContent = record.title || '-';
    document.getElementById('viewVideoLink').textContent = record.videoLink || '-';
    document.getElementById('viewDescription').textContent = record.description || '-';
    document.getElementById('viewCreatedBy').textContent = record.createdBy || 'Admin';
    document.getElementById('viewCreatedAt').textContent = record.createdAt || '-';
    document.getElementById('viewModal')?.classList.add('active');
}

function openViewedVideo() {
    const record = records.find(item => item.id === viewingId);
    if (record?.videoLink) window.open(record.videoLink, '_blank');
}

function editViewedVideo() {
    if (!viewingId) return;
    closeViewModal();
    editRecord(viewingId);
}

async function deleteViewedVideo() {
    if (!viewingId) return;
    closeViewModal();
    await deleteRecord(viewingId);
}

function closeModal() {
    document.getElementById('tutorialModal')?.classList.remove('active');
}

function closeViewModal() {
    document.getElementById('viewModal')?.classList.remove('active');
}

async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
        className: document.getElementById('tutorialClassSelect').value,
        section: document.getElementById('tutorialSectionSelect').value,
        title: document.getElementById('tutorialTitle').value.trim(),
        videoLink: document.getElementById('tutorialVideoLink').value.trim(),
        description: document.getElementById('tutorialDescription').value.trim()
    };

    if (!payload.className || !payload.section || !payload.title || !payload.videoLink) {
        Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Class, Section, Title, and Video Link are required.' });
        return;
    }

    const url = editingId
        ? `/api/download-center/video-tutorials/${editingId}`
        : '/api/download-center/video-tutorials';
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
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save video tutorial' });
    }
}

async function deleteRecord(id) {
    const confirmed = await Swal.fire({
        title: 'Delete video tutorial?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch(`/api/download-center/video-tutorials/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1800, showConfirmButton: false });
        loadRecords();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

function handleSearch() {
    applyFilters();
}

function handleFilter() {
    applyFilters();
}

function handleEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderVideoGrid();
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
        Class: record.className || '',
        Section: record.section || '',
        Title: record.title || '',
        'Video Link': record.videoLink || '',
        Description: record.description || '',
        'Created By': record.createdBy || 'Admin'
    }));
}

function handleCopy() {
    const headers = ['Class', 'Section', 'Title', 'Video Link', 'Description', 'Created By'];
    const rows = exportRows().map(row => Object.values(row).join('\t'));
    navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n')).then(() => {
        Swal.fire({ icon: 'success', title: 'Copied!', timer: 1500, showConfirmButton: false });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Video Tutorials');
    XLSX.writeFile(wb, 'video-tutorials.xlsx');
}

function handleCSVExport() {
    const headers = Object.keys(exportRows()[0] || { Class: '', Section: '', Title: '', 'Video Link': '', Description: '', 'Created By': '' });
    const csvData = [headers, ...exportRows().map(row => headers.map(key => row[key]))];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'video-tutorials.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [['Class', 'Section', 'Title', 'Video Link']];
    const body = exportRows().map(row => [row.Class, row.Section, row.Title, row['Video Link']]);
    doc.autoTable({ head: headers, body, styles: { fontSize: 8 }, headStyles: { fillColor: [112, 94, 200] } });
    doc.save('video-tutorials.pdf');
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

window.viewRecord = viewRecord;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
