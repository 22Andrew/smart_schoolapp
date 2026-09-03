document.addEventListener('DOMContentLoaded', function () {
    const marksDivisionForm = document.getElementById('marksDivisionForm');
    const divisionIdInput = document.getElementById('divisionId');
    const formTitle = document.getElementById('formPanelTitle');
    const saveBtn = document.getElementById('saveDivisionBtn');
    const tableBody = document.getElementById('divisionTableBody');

    let divisions = [];
    let editingId = null;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatPercent(value) {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return '0.00';
        }
        return num.toFixed(2);
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function renderTable() {
        if (!divisions.length) {
            tableBody.innerHTML = '<tr><td colspan="4" class="empty-cell">No marks divisions found</td></tr>';
            return;
        }

        tableBody.innerHTML = divisions.map(function (item) {
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td><a href="#" class="division-name-link" data-action="edit" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.divisionName) + '</a></td>'
                + '<td>' + formatPercent(item.percentFrom) + '</td>'
                + '<td>' + formatPercent(item.percentUpto) + '</td>'
                + '<td><div class="action-btns">'
                + '<button type="button" class="action-btn" data-action="edit" data-id="' + escapeHtml(item.id) + '" title="Edit">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
                + '</button>'
                + '<button type="button" class="action-btn delete-btn" data-action="delete" data-id="' + escapeHtml(item.id) + '" title="Delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                + '</button>'
                + '</div></td>'
                + '</tr>';
        }).join('');
    }

    function resetForm() {
        marksDivisionForm.reset();
        divisionIdInput.value = '';
        editingId = null;
        formTitle.textContent = 'Add Marks Division';
        saveBtn.textContent = 'Save';
    }

    function populateForm(item) {
        editingId = item.id;
        divisionIdInput.value = item.id;
        formTitle.textContent = 'Edit Marks Division';
        saveBtn.textContent = 'Update';
        document.getElementById('divisionName').value = item.divisionName || '';
        document.getElementById('percentFrom').value = item.percentFrom != null ? item.percentFrom : '';
        document.getElementById('percentUpto').value = item.percentUpto != null ? item.percentUpto : '';
    }

    function buildPayload() {
        return {
            divisionName: document.getElementById('divisionName').value.trim(),
            percentFrom: document.getElementById('percentFrom').value,
            percentUpto: document.getElementById('percentUpto').value
        };
    }

    async function loadDivisions() {
        divisions = await fetchJson('/api/marks-divisions');
        renderTable();
    }

    async function handleDelete(id) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete division?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) {
            return;
        }
        await fetchJson('/api/marks-divisions/' + id, { method: 'DELETE' });
        showSuccess('Marks division deleted successfully!');
        if (String(editingId) === String(id)) {
            resetForm();
        }
        await loadDivisions();
    }

    marksDivisionForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload.divisionName) {
            showError({ message: 'Division name is required.' });
            return;
        }

        const url = editingId ? '/api/marks-divisions/' + editingId : '/api/marks-divisions';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetchJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showSuccess(response.message || 'Marks division saved successfully!');
            resetForm();
            await loadDivisions();
        } catch (error) {
            showError(error);
        }
    });

    tableBody.addEventListener('click', async function (event) {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) {
            return;
        }
        event.preventDefault();
        const action = actionEl.getAttribute('data-action');
        const id = actionEl.getAttribute('data-id');
        const item = divisions.find(function (row) {
            return String(row.id) === String(id);
        });
        if (!item) {
            return;
        }

        if (action === 'edit') {
            populateForm(item);
            document.querySelector('.division-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (action === 'delete') {
            try {
                await handleDelete(id);
            } catch (error) {
                showError(error);
            }
        }
    });

    loadDivisions().catch(showError);
});
