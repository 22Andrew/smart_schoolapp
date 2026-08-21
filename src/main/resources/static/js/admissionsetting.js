let formSettings = {};
let fieldRecords = [];
let filteredFields = [];
let currentPage = 1;
let recordsPerPage = 50;
let sortKey = 'sortOrder';
let sortDir = 'asc';
let instructionsEditor = null;
let termsEditor = null;

document.addEventListener('DOMContentLoaded', function () {
    setupTabs();
    setupFormListeners();
    setupFieldListeners();
    initEditors();
    loadFormSettings();
});

function setupTabs() {
    document.querySelectorAll('.admissionsetting-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            switchTab(tab.getAttribute('data-tab'));
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.admissionsetting-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    document.getElementById('formSettingPanel')?.classList.toggle('active', tabName === 'form-setting');
    document.getElementById('fieldsSettingPanel')?.classList.toggle('active', tabName === 'fields-setting');
    if (tabName === 'fields-setting' && fieldRecords.length === 0) {
        loadFieldSettings();
    }
}

function setupFormListeners() {
    document.getElementById('saveFormSettingBtn')?.addEventListener('click', saveFormSettings);
    document.getElementById('downloadApplicationFormBtn')?.addEventListener('click', downloadApplicationForm);

    const dropzone = document.getElementById('applicationFormDropzone');
    const fileInput = document.getElementById('applicationFormInput');
    if (dropzone && fileInput) {
        dropzone.addEventListener('click', function () { fileInput.click(); });
        dropzone.addEventListener('dragover', function (event) {
            event.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', function () {
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', function (event) {
            event.preventDefault();
            dropzone.classList.remove('dragover');
            if (event.dataTransfer.files.length) {
                fileInput.files = event.dataTransfer.files;
                updateDropzoneLabel(event.dataTransfer.files[0].name);
            }
        });
        fileInput.addEventListener('change', function () {
            if (fileInput.files.length) {
                updateDropzoneLabel(fileInput.files[0].name);
            }
        });
    }
}

function setupFieldListeners() {
    document.getElementById('fieldSearchInput')?.addEventListener('input', applyFieldFilters);
    document.getElementById('fieldEntriesSelect')?.addEventListener('change', handleFieldEntriesChange);
    document.getElementById('fieldCopyBtn')?.addEventListener('click', handleFieldCopy);
    document.getElementById('fieldExcelBtn')?.addEventListener('click', handleFieldExcelExport);
    document.getElementById('fieldCsvBtn')?.addEventListener('click', handleFieldCSVExport);
    document.getElementById('fieldPdfBtn')?.addEventListener('click', handleFieldPDFExport);
    document.getElementById('fieldPrintBtn')?.addEventListener('click', handleFieldPrint);

    document.querySelectorAll('#admissionFieldsTable thead th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            document.querySelectorAll('#admissionFieldsTable thead th.sortable').forEach(function (header) {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            applyFieldFilters();
        });
    });

    setupFieldColumnVisibility();
}

function initEditors() {
    if (typeof CKEDITOR === 'undefined') {
        return;
    }
    if (document.getElementById('onlineAdmissionInstructions')) {
        instructionsEditor = CKEDITOR.replace('onlineAdmissionInstructions', { height: 220 });
    }
    if (document.getElementById('onlineAdmissionTerms')) {
        termsEditor = CKEDITOR.replace('onlineAdmissionTerms', { height: 220 });
    }
}

async function loadFormSettings() {
    try {
        const response = await fetch('/api/online-admission-settings/form');
        if (!response.ok) throw new Error('Failed to load online admission settings');
        formSettings = await response.json();
        populateFormSettings();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load settings', confirmButtonColor: '#ef4444' });
    }
}

