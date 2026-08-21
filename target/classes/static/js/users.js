let userRecords = [];
let filteredRecords = [];
let currentType = 'student';
let currentPage = 1;
let recordsPerPage = 50;
let sortKey = null;
let sortDir = 'asc';

const COLUMN_CONFIG = {
    student: [
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'studentName', label: 'Student Name', linkKey: 'profileUrl' },
        { key: 'username', label: 'Username' },
        { key: 'classLabel', label: 'Class' },
        { key: 'fatherName', label: 'Father Name' },
        { key: 'mobileNumber', label: 'Mobile Number' },
        { key: 'action', label: 'Action', sortable: false }
    ],
    parent: [
        { key: 'guardianName', label: 'Guardian Name' },
        { key: 'username', label: 'Username' },
        { key: 'mobileNumber', label: 'Mobile Number' },
        { key: 'studentName', label: 'Student Name', linkKey: 'profileUrl' },
        { key: 'action', label: 'Action', sortable: false }
    ],
    staff: [
        { key: 'staffId', label: 'Staff ID' },
        { key: 'staffName', label: 'Name' },
        { key: 'username', label: 'Username' },
        { key: 'role', label: 'Role' },
        { key: 'mobileNumber', label: 'Mobile Number' },
        { key: 'action', label: 'Action', sortable: false }
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    renderTableHead();
    loadUsers();
});

function setupEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    document.querySelectorAll('.user-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.user-tab').forEach(function (item) {
                item.classList.remove('active');
            });
            tab.classList.add('active');
            currentType = tab.getAttribute('data-type') || 'student';
            sortKey = null;
            sortDir = 'asc';
            currentPage = 1;
            renderTableHead();
            loadUsers();
        });
    });

    setupColumnVisibility();
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users?type=' + encodeURIComponent(currentType));
        if (!response.ok) throw new Error('Failed to fetch users');
        userRecords = await response.json();
        applyFilters();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load users',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTableHead() {
    const thead = document.getElementById('usersTableHead');
    if (!thead) return;

    const columns = COLUMN_CONFIG[currentType] || COLUMN_CONFIG.student;
    const sortIcons = ''
        + '<span class="sort-icons" aria-hidden="true">'
        + '<svg viewBox="0 0 10 6"><path d="M5 0L10 6H0z"/></svg>'
        + '<svg viewBox="0 0 10 6"><path d="M5 6L0 0h10z"/></svg>'
        + '</span>';

    thead.innerHTML = '<tr>' + columns.map(function (column) {
        if (column.sortable === false) {
            return '<th>' + escapeHtml(column.label) + '</th>';
        }
        return '<th class="sortable" data-sort="' + column.key + '">'
            + escapeHtml(column.label)
            + sortIcons
            + '</th>';
    }).join('') + '</tr>';

    thead.querySelectorAll('th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            thead.querySelectorAll('th.sortable').forEach(function (header) {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            applyFilters();
        });
    });

    rebuildColumnVisibilityDropdown();
}

