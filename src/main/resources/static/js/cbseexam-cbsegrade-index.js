document.addEventListener('DOMContentLoaded', function () {
    let grades = [];
    let currentPage = 1;
    let pageSize = 50;
    let editingId = null;

    const tableBody = document.getElementById('gradeTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const gradeForm = document.getElementById('gradeForm');
    const gradeModal = document.getElementById('gradeModal');
    const gradeDetailsBody = document.getElementById('gradeDetailsBody');
    const gradeModalTitle = document.getElementById('gradeModalTitle');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    function openModal() {
        if (gradeModal) {
            gradeModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (gradeModal) {
            gradeModal.hidden = true;
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

    function buildNestedGradeTable(details) {
        const rows = (details || []).map(function (detail) {
            return '<tr>'
                + '<td>' + escapeHtml(detail.gradeName) + '</td>'
                + '<td>' + escapeHtml(detail.maxPercentage) + '</td>'
                + '<td>' + escapeHtml(detail.minPercentage) + '</td>'
                + '<td>' + escapeHtml(detail.remark || '') + '</td>'
                + '</tr>';
        }).join('');
        return '<table class="nested-grade-table">'
            + '<thead><tr><th>Grade</th><th>Maximum Percentage</th><th>Minimum Percentage</th><th>Remark</th></tr></thead>'
            + '<tbody>' + rows + '</tbody></table>';
    }

    function buildDetailRow(row) {
        return '<div class="grade-detail-row">'
            + '<div class="detail-field">'
            + '<label>Grade <span class="required">*</span></label>'
            + '<input type="text" class="detail-grade-name" value="' + escapeHtml(row ? row.gradeName : '') + '">'
            + '</div>'
            + '<div class="detail-field">'
            + '<label>Maximum Percentage <span class="required">*</span></label>'
            + '<input type="number" class="detail-max" min="0" max="100" value="' + escapeHtml(row && row.maxPercentage != null ? row.maxPercentage : '') + '">'
            + '</div>'
            + '<div class="detail-field">'
            + '<label>Minimum Percentage <span class="required">*</span></label>'
            + '<input type="number" class="detail-min" min="0" max="100" value="' + escapeHtml(row && row.minPercentage != null ? row.minPercentage : '') + '">'
            + '</div>'
            + '<div class="detail-field">'
            + '<label>Remark</label>'
            + '<input type="text" class="detail-remark" value="' + escapeHtml(row ? row.remark || '' : '') + '">'
            + '</div>'
            + '<button type="button" class="btn-remove-detail" title="Remove">&times;</button>'
            + '</div>';
    }

    function resetModal(details) {
        editingId = null;
        gradeForm.reset();
        gradeModalTitle.textContent = 'Add Grade';
        const rows = details && details.length ? details : [null];
        gradeDetailsBody.innerHTML = rows.map(buildDetailRow).join('');
    }

    function collectDetails() {
        return Array.from(gradeDetailsBody.querySelectorAll('.grade-detail-row')).map(function (row) {
            return {
                gradeName: row.querySelector('.detail-grade-name').value.trim(),
                maxPercentage: row.querySelector('.detail-max').value,
                minPercentage: row.querySelector('.detail-min').value,
                remark: row.querySelector('.detail-remark').value.trim()
            };
        }).filter(function (item) {
            return item.gradeName || item.maxPercentage || item.minPercentage || item.remark;
        });
    }

    function getFilteredGrades() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return grades.slice();
        return grades.filter(function (item) {
            const detailsText = (item.details || []).map(function (d) {
                return [d.gradeName, d.maxPercentage, d.minPercentage, d.remark].join(' ');
            }).join(' ');
            return [item.gradeTitle, item.description, detailsText].join(' ').toLowerCase().indexOf(term) !== -1;
        });
    }

    function renderGrades() {
        const filtered = getFilteredGrades();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#94a3b8;">No exam grades found</td></tr>';
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            pagination.innerHTML = '<button type="button" class="pagination-btn" disabled>&lsaquo;</button><button type="button" class="pagination-btn active">1</button><button type="button" class="pagination-btn" disabled>&rsaquo;</button>';
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (item) {
            return '<tr data-id="' + item.id + '">'
                + '<td>' + escapeHtml(item.gradeTitle) + '</td>'
                + '<td>' + escapeHtml(item.description || '') + '</td>'
                + '<td class="grade-nested-cell">' + buildNestedGradeTable(item.details) + '</td>'
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

    async function loadGrades() {
        const response = await fetch('/api/cbse-exam-grades');
        if (!response.ok) throw new Error('Failed to load exam grades');
        grades = await response.json();
        renderGrades();
    }

    document.getElementById('addGradeBtn')?.addEventListener('click', function () {
        resetModal([null]);
        openModal();
    });

    document.getElementById('addDetailRowBtn')?.addEventListener('click', function () {
        gradeDetailsBody.insertAdjacentHTML('beforeend', buildDetailRow(null));
    });

    gradeDetailsBody?.addEventListener('click', function (e) {
        if (e.target.closest('.btn-remove-detail')) {
            const row = e.target.closest('.grade-detail-row');
            if (row && gradeDetailsBody.querySelectorAll('.grade-detail-row').length > 1) {
                row.remove();
            }
        }
    });

    gradeForm?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = {
            gradeTitle: document.getElementById('gradeTitle').value.trim(),
            description: document.getElementById('gradeDescription').value.trim(),
            details: collectDetails()
        };

        try {
            const url = editingId ? '/api/cbse-exam-grades/' + editingId : '/api/cbse-exam-grades';
            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save exam grade');
            }
            closeModal();
            await loadGrades();
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
                const response = await fetch('/api/cbse-exam-grades/' + id);
                if (!response.ok) throw new Error('Failed to load exam grade');
                const data = await response.json();
                editingId = id;
                gradeModalTitle.textContent = 'Edit Grade';
                document.getElementById('gradeTitle').value = data.gradeTitle || '';
                document.getElementById('gradeDescription').value = data.description || '';
                gradeDetailsBody.innerHTML = (data.details || []).length
                    ? data.details.map(buildDetailRow).join('')
                    : buildDetailRow(null);
                openModal();
            } catch (error) {
                showError(error);
            }
            return;
        }

        if (e.target.closest('.btn-delete')) {
            const title = row.querySelector('td')?.textContent.trim() || 'this grade';
            Swal.fire({
                icon: 'warning',
                title: 'Delete Exam Grade?',
                text: '"' + title + '" will be deleted.',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            }).then(async function (result) {
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/cbse-exam-grades/' + id, { method: 'DELETE' });
                    const data = await response.json().catch(function () { return {}; });
                    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete');
                    await loadGrades();
                    Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
                } catch (error) {
                    showError(error);
                }
            });
        }
    });

    searchInput?.addEventListener('input', function () { currentPage = 1; renderGrades(); });
    entriesSelect?.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderGrades();
    });
    pagination?.addEventListener('click', function (e) {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        const totalPages = Math.max(1, Math.ceil(getFilteredGrades().length / pageSize) || 1);
        if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
        else if (btn.dataset.nav === 'prev') currentPage = Math.max(1, currentPage - 1);
        else if (btn.dataset.nav === 'next') currentPage = Math.min(totalPages, currentPage + 1);
        renderGrades();
    });

    loadGrades().catch(showError);
});
