document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const keywordInput = document.getElementById('keywordInput');
    const searchByClassBtn = document.getElementById('searchByClassBtn');
    const searchByKeywordBtn = document.getElementById('searchByKeywordBtn');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('collectFeesTable');
    const tableBody = document.getElementById('collectFeesTableBody');
    const showingInfo = document.querySelector('.showing-info');

    let classes = [];
    let rows = [];
    let currentPage = 1;
    let pageSize = 50;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function fullName(item) {
        const first = item.firstName || '';
        const last = item.lastName || '';
        return (first + ' ' + last).trim();
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value);
        if (text.includes('-')) {
            const parts = text.split('-');
            if (parts.length === 3) {
                return parts[1] + '/' + parts[2] + '/' + parts[0];
            }
        }
        return text;
    }

    function populateSections() {
        const selected = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
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

    function getFilteredRows() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return rows.slice();
        return rows.filter(function (item) {
            const haystack = [
                item.className,
                item.section,
                item.admissionNo,
                fullName(item),
                item.fatherName,
                formatDate(item.dateOfBirth),
                item.mobileNumber
            ].join(' ').toLowerCase();
            return haystack.indexOf(term) !== -1;
        });
    }

    function updateShowingInfo(start, end, total) {
        if (!showingInfo) return;
        if (total === 0) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        showingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + total + ' entries';
    }

    function renderPagination(total, totalPages) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function renderRows() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="8" style="text-align:center;color:#94a3b8;">No students found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filtered.slice(startIndex, endIndex);

        tableBody.innerHTML = pageRows.map(function (item) {
            const name = fullName(item);
            return '<tr data-student-id="' + escapeHtml(String(item.id)) + '">'
                + '<td>' + escapeHtml(item.className || '') + '</td>'
                + '<td>' + escapeHtml(item.section || '') + '</td>'
                + '<td>' + escapeHtml(item.admissionNo || '') + '</td>'
                + '<td><a class="student-name-link" href="/student/view/' + escapeHtml(String(item.id)) + '">'
                + escapeHtml(name) + '</a></td>'
                + '<td>' + escapeHtml(item.fatherName || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(item.dateOfBirth)) + '</td>'
                + '<td>' + escapeHtml(item.mobileNumber || '') + '</td>'
                + '<td><button type="button" class="btn-collect-fees">Collect Fees</button></td>'
                + '</tr>';
        }).join('');

        updateShowingInfo(startIndex + 1, endIndex, total);
        renderPagination(total, totalPages);
    }

    async function parseErrorMessage(response) {
        try {
            const data = await response.json();
            return data.message || 'Request failed';
        } catch (e) {
            return 'Request failed';
        }
    }

    async function searchStudents(requireClass) {
        const classId = classSelect.value;
        const keyword = (keywordInput.value || '').trim();

        if (requireClass && !classId) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select a class.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        if (!requireClass && !classId && !keyword) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select a class or enter a keyword.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        let url = '/api/student-admissions?';
        const params = [];
        if (classId) params.push('classId=' + encodeURIComponent(classId));
        if (sectionSelect.value) params.push('section=' + encodeURIComponent(sectionSelect.value));
        if (keyword) params.push('keyword=' + encodeURIComponent(keyword));
        url += params.join('&');

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(await parseErrorMessage(response));
            rows = await response.json();
            currentPage = 1;
            renderRows();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to search students.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    if (classSelect) classSelect.addEventListener('change', populateSections);
    if (searchByClassBtn) searchByClassBtn.addEventListener('click', function () { searchStudents(true); });
    if (searchByKeywordBtn) searchByKeywordBtn.addEventListener('click', function () { searchStudents(false); });

    if (keywordInput) {
        keywordInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchStudents(false);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderRows();
        });
    }

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
            const filtered = getFilteredRows();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (btn.getAttribute('data-nav') === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (btn.getAttribute('data-page')) currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            renderRows();
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-collect-fees');
            if (!btn) return;
            const row = btn.closest('tr');
            const studentId = row && row.getAttribute('data-student-id');
            if (!studentId) return;
            window.location.href = '/studentfee/addfee/' + encodeURIComponent(studentId);
        });
    }

    function getExportRows() {
        const headers = ['Class', 'Section', 'Admission No', 'Student Name', 'Father Name', 'Date Of Birth', 'Mobile No.'];
        const data = getFilteredRows().map(function (item) {
            return [
                item.className || '',
                item.section || '',
                item.admissionNo || '',
                fullName(item),
                item.fatherName || '',
                formatDate(item.dateOfBirth),
                item.mobileNumber || ''
            ];
        });
        return { headers: headers, data: data };
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getExportRows();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied!', text: 'Table data copied to clipboard', timer: 2000, showConfirmButton: false });
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getExportRows();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Collect Fees');
            XLSX.writeFile(wb, 'Collect_Fees_' + new Date().toISOString().split('T')[0] + '.xlsx');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getExportRows();
            const lines = [result.headers.join(',')].concat(result.data.map(function (row) {
                return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(',');
            }));
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Collect_Fees.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    ['pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', function () { window.print(); });
    });

    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function () {
            columnVisibilityDropdown.classList.remove('active');
        });
        columnVisibilityDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const columnIndex = parseInt(checkbox.getAttribute('data-column'), 10);
                if (!table) return;
                table.querySelectorAll('tr').forEach(function (row) {
                    const cell = row.children[columnIndex];
                    if (cell) cell.style.display = checkbox.checked ? '' : 'none';
                });
            });
        });
    }

    loadClasses().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load classes.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
