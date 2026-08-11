document.addEventListener('DOMContentLoaded', function () {
    const marksGradeForm = document.getElementById('marksGradeForm');
    const gradeIdInput = document.getElementById('gradeId');
    const formTitle = document.getElementById('formPanelTitle');
    const saveBtn = document.getElementById('saveGradeBtn');
    const examTypeSelect = document.getElementById('examTypeSelect');
    const tableBody = document.getElementById('gradeTableBody');

    let grades = [];
    let examTypes = [];
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

    function formatGradePoint(value) {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return '0.0';
        }
        return Number.isInteger(num) ? String(num) + '.0' : String(num);
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

    function populateExamTypeSelect() {
        examTypeSelect.innerHTML = '<option value="">Select</option>' + examTypes.map(function (type) {
            return '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>';
        }).join('');
    }

    function renderTable() {
        if (!grades.length) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-cell">No marks grades found</td></tr>';
            return;
        }

        const grouped = {};
        grades.forEach(function (item) {
            if (!grouped[item.examType]) {
                grouped[item.examType] = [];
            }
            grouped[item.examType].push(item);
        });

        let html = '';
        Object.keys(grouped).forEach(function (examType) {
            const rows = grouped[examType];
            rows.forEach(function (item, index) {
                html += '<tr data-id="' + escapeHtml(item.id) + '">';
                if (index === 0) {
                    html += '<td class="exam-type-cell" rowspan="' + rows.length + '">' + escapeHtml(examType) + '</td>';
                }
                html += '<td>' + escapeHtml(item.gradeName) + '</td>'
                    + '<td>' + formatPercent(item.percentFrom) + 'To' + formatPercent(item.percentUpto) + '</td>'
                    + '<td>' + escapeHtml(formatGradePoint(item.gradePoint)) + '</td>'
                    + '<td>' + escapeHtml(item.description || '') + '</td>'
                    + '<td><div class="action-btns">'
                    + '<button type="button" class="action-btn" data-action="edit" data-id="' + escapeHtml(item.id) + '" title="Edit">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
                    + '</button>'
                    + '<button type="button" class="action-btn delete-btn" data-action="delete" data-id="' + escapeHtml(item.id) + '" title="Delete">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                    + '</button>'
                    + '</div></td>'
                    + '</tr>';
            });
        });

        tableBody.innerHTML = html;
    }

    function resetForm() {
        marksGradeForm.reset();
        gradeIdInput.value = '';
        editingId = null;
        formTitle.textContent = 'Add Marks Grade';
        saveBtn.textContent = 'Save';
    }

    function populateForm(item) {
        editingId = item.id;
        gradeIdInput.value = item.id;
        formTitle.textContent = 'Edit Marks Grade';
        saveBtn.textContent = 'Update';
        examTypeSelect.value = item.examType || '';
        document.getElementById('gradeName').value = item.gradeName || '';
        document.getElementById('percentUpto').value = item.percentUpto != null ? item.percentUpto : '';
        document.getElementById('percentFrom').value = item.percentFrom != null ? item.percentFrom : '';
        document.getElementById('gradePoint').value = item.gradePoint != null ? item.gradePoint : '';
        document.getElementById('description').value = item.description || '';
    }

    function buildPayload() {
        return {
            examType: examTypeSelect.value.trim(),
            gradeName: document.getElementById('gradeName').value.trim(),
            percentUpto: document.getElementById('percentUpto').value,
            percentFrom: document.getElementById('percentFrom').value,
            gradePoint: document.getElementById('gradePoint').value,
            description: document.getElementById('description').value.trim()
        };
    }

    async function loadGrades() {
        const [gradeData, typeData] = await Promise.all([
            fetchJson('/api/marks-grades'),
            fetchJson('/api/marks-grades/exam-types')
        ]);
        grades = gradeData || [];
        examTypes = typeData || [];
        populateExamTypeSelect();
        renderTable();
    }

    async function handleDelete(id) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete grade?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) {
            return;
        }
        await fetchJson('/api/marks-grades/' + id, { method: 'DELETE' });
        showSuccess('Marks grade deleted successfully!');
        if (String(editingId) === String(id)) {
            resetForm();
        }
        await loadGrades();
    }

    marksGradeForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload.examType || !payload.gradeName) {
            showError({ message: 'Exam type and grade name are required.' });
            return;
        }

        const url = editingId ? '/api/marks-grades/' + editingId : '/api/marks-grades';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetchJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showSuccess(response.message || 'Marks grade saved successfully!');
            resetForm();
            await loadGrades();
        } catch (error) {
            showError(error);
        }
    });

    tableBody.addEventListener('click', async function (event) {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) {
            return;
        }
        const action = actionEl.getAttribute('data-action');
        const id = actionEl.getAttribute('data-id');
        const item = grades.find(function (row) {
            return String(row.id) === String(id);
        });
        if (!item) {
            return;
        }

        if (action === 'edit') {
            populateForm(item);
            document.querySelector('.grade-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (action === 'delete') {
            try {
                await handleDelete(id);
            } catch (error) {
                showError(error);
            }
        }
    });

    loadGrades().catch(showError);
});
