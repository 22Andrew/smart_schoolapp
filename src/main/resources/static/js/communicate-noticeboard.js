let records = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let editingId = null;

const RECIPIENT_OPTIONS = `
    <option value="">Select</option>
    <option value="Student">Student</option>
    <option value="Guardian">Guardian</option>
    <option value="Staff">Staff</option>
    <option value="Class">Class</option>
    <option value="Individual">Individual</option>
    <option value="All">All</option>
`;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('recordForm')?.addEventListener('submit', handleSubmit);
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    loadRecords();
});

async function loadRecords() {
    try {
        const response = await fetch('/api/communicate/notices');
        if (!response.ok) throw new Error('Failed to load notices');
        records = await response.json();
        filteredRecords = [...records];
        currentPage = 1;
        renderTable();
    } catch (error) {
        showError(error.message || 'Failed to load notices');
    }
}

function renderTable() {
    const tbody = document.getElementById('recordTableBody');
    if (!tbody) return;
    const start = (currentPage - 1) * recordsPerPage;
    const pageRecords = filteredRecords.slice(start, start + recordsPerPage);
    tbody.innerHTML = '';

    if (!pageRecords.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;">No notices found</td></tr>';
    } else {
        pageRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.title)}</td>
                <td>${escapeHtml(record.noticeDate)}</td>
                <td>${escapeHtml(record.publishTo)}</td>
                <td>${record.showOnWebsite ? 'Yes' : 'No'}</td>
                <td>${escapeHtml(truncate(record.message, 80))}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn-action" onclick="editRecord(${record.id})" title="Edit">✎</button>
                        <button type="button" class="btn-action" onclick="deleteRecord(${record.id})" title="Delete">✕</button>
                    </div>
                </td>`;
            tbody.appendChild(row);
        });
    }
    updatePagination(filteredRecords.length);
}

async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
        title: document.getElementById('noticeTitle').value.trim(),
        message: document.getElementById('noticeMessage').value.trim(),
        noticeDate: document.getElementById('noticeDate').value,
        publishTo: document.getElementById('publishTo').value,
        showOnWebsite: document.getElementById('showOnWebsite').checked
    };

    const url = editingId ? `/api/communicate/notices/${editingId}` : '/api/communicate/notices';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        showSuccess(result.message);
        resetForm();
        loadRecords();
    } catch (error) {
        showError(error.message || 'Failed to save notice');
    }
}

function editRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;
    editingId = id;
    document.getElementById('formTitle').textContent = 'Edit Notice';
    document.getElementById('noticeTitle').value = record.title || '';
    document.getElementById('noticeMessage').value = record.message || '';
    document.getElementById('noticeDate').value = record.noticeDate || '';
    document.getElementById('publishTo').value = record.publishTo || '';
    document.getElementById('showOnWebsite').checked = !!record.showOnWebsite;
}

async function deleteRecord(id) {
    const confirmed = await Swal.fire({ title: 'Delete notice?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (!confirmed.isConfirmed) return;
    try {
        const response = await fetch(`/api/communicate/notices/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        showSuccess(result.message);
        if (editingId === id) resetForm();
        loadRecords();
    } catch (error) {
        showError(error.message || 'Failed to delete notice');
    }
}

function resetForm() {
    editingId = null;
    document.getElementById('recordForm')?.reset();
    document.getElementById('formTitle').textContent = 'Add Notice';
    if (!document.getElementById('noticeDate').value) {
        document.getElementById('noticeDate').value = new Date().toISOString().slice(0, 10);
    }
}

function handleSearch(event) {
    const term = event.target.value.toLowerCase();
    filteredRecords = records.filter(record =>
        (record.title && record.title.toLowerCase().includes(term)) ||
        (record.message && record.message.toLowerCase().includes(term)) ||
        (record.publishTo && record.publishTo.toLowerCase().includes(term))
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

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, max) {
    if (!text) return '';
    return text.length <= max ? text : text.slice(0, max) + '...';
}

function showSuccess(message) {
    Swal.fire({ icon: 'success', title: 'Success', text: message, timer: 2200, showConfirmButton: false });
}

function showError(message) {
    Swal.fire({ icon: 'error', title: 'Error', text: message });
}

window.editRecord = editRecord;
window.deleteRecord = deleteRecord;

if (document.getElementById('noticeDate') && !document.getElementById('noticeDate').value) {
    document.getElementById('noticeDate').value = new Date().toISOString().slice(0, 10);
}
