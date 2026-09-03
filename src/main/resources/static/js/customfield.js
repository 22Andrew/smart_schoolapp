let belongToOptions = [];
let fieldTypes = [];
let groupedFields = {};
let editingId = null;
let dragSourceId = null;

document.addEventListener('DOMContentLoaded', function () {
    setupForm();
    loadCustomFields();
});

function setupForm() {
    document.getElementById('customFieldForm').addEventListener('submit', handleSave);
    document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
}

async function loadCustomFields() {
    try {
        const response = await fetch('/api/custom-fields');
        if (!response.ok) throw new Error('Failed to load custom fields');
        const data = await response.json();
        belongToOptions = data.belongToOptions || [];
        fieldTypes = data.fieldTypes || [];
        groupedFields = data.groupedFields || {};
        populateSelect('belongTo', belongToOptions);
        populateSelect('fieldType', fieldTypes);
        renderAccordion();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load custom fields',
            confirmButtonColor: '#ef4444'
        });
    }
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select</option>' + options.map(function (option) {
        return '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.label) + '</option>';
    }).join('');
    if (currentValue) {
        select.value = currentValue;
    }
}

function renderAccordion() {
    const container = document.getElementById('customFieldAccordion');
    if (!container) return;

    if (!belongToOptions.length) {
        container.innerHTML = '<p class="loading-text">No categories available.</p>';
        return;
    }

    container.innerHTML = belongToOptions.map(function (option, index) {
        const fields = groupedFields[option.value] || [];
        const openClass = index === 0 ? ' open' : '';
        const toggleSymbol = index === 0 ? '−' : '+';

        return ''
            + '<div class="customfield-panel' + openClass + '" data-belong-to="' + escapeHtml(option.value) + '">'
            + '<div class="customfield-panel-header" data-action="toggle">'
            + '<span>' + escapeHtml(option.label) + '</span>'
            + '<span class="customfield-panel-toggle">' + toggleSymbol + '</span>'
            + '</div>'
            + '<div class="customfield-panel-body">'
            + renderFieldItems(option.value, fields)
            + '</div>'
            + '</div>';
    }).join('');

    container.querySelectorAll('.customfield-panel-header').forEach(function (header) {
        header.addEventListener('click', function () {
            togglePanel(header.closest('.customfield-panel'));
        });
    });

    container.querySelectorAll('[data-action="edit"]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const fieldId = Number(button.getAttribute('data-id'));
            editField(fieldId);
        });
    });

    container.querySelectorAll('[data-action="delete"]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const fieldId = Number(button.getAttribute('data-id'));
            deleteField(fieldId);
        });
    });

    setupDragAndDrop(container);
}

function renderFieldItems(belongTo, fields) {
    if (!fields.length) {
        return '<div class="customfield-empty">No record found</div>';
    }

    return '<ul class="customfield-items" data-belong-to="' + escapeHtml(belongTo) + '">'
        + fields.map(function (field) {
            return ''
                + '<li class="customfield-item" draggable="true" data-id="' + field.id + '">'
                + '<div class="customfield-item-name">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<line x1="8" y1="6" x2="21" y2="6"></line>'
                + '<line x1="8" y1="12" x2="21" y2="12"></line>'
                + '<line x1="8" y1="18" x2="21" y2="18"></line>'
                + '<line x1="3" y1="6" x2="3.01" y2="6"></line>'
                + '<line x1="3" y1="12" x2="3.01" y2="12"></line>'
                + '<line x1="3" y1="18" x2="3.01" y2="18"></line>'
                + '</svg>'
                + '<span>' + escapeHtml(field.name) + '</span>'
                + '</div>'
                + '<div class="customfield-item-actions">'
                + '<button type="button" class="customfield-action-btn" data-action="edit" data-id="' + field.id + '" title="Edit">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<path d="M12 20h9"></path>'
                + '<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>'
                + '</svg>'
                + '</button>'
                + '<button type="button" class="customfield-action-btn delete" data-action="delete" data-id="' + field.id + '" title="Delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<line x1="18" y1="6" x2="6" y2="18"></line>'
                + '<line x1="6" y1="6" x2="18" y2="18"></line>'
                + '</svg>'
                + '</button>'
                + '</div>'
                + '</li>';
        }).join('')
        + '</ul>';
}

