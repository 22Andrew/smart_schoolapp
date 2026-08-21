let currentTab = 'profile-update';
let dashboardWidgets = [];
let filteredWidgets = [];
let editFields = [];
let currentPage = 1;
let recordsPerPage = 50;
let sortKey = 'sortOrder';
let sortDir = 'asc';

document.addEventListener('DOMContentLoaded', function () {
    setupTabListeners();
    setupDashboardListeners();
    loadProfileUpdateSettings();
});

function setupTabListeners() {
    document.querySelectorAll('.profilesetting-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            const tabName = tab.getAttribute('data-tab') || 'profile-update';
            switchTab(tabName);
        });
    });

    document.getElementById('saveProfileUpdateBtn')?.addEventListener('click', saveProfileUpdateSettings);
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.profilesetting-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    document.getElementById('profileUpdatePanel')?.classList.toggle('active', tabName === 'profile-update');
    document.getElementById('dashboardSettingPanel')?.classList.toggle('active', tabName === 'dashboard-setting');

    if (tabName === 'dashboard-setting' && dashboardWidgets.length === 0) {
        loadDashboardWidgets();
    }
}

async function loadProfileUpdateSettings() {
    try {
        const response = await fetch('/api/profile-settings/profile-update');
        if (!response.ok) throw new Error('Failed to fetch profile settings');
        const data = await response.json();
        const allowEditable = Boolean(data.allowEditableFormFields);
        document.getElementById('allowEditableFormFields').checked = allowEditable;
        editFields = Array.isArray(data.editFields) ? data.editFields : [];
        toggleEditableFieldsSection(allowEditable);
        renderEditFieldsTable();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load profile settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function saveProfileUpdateSettings() {
    const allowEditable = document.getElementById('allowEditableFormFields').checked;
    try {
        const response = await fetch('/api/profile-settings/profile-update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allowEditableFormFields: allowEditable })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        toggleEditableFieldsSection(allowEditable);
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || 'Record saved successfully',
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save profile settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function toggleEditableFieldsSection(visible) {
    const section = document.getElementById('editableFieldsSection');
    if (!section) return;
    section.classList.toggle('hidden', !visible);
}

function renderEditFieldsTable() {
    const tbody = document.getElementById('editFieldsTableBody');
    if (!tbody) return;

    if (editFields.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:40px;">No editable fields found</td></tr>';
        return;
    }

    tbody.innerHTML = editFields.map(function (field) {
        const checked = field.enabled ? 'checked' : '';
        const slug = escapeHtml(field.slug || '');
        return '<tr>'
            + '<td>' + escapeHtml(field.name || '') + '</td>'
            + '<td class="action-cell">'
            + '<div class="toggle-cell">'
            + '<label class="toggle-switch">'
            + '<input type="checkbox" data-slug="' + slug + '" ' + checked + ' onchange="toggleEditFieldStatus(this)">'
            + '<span class="toggle-slider"></span>'
            + '</label>'
            + '</div>'
            + '</td>'
            + '</tr>';
    }).join('');
}

async function toggleEditFieldStatus(checkbox) {
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
        const response = await fetch('/api/profile-settings/edit-fields/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: slug, enabled: enabled, status: enabled ? 'yes' : 'no' })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        const field = editFields.find(function (item) { return item.slug === slug; });
        if (field) field.enabled = enabled;

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
            text: error.message || 'Failed to update field status',
            confirmButtonColor: '#ef4444'
        });
    }
}

function setupDashboardListeners() {
    document.getElementById('searchInput')?.addEventListener('input', applyDashboardFilters);
    document.getElementById('entriesSelect')?.addEventListener('change', handleEntriesChange);
    document.getElementById('copyBtn')?.addEventListener('click', handleCopy);
    document.getElementById('excelBtn')?.addEventListener('click', handleExcelExport);
    document.getElementById('csvBtn')?.addEventListener('click', handleCSVExport);
    document.getElementById('pdfBtn')?.addEventListener('click', handlePDFExport);
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);

    document.querySelectorAll('#dashboardWidgetsTable thead th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            document.querySelectorAll('#dashboardWidgetsTable thead th.sortable').forEach(function (header) {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            applyDashboardFilters();
        });
    });

    setupColumnVisibility();
}

async function loadDashboardWidgets() {
    try {
        const response = await fetch('/api/profile-settings/dashboard-widgets');
        if (!response.ok) throw new Error('Failed to fetch dashboard widgets');
        dashboardWidgets = await response.json();
        applyDashboardFilters();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load dashboard widgets',
            confirmButtonColor: '#ef4444'
        });
    }
}

