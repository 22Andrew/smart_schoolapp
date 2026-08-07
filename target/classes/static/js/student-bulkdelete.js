document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('bulkDeleteTable');
    const tableBody = document.getElementById('bulkDeleteTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput');
    const selectAll = document.getElementById('selectAll');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const criteriaForm = document.getElementById('criteriaForm');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const entriesSelect = document.getElementById('entriesSelect');

    let classes = [];
    let students = [];
    let currentPage = 1;
    let pageSize = 50;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value);
        if (text.includes('-')) {
            const parts = text.split('T')[0].split('-');
            if (parts.length === 3) return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        return text;
    }

    function populateSections() {
        const selected = classes.find(function (c) { return String(c.id) === String(classSelect.value); });
        const current = sectionSelect.value;
        sectionSelect.innerHTML = '<option value="">Select</option>';
        const sections = selected && Array.isArray(selected.sections) ? selected.sections : [];
        sections.forEach(function (name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            sectionSelect.appendChild(option);
        });
        if (current) sectionSelect.value = current;
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
    }

    function getFiltered() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return students.slice();
        return students.filter(function (item) {
            const haystack = [
                item.admissionNo, item.studentName, item.classLabel,
                item.dateOfBirth, item.gender, item.categoryName, item.mobileNumber
            ].join(' ').toLowerCase();
            return haystack.indexOf(term) !== -1;
        });
    }

    function syncSelectAllState() {
        if (!selectAll) return;
        const boxes = Array.from(tableBody.querySelectorAll('.row-checkbox'));
        if (!boxes.length) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            return;
        }
        const checkedCount = boxes.filter(function (box) { return box.checked; }).length;
        selectAll.checked = checkedCount === boxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
    }

    function updateShowingInfo(from, to, total) {
        if (!showingInfo) return;
        if (!total) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        showingInfo.textContent = 'Showing ' + from + ' to ' + to + ' of ' + total + ' entries';
    }

    function renderPagination(total, totalPages) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= totalPages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"' + (currentPage >= totalPages || !total ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function renderRows() {
        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const pageRows = filtered.slice(start, start + pageSize);

        if (!pageRows.length) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="9" style="text-align:center;color:#94a3b8;">No students found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            syncSelectAllState();
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item, index) {
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td><input type="checkbox" class="row-checkbox" value="' + escapeHtml(item.id) + '"></td>'
                + '<td>' + (start + index + 1) + '</td>'
                + '<td>' + escapeHtml(item.admissionNo || '') + '</td>'
                + '<td>' + escapeHtml(item.studentName || '') + '</td>'
                + '<td>' + escapeHtml(item.classLabel || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(item.dateOfBirth)) + '</td>'
                + '<td>' + escapeHtml(item.gender || '') + '</td>'
                + '<td>' + escapeHtml(item.categoryName || '') + '</td>'
                + '<td>' + escapeHtml(item.mobileNumber || '') + '</td>'
                + '</tr>';
        }).join('');

        updateShowingInfo(start + 1, Math.min(start + pageSize, total), total);
        renderPagination(total, totalPages);
        syncSelectAllState();
    }

    async function searchStudents() {
        const classId = classSelect.value;
        if (!classId) {
            Swal.fire({ icon: 'warning', title: 'Class Required', text: 'Please select a class.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const query = new URLSearchParams();
        query.set('classId', classId);
        if (sectionSelect.value) query.set('section', sectionSelect.value);
        const response = await fetch('/api/student-admissions?' + query.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to search students');
        }
        students = await response.json();
        currentPage = 1;
        renderRows();
    }

    async function bulkDelete() {
        const selected = Array.from(tableBody.querySelectorAll('.row-checkbox:checked')).map(function (box) {
            return box.value;
        });
        if (!selected.length) {
            Swal.fire({ icon: 'warning', title: 'No Students Selected', text: 'Please select at least one student to delete.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete Selected Students?',
            text: selected.length + ' student(s) will be deleted. This cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete'
        });
        if (!confirm.isConfirmed) return;

        const response = await fetch('/api/student-admissions/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selected })
        });
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(data.message || 'Failed to delete students');
        await searchStudents();
        Swal.fire({ icon: 'success', title: 'Deleted', text: (data.deleted || selected.length) + ' student(s) deleted.', timer: 1600, showConfirmButton: false });
    }

    if (classSelect) classSelect.addEventListener('change', populateSections);
    if (criteriaForm) {
        criteriaForm.addEventListener('submit', function (e) {
            e.preventDefault();
            searchStudents().catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }
    if (searchInput) searchInput.addEventListener('input', function () { currentPage = 1; renderRows(); });
    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderRows();
        });
    }
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            tableBody.querySelectorAll('.row-checkbox').forEach(function (box) {
                box.checked = selectAll.checked;
            });
            selectAll.indeterminate = false;
        });
    }
    if (tableBody) {
        tableBody.addEventListener('change', function (e) {
            if (e.target.classList.contains('row-checkbox')) syncSelectAllState();
        });
    }
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function () {
            bulkDelete().catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }

    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFiltered();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (btn.getAttribute('data-nav') === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (btn.getAttribute('data-page')) currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            renderRows();
        });
    }

    function getTableData() {
        const headers = ['#', 'Admission No', 'Student Name', 'Class', 'Date Of Birth', 'Gender', 'Category', 'Mobile Number'];
        const data = getFiltered().map(function (item, index) {
            return [
                index + 1,
                item.admissionNo || '',
                item.studentName || '',
                item.classLabel || '',
                formatDate(item.dateOfBirth),
                item.gender || '',
                item.categoryName || '',
                item.mobileNumber || ''
            ];
        });
        return { headers: headers, data: data };
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getTableData();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied!', timer: 1500, showConfirmButton: false });
            });
        });
    }
    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getTableData();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Bulk Delete');
            XLSX.writeFile(wb, 'Bulk_Delete_Students.xlsx');
        });
    }
    ['csvBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'csvBtn') {
                const result = getTableData();
                const lines = [result.headers.join(',')].concat(result.data.map(function (row) {
                    return row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
                }));
                const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'Bulk_Delete_Students.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                window.print();
            }
        });
    });

    loadClasses().catch(function (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load classes.', confirmButtonColor: '#8b5cf6' });
    });
});
