// Postal Dispatch Management JavaScript

// Global variables
let dispatchRecords = [];
let currentPage = 1;
let recordsPerPage = 50;
let filteredRecords = [];
let isEditMode = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load dispatch records
    loadDispatchRecords();
    
    // Set today's date as default
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});

/**
 * Initialize page elements
 */
function initializePage() {
    console.log('Initializing Postal Dispatch page...');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Form submission
    const dispatchForm = document.getElementById('dispatchForm');
    if (dispatchForm) {
        dispatchForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Entries per page selector
    const entriesSelect = document.getElementById('entriesSelect');
    if (entriesSelect) {
        entriesSelect.addEventListener('change', handleEntriesChange);
    }
    
    // Export buttons
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);
    
    // Column visibility functionality
    setupColumnVisibility();
    
    // File upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('document');
    
    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', () => fileInput.click());
        
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
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                displayFileName(files[0].name);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                displayFileName(e.target.files[0].name);
            }
        });
    }
}

/**
 * Display selected file name
 */
function displayFileName(fileName) {
    const fileNameDisplay = document.getElementById('fileName');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = `Selected: ${fileName}`;
        fileNameDisplay.classList.add('active');
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        toTitle: document.getElementById('toTitle').value.trim(),
        referenceNo: document.getElementById('referenceNo').value.trim(),
        address: document.getElementById('address').value.trim(),
        note: document.getElementById('note').value.trim(),
        fromTitle: document.getElementById('fromTitle').value.trim(),
        date: document.getElementById('date').value
    };
    
    // Validation
    if (!formData.toTitle || !formData.fromTitle || !formData.date) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please fill in all required fields',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
        return;
    }
    
    try {
        const dispatchId = document.getElementById('dispatchId').value;
        const url = dispatchId ? `/api/postal-dispatch/${dispatchId}` : '/api/postal-dispatch';
        const method = dispatchId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: result.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                timer: 3000,
                timerProgressBar: true
            });
            
            resetForm();
            loadDispatchRecords();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save postal dispatch record',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

/**
 * Reset form to initial state
 */
function resetForm() {
    document.getElementById('dispatchForm').reset();
    document.getElementById('dispatchId').value = '';
    document.getElementById('date').valueAsDate = new Date();
    
    const fileNameDisplay = document.getElementById('fileName');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = '';
        fileNameDisplay.classList.remove('active');
    }
    
    isEditMode = false;
    const submitBtn = document.querySelector('.btn-save-primary');
    if (submitBtn) {
        submitBtn.textContent = 'Save';
    }
}

/**
 * Load all dispatch records from the server
 */
async function loadDispatchRecords() {
    try {
        const response = await fetch('/api/postal-dispatch');
        if (!response.ok) {
            throw new Error('Failed to fetch postal dispatch records');
        }
        
        dispatchRecords = await response.json();
        filteredRecords = [...dispatchRecords];
        renderTable();
    } catch (error) {
        console.error('Error loading dispatch records:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load postal dispatch records',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

/**
 * Render the table with current records
 */
function renderTable(records = filteredRecords) {
    const tbody = document.getElementById('dispatchTableBody');
    if (!tbody) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);
    
    // Clear existing content
    tbody.innerHTML = '';
    
    if (paginatedRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">No dispatch records found</td>
            </tr>
        `;
    } else {
        paginatedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.toTitle)}</td>
                <td>${escapeHtml(record.referenceNo || '-')}</td>
                <td>${escapeHtml(record.fromTitle)}</td>
                <td>${formatDate(record.date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewDispatch(${record.id})" title="View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                        </button>
                        <button class="btn-action btn-user" onclick="viewUser(${record.id})" title="User">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </button>
                        <button class="btn-action btn-edit" onclick="editDispatch(${record.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            </svg>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteDispatch(${record.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" x2="10" y1="11" y2="17"></line>
                                <line x1="14" x2="14" y1="11" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updatePaginationInfo(records.length);
}

/**
 * View dispatch details
 */
async function viewDispatch(id) {
    try {
        const response = await fetch(`/api/postal-dispatch/${id}`);
        const dispatch = await response.json();
        
        Swal.fire({
            title: 'Postal Dispatch Details',
            html: `
                <div style="text-align: left;">
                    <p><strong>To Title:</strong> ${escapeHtml(dispatch.toTitle)}</p>
                    <p><strong>Reference No:</strong> ${escapeHtml(dispatch.referenceNo || '-')}</p>
                    <p><strong>From Title:</strong> ${escapeHtml(dispatch.fromTitle)}</p>
                    <p><strong>Date:</strong> ${formatDate(dispatch.date)}</p>
                    <p><strong>Address:</strong> ${escapeHtml(dispatch.address || '-')}</p>
                    <p><strong>Note:</strong> ${escapeHtml(dispatch.note || '-')}</p>
                </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981'
        });
    } catch (error) {
        console.error('Error viewing dispatch:', error);
    }
}

/**
 * View user details (placeholder)
 */
function viewUser(id) {
    Swal.fire({
        title: 'User Information',
        text: 'User details functionality coming soon',
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
    });
}

/**
 * Edit dispatch record
 */
