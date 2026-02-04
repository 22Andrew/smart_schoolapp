// Visitors Purpose Page JavaScript

// Data arrays
let purposeData = [];
let complaintTypeData = [];
let sourceData = [];
let referenceData = [];

let currentTab = 'purpose';
let editingId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeQuickLinks();
    loadPurposeData();
    setupFormHandlers();
    setupExportHandlers();
});

// Tab Switching
function initializeTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    editingId = null;
    
    // Update tab buttons
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        }
    });
    
    // Update form content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');
    
    // Update list content
    document.querySelectorAll('.list-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-list`).classList.add('active');
    
    // Load data for the selected tab
    loadDataForTab(tabName);
    
    // Reset form
    resetForm(tabName);
}

function resetForm(tabName) {
    const form = document.getElementById(`${tabName}Form`);
    if (form) {
        form.reset();
        const idField = form.querySelector('input[name="id"]');
        if (idField) idField.value = '';
    }
    editingId = null;
}

function loadDataForTab(tabName) {
    switch(tabName) {
        case 'purpose':
            loadPurposeData();
            break;
        case 'complaint-type':
            loadComplaintTypeData();
            break;
        case 'source':
            loadSourceData();
            break;
        case 'reference':
            loadReferenceData();
            break;
    }
}

// Form Handlers
function setupFormHandlers() {
    // Purpose Form
    document.getElementById('purposeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePurpose();
    });
    
    // Complaint Type Form
    document.getElementById('complaintTypeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveComplaintType();
    });
    
    // Source Form
    document.getElementById('sourceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSource();
    });
    
    // Reference Form
    document.getElementById('referenceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveReference();
    });
}