function togglePanel(panel) {
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    document.querySelectorAll('.customfield-panel').forEach(function (item) {
        item.classList.remove('open');
        const toggle = item.querySelector('.customfield-panel-toggle');
        if (toggle) toggle.textContent = '+';
    });
    if (!isOpen) {
        panel.classList.add('open');
        const toggle = panel.querySelector('.customfield-panel-toggle');
        if (toggle) toggle.textContent = '−';
    }
}

function findFieldById(id) {
    for (const key of Object.keys(groupedFields)) {
        const match = (groupedFields[key] || []).find(function (field) {
            return Number(field.id) === Number(id);
        });
        if (match) return match;
    }
    return null;
}

function editField(id) {
    const field = findFieldById(id);
    if (!field) return;

    editingId = field.id;
    document.getElementById('fieldId').value = field.id;
    document.getElementById('belongTo').value = field.belongTo;
    document.getElementById('fieldType').value = field.fieldType;
    document.getElementById('fieldName').value = field.name;
    document.getElementById('bsColumn').value = field.bsColumn || 12;
    document.getElementById('fieldValues').value = field.fieldValues || '';
    document.getElementById('requiredField').checked = !!field.requiredField;
    document.getElementById('visibleOnTable').checked = !!field.visibleOnTable;
    document.getElementById('formTitle').textContent = 'Edit Custom Field';
    document.getElementById('saveBtn').textContent = 'Save';
    document.getElementById('cancelEditBtn').hidden = false;

    const panel = document.querySelector('.customfield-panel[data-belong-to="' + field.belongTo + '"]');
    togglePanel(panel);
    document.querySelector('.customfield-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
    editingId = null;
    document.getElementById('customFieldForm').reset();
    document.getElementById('fieldId').value = '';
    document.getElementById('bsColumn').value = '12';
    document.getElementById('formTitle').textContent = 'Add Custom Field';
    document.getElementById('saveBtn').textContent = 'Save';
    document.getElementById('cancelEditBtn').hidden = true;
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        belongTo: document.getElementById('belongTo').value,
        fieldType: document.getElementById('fieldType').value,
        name: document.getElementById('fieldName').value.trim(),
        bsColumn: document.getElementById('bsColumn').value,
        fieldValues: document.getElementById('fieldValues').value.trim(),
        requiredField: document.getElementById('requiredField').checked,
        visibleOnTable: document.getElementById('visibleOnTable').checked
    };

    const url = editingId ? '/api/custom-fields/' + editingId : '/api/custom-fields';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        groupedFields = data.groupedFields || groupedFields;
        renderAccordion();
        resetForm();

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message,
            confirmButtonColor: '#10b981',
            timer: 1800,
            timerProgressBar: true
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save custom field',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function deleteField(id) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Delete custom field?',
        text: 'This action cannot be undone.',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Delete'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch('/api/custom-fields/' + id, { method: 'DELETE' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        groupedFields = data.groupedFields || groupedFields;
        if (editingId === id) resetForm();
        renderAccordion();

        Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: data.message,
            confirmButtonColor: '#10b981',
            timer: 1500,
            timerProgressBar: true
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete custom field',
            confirmButtonColor: '#ef4444'
        });
    }
}

function setupDragAndDrop(container) {
    container.querySelectorAll('.customfield-item').forEach(function (item) {
        item.addEventListener('dragstart', function () {
            dragSourceId = item.getAttribute('data-id');
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', function () {
            item.classList.remove('dragging');
            dragSourceId = null;
        });

        item.addEventListener('dragover', function (event) {
            event.preventDefault();
        });

        item.addEventListener('drop', function (event) {
            event.preventDefault();
            const targetId = item.getAttribute('data-id');
            if (!dragSourceId || dragSourceId === targetId) return;

            const list = item.closest('.customfield-items');
            const belongTo = list.getAttribute('data-belong-to');
            const ids = Array.from(list.querySelectorAll('.customfield-item')).map(function (node) {
                return Number(node.getAttribute('data-id'));
            });

            const fromIndex = ids.indexOf(Number(dragSourceId));
            const toIndex = ids.indexOf(Number(targetId));
            if (fromIndex < 0 || toIndex < 0) return;

            ids.splice(fromIndex, 1);
            ids.splice(toIndex, 0, Number(dragSourceId));
            saveOrder(belongTo, ids);
        });
    });
}

async function saveOrder(belongTo, ids) {
    try {
        const response = await fetch('/api/custom-fields/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ belongTo: belongTo, ids: ids })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        groupedFields = data.groupedFields || groupedFields;
        renderAccordion();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to update order',
            confirmButtonColor: '#ef4444'
        });
        renderAccordion();
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