function applyDashboardFilters() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    filteredWidgets = dashboardWidgets.filter(function (record) {
        return String(record.name || '').toLowerCase().includes(searchTerm);
    });

    if (sortKey) {
        filteredWidgets.sort(function (a, b) {
            if (sortKey === 'sortOrder') {
                const left = Number(a.sortOrder) || 0;
                const right = Number(b.sortOrder) || 0;
                if (left < right) return sortDir === 'asc' ? -1 : 1;
                if (left > right) return sortDir === 'asc' ? 1 : -1;
                return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
            }
            if (sortKey === 'studentEnabled' || sortKey === 'parentEnabled') {
                const left = a[sortKey] ? 1 : 0;
                const right = b[sortKey] ? 1 : 0;
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
    renderDashboardTable();
}

function renderDashboardTable() {
    const tbody = document.getElementById('dashboardWidgetsTableBody');
    if (!tbody) return;

    const records = filteredWidgets.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:40px;">No dashboard widgets found</td></tr>';
    } else {
        tbody.innerHTML = records.map(function (record) {
            const studentChecked = record.studentEnabled ? 'checked' : '';
            const parentChecked = record.parentEnabled ? 'checked' : '';
            const slug = escapeHtml(record.slug || '');
            return '<tr>'
                + '<td>' + escapeHtml(record.name || '') + '</td>'
                + '<td class="toggle-col">'
                + '<div class="toggle-cell">'
                + '<label class="toggle-switch">'
                + '<input type="checkbox" data-slug="' + slug + '" data-panel="student" ' + studentChecked + ' onchange="toggleDashboardWidgetStatus(this)">'
                + '<span class="toggle-slider"></span>'
                + '</label>'
                + '</div>'
                + '</td>'
                + '<td class="toggle-col">'
                + '<div class="toggle-cell">'
                + '<label class="toggle-switch">'
                + '<input type="checkbox" data-slug="' + slug + '" data-panel="parent" ' + parentChecked + ' onchange="toggleDashboardWidgetStatus(this)">'
                + '<span class="toggle-slider"></span>'
                + '</label>'
                + '</div>'
                + '</td>'
                + '</tr>';
        }).join('');
    }

    applyColumnVisibility();
    updatePaginationInfo(filteredWidgets.length);
}

async function toggleDashboardWidgetStatus(checkbox) {
    const slug = checkbox.getAttribute('data-slug');
    const panel = checkbox.getAttribute('data-panel') || 'student';
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
        const response = await fetch('/api/profile-settings/dashboard-widgets/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: slug,
                panel: panel,
                enabled: enabled,
                status: enabled ? 'yes' : 'no'
            })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        const record = dashboardWidgets.find(function (item) { return item.slug === slug; });
        if (record) {
            if (panel === 'parent') {
                record.parentEnabled = enabled;
            } else {
                record.studentEnabled = enabled;
            }
        }

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
            text: error.message || 'Failed to update dashboard widget status',
            confirmButtonColor: '#ef4444'
        });
    }
}

function handleEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderDashboardTable();
}

function updatePaginationInfo(totalRecords) {
    document.getElementById('showingStart').textContent = totalRecords > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0;
    document.getElementById('showingEnd').textContent = Math.min(currentPage * recordsPerPage, totalRecords);
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
            renderDashboardTable();
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
            renderDashboardTable();
        }
    };
    paginationDiv.appendChild(nextBtn);
}

function exportRows() {
    return filteredWidgets.map(function (record) {
        return {
            Name: record.name,
            Student: record.studentEnabled ? 'Enabled' : 'Disabled',
            Parent: record.parentEnabled ? 'Enabled' : 'Disabled'
        };
    });
}

function handleCopy() {
    const header = 'Name\tStudent\tParent';
    const body = exportRows().map(function (row) { return row.Name + '\t' + row.Student + '\t' + row.Parent; }).join('\n');
    navigator.clipboard.writeText(header + '\n' + body).then(function () {
        Swal.fire({ icon: 'success', title: 'Copied!', text: 'Table data copied to clipboard', confirmButtonColor: '#10b981', timer: 1500, timerProgressBar: true });
    });
}

function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Setting');
    XLSX.writeFile(wb, 'Dashboard-Setting.xlsx');
}

function handleCSVExport() {
    const csvData = [['Name', 'Student', 'Parent']].concat(exportRows().map(function (row) { return [row.Name, row.Student, row.Parent]; }));
    const csvContent = csvData.map(function (row) {
        return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dashboard-Setting.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function handlePDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Dashboard Setting', 14, 15);
    doc.autoTable({
        head: [['Name', 'Student', 'Parent']],
        body: exportRows().map(function (row) { return [row.Name, row.Student, row.Parent]; }),
        startY: 22
    });
    doc.save('Dashboard-Setting.pdf');
}

function handlePrint() {
    window.print();
}

function setupColumnVisibility() {
    const table = document.getElementById('dashboardWidgetsTable');
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
        document.addEventListener('click', function () { dropdown.classList.remove('active'); });
        dropdown.addEventListener('click', function (event) { event.stopPropagation(); });
        content.addEventListener('change', function () { applyColumnVisibility(); });
        dropdown.dataset.initialized = 'true';
    }
    applyColumnVisibility();
}

function applyColumnVisibility() {
    const table = document.getElementById('dashboardWidgetsTable');
    const dropdown = document.getElementById('columnVisibilityDropdown');
    if (!table || !dropdown) return;
    dropdown.querySelectorAll('input[type="checkbox"]').forEach(function (toggle) {
        const index = parseInt(toggle.getAttribute('data-column'), 10);
        table.querySelectorAll('tr').forEach(function (row) {
            const cell = row.children[index];
            if (cell) cell.style.display = toggle.checked ? '' : 'none';
        });
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
