// Complain specific JavaScript
let complainRecords = [];
let currentEditId = null;

// DOM Elements
const complainForm = document.getElementById('complainForm');
const complainTableBody = document.getElementById('complainTableBody');
const searchInput = document.getElementById('searchInput');

// File upload handling
const fileUploadArea = document.querySelector('.file-upload-area');
const fileInput = document.getElementById('document');

fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const fileName = e.target.files[0].name;
        fileUploadArea.querySelector('p').textContent = `Selected: ${fileName}`;
    }
});

// Drag and drop
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#3b82f6';
});

fileUploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#334155';
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#334155';
    
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        const fileName = e.dataTransfer.files[0].name;
        fileUploadArea.querySelector('p').textContent = `Selected: ${fileName}`;
    }
});

// Form Submission
complainForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        complainType: document.getElementById('complainType').value,
        source: document.getElementById('source').value,
        complainBy: document.getElementById('complainBy').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value || null,
        actionTaken: document.getElementById('actionTaken').value || null,
        assigned: document.getElementById('assigned').value || null,
        note: document.getElementById('note').value || null
    };

    try {
        let response;
        if (currentEditId) {
            // Update existing complain
            response = await fetch(`/api/complains/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Create new complain
            response = await fetch('/api/complains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: currentEditId ? 'Complain updated successfully' : 'Complain added successfully',
                showConfirmButton: true,
                confirmButtonColor: '#3498db',
                confirmButtonText: 'OK'
            });
            resetForm();
            loadComplainRecords();
        } else {
            throw new Error('Failed to save complain record');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to save complain record. Please try again.',
            confirmButtonColor: '#3498db'
        });
    }
});

// Reset Form
function resetForm() {
    complainForm.reset();
    currentEditId = null;
    document.getElementById('complainId').value = '';
    fileUploadArea.querySelector('p').textContent = 'Drag and drop a file here or click';
}

// Load Complain Records
async function loadComplainRecords() {
    try {
        const response = await fetch('/api/complains');
        if (response.ok) {
            complainRecords = await response.json();
            renderTable();
        }
    } catch (error) {
        console.error('Error loading complain records:', error);
    }
}

// Render Table
function renderTable(records = complainRecords) {
    if (records.length === 0) {
        complainTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">No complain records found</td>
            </tr>
        `;
        updatePagination(0);
        return;
    }

    complainTableBody.innerHTML = records.map((complain, index) => `
        <tr>
            <td>${index + 1 + 300}</td>
            <td><span class="badge badge-${complain.complainType.toLowerCase()}">${complain.complainType}</span></td>
            <td>${complain.complainBy}</td>
            <td>${complain.phone}</td>
            <td>${formatDate(complain.date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewComplain(${complain.id})" title="View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-action btn-edit" onclick="editComplain(${complain.id})" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteComplain(${complain.id})" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updatePagination(records.length);
}

// View Complain
window.viewComplain = function(id) {
    const complain = complainRecords.find(c => c.id === id);
    if (complain) {
        Swal.fire({
            title: 'Complain Details',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <p><strong>Complain #:</strong> ${id + 300}</p>
                    <p><strong>Type:</strong> ${complain.complainType}</p>
                    <p><strong>Source:</strong> ${complain.source}</p>
                    <p><strong>Complain By:</strong> ${complain.complainBy}</p>
                    <p><strong>Phone:</strong> ${complain.phone}</p>
                    <p><strong>Date:</strong> ${formatDate(complain.date)}</p>
                    ${complain.description ? `<p><strong>Description:</strong> ${complain.description}</p>` : ''}
                    ${complain.actionTaken ? `<p><strong>Action Taken:</strong> ${complain.actionTaken}</p>` : ''}
                    ${complain.assigned ? `<p><strong>Assigned:</strong> ${complain.assigned}</p>` : ''}
                    ${complain.note ? `<p><strong>Note:</strong> ${complain.note}</p>` : ''}
                </div>
            `,
            width: 600,
            showConfirmButton: true,
            confirmButtonColor: '#3498db',
            confirmButtonText: 'OK'
        });
    }
};