function applyFilters() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    filteredRecords = userRecords.filter(function (record) {
        return Object.values(record).some(function (value) {
            return value != null && String(value).toLowerCase().includes(searchTerm);
        });
    });

    if (sortKey) {
        filteredRecords.sort(function (a, b) {
            const left = String(a[sortKey] || '').toLowerCase();
            const right = String(b[sortKey] || '').toLowerCase();
            if (left < right) return sortDir === 'asc' ? -1 : 1;
            if (left > right) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    currentPage = 1;
    renderTable();
}

function renderTable(records) {
    if (records === undefined) records = filteredRecords;
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const columns = COLUMN_CONFIG[currentType] || COLUMN_CONFIG.student;
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    if (!paginatedRecords.length) {
        tbody.innerHTML = '<tr><td colspan="' + columns.length + '" style="text-align:center;padding:40px;">No users found</td></tr>';
    } else {
        tbody.innerHTML = paginatedRecords.map(function (record) {
            return '<tr>' + columns.map(function (column) {
                return '<td>' + renderCell(record, column) + '</td>';
            }).join('') + '</tr>';
        }).join('');
    }

    applyColumnVisibility();
    updatePaginationInfo(records.length);
}

function renderCell(record, column) {
    if (column.key === 'action') {
        const checked = record.loginEnabled ? 'checked' : '';
        return ''
            + '<label class="toggle-switch">'
            + '<input type="checkbox" ' + checked + ' onchange="toggleUserStatus(' + record.id + ', this.checked, ' + Boolean(record.demo) + ')">'
            + '<span class="toggle-slider"></span>'
            + '</label>';
    }

    const value = record[column.key] == null ? '-' : record[column.key];
    if (column.linkKey && record[column.linkKey] && record[column.linkKey] !== '#') {
        return '<a class="student-name-link" href="' + escapeHtml(record[column.linkKey]) + '">' + escapeHtml(value) + '</a>';
    }
    if (column.linkKey) {
        return '<span class="student-name-link">' + escapeHtml(value) + '</span>';
    }
    return escapeHtml(value);
}

async function toggleUserStatus(id, enabled, isDemo) {
    if (isDemo || id < 0) {
        const record = userRecords.find(function (item) { return item.id === id; });
        if (record) record.loginEnabled = enabled;
        applyFilters();
        return;
    }

    try {
        const response = await fetch('/api/users/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginEnabled: enabled })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        const record = userRecords.find(function (item) { return item.id === id; });
        if (record) record.loginEnabled = enabled;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to update user status',
            confirmButtonColor: '#ef4444'
        });
        loadUsers();
    }
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
    prevBtn.disabled = currentPage === 1 || totalRecords === 0;
    prevBtn.onclick = function () {
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
        pageBtn.onclick = function () {
            currentPage = i;
            renderTable();
        };
        paginationDiv.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages || totalRecords === 0;
    nextBtn.onclick = function () {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    };
    paginationDiv.appendChild(nextBtn);
}

function exportRows() {
    const columns = (COLUMN_CONFIG[currentType] || COLUMN_CONFIG.student).filter(function (column) {
        return column.key !== 'action';
    });
    return filteredRecords.map(function (record) {
        const row = {};
        columns.forEach(function (column) {
            row[column.label] = record[column.key] == null ? '' : record[column.key];
        });
        return row;
    });
}

function handleCopy() {
    const columns = (COLUMN_CONFIG[currentType] || COLUMN_CONFIG.student).filter(function (column) {
        return column.key !== 'action';
    });
    const header = columns.map(function (column) { return column.label; }).join('\t');
    const body = exportRows().map(function (row) {
        return columns.map(function (column) { return row[column.label]; }).join('\t');
    }).join('\n');
    navigator.clipboard.writeText(header + '\n' + body).then(function () {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Table data copied to clipboard',
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'Users-' + currentType + '.xlsx');
}

function handleCSVExport() {
    const columns = (COLUMN_CONFIG[currentType] || COLUMN_CONFIG.student).filter(function (column) {
        return column.key !== 'action';
    });
    const csvData = [columns.map(function (column) { return column.label; })].concat(
        exportRows().map(function (row) {
            return columns.map(function (column) { return row[column.label]; });
        })
    );
    const csvContent = csvData.map(function (row) {
        return row.map(function (cell) {
            return '"' + String(cell).replace(/"/g, '""') + '"';
        }).join(',');
    }).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Users-' + currentType + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'pt', 'a4');
    const columns = (COLUMN_CONFIG[currentType] || COLUMN_CONFIG.student).filter(function (column) {
        return column.key !== 'action';
    });
    const head = [columns.map(function (column) { return column.label; })];
    const body = exportRows().map(function (row) {
        return columns.map(function (column) { return row[column.label]; });
    });

    doc.autoTable({
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save('Users-' + currentType + '.pdf');
}

function handlePrint() {
    window.print();
}

function rebuildColumnVisibilityDropdown() {
    const dropdown = document.getElementById('columnVisibilityDropdown');
    if (!dropdown) return;

    const columns = COLUMN_CONFIG[currentType] || COLUMN_CONFIG.student;
    dropdown.innerHTML = ''
        + '<div class="dropdown-header"><span>Toggle Columns</span></div>'
        + '<div class="dropdown-content">'
        + columns.map(function (column, index) {
            return '<label class="column-toggle-item">'
                + '<input type="checkbox" class="column-toggle" data-column="' + index + '" checked>'
                + '<span>' + escapeHtml(column.label) + '</span>'
                + '</label>';
        }).join('')
        + '</div>';

    dropdown.querySelectorAll('.column-toggle').forEach(function (toggle) {
        toggle.addEventListener('change', applyColumnVisibility);
    });
}

function setupColumnVisibility() {
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (!columnVisibilityBtn || !columnVisibilityDropdown) return;

    columnVisibilityBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        columnVisibilityDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn) {
            columnVisibilityDropdown.classList.remove('active');
        }
    });

    columnVisibilityDropdown.addEventListener('click', function (e) {
        e.stopPropagation();
    });
}

function applyColumnVisibility() {
    const table = document.getElementById('usersTable');
    if (!table) return;

    document.querySelectorAll('.column-toggle').forEach(function (toggle) {
        const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
        const isVisible = toggle.checked;
        const headerCells = table.querySelectorAll('thead th');
        if (headerCells[columnIndex]) {
            headerCells[columnIndex].style.display = isVisible ? '' : 'none';
        }
        table.querySelectorAll('tbody tr').forEach(function (row) {
            const cells = row.querySelectorAll('td');
            if (cells[columnIndex]) {
                cells[columnIndex].style.display = isVisible ? '' : 'none';
            }
        });
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.toggleUserStatus = toggleUserStatus;
