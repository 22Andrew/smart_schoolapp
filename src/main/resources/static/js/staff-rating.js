let ratingRecords = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadRatings();
});

function setupEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);

    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    setupColumnVisibility();
}

async function loadRatings() {
    try {
        const response = await fetch('/api/staff-teacher-ratings');
        if (!response.ok) throw new Error('Failed to fetch ratings');

        ratingRecords = await response.json();
        filteredRecords = [...ratingRecords];
        currentPage = 1;
        renderTable();
    } catch (error) {
        console.error('Error loading ratings:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load teacher ratings',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTable(records = filteredRecords) {
    const tbody = document.getElementById('ratingTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (paginatedRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">No ratings found</td>
            </tr>
        `;
    } else {
        paginatedRecords.forEach(record => {
            const row = document.createElement('tr');
            const isPending = (record.status || '').toLowerCase() === 'pending';
            row.innerHTML = `
                <td>${escapeHtml(record.staffId)}</td>
                <td><span class="staff-name-link">${escapeHtml(record.staffDisplay)}</span></td>
                <td>${renderStars(record.rating)}</td>
                <td>${escapeHtml(record.comment || '')}</td>
                <td>${renderStatusBadge(record.status)}</td>
                <td>${escapeHtml(record.studentDisplay)}</td>
                <td>
                    <div class="action-buttons">
                        ${isPending ? `<button type="button" class="btn-approve" onclick="approveRating(${record.id})">Approve</button>` : ''}
                        <button type="button" class="btn-action" onclick="deleteRating(${record.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
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

function renderStars(rating) {
    const value = Math.max(0, Math.min(5, parseInt(rating, 10) || 0));
    let starsHtml = '<span class="rating-stars">';
    for (let i = 1; i <= 5; i++) {
        starsHtml += `<span class="star ${i <= value ? '' : 'empty'}">★</span>`;
    }
    starsHtml += `</span><span class="rating-value">${value}</span>`;
    return starsHtml;
}

function renderStatusBadge(status) {
    const normalized = (status || 'Pending').toLowerCase();
    const className = normalized === 'approved' ? 'status-badge-approved' : 'status-badge-pending';
    return `<span class="status-badge ${className}">${escapeHtml(status || 'Pending')}</span>`;
}

async function approveRating(id) {
    try {
        const response = await fetch(`/api/staff-teacher-ratings/${id}/approve`, { method: 'POST' });
        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Approved!',
                text: result.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
            loadRatings();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to approve rating',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function deleteRating(id) {
    const result = await Swal.fire({
        title: 'Delete Rating?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/api/staff-teacher-ratings/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: data.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
            loadRatings();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete rating',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
        });
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filteredRecords = ratingRecords.filter(record => {
        return (
            (record.staffId && String(record.staffId).toLowerCase().includes(searchTerm)) ||
            (record.staffDisplay && record.staffDisplay.toLowerCase().includes(searchTerm)) ||
            (record.comment && record.comment.toLowerCase().includes(searchTerm)) ||
            (record.status && record.status.toLowerCase().includes(searchTerm)) ||
            (record.studentDisplay && record.studentDisplay.toLowerCase().includes(searchTerm)) ||
            (record.rating && String(record.rating).includes(searchTerm))
        );
    });
    currentPage = 1;
    renderTable();
}

function handleEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderTable();
}

function updatePaginationInfo(totalRecords) {
    const startIndex = totalRecords > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0;
    const endIndex = Math.min(currentPage * recordsPerPage, totalRecords);

    document.getElementById('showingStart').textContent = startIndex;
    document.getElementById('showingEnd').textContent = endIndex;
    document.getElementById('totalEntries').textContent = totalRecords;

    const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;

    paginationDiv.innerHTML = '';

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

    const maxButtons = Math.min(totalPages, 5);
    for (let i = 1; i <= maxButtons; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderTable();
        };
        paginationDiv.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages || totalRecords === 0;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    };
    paginationDiv.appendChild(nextBtn);
}

function handleCopy() {
    const tableData = filteredRecords.map(record =>
        `${record.staffId}\t${record.staffDisplay}\t${record.rating}\t${record.comment || ''}\t${record.status}\t${record.studentDisplay}`
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

function handleExcelExport() {
    const data = filteredRecords.map(record => ({
        'Staff ID': record.staffId,
        Name: record.staffDisplay,
        Rating: record.rating,
        Comment: record.comment || '',
        Status: record.status,
        'Student Name': record.studentDisplay
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers Rating');
    XLSX.writeFile(wb, 'teachers_rating.xlsx');
}

function handleCSVExport() {
    const headers = ['Staff ID', 'Name', 'Rating', 'Comment', 'Status', 'Student Name'];
    const csvData = [headers];

    filteredRecords.forEach(record => {
        csvData.push([
            record.staffId,
            record.staffDisplay,
            record.rating,
            record.comment || '',
            record.status,
            record.studentDisplay
        ]);
    });

    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers_rating.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    const tableData = filteredRecords.map(record => [
        record.staffId,
        record.staffDisplay,
        String(record.rating),
        record.comment || '',
        record.status,
        record.studentDisplay
    ]);

    doc.autoTable({
        head: [['Staff ID', 'Name', 'Rating', 'Comment', 'Status', 'Student Name']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 8 }
    });

    doc.save('teachers_rating.pdf');
}

function handlePrint() {
    window.print();
}

function setupColumnVisibility() {
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    const columnToggles = document.querySelectorAll('.column-toggle');

    if (!columnVisibilityBtn || !columnVisibilityDropdown) return;

    columnVisibilityBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        columnVisibilityDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn) {
            columnVisibilityDropdown.classList.remove('active');
        }
    });

    columnVisibilityDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    columnToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const columnIndex = parseInt(this.getAttribute('data-column'), 10);
            const isVisible = this.checked;
            const table = document.getElementById('ratingTable');
            if (!table) return;

            const headerCells = table.querySelectorAll('thead th');
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = isVisible ? '' : 'none';
            }

            table.querySelectorAll('tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = isVisible ? '' : 'none';
                }
            });
        });
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.approveRating = approveRating;
window.deleteRating = deleteRating;
