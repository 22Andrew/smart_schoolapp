document.addEventListener('DOMContentLoaded', function () {
    let assignments = [];
    let parameters = [];
    let observations = [];
    let terms = [];
    let observationOptions = [];

    let assignPage = 1;
    let assignPageSize = 100;
    let editingAssignId = null;

    let parameterPage = 1;
    let parameterPageSize = 50;
    let editingParameterId = null;

    let observationPage = 1;
    let observationPageSize = 50;
    let editingObservationId = null;

    const assignTableBody = document.getElementById('assignTableBody');
    const assignShowingInfo = document.getElementById('assignShowingInfo');
    const assignPagination = document.getElementById('assignPagination');
    const assignSearchInput = document.getElementById('assignSearchInput');
    const assignEntriesSelect = document.getElementById('assignEntriesSelect');

    const parameterTableBody = document.getElementById('parameterTableBody');
    const parameterShowingInfo = document.getElementById('parameterShowingInfo');
    const parameterPagination = document.getElementById('parameterPagination');
    const parameterSearchInput = document.getElementById('parameterSearchInput');
    const parameterEntriesSelect = document.getElementById('parameterEntriesSelect');

    const observationTableBody = document.getElementById('observationTableBody');
    const observationShowingInfo = document.getElementById('observationShowingInfo');
    const observationPagination = document.getElementById('observationPagination');
    const observationSearchInput = document.getElementById('observationSearchInput');
    const observationEntriesSelect = document.getElementById('observationEntriesSelect');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: (error && error.message) || 'Something went wrong.',
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
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    async function fetchList(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        return response.json();
    }

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>'
            + '</button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
            + '</button>';
    }

    function openModal(modal) {
        if (!modal) return;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.hidden = true;
        if (!document.querySelector('.cbse-modal:not([hidden])')) {
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', function () {
            const modal = el.closest('.cbse-modal');
            closeModal(modal);
        });
    });

    function renderPagination(container, current, totalPages, onChange) {
        container.innerHTML = ''
            + '<button type="button" class="pagination-btn" data-page="' + (current - 1) + '" ' + (current <= 1 ? 'disabled' : '') + '>&lsaquo;</button>'
            + '<button type="button" class="pagination-btn active">' + current + '</button>'
            + '<button type="button" class="pagination-btn" data-page="' + (current + 1) + '" ' + (current >= totalPages ? 'disabled' : '') + '>&rsaquo;</button>';
        container.querySelectorAll('.pagination-btn[data-page]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const page = Number(btn.getAttribute('data-page'));
                if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
                    onChange(page);
                }
            });
        });
    }

    function paginate(items, page, size) {
        const total = items.length;
        const totalPages = Math.max(1, Math.ceil(total / size) || 1);
        const safePage = Math.min(Math.max(page, 1), totalPages);
        const start = (safePage - 1) * size;
        return {
            total: total,
            totalPages: totalPages,
            page: safePage,
            slice: items.slice(start, start + size)
        };
    }

    function buildEmptyAssignRow() {
        return '<tr><td colspan="5" class="empty-state-cell">'
            + '<div class="empty-state-box">'
            + '<div class="empty-title">No data available in table</div>'
            + '<div class="empty-subtitle">&larr; Add new record or search with different criteria.</div>'
            + '</div></td></tr>';
    }

    function renderAssignments() {
        const term = assignSearchInput ? assignSearchInput.value.toLowerCase().trim() : '';
        const filtered = assignments.filter(function (item) {
            if (!term) return true;
            return [item.observationName, item.termName, item.termCode, item.description]
                .join(' ').toLowerCase().indexOf(term) !== -1;
        });

        const result = paginate(filtered, assignPage, assignPageSize);
        assignPage = result.page;

        if (!result.total) {
            assignTableBody.innerHTML = buildEmptyAssignRow();
        } else {
            assignTableBody.innerHTML = result.slice.map(function (item) {
                return '<tr data-id="' + item.id + '">'
                    + '<td>' + escapeHtml(item.observationName) + '</td>'
                    + '<td>' + escapeHtml(item.termName) + '</td>'
                    + '<td>' + escapeHtml(item.termCode) + '</td>'
                    + '<td>' + escapeHtml(item.description) + '</td>'
                    + '<td class="action-cell">' + createActionButtonsHtml() + '</td>'
                    + '</tr>';
            }).join('');
        }

        const start = result.total ? (result.page - 1) * assignPageSize + 1 : 0;
        const end = result.total ? Math.min(result.page * assignPageSize, result.total) : 0;
        assignShowingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + result.total + ' entries';
        renderPagination(assignPagination, result.page, result.totalPages, function (page) {
            assignPage = page;
            renderAssignments();
        });
    }

    function renderParameters() {
        const term = parameterSearchInput ? parameterSearchInput.value.toLowerCase().trim() : '';
        const filtered = parameters.filter(function (item) {
            return !term || String(item.parameterName || '').toLowerCase().indexOf(term) !== -1;
        });
        const result = paginate(filtered, parameterPage, parameterPageSize);
        parameterPage = result.page;

        if (!result.total) {
            parameterTableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:2rem;color:#94a3b8;">No parameters found</td></tr>';
        } else {
            parameterTableBody.innerHTML = result.slice.map(function (item) {
                return '<tr data-id="' + item.id + '">'
                    + '<td>' + escapeHtml(item.parameterName) + '</td>'
                    + '<td class="action-cell">' + createActionButtonsHtml() + '</td>'
                    + '</tr>';
            }).join('');
        }

        const start = result.total ? (result.page - 1) * parameterPageSize + 1 : 0;
        const end = result.total ? Math.min(result.page * parameterPageSize, result.total) : 0;
        parameterShowingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + result.total + ' entries';
        renderPagination(parameterPagination, result.page, result.totalPages, function (page) {
            parameterPage = page;
            renderParameters();
        });
    }

    function renderObservations() {
        const term = observationSearchInput ? observationSearchInput.value.toLowerCase().trim() : '';
        const filtered = observations.filter(function (item) {
            const detailsText = (item.details || []).map(function (d) {
                return [d.parameterName, d.maxMarks].join(' ');
            }).join(' ');
            return !term || [item.observationName, item.observationDescription, detailsText]
                .join(' ').toLowerCase().indexOf(term) !== -1;
        });
        const result = paginate(filtered, observationPage, observationPageSize);
        observationPage = result.page;

        if (!result.total) {
            observationTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#94a3b8;">No observations found</td></tr>';
        } else {
            observationTableBody.innerHTML = result.slice.map(function (item) {
                const paramText = (item.details || []).map(function (d) {
                    return d.parameterName;
                }).join('\n');
                const marksText = (item.details || []).map(function (d) {
                    return d.maxMarks;
                }).join('\n');
                return '<tr data-id="' + item.id + '">'
                    + '<td>' + escapeHtml(item.observationName) + '</td>'
                    + '<td>' + escapeHtml(item.observationDescription || '') + '</td>'
                    + '<td class="observation-param-cell">' + escapeHtml(paramText) + '</td>'
                    + '<td class="observation-marks-cell">' + escapeHtml(marksText) + '</td>'
                    + '<td class="action-cell">' + createActionButtonsHtml() + '</td>'
                    + '</tr>';
            }).join('');
        }

        const start = result.total ? (result.page - 1) * observationPageSize + 1 : 0;
        const end = result.total ? Math.min(result.page * observationPageSize, result.total) : 0;
        observationShowingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + result.total + ' entries';
        renderPagination(observationPagination, result.page, result.totalPages, function (page) {
            observationPage = page;
            renderObservations();
        });
    }

    function populateSelect(select, items, valueKey, labelKey, selectedValue) {
        select.innerHTML = '<option value="">Select</option>' + items.map(function (item) {
            const value = item[valueKey];
            const label = item[labelKey];
            const selected = selectedValue != null && String(selectedValue) === String(value) ? ' selected' : '';
            return '<option value="' + escapeHtml(value) + '"' + selected + '>' + escapeHtml(label) + '</option>';
        }).join('');
    }

    function buildParameterOptions(selectedId) {
        return '<option value="">Select</option>' + parameters.map(function (item) {
            const selected = selectedId != null && String(selectedId) === String(item.id) ? ' selected' : '';
            return '<option value="' + item.id + '"' + selected + '>' + escapeHtml(item.parameterName) + '</option>';
        }).join('');
    }

    function buildObservationDetailRow(row) {
        return '<div class="observation-detail-row">'
            + '<div class="detail-field">'
            + '<label>Parameter <span class="required">*</span></label>'
            + '<select class="form-control detail-parameter">' + buildParameterOptions(row ? row.parameterId : null) + '</select>'
            + '</div>'
            + '<div class="detail-field">'
            + '<label>Max Marks <span class="required">*</span></label>'
            + '<input type="number" class="form-control detail-max-marks" min="0" value="' + escapeHtml(row && row.maxMarks != null ? row.maxMarks : '') + '">'
            + '</div>'
            + '<button type="button" class="btn-remove-detail" title="Remove">&times;</button>'
            + '</div>';
    }

    function resetAssignModal(item) {
        editingAssignId = item ? item.id : null;
        document.getElementById('assignId').value = editingAssignId || '';
        document.getElementById('assignTermModalTitle').textContent = item ? 'Edit Observation Term' : 'Add Observation Term';
        populateSelect(document.getElementById('assignObservationSelect'), observationOptions, 'id', 'observationName', item ? item.observationId : null);
        populateSelect(document.getElementById('assignTermSelect'), terms, 'id', 'termName', item ? item.termId : null);
        document.getElementById('assignDescription').value = item ? item.description || '' : '';
    }

    function resetParameterForm(item) {
        editingParameterId = item ? item.id : null;
        document.getElementById('parameterId').value = editingParameterId || '';
        document.getElementById('parameterName').value = item ? item.parameterName || '' : '';
    }

    function resetObservationModal(item) {
        editingObservationId = item ? item.id : null;
        document.getElementById('observationId').value = editingObservationId || '';
        document.getElementById('observationModalTitle').textContent = item ? 'Edit Observation' : 'Add Observation';
        document.getElementById('observationName').value = item ? item.observationName || '' : '';
        document.getElementById('observationDescription').value = item ? item.observationDescription || '' : '';
        const rows = item && item.details && item.details.length ? item.details : [null];
        document.getElementById('observationDetailsBody').innerHTML = rows.map(buildObservationDetailRow).join('');
    }

    function collectObservationDetails() {
        return Array.from(document.querySelectorAll('#observationDetailsBody .observation-detail-row')).map(function (row) {
            return {
                parameterId: row.querySelector('.detail-parameter').value,
                maxMarks: row.querySelector('.detail-max-marks').value
            };
        }).filter(function (item) {
            return item.parameterId || item.maxMarks;
        });
    }

    async function loadAllData() {
        const [assignData, parameterData, observationData, termData, optionData] = await Promise.all([
            fetchList('/api/cbse-observations/assignments'),
            fetchList('/api/cbse-observations/parameters'),
            fetchList('/api/cbse-observations'),
            fetchList('/api/cbse-observations/terms'),
            fetchList('/api/cbse-observations/options')
        ]);
        assignments = assignData || [];
        parameters = parameterData || [];
        observations = observationData || [];
        terms = termData || [];
        observationOptions = optionData || [];
        renderAssignments();
    }

    document.getElementById('addAssignBtn').addEventListener('click', function () {
        resetAssignModal(null);
        openModal(document.getElementById('assignTermModal'));
    });

    document.getElementById('observationParameterBtn').addEventListener('click', function () {
        resetParameterForm(null);
        renderParameters();
        openModal(document.getElementById('parameterModal'));
    });

    document.getElementById('observationListBtn').addEventListener('click', function () {
        renderObservations();
        openModal(document.getElementById('observationListModal'));
    });

    document.getElementById('addObservationBtn').addEventListener('click', function () {
        resetObservationModal(null);
        openModal(document.getElementById('observationModal'));
    });

    document.getElementById('addObservationDetailBtn').addEventListener('click', function () {
        document.getElementById('observationDetailsBody').insertAdjacentHTML('beforeend', buildObservationDetailRow(null));
    });

    document.getElementById('observationDetailsBody').addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-remove-detail')) {
            const rows = document.querySelectorAll('#observationDetailsBody .observation-detail-row');
            if (rows.length <= 1) {
                showError({ message: 'At least one parameter row is required.' });
                return;
            }
            event.target.closest('.observation-detail-row').remove();
        }
    });

    document.getElementById('assignTermForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = {
            observationId: document.getElementById('assignObservationSelect').value,
            termId: document.getElementById('assignTermSelect').value,
            description: document.getElementById('assignDescription').value.trim()
        };
        const url = editingAssignId
            ? '/api/cbse-observations/assignments/' + editingAssignId
            : '/api/cbse-observations/assignments';
        const method = editingAssignId ? 'PUT' : 'POST';
        try {
            const response = await fetchJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showSuccess(response.message || 'Saved successfully!');
            closeModal(document.getElementById('assignTermModal'));
            assignments = await fetchList('/api/cbse-observations/assignments');
            renderAssignments();
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('parameterForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = { parameterName: document.getElementById('parameterName').value.trim() };
        const url = editingParameterId
            ? '/api/cbse-observations/parameters/' + editingParameterId
            : '/api/cbse-observations/parameters';
        const method = editingParameterId ? 'PUT' : 'POST';
        try {
            const response = await fetchJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showSuccess(response.message || 'Parameter saved successfully!');
            parameters = await fetchList('/api/cbse-observations/parameters');
            observationOptions = await fetchList('/api/cbse-observations/options');
            resetParameterForm(null);
            renderParameters();
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('observationForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = {
            observationName: document.getElementById('observationName').value.trim(),
            observationDescription: document.getElementById('observationDescription').value.trim(),
            details: collectObservationDetails()
        };
        const url = editingObservationId
            ? '/api/cbse-observations/' + editingObservationId
            : '/api/cbse-observations';
        const method = editingObservationId ? 'PUT' : 'POST';
        try {
            const response = await fetchJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showSuccess(response.message || 'Observation saved successfully!');
            closeModal(document.getElementById('observationModal'));
            observations = await fetchList('/api/cbse-observations');
            observationOptions = await fetchList('/api/cbse-observations/options');
            renderObservations();
        } catch (error) {
            showError(error);
        }
    });

    assignTableBody.addEventListener('click', handleAssignTableClick);
    parameterTableBody.addEventListener('click', handleParameterTableClick);
    observationTableBody.addEventListener('click', handleObservationTableClick);

    async function handleAssignTableClick(event) {
        const row = event.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const item = assignments.find(function (entry) { return String(entry.id) === String(id); });
        if (!item) return;

        if (event.target.closest('.btn-edit')) {
            resetAssignModal(item);
            openModal(document.getElementById('assignTermModal'));
        } else if (event.target.closest('.btn-delete')) {
            const confirm = await Swal.fire({
                icon: 'warning',
                title: 'Delete assignment?',
                text: 'This action cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!confirm.isConfirmed) return;
            try {
                const response = await fetchJson('/api/cbse-observations/assignments/' + id, { method: 'DELETE' });
                showSuccess(response.message || 'Deleted successfully!');
                assignments = await fetchList('/api/cbse-observations/assignments');
                renderAssignments();
            } catch (error) {
                showError(error);
            }
        }
    }

    async function handleParameterTableClick(event) {
        const row = event.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const item = parameters.find(function (entry) { return String(entry.id) === String(id); });
        if (!item) return;

        if (event.target.closest('.btn-edit')) {
            resetParameterForm(item);
        } else if (event.target.closest('.btn-delete')) {
            const confirm = await Swal.fire({
                icon: 'warning',
                title: 'Delete parameter?',
                text: 'This action cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!confirm.isConfirmed) return;
            try {
                const response = await fetchJson('/api/cbse-observations/parameters/' + id, { method: 'DELETE' });
                showSuccess(response.message || 'Deleted successfully!');
                parameters = await fetchList('/api/cbse-observations/parameters');
                observationOptions = await fetchList('/api/cbse-observations/options');
                renderParameters();
            } catch (error) {
                showError(error);
            }
        }
    }

    async function handleObservationTableClick(event) {
        const row = event.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const item = observations.find(function (entry) { return String(entry.id) === String(id); });
        if (!item) return;

        if (event.target.closest('.btn-edit')) {
            resetObservationModal(item);
            openModal(document.getElementById('observationModal'));
        } else if (event.target.closest('.btn-delete')) {
            const confirm = await Swal.fire({
                icon: 'warning',
                title: 'Delete observation?',
                text: 'This action cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!confirm.isConfirmed) return;
            try {
                const response = await fetchJson('/api/cbse-observations/' + id, { method: 'DELETE' });
                showSuccess(response.message || 'Deleted successfully!');
                observations = await fetchList('/api/cbse-observations');
                observationOptions = await fetchList('/api/cbse-observations/options');
                renderObservations();
            } catch (error) {
                showError(error);
            }
        }
    }

    if (assignSearchInput) {
        assignSearchInput.addEventListener('input', function () {
            assignPage = 1;
            renderAssignments();
        });
    }
    if (assignEntriesSelect) {
        assignEntriesSelect.addEventListener('change', function () {
            assignPageSize = Number(assignEntriesSelect.value) || 100;
            assignPage = 1;
            renderAssignments();
        });
    }
    if (parameterSearchInput) {
        parameterSearchInput.addEventListener('input', function () {
            parameterPage = 1;
            renderParameters();
        });
    }
    if (parameterEntriesSelect) {
        parameterEntriesSelect.addEventListener('change', function () {
            parameterPageSize = Number(parameterEntriesSelect.value) || 50;
            parameterPage = 1;
            renderParameters();
        });
    }
    if (observationSearchInput) {
        observationSearchInput.addEventListener('input', function () {
            observationPage = 1;
            renderObservations();
        });
    }
    if (observationEntriesSelect) {
        observationEntriesSelect.addEventListener('change', function () {
            observationPageSize = Number(observationEntriesSelect.value) || 50;
            observationPage = 1;
            renderObservations();
        });
    }

    loadAllData().catch(showError);
});
