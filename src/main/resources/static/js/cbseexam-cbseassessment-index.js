document.addEventListener('DOMContentLoaded', function () {
    let assessments = [];
    let currentPage = 1;
    let pageSize = 50;
    let editingId = null;

    const tableBody = document.getElementById('assessmentTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const assessmentForm = document.getElementById('assessmentForm');
    const assessmentModal = document.getElementById('assessmentModal');
    const assessmentDetailsBody = document.getElementById('assessmentDetailsBody');
    const assessmentModalTitle = document.getElementById('assessmentModalTitle');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    function openModal() {
        if (assessmentModal) {
            assessmentModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (assessmentModal) {
            assessmentModal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeModal();
        });
    });

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>'
            + '</button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
            + '</button>';
    }

    function buildNestedAssessmentTable(details) {
        const rows = (details || []).map(function (detail) {
            return '<tr>'
                + '<td>' + escapeHtml(detail.assessmentType) + '</td>'
                + '<td>' + escapeHtml(detail.code || '') + '</td>'
                + '<td>' + escapeHtml(detail.maximumMarks) + '</td>'
                + '<td>' + escapeHtml(detail.passPercentage) + '</td>'
                + '<td>' + escapeHtml(detail.description || '') + '</td>'
                + '</tr>';
        }).join('');
        return '<table class="nested-grade-table">'
            + '<thead><tr><th>Assessment Type</th><th>Code</th><th>Maximum Marks</th><th>Pass Percentage</th><th>Description</th></tr></thead>'
            + '<tbody>' + rows + '</tbody></table>';
    }

    function buildDetailRow(row) {
        return '<div class="assessment-detail-row">'
            + '<div class="detail-field">'
            + '<label>Assessment Type <span class="required">*</span></label>'
            + '<input type="text" class="detail-assessment-type" value="' + escapeHtml(row ? row.assessmentType : '') + '">'
            + '</div>'
            + '<div class="detail-field detail-field-sm">'
            + '<label>Code</label>'
            + '<input type="text" class="detail-code" value="' + escapeHtml(row ? row.code || '' : '') + '">'
            + '</div>'
            + '<div class="detail-field">'
            + '<label>Maximum Marks <span class="required">*</span></label>'
            + '<input type="number" class="detail-max-marks" min="0" value="' + escapeHtml(row && row.maximumMarks != null ? row.maximumMarks : '') + '">'
            + '</div>'
            + '<div class="detail-field">'
            + '<label>Pass Percentage <span class="required">*</span></label>'
            + '<input type="number" class="detail-pass-percentage" min="0" max="100" value="' + escapeHtml(row && row.passPercentage != null ? row.passPercentage : '') + '">'
            + '</div>'
            + '<div class="detail-field">'
            + '<label>Description</label>'
            + '<input type="text" class="detail-description" value="' + escapeHtml(row ? row.description || '' : '') + '">'
            + '</div>'
            + '<button type="button" class="btn-remove-detail" title="Remove">&times;</button>'
            + '</div>';
    }

    function resetModal(details) {
        editingId = null;
        assessmentForm.reset();
        assessmentModalTitle.textContent = 'Add Assessment';
        const rows = details && details.length ? details : [null];
        assessmentDetailsBody.innerHTML = rows.map(buildDetailRow).join('');
    }

    function collectDetails() {
        return Array.from(assessmentDetailsBody.querySelectorAll('.assessment-detail-row')).map(function (row) {
            return {
                assessmentType: row.querySelector('.detail-assessment-type').value.trim(),
                code: row.querySelector('.detail-code').value.trim(),
                maximumMarks: row.querySelector('.detail-max-marks').value,
                passPercentage: row.querySelector('.detail-pass-percentage').value,
                description: row.querySelector('.detail-description').value.trim()
            };
        }).filter(function (item) {
            return item.assessmentType || item.code || item.maximumMarks || item.passPercentage || item.description;
        });
    }

    function getFilteredAssessments() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return assessments.slice();
        return assessments.filter(function (item) {
            const detailsText = (item.details || []).map(function (d) {
                return [d.assessmentType, d.code, d.maximumMarks, d.passPercentage, d.description].join(' ');
            }).join(' ');
            return [item.assessmentName, item.assessmentDescription, detailsText].join(' ').toLowerCase().indexOf(term) !== -1;
        });
    }

    function renderAssessments() {
        const filtered = getFilteredAssessments();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#94a3b8;">No assessments found</td></tr>';
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            pagination.innerHTML = '<button type="button" class="pagination-btn" disabled>&lsaquo;</button><button type="button" class="pagination-btn active">1</button><button type="button" class="pagination-btn" disabled>&rsaquo;</button>';
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (item) {
            return '<tr data-id="' + item.id + '">'
                + '<td>' + escapeHtml(item.assessmentName) + '</td>'
                + '<td>' + escapeHtml(item.assessmentDescription || '') + '</td>'
                + '<td class="grade-nested-cell">' + buildNestedAssessmentTable(item.details) + '</td>'
                + '<td class="action-cell"><div class="action-buttons">' + createActionButtonsHtml() + '</div></td>'
                + '</tr>';
        }).join('');

        showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        let pHtml = '<button type="button" class="pagination-btn" data-nav="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let p = 1; p <= totalPages; p++) {
            pHtml += '<button type="button" class="pagination-btn' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        pHtml += '<button type="button" class="pagination-btn" data-nav="next"' + (currentPage >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = pHtml;
    }

    async function loadAssessments() {
        const response = await fetch('/api/cbse-exam-assessments');
        if (!response.ok) throw new Error('Failed to load assessments');
        assessments = await response.json();
        renderAssessments();
    }

    document.getElementById('addAssessmentBtn')?.addEventListener('click', function () {
        resetModal([null]);
        openModal();
    });

    document.getElementById('addDetailRowBtn')?.addEventListener('click', function () {
        assessmentDetailsBody.insertAdjacentHTML('beforeend', buildDetailRow(null));
    });

    assessmentDetailsBody?.addEventListener('click', function (e) {
        if (e.target.closest('.btn-remove-detail')) {
            const row = e.target.closest('.assessment-detail-row');
            if (row && assessmentDetailsBody.querySelectorAll('.assessment-detail-row').length > 1) {
                row.remove();
            }
        }
    });

    assessmentForm?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = {
            assessmentName: document.getElementById('assessmentName').value.trim(),
            assessmentDescription: document.getElementById('assessmentDescription').value.trim(),
            details: collectDetails()
        };

        try {
            const url = editingId ? '/api/cbse-exam-assessments/' + editingId : '/api/cbse-exam-assessments';
            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save assessment');
            }
            closeModal();
            await loadAssessments();
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            showError(error);
        }
    });

    tableBody?.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');

        if (e.target.closest('.btn-edit')) {
            try {
                const response = await fetch('/api/cbse-exam-assessments/' + id);
                if (!response.ok) throw new Error('Failed to load assessment');
                const data = await response.json();
                editingId = id;
                assessmentModalTitle.textContent = 'Edit Assessment';
                document.getElementById('assessmentName').value = data.assessmentName || '';
                document.getElementById('assessmentDescription').value = data.assessmentDescription || '';
                assessmentDetailsBody.innerHTML = (data.details || []).length
                    ? data.details.map(buildDetailRow).join('')
                    : buildDetailRow(null);
                openModal();
            } catch (error) {
                showError(error);
            }
            return;
        }

        if (e.target.closest('.btn-delete')) {
            const title = row.querySelector('td')?.textContent.trim() || 'this assessment';
            Swal.fire({
                icon: 'warning',
                title: 'Delete Assessment?',
                text: '"' + title + '" will be deleted.',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            }).then(async function (result) {
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/cbse-exam-assessments/' + id, { method: 'DELETE' });
                    const data = await response.json().catch(function () { return {}; });
                    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete');
                    await loadAssessments();
                    Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
                } catch (error) {
                    showError(error);
                }
            });
        }
    });

    searchInput?.addEventListener('input', function () { currentPage = 1; renderAssessments(); });
    entriesSelect?.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderAssessments();
    });
    pagination?.addEventListener('click', function (e) {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        const totalPages = Math.max(1, Math.ceil(getFilteredAssessments().length / pageSize) || 1);
        if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
        else if (btn.dataset.nav === 'prev') currentPage = Math.max(1, currentPage - 1);
        else if (btn.dataset.nav === 'next') currentPage = Math.min(totalPages, currentPage + 1);
        renderAssessments();
    });

    loadAssessments().catch(showError);
});
