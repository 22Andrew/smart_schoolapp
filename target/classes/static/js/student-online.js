document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('onlineStudentTable');
    const tableBody = document.getElementById('onlineStudentTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput') || document.querySelector('.table-search-input');
    const entriesSelect = document.getElementById('entriesSelect');

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
        if (text.includes('T')) {
            const d = text.split('T')[0];
            const parts = d.split('-');
            if (parts.length === 3) return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        if (text.includes('-')) {
            const parts = text.split('-');
            if (parts.length === 3) return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        return text;
    }

    function statusBadge(value, okValues) {
        const text = value || '';
        const ok = (okValues || []).some(function (v) { return v.toLowerCase() === text.toLowerCase(); });
        const cls = ok ? 'status-success' : 'status-danger';
        return '<span class="status-badge ' + cls + '">' + escapeHtml(text) + '</span>';
    }

    function getFiltered() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return students.slice();
        return students.filter(function (item) {
            const haystack = [
                item.referenceNo, item.studentName, item.classLabel, item.fatherName,
                item.dateOfBirth, item.gender, item.categoryName, item.mobileNumber,
                item.formStatus, item.paymentStatus, item.createdAt
            ].join(' ').toLowerCase();
            return haystack.indexOf(term) !== -1;
        });
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
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="13" style="text-align:center;color:#94a3b8;">No online admission students found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item) {
            const enrolled = item.enrolled
                ? '<span class="enrolled-icon enrolled-yes" title="Enrolled">✓</span>'
                : '<span class="enrolled-icon enrolled-no" title="Not Enrolled">✗</span>';
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td>' + escapeHtml(item.referenceNo || item.admissionNo || '') + '</td>'
                + '<td><a class="student-link" href="/student/view/' + escapeHtml(item.id) + '">' + escapeHtml(item.studentName || '') + '</a></td>'
                + '<td>' + escapeHtml(item.classLabel || '') + '</td>'
                + '<td>' + escapeHtml(item.fatherName || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(item.dateOfBirth)) + '</td>'
                + '<td>' + escapeHtml(item.gender || '') + '</td>'
                + '<td>' + escapeHtml(item.categoryName || '') + '</td>'
                + '<td>' + escapeHtml(item.mobileNumber || '') + '</td>'
                + '<td>' + statusBadge(item.formStatus, ['Submitted']) + '</td>'
                + '<td>' + statusBadge(item.paymentStatus, ['Paid']) + '</td>'
                + '<td>' + enrolled + '</td>'
                + '<td>' + escapeHtml(formatDate(item.createdAt)) + '</td>'
                + '<td><div class="action-buttons">'
                + '<a class="btn-action btn-view" href="/student/view/' + escapeHtml(item.id) + '" title="View">View</a>'
                + '<a class="btn-action btn-edit" href="/student/create?id=' + escapeHtml(item.id) + '" title="Edit">Edit</a>'
                + '<button type="button" class="btn-action btn-delete" data-id="' + escapeHtml(item.id) + '" title="Delete">Delete</button>'
                + '</div></td></tr>';
        }).join('');

        updateShowingInfo(start + 1, Math.min(start + pageSize, total), total);
        renderPagination(total, totalPages);
    }

    async function loadStudents() {
        const response = await fetch('/api/student-admissions');
        if (!response.ok) throw new Error('Failed to load students');
        students = await response.json();
        currentPage = 1;
        renderRows();
    }

    async function deleteStudent(id) {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete student?',
            text: 'This cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete'
        });
        if (!confirm.isConfirmed) return;
        const response = await fetch('/api/student-admissions/' + encodeURIComponent(id), { method: 'DELETE' });
        if (!response.ok && response.status !== 204) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete student');
        }
        await loadStudents();
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1400, showConfirmButton: false });
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

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-delete');
            if (!btn) return;
            deleteStudent(btn.getAttribute('data-id')).catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }

    function getTableData() {
        const headers = ['Reference No', 'Student Name', 'Class', 'Father Name', 'Date Of Birth', 'Gender', 'Category', 'Student Mobile Number', 'Form Status', 'Payment Status', 'Enrolled', 'Created At'];
        const data = getFiltered().map(function (item) {
            return [
                item.referenceNo || item.admissionNo || '',
                item.studentName || '',
                item.classLabel || '',
                item.fatherName || '',
                formatDate(item.dateOfBirth),
                item.gender || '',
                item.categoryName || '',
                item.mobileNumber || '',
                item.formStatus || '',
                item.paymentStatus || '',
                item.enrolled ? 'Yes' : 'No',
                formatDate(item.createdAt)
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
            XLSX.utils.book_append_sheet(wb, ws, 'Online Admission');
            XLSX.writeFile(wb, 'Online_Admission.xlsx');
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
                link.download = 'Online_Admission.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                window.print();
            }
        });
    });

    loadStudents().catch(function (error) {
        console.error(error);
        tableBody.innerHTML = '<tr class="no-data-row"><td colspan="13" style="text-align:center;color:#94a3b8;">Failed to load students</td></tr>';
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load online admission students.', confirmButtonColor: '#8b5cf6' });
    });
});
