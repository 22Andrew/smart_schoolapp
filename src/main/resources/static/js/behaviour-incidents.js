document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('incidentsTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const addIncidentBtn = document.getElementById('addIncidentBtn');
    const incidentModal = document.getElementById('incidentModal');
    const incidentForm = document.getElementById('incidentForm');
    const incidentModalTitle = document.getElementById('incidentModalTitle');
    const incidentId = document.getElementById('incidentId');
    const incidentTitle = document.getElementById('incidentTitle');
    const incidentPoints = document.getElementById('incidentPoints');
    const negativeIncident = document.getElementById('negativeIncident');
    const incidentDescription = document.getElementById('incidentDescription');

    let incidents = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 100;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function emptyStateHtml() {
        return ''
            + '<tr class="empty-row"><td colspan="4">'
            + '<div class="empty-state"><p class="empty-message">No data available in table</p></div>'
            + '</td></tr>';
    }

    function sortValue(row, key) {
        switch (key) {
            case 'title': return row.title || '';
            case 'points': return Number(row.points || 0);
            case 'description': return row.description || '';
            default: return '';
        }
    }

    function getFiltered() {
        let rows = incidents.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [row.title, row.points, row.description].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
                const av = sortValue(a, sortKey);
                const bv = sortValue(b, sortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function actionButtonsHtml(row) {
        const id = escapeHtml(String(row.id));
        return ''
            + '<button type="button" class="btn-action btn-edit" data-id="' + id + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" data-id="' + id + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>‹</button>';

        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }

        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>›</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = emptyStateHtml();
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td>' + escapeHtml(String(row.points == null ? 0 : row.points)) + '</td>'
                + '<td>' + escapeHtml(row.description || '') + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(row) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    async function loadIncidents() {
        const response = await fetch('/api/behaviour/incidents');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load incidents');
        }
        incidents = await response.json();
        renderTable();
    }

    function openModal(mode, row) {
        if (mode === 'edit' && row) {
            const points = Number(row.points || 0);
            const isNegative = row.negativeIncident === true || points < 0;
            incidentModalTitle.textContent = 'Edit Incident';
            incidentId.value = String(row.id);
            incidentTitle.value = row.title || '';
            incidentPoints.value = String(Math.abs(points));
            negativeIncident.checked = isNegative;
            incidentDescription.value = row.description || '';
        } else {
            incidentModalTitle.textContent = 'Add Incident';
            incidentId.value = '';
            incidentTitle.value = '';
            incidentPoints.value = '';
            negativeIncident.checked = false;
            incidentDescription.value = '';
        }
        incidentModal.hidden = false;
        incidentTitle.focus();
    }

    function closeModal() {
        incidentModal.hidden = true;
    }

    function exportCsv() {
        const rows = getFiltered();
        const lines = [['Title', 'Point', 'Description']];
        rows.forEach(function (row) {
            lines.push([
                row.title || '',
                row.points == null ? 0 : row.points,
                row.description || ''
            ].map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'incident-list.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    if (addIncidentBtn) {
        addIncidentBtn.addEventListener('click', function () {
            openModal('add');
        });
    }

    document.querySelectorAll('[data-close-incident]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            tableFilter = tableSearchInput.value;
            currentPage = 1;
            renderTable();
        });
    }

    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 100;
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            else if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
            renderTable();
        });
    }

    document.querySelectorAll('#incidentsTable thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            const key = th.getAttribute('data-sort');
            if (sortKey === key) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortDir = 'asc';
            }
            renderTable();
        });
    });

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const row = incidents.find(function (item) {
                    return String(item.id) === String(editBtn.dataset.id);
                });
                if (row) openModal('edit', row);
                return;
            }

            const deleteBtn = e.target.closest('.btn-delete');
            if (!deleteBtn) return;

            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete incident?',
                text: 'This cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await fetch('/api/behaviour/incidents/' + encodeURIComponent(deleteBtn.dataset.id), {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || 'Failed to delete incident');
                }
                await loadIncidents();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    timer: 1400,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete incident.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (incidentForm) {
        incidentForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const id = incidentId.value.trim();
            const title = incidentTitle.value.trim();
            const description = incidentDescription.value.trim();
            const pointsValue = incidentPoints.value.trim();

            if (!title) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Title Required',
                    text: 'Please enter an incident title.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (pointsValue === '' || Number.isNaN(Number(pointsValue))) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Point Required',
                    text: 'Please enter a valid point value.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (!description) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Description Required',
                    text: 'Please enter a description.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const payload = {
                title: title,
                points: Math.abs(Number(pointsValue)),
                negativeIncident: !!(negativeIncident && negativeIncident.checked),
                description: description
            };

            try {
                const response = await fetch(id
                    ? '/api/behaviour/incidents/' + encodeURIComponent(id)
                    : '/api/behaviour/incidents', {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || 'Failed to save incident');
                }
                closeModal();
                await loadIncidents();
                Swal.fire({
                    icon: 'success',
                    title: id ? 'Updated' : 'Saved',
                    text: id ? 'Incident updated successfully.' : 'Incident saved to database.',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save incident.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    if (excelBtn) excelBtn.addEventListener('click', exportCsv);
    if (csvBtn) csvBtn.addEventListener('click', exportCsv);
    if (pdfBtn) pdfBtn.addEventListener('click', function () { window.print(); });
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    loadIncidents().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load incidents.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
