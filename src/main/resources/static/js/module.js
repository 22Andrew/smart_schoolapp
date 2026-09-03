let moduleRecords = [];
let filteredRecords = [];
let currentType = 'system';
let currentPage = 1;
let recordsPerPage = 50;
let sortKey = 'sortOrder';
let sortDir = 'asc';

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadModules();
});

function setupEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    document.querySelectorAll('.module-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.module-tab').forEach(function (item) {
                item.classList.remove('active');
            });
            tab.classList.add('active');
            currentType = tab.getAttribute('data-type') || 'system';
            sortKey = 'sortOrder';
            sortDir = 'asc';
            currentPage = 1;
            document.querySelectorAll('#modulesTable thead th.sortable').forEach(function (header) {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            loadModules();
        });
    });

    document.querySelectorAll('#modulesTable thead th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            document.querySelectorAll('#modulesTable thead th.sortable').forEach(function (header) {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            applyFilters();
        });
    });

    setupColumnVisibility();
}

async function loadModules() {
    try {
        const response = await fetch('/api/modules?type=' + encodeURIComponent(currentType));
        if (!response.ok) throw new Error('Failed to fetch modules');
        moduleRecords = await response.json();
        applyFilters();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load modules',
            confirmButtonColor: '#ef4444'
        });
    }
}

function applyFilters() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    filteredRecords = moduleRecords.filter(function (record) {
        return String(record.name || '').toLowerCase().includes(searchTerm);
    });

    if (sortKey) {
        filteredRecords.sort(function (a, b) {
            if (sortKey === 'sortOrder') {
                const left = Number(a.sortOrder) || 0;
                const right = Number(b.sortOrder) || 0;
                if (left < right) return sortDir === 'asc' ? -1 : 1;
                if (left > right) return sortDir === 'asc' ? 1 : -1;
                return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
            }
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
    const tbody = document.getElementById('modulesTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    if (!paginatedRecords.length) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:40px;">No modules found</td></tr>';
    } else {
        tbody.innerHTML = paginatedRecords.map(function (record) {
            const checked = record.enabled ? 'checked' : '';
            return ''
                + '<tr>'
                + '<td>' + escapeHtml(record.name) + '</td>'
                + '<td>'
                + '<label class="toggle-switch">'
                + '<input type="checkbox" ' + checked + ' onchange="toggleModuleStatus(' + record.id + ', this.checked)">'
                + '<span class="toggle-slider"></span>'
                + '</label>'
                + '</td>'
                + '</tr>';
        }).join('');
    }

    applyColumnVisibility();
    updatePaginationInfo(records.length);
}

async function toggleModuleStatus(id, enabled) {
    try {
        const response = await fetch('/api/modules/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: enabled })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        const record = moduleRecords.find(function (item) { return item.id === id; });
        if (record) record.enabled = enabled;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to update module status',
            confirmButtonColor: '#ef4444'
        });
        loadModules();
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
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1 || totalRecords === 0;
    prevBtn.onclick = function () {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    };
    paginationDiv.appendChild(prevBtn);

    const pageBtn = document.createElement('button');
    pageBtn.className = 'pagination-btn active';
    pageBtn.textContent = String(currentPage);
    paginationDiv.appendChild(pageBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next';
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
    return filteredRecords.map(function (record) {
        return {
            Name: record.name,
            Status: record.enabled ? 'Enabled' : 'Disabled'
        };
    });
}

function handleCopy() {
    const header = 'Name\tStatus';
    const body = exportRows().map(function (row) {
        return row.Name + '\t' + row.Status;
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
    XLSX.utils.book_append_sheet(wb, ws, 'Modules');
    XLSX.writeFile(wb, 'Modules-' + currentType + '.xlsx');
}

function handleCSVExport() {
    const csvData = [['Name', 'Status']].concat(
        exportRows().map(function (row) { return [row.Name, row.Status]; })
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
    a.download = 'Modules-' + currentType + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.autoTable({
        head: [['Name', 'Status']],
        body: exportRows().map(function (row) { return [row.Name, row.Status]; }),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
    });
    doc.save('Modules-' + currentType + '.pdf');
}

function handlePrint() {
    window.print();
}

function setupColumnVisibility() {
    const dropdown = document.getElementById('columnVisibilityDropdown');
    if (dropdown) {
        dropdown.innerHTML = ''
            + '<div class="dropdown-header"><span>Toggle Columns</span></div>'
            + '<div class="dropdown-content">'
            + '<label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="0" checked><span>Name</span></label>'
            + '<label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="1" checked><span>Action</span></label>'
            + '</div>';
        dropdown.querySelectorAll('.column-toggle').forEach(function (toggle) {
            toggle.addEventListener('change', applyColumnVisibility);
        });
    }

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
    const table = document.getElementById('modulesTable');
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

window.toggleModuleStatus = toggleModuleStatus;