async function editDispatch(id) {
    try {
        const response = await fetch(`/api/postal-dispatch/${id}`);
        const dispatch = await response.json();
        
        // Populate form with dispatch data
        document.getElementById('dispatchId').value = dispatch.id;
        document.getElementById('toTitle').value = dispatch.toTitle;
        document.getElementById('referenceNo').value = dispatch.referenceNo || '';
        document.getElementById('address').value = dispatch.address || '';
        document.getElementById('note').value = dispatch.note || '';
        document.getElementById('fromTitle').value = dispatch.fromTitle;
        document.getElementById('date').value = dispatch.date;
        
        isEditMode = true;
        const submitBtn = document.querySelector('.btn-save-primary');
        if (submitBtn) {
            submitBtn.textContent = 'Update';
        }
        
        // Scroll to form
        document.querySelector('.add-dispatch-panel').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading dispatch for edit:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load dispatch record',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

/**
 * Delete dispatch record
 */
async function deleteDispatch(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/postal-dispatch/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: data.message,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    timerProgressBar: true
                });
                
                loadDispatchRecords();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete dispatch record',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ef4444'
            });
        }
    }
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    filteredRecords = dispatchRecords.filter(record => {
        return (
            record.toTitle.toLowerCase().includes(searchTerm) ||
            (record.referenceNo && record.referenceNo.toLowerCase().includes(searchTerm)) ||
            record.fromTitle.toLowerCase().includes(searchTerm) ||
            formatDate(record.date).includes(searchTerm)
        );
    });
    
    currentPage = 1;
    renderTable();
}

/**
 * Handle entries per page change
 */
function handleEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value);
    currentPage = 1;
    renderTable();
}

/**
 * Update pagination information
 */
function updatePaginationInfo(totalRecords) {
    const startIndex = (currentPage - 1) * recordsPerPage + 1;
    const endIndex = Math.min(currentPage * recordsPerPage, totalRecords);
    
    document.getElementById('showingStart').textContent = totalRecords > 0 ? startIndex : 0;
    document.getElementById('showingEnd').textContent = endIndex;
    document.getElementById('totalEntries').textContent = totalRecords;
    
    // Update pagination buttons
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginationDiv = document.getElementById('pagination');
    
    if (paginationDiv) {
        paginationDiv.innerHTML = '';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '‹';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        };
        paginationDiv.appendChild(prevBtn);
        
        // Page numbers
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                renderTable();
            };
            paginationDiv.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = '›';
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        };
        paginationDiv.appendChild(nextBtn);
    }
}

/**
 * Handle copy to clipboard
 */
function handleCopy() {
    const tableData = filteredRecords.map(record => 
        `${record.toTitle}\t${record.referenceNo || ''}\t${record.fromTitle}\t${formatDate(record.date)}`
    ).join('\n');
    
    navigator.clipboard.writeText(tableData).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Table data copied to clipboard',
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    });
}

/**
 * Handle Excel export
 */
function handleExcelExport() {
    const data = filteredRecords.map(record => ({
        'To Title': record.toTitle,
        'Reference No': record.referenceNo || '',
        'From Title': record.fromTitle,
        'Date': formatDate(record.date),
        'Address': record.address || '',
        'Note': record.note || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Postal Dispatch');
    XLSX.writeFile(wb, 'postal_dispatch.xlsx');
}

/**
 * Handle CSV export
 */
function handleCSVExport() {
    const headers = ['To Title', 'Reference No', 'From Title', 'Date', 'Address', 'Note'];
    const csvData = [headers];
    
    filteredRecords.forEach(record => {
        csvData.push([
            record.toTitle,
            record.referenceNo || '',
            record.fromTitle,
            formatDate(record.date),
            record.address || '',
            record.note || ''
        ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postal_dispatch.csv';
    a.click();
}

/**
 * Handle PDF export
 */
function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const tableData = filteredRecords.map(record => [
        record.toTitle,
        record.referenceNo || '',
        record.fromTitle,
        formatDate(record.date)
    ]);
    
    doc.autoTable({
        head: [['To Title', 'Reference No', 'From Title', 'Date']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save('postal_dispatch.pdf');
}

/**
 * Handle print
 */
function handlePrint() {
    window.print();
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Setup column visibility functionality
 */
function setupColumnVisibility() {
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    const columnToggles = document.querySelectorAll('.column-toggle');
    
    if (!columnVisibilityBtn || !columnVisibilityDropdown) return;
    
    // Toggle dropdown visibility
    columnVisibilityBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        columnVisibilityDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn) {
            columnVisibilityDropdown.classList.remove('active');
        }
    });
    
    // Prevent dropdown from closing when clicking inside it
    columnVisibilityDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Handle column visibility toggle
    columnToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const columnIndex = parseInt(this.getAttribute('data-column'));
            const isVisible = this.checked;
            
            // Get the table
            const table = document.querySelector('.data-table');
            if (!table) return;
            
            // Toggle header cell
            const headerCells = table.querySelectorAll('thead th');
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = isVisible ? '' : 'none';
            }
            
            // Toggle body cells in all rows
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = isVisible ? '' : 'none';
                }
            });
        });
    });
}
