let systemfieldRecords = [];
let filteredRecords = [];
let currentType = 'student';
let currentPage = 1;
let recordsPerPage = 50;
let sortKey = 'sortOrder';
let sortDir = 'asc';

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadSystemFields();
});

function setupEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    document.querySelectorAll('.systemfield-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.systemfield-tab').forEach(function (item) {
                item.classList.remove('active');
            });
            tab.classList.add('active');
            currentType = tab.getAttribute('data-type') || 'student';
            sortKey = 'sortOrder';
            sortDir = 'asc';
            currentPage = 1;
            document.getElementById('searchInput').value = '';
            document.querySelectorAll('#systemfieldTable thead th.sortable').forEach(function (header) {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            loadSystemFields();
        });
    });

    document.querySelectorAll('#systemfieldTable thead th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            document.querySelectorAll('#systemfieldTable thead th.sortable').forEach(function (header) {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            applyFilters();
        });
    });

    setupColumnVisibility();
}

async function loadSystemFields() {
    try {
        const response = await fetch('/api/system-fields?type=' + encodeURIComponent(currentType));
        if (!response.ok) throw new Error('Failed to fetch system fields');
        systemfieldRecords = await response.json();
        applyFilters();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load system fields',
            confirmButtonColor: '#ef4444'
        });
    }
}

function applyFilters() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    filteredRecords = systemfieldRecords.filter(function (record) {
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

function renderTable() {
    const tbody = document.getElementById('systemfieldTableBody');
    if (!tbody) return;

    const records = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:40px;">No system fields found</td></tr>';
    } else {
        tbody.innerHTML = records.map(function (record) {
            const checked = record.enabled ? 'checked' : '';
            const slug = escapeHtml(record.slug || record.role || '');
            return '<tr>'
                + '<td>' + escapeHtml(record.name || '') + '</td>'
                + '<td class="action-cell">'
                + '<div class="toggle-cell">'
                + '<label class="toggle-switch">'
                + '<input type="checkbox" data-slug="' + slug + '" ' + checked + ' onchange="toggleSystemFieldStatus(this)">'
                + '<span class="toggle-slider"></span>'
                + '</label>'
                + '</div>'
                + '</td>'
                + '</tr>';
        }).join('');
    }

    applyColumnVisibility();
    updatePaginationInfo(filteredRecords.length);
}

async function toggleSystemFieldStatus(checkbox) {
    const slug = checkbox.getAttribute('data-slug');
    const enabled = checkbox.checked;
    const previousValue = !enabled;

    const result = await Swal.fire({
        title: 'Confirm Status',
        text: 'Are you sure you want to change status?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: '#10b981'
    });

    if (!result.isConfirmed) {
        checkbox.checked = previousValue;
        return;
    }

    try {
        const response = await fetch('/api/system-fields/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: currentType,
                role: slug,
                status: enabled ? 'yes' : 'no',
                enabled: enabled
            })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        const record = systemfieldRecords.find(function (item) {
            return (item.slug || item.role) === slug;
        });
        if (record) record.enabled = enabled;

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || 'Status change successfully',
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    } catch (error) {
        checkbox.checked = previousValue;
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to update system field status',
            confirmButtonColor: '#ef4444'
        });
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
    XLSX.utils.book_append_sheet(wb, ws, 'System Fields');
    XLSX.writeFile(wb, 'System-Fields-' + currentType + '.xlsx');
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
    a.download = 'System-Fields-' + currentType + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('System Fields - ' + capitalize(currentType), 14, 15);
    doc.autoTable({
        head: [['Name', 'Status']],
        body: exportRows().map(function (row) { return [row.Name, row.Status]; }),
        startY: 22
    });
    doc.save('System-Fields-' + currentType + '.pdf');
}

function handlePrint() {
    window.print();
}

function setupColumnVisibility() {
    const table = document.getElementById('systemfieldTable');
    const dropdown = document.getElementById('columnVisibilityDropdown');
    const btn = document.getElementById('columnVisibilityBtn');
    if (!table || !dropdown || !btn) return;

    if (!dropdown.dataset.initialized) {
        const headers = Array.from(table.querySelectorAll('thead th'));
        dropdown.innerHTML = '<div class="dropdown-header">Column Visibility</div><div class="dropdown-content"></div>';
        const content = dropdown.querySelector('.dropdown-content');

        headers.forEach(function (header, index) {
            const label = document.createElement('label');
            label.className = 'column-toggle-item';
            label.innerHTML = '<input type="checkbox" checked data-column="' + index + '"> ' + header.textContent.trim();
            content.appendChild(label);
        });

        btn.addEventListener('click', function (event) {
            event.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', function () {
            dropdown.classList.remove('active');
        });

        dropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        content.addEventListener('change', function (event) {
            if (event.target.matches('input[type="checkbox"]')) {
                applyColumnVisibility();
            }
        });

        dropdown.dataset.initialized = 'true';
    }

    applyColumnVisibility();
}

function applyColumnVisibility() {
    const table = document.getElementById('systemfieldTable');
    const dropdown = document.getElementById('columnVisibilityDropdown');
    if (!table || !dropdown) return;

    const toggles = dropdown.querySelectorAll('input[type="checkbox"]');
    toggles.forEach(function (toggle) {
        const index = parseInt(toggle.getAttribute('data-column'), 10);
        const visible = toggle.checked;
        table.querySelectorAll('tr').forEach(function (row) {
            const cell = row.children[index];
            if (cell) cell.style.display = visible ? '' : 'none';
        });
    });
}

function capitalize(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