// Purpose CRUD Operations
async function savePurpose() {
    const name = document.getElementById('purposeName').value.trim();
    const description = document.getElementById('purposeDescription').value.trim();
    
    if (!name) {
        Swal.fire('Error', 'Purpose name is required', 'error');
        return;
    }
    
    const data = { name, description };
    
    try {
        let response;
        if (editingId) {
            // Update existing
            response = await fetch(`/api/purposes/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new
            response = await fetch('/api/purposes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            Swal.fire('Success', editingId ? 'Purpose updated successfully' : 'Purpose added successfully', 'success');
            resetForm('purpose');
            loadPurposeData();
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        Swal.fire('Error', 'Failed to save purpose', 'error');
    }
}

async function loadPurposeData() {
    try {
        const response = await fetch('/api/purposes');
        if (response.ok) {
            purposeData = await response.json();
        }
    } catch (error) {
        console.error('Error loading purposes:', error);
    }
    
    const tbody = document.getElementById('purposeTableBody');
    tbody.innerHTML = '';
    
    if (purposeData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No data available</td></tr>';
    } else {
        purposeData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.description || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editPurpose(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="deletePurpose(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updatePagination('purpose', purposeData.length);
}

function editPurpose(id) {
    const item = purposeData.find(p => p.id === id);
    if (item) {
        editingId = id;
        document.getElementById('purposeName').value = item.name;
        document.getElementById('purposeDescription').value = item.description;
        document.getElementById('purposeName').focus();
    }
}

async function deletePurpose(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#718096',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/purposes/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                Swal.fire('Deleted!', 'Purpose has been deleted.', 'success');
                loadPurposeData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete purpose', 'error');
        }
    }
}

// Complaint Type CRUD Operations
async function saveComplaintType() {
    const name = document.getElementById('complaintTypeName').value.trim();
    const description = document.getElementById('complaintTypeDescription').value.trim();
    
    if (!name) {
        Swal.fire('Error', 'Complaint Type name is required', 'error');
        return;
    }
    
    const data = { name, description };
    
    try {
        let response;
        if (editingId) {
            response = await fetch(`/api/complaint-types/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/complaint-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            Swal.fire('Success', editingId ? 'Complaint Type updated successfully' : 'Complaint Type added successfully', 'success');
            resetForm('complaint-type');
            loadComplaintTypeData();
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        Swal.fire('Error', 'Failed to save complaint type', 'error');
    }
}

async function loadComplaintTypeData() {
    try {
        const response = await fetch('/api/complaint-types');
        if (response.ok) {
            complaintTypeData = await response.json();
        }
    } catch (error) {
        console.error('Error loading complaint types:', error);
    }
    
    const tbody = document.getElementById('complaintTypeTableBody');
    tbody.innerHTML = '';
    
    if (complaintTypeData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No data available</td></tr>';
    } else {
        complaintTypeData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.description || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editComplaintType(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteComplaintType(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updatePagination('complaintType', complaintTypeData.length);
}

function editComplaintType(id) {
    const item = complaintTypeData.find(p => p.id === id);
    if (item) {
        editingId = id;
        document.getElementById('complaintTypeName').value = item.name;
        document.getElementById('complaintTypeDescription').value = item.description;
        document.getElementById('complaintTypeName').focus();
    }
}

async function deleteComplaintType(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#718096',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/complaint-types/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                Swal.fire('Deleted!', 'Complaint Type has been deleted.', 'success');
                loadComplaintTypeData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete complaint type', 'error');
        }
    }
}

// Source CRUD Operations
async function saveSource() {
    const name = document.getElementById('sourceName').value.trim();
    const description = document.getElementById('sourceDescription').value.trim();
    
    if (!name) {
        Swal.fire('Error', 'Source name is required', 'error');
        return;
    }
    
    const data = { name, description };
    
    try {
        let response;
        if (editingId) {
            response = await fetch(`/api/sources/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/sources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            Swal.fire('Success', editingId ? 'Source updated successfully' : 'Source added successfully', 'success');
            resetForm('source');
            loadSourceData();
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        Swal.fire('Error', 'Failed to save source', 'error');
    }
}

async function loadSourceData() {
    try {
        const response = await fetch('/api/sources');
        if (response.ok) {
            sourceData = await response.json();
        }
    } catch (error) {
        console.error('Error loading sources:', error);
    }
    
    const tbody = document.getElementById('sourceTableBody');
    tbody.innerHTML = '';
    
    if (sourceData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No data available</td></tr>';
    } else {
        sourceData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.description || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editSource(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteSource(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updatePagination('source', sourceData.length);
}

function editSource(id) {
    const item = sourceData.find(p => p.id === id);
    if (item) {
        editingId = id;
        document.getElementById('sourceName').value = item.name;
        document.getElementById('sourceDescription').value = item.description;
        document.getElementById('sourceName').focus();
    }
}

async function deleteSource(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#718096',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/sources/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                Swal.fire('Deleted!', 'Source has been deleted.', 'success');
                loadSourceData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete source', 'error');
        }
    }
}

// Reference CRUD Operations
async function saveReference() {
    const name = document.getElementById('referenceName').value.trim();
    const description = document.getElementById('referenceDescription').value.trim();
    
    if (!name) {
        Swal.fire('Error', 'Reference name is required', 'error');
        return;
    }
    
    const data = { name, description };
    
    try {
        let response;
        if (editingId) {
            response = await fetch(`/api/references/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/references', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            Swal.fire('Success', editingId ? 'Reference updated successfully' : 'Reference added successfully', 'success');
            resetForm('reference');
            loadReferenceData();
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        Swal.fire('Error', 'Failed to save reference', 'error');
    }
}

async function loadReferenceData() {
    try {
        const response = await fetch('/api/references');
        if (response.ok) {
            referenceData = await response.json();
        }
    } catch (error) {
        console.error('Error loading references:', error);
    }
    
    const tbody = document.getElementById('referenceTableBody');
    tbody.innerHTML = '';
    
    if (referenceData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No data available</td></tr>';
    } else {
        referenceData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.description || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editReference(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteReference(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updatePagination('reference', referenceData.length);
}

function editReference(id) {
    const item = referenceData.find(p => p.id === id);
    if (item) {
        editingId = id;
        document.getElementById('referenceName').value = item.name;
        document.getElementById('referenceDescription').value = item.description;
        document.getElementById('referenceName').focus();
    }
}

async function deleteReference(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#718096',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/references/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                Swal.fire('Deleted!', 'Reference has been deleted.', 'success');
                loadReferenceData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete reference', 'error');
        }
    }
}

// Pagination
function updatePagination(type, total) {
    const showingStart = document.getElementById(`${type}ShowingStart`);
    const showingEnd = document.getElementById(`${type}ShowingEnd`);
    const totalEntries = document.getElementById(`${type}TotalEntries`);
    
    if (showingStart) showingStart.textContent = total > 0 ? 1 : 0;
    if (showingEnd) showingEnd.textContent = total;
    if (totalEntries) totalEntries.textContent = total;
}

// Export Handlers
function setupExportHandlers() {
    // Purpose exports
    document.getElementById('purposeCopyBtn')?.addEventListener('click', () => copyToClipboard('purpose'));
    document.getElementById('purposeExcelBtn')?.addEventListener('click', () => exportToExcel('purpose'));
    document.getElementById('purposeCsvBtn')?.addEventListener('click', () => exportToCSV('purpose'));
    document.getElementById('purposePdfBtn')?.addEventListener('click', () => exportToPDF('purpose'));
    
    // Similar for other tabs
    document.getElementById('complaintTypeCopyBtn')?.addEventListener('click', () => copyToClipboard('complaintType'));
    document.getElementById('complaintTypeExcelBtn')?.addEventListener('click', () => exportToExcel('complaintType'));
    document.getElementById('complaintTypeCsvBtn')?.addEventListener('click', () => exportToCSV('complaintType'));
    document.getElementById('complaintTypePdfBtn')?.addEventListener('click', () => exportToPDF('complaintType'));
    
    document.getElementById('sourceCopyBtn')?.addEventListener('click', () => copyToClipboard('source'));
    document.getElementById('sourceExcelBtn')?.addEventListener('click', () => exportToExcel('source'));
    document.getElementById('sourceCsvBtn')?.addEventListener('click', () => exportToCSV('source'));
    document.getElementById('sourcePdfBtn')?.addEventListener('click', () => exportToPDF('source'));
    
    document.getElementById('referenceCopyBtn')?.addEventListener('click', () => copyToClipboard('reference'));
    document.getElementById('referenceExcelBtn')?.addEventListener('click', () => exportToExcel('reference'));
    document.getElementById('referenceCsvBtn')?.addEventListener('click', () => exportToCSV('reference'));
    document.getElementById('referencePdfBtn')?.addEventListener('click', () => exportToPDF('reference'));
}

function getDataByType(type) {
    switch(type) {
        case 'purpose': return purposeData;
        case 'complaintType': return complaintTypeData;
        case 'source': return sourceData;
        case 'reference': return referenceData;
        default: return [];
    }
}

function copyToClipboard(type) {
    const data = getDataByType(type);
    let text = 'Name\tDescription\n';
    data.forEach(item => {
        text += `${item.name}\t${item.description || ''}\n`;
    });
    
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire('Success', 'Data copied to clipboard', 'success');
    });
}

function exportToExcel(type) {
    const data = getDataByType(type);
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
        'Name': item.name,
        'Description': item.description || ''
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `${type}_${new Date().getTime()}.xlsx`);
}

function exportToCSV(type) {
    const data = getDataByType(type);
    let csv = 'Name,Description\n';
    data.forEach(item => {
        csv += `"${item.name}","${item.description || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${new Date().getTime()}.csv`;
    a.click();
}

function exportToPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = getDataByType(type);
    
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} List`, 14, 15);
    
    const tableData = data.map(item => [item.name, item.description || '']);
    
    doc.autoTable({
        head: [['Name', 'Description']],
        body: tableData,
        startY: 25
    });
    
    doc.save(`${type}_${new Date().getTime()}.pdf`);
}

// Quick Links Modal
function initializeQuickLinks() {
    const quickLinksBtn = document.getElementById('quickLinksBtn');
    const quickLinksModal = document.getElementById('quickLinksModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (quickLinksBtn) {
        quickLinksBtn.addEventListener('click', () => {
            quickLinksModal.classList.add('active');
        });
    }
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            quickLinksModal.classList.remove('active');
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            quickLinksModal.classList.remove('active');
        });
    }
}