// Edit Complain
window.editComplain = function(id) {
    const complain = complainRecords.find(c => c.id === id);
    if (complain) {
        currentEditId = complain.id;
        document.getElementById('complainId').value = complain.id;
        document.getElementById('complainType').value = complain.complainType;
        document.getElementById('source').value = complain.source;
        document.getElementById('complainBy').value = complain.complainBy;
        document.getElementById('phone').value = complain.phone;
        document.getElementById('date').value = complain.date;
        document.getElementById('description').value = complain.description || '';
        document.getElementById('actionTaken').value = complain.actionTaken || '';
        document.getElementById('assigned').value = complain.assigned || '';
        document.getElementById('note').value = complain.note || '';
        
        // Scroll to form
        document.querySelector('.add-complain-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Delete Complain
window.deleteComplain = async function(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/complains/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Complain record has been deleted.',
                    showConfirmButton: true,
                    confirmButtonColor: '#3498db',
                    confirmButtonText: 'OK'
                });
                loadComplainRecords();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete complain record.',
                confirmButtonColor: '#3498db'
            });
        }
    }
};

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = complainRecords.filter(complain => 
        complain.complainBy.toLowerCase().includes(searchTerm) ||
        complain.phone.includes(searchTerm) ||
        complain.complainType.toLowerCase().includes(searchTerm) ||
        complain.source.toLowerCase().includes(searchTerm) ||
        (complain.description && complain.description.toLowerCase().includes(searchTerm))
    );
    renderTable(filtered);
});

// Export Functions
document.getElementById('copyBtn').addEventListener('click', () => {
    const table = document.getElementById('complainTable');
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    
    Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Table copied to clipboard',
        showConfirmButton: true,
        confirmButtonColor: '#3498db',
        confirmButtonText: 'OK',
        timer: 1500
    });
});

document.getElementById('excelBtn').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(complainRecords.map((c, i) => ({
        'Complain #': i + 1 + 300,
        'Type': c.complainType,
        'Source': c.source,
        'Name': c.complainBy,
        'Phone': c.phone,
        'Date': formatDate(c.date),
        'Description': c.description || '',
        'Action Taken': c.actionTaken || '',
        'Assigned': c.assigned || ''
    })));
    XLSX.utils.book_append_sheet(wb, ws, 'Complains');
    XLSX.writeFile(wb, 'complains.xlsx');
});

document.getElementById('csvBtn').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(complainRecords.map((c, i) => ({
        'Complain #': i + 1 + 300,
        'Type': c.complainType,
        'Source': c.source,
        'Name': c.complainBy,
        'Phone': c.phone,
        'Date': formatDate(c.date),
        'Description': c.description || '',
        'Action Taken': c.actionTaken || '',
        'Assigned': c.assigned || ''
    })));
    XLSX.utils.book_append_sheet(wb, ws, 'Complains');
    XLSX.writeFile(wb, 'complains.csv');
});

document.getElementById('pdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.autoTable({
        head: [['Complain #', 'Type', 'Name', 'Phone', 'Date']],
        body: complainRecords.map((complain, index) => [
            index + 1 + 300,
            complain.complainType,
            complain.complainBy,
            complain.phone,
            formatDate(complain.date)
        ])
    });
    
    doc.save('complains.pdf');
});

document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
});

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function updatePagination(count) {
    document.getElementById('showingStart').textContent = count > 0 ? '1' : '0';
    document.getElementById('showingEnd').textContent = count;
    document.getElementById('totalEntries').textContent = count;
}

// Column Visibility Toggle
const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
const columnToggles = document.querySelectorAll('.column-toggle');
const tableHeaders = document.querySelectorAll('.data-table thead th');

// Toggle dropdown
columnVisibilityBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    columnVisibilityDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn) {
        columnVisibilityDropdown.classList.remove('active');
    }
});

// Handle column toggle
columnToggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
        const columnIndex = parseInt(e.target.getAttribute('data-column'));
        const isVisible = e.target.checked;
        
        // Toggle header
        if (tableHeaders[columnIndex]) {
            tableHeaders[columnIndex].style.display = isVisible ? '' : 'none';
        }
        
        // Toggle cells in all rows
        const rows = document.querySelectorAll('.data-table tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells[columnIndex]) {
                cells[columnIndex].style.display = isVisible ? '' : 'none';
            }
        });
    });
});

// Quick Links Modal
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

// Initialize
loadComplainRecords();

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();