function populateFormSettings() {
    document.getElementById('onlineAdmissionEnabled').checked = !!formSettings.onlineAdmissionEnabled;
    document.getElementById('onlineAdmissionPaymentOption').checked = !!formSettings.paymentOptionEnabled;
    document.getElementById('onlineAdmissionFormFees').value = formSettings.formFees || '100.00';

    const downloadBtn = document.getElementById('downloadApplicationFormBtn');
    if (downloadBtn) {
        downloadBtn.disabled = !formSettings.applicationFormPath;
    }

    if (formSettings.applicationFormName) {
        updateDropzoneLabel(formSettings.applicationFormName);
    }

    if (instructionsEditor) {
        instructionsEditor.setData(formSettings.instructions || '');
    } else {
        document.getElementById('onlineAdmissionInstructions').value = formSettings.instructions || '';
    }

    if (termsEditor) {
        termsEditor.setData(formSettings.termsConditions || '');
    } else {
        document.getElementById('onlineAdmissionTerms').value = formSettings.termsConditions || '';
    }
}

async function saveFormSettings() {
    const formData = new FormData();
    formData.append('onlineAdmissionEnabled', document.getElementById('onlineAdmissionEnabled').checked ? 'true' : 'false');
    formData.append('paymentOptionEnabled', document.getElementById('onlineAdmissionPaymentOption').checked ? 'true' : 'false');
    formData.append('formFees', document.getElementById('onlineAdmissionFormFees').value || '0');
    formData.append('instructions', instructionsEditor ? instructionsEditor.getData() : document.getElementById('onlineAdmissionInstructions').value);
    formData.append('termsConditions', termsEditor ? termsEditor.getData() : document.getElementById('onlineAdmissionTerms').value);

    const fileInput = document.getElementById('applicationFormInput');
    if (fileInput && fileInput.files.length) {
        formData.append('applicationForm', fileInput.files[0]);
    }

    try {
        const response = await fetch('/api/online-admission-settings/form', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        formSettings = data.data || formSettings;
        populateFormSettings();
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || 'Record saved successfully',
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save settings', confirmButtonColor: '#ef4444' });
    }
}

function downloadApplicationForm() {
    if (!formSettings.applicationFormPath) {
        Swal.fire({ icon: 'info', title: 'No File', text: 'No admission application form uploaded yet.', confirmButtonColor: '#8b5cf6' });
        return;
    }
    window.open(formSettings.applicationFormPath, '_blank');
}

function updateDropzoneLabel(name) {
    const label = document.getElementById('applicationFormDropzoneText');
    if (label) {
        label.textContent = name || 'Drag and drop a file here or click';
    }
}

async function loadFieldSettings() {
    try {
        const response = await fetch('/api/online-admission-settings/fields');
        if (!response.ok) throw new Error('Failed to load online admission fields');
        fieldRecords = await response.json();
        applyFieldFilters();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load fields', confirmButtonColor: '#ef4444' });
    }
}

function applyFieldFilters() {
    const searchTerm = (document.getElementById('fieldSearchInput')?.value || '').toLowerCase();
    filteredFields = fieldRecords.filter(function (record) {
        return String(record.name || '').toLowerCase().includes(searchTerm)
            || String(record.fieldSource || '').toLowerCase().includes(searchTerm);
    });

    if (sortKey) {
        filteredFields.sort(function (a, b) {
            if (sortKey === 'sortOrder') {
                const left = Number(a.sortOrder) || 0;
                const right = Number(b.sortOrder) || 0;
                if (left < right) return sortDir === 'asc' ? -1 : 1;
                if (left > right) return sortDir === 'asc' ? 1 : -1;
                return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
            }
            if (sortKey === 'enabled') {
                const left = a.enabled ? 1 : 0;
                const right = b.enabled ? 1 : 0;
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
    renderFieldTable();
}

function renderFieldTable() {
    const tbody = document.getElementById('admissionFieldsTableBody');
    if (!tbody) return;

    const records = filteredFields.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:40px;">No fields found</td></tr>';
    } else {
        tbody.innerHTML = records.map(function (record) {
            const checked = record.enabled ? 'checked' : '';
            const slug = escapeHtml(record.slug || '');
            const typeClass = record.fieldSource === 'CUSTOM' ? 'custom' : '';
            const typeLabel = record.fieldSource === 'CUSTOM' ? 'Custom' : 'System';
            return '<tr>'
                + '<td>' + escapeHtml(record.name || '') + ' <span class="field-type-badge ' + typeClass + '">' + typeLabel + '</span></td>'
                + '<td class="action-cell">'
                + '<div class="toggle-cell">'
                + '<label class="toggle-switch">'
                + '<input type="checkbox" data-slug="' + slug + '" ' + checked + ' onchange="toggleAdmissionFieldStatus(this)">'
                + '<span class="toggle-slider"></span>'
                + '</label>'
                + '</div>'
                + '</td>'
                + '</tr>';
        }).join('');
    }

    applyFieldColumnVisibility();
    updateFieldPagination(filteredFields.length);
}

async function toggleAdmissionFieldStatus(checkbox) {
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
        const response = await fetch('/api/online-admission-settings/fields/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: slug, enabled: enabled, status: enabled ? 'yes' : 'no' })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        const record = fieldRecords.find(function (item) { return item.slug === slug; });
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
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to update field status', confirmButtonColor: '#ef4444' });
    }
}

function handleFieldEntriesChange(event) {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderFieldTable();
}

function updateFieldPagination(total) {
    const start = total === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
    const end = Math.min(currentPage * recordsPerPage, total);
    document.getElementById('fieldShowingStart').textContent = start;
    document.getElementById('fieldShowingEnd').textContent = end;
    document.getElementById('fieldTotalEntries').textContent = total;

    const pagination = document.getElementById('fieldPagination');
    if (!pagination) return;
    const totalPages = Math.max(1, Math.ceil(total / recordsPerPage));
    let html = '';
    html += '<button type="button" ' + (currentPage === 1 ? 'disabled' : '') + ' onclick="goToFieldPage(' + (currentPage - 1) + ')">&lt;</button>';
    for (let i = 1; i <= totalPages; i++) {
        html += '<button type="button" class="' + (i === currentPage ? 'active' : '') + '" onclick="goToFieldPage(' + i + ')">' + i + '</button>';
    }
    html += '<button type="button" ' + (currentPage === totalPages ? 'disabled' : '') + ' onclick="goToFieldPage(' + (currentPage + 1) + ')">&gt;</button>';
    pagination.innerHTML = html;
}

function goToFieldPage(page) {
    const totalPages = Math.max(1, Math.ceil(filteredFields.length / recordsPerPage));
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderFieldTable();
}

function fieldExportRows() {
    return filteredFields.map(function (record) {
        return {
            Name: record.name,
            Type: record.fieldSource === 'CUSTOM' ? 'Custom' : 'System',
            Status: record.enabled ? 'Enabled' : 'Disabled'
        };
    });
}

function handleFieldCopy() {
    const header = 'Name\tType\tStatus';
    const body = fieldExportRows().map(function (row) { return row.Name + '\t' + row.Type + '\t' + row.Status; }).join('\n');
    navigator.clipboard.writeText(header + '\n' + body).then(function () {
        Swal.fire({ icon: 'success', title: 'Copied!', text: 'Table data copied to clipboard', confirmButtonColor: '#10b981', timer: 1500, timerProgressBar: true });
    });
}

function handleFieldExcelExport() {
    const ws = XLSX.utils.json_to_sheet(fieldExportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Online Admission Fields');
    XLSX.writeFile(wb, 'online-admission-fields.xlsx');
}

function handleFieldCSVExport() {
    const csvData = [['Name', 'Type', 'Status']].concat(fieldExportRows().map(function (row) { return [row.Name, row.Type, row.Status]; }));
    const csvContent = csvData.map(function (row) {
        return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'online-admission-fields.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

function handleFieldPDFExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Online Admission Fields Setting', 14, 16);
    doc.autoTable({
        head: [['Name', 'Type', 'Status']],
        body: fieldExportRows().map(function (row) { return [row.Name, row.Type, row.Status]; }),
        startY: 22
    });
    doc.save('online-admission-fields.pdf');
}

function handleFieldPrint() {
    window.print();
}

function setupFieldColumnVisibility() {
    const table = document.getElementById('admissionFieldsTable');
    const dropdown = document.getElementById('fieldColumnVisibilityDropdown');
    const btn = document.getElementById('fieldColumnVisibilityBtn');
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
        content.addEventListener('change', function () { applyFieldColumnVisibility(); });
        dropdown.dataset.initialized = 'true';
    }
    applyFieldColumnVisibility();
}

function applyFieldColumnVisibility() {
    const table = document.getElementById('admissionFieldsTable');
    const dropdown = document.getElementById('fieldColumnVisibilityDropdown');
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
