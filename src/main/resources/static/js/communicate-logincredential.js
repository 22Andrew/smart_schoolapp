document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('bulkMailTable');
    const tableBody = document.getElementById('bulkMailTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput');
    const selectAll = document.getElementById('selectAll');
    const sendBtn = document.getElementById('sendBtn');
    const criteriaForm = document.getElementById('criteriaForm');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const entriesSelect = document.getElementById('entriesSelect');
    const messageToSelect = document.getElementById('messageToSelect');
    const notificationTypeSelect = document.getElementById('notificationTypeSelect');
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');

    let classes = [];
    let students = [];
    let currentPage = 1;
    let pageSize = 50;
    let currentClassLabel = '';

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

    function classLabelFromSelect() {
        const selected = classes.find(function (item) {
            return String(item.id) === String(classSelect.value);
        });
        const className = selected ? selected.name : '';
        const section = sectionSelect.value || '';
        if (className && section) return className + '(' + section + ')';
        return className || '';
    }

    function populateSections() {
        const selected = classes.find(function (item) {
            return String(item.id) === String(classSelect.value);
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

    function getFiltered() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return students.slice();
        return students.filter(function (item) {
            const haystack = [
                item.admissionNo, item.studentName, item.classLabel,
                item.dateOfBirth, item.gender, item.mobileNumber
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
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="8" style="text-align:center;color:#94a3b8;">No students found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            syncSelectAllState();
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item, index) {
            const viewUrl = '/student/view/' + encodeURIComponent(String(item.id));
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td><input type="checkbox" class="row-checkbox" value="' + escapeHtml(item.id) + '"></td>'
                + '<td>' + (start + index + 1) + '</td>'
                + '<td>' + escapeHtml(item.admissionNo || '') + '</td>'
                + '<td><a href="' + viewUrl + '" class="student-name-link">' + escapeHtml(item.studentName || '') + '</a></td>'
                + '<td>' + escapeHtml(item.classLabel || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(item.dateOfBirth)) + '</td>'
                + '<td>' + escapeHtml(item.gender || '') + '</td>'
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
            Swal.fire({ icon: 'warning', title: 'Class Required', text: 'Please select a class.', confirmButtonColor: '#705ec8' });
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
        currentClassLabel = classLabelFromSelect();
        currentPage = 1;
        renderRows();
    }

    async function sendCredentials() {
        const selected = Array.from(tableBody.querySelectorAll('.row-checkbox:checked')).map(function (box) {
            return parseInt(box.value, 10);
        }).filter(function (id) { return !Number.isNaN(id); });

        if (!selected.length) {
            Swal.fire({ icon: 'warning', title: 'No Students Selected', text: 'Please select at least one student.', confirmButtonColor: '#705ec8' });
            return;
        }

        const messageTo = messageToSelect ? messageToSelect.value : '';
        const notificationType = notificationTypeSelect ? notificationTypeSelect.value : '';
        if (!messageTo || !notificationType) {
            Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Please select Message To and Notification Type.', confirmButtonColor: '#705ec8' });
            return;
        }

        const confirm = await Swal.fire({
            icon: 'question',
            title: 'Send login credentials?',
            text: 'Credentials will be sent to ' + selected.length + ' selected student(s).',
            showCancelButton: true,
            confirmButtonText: 'Send',
            confirmButtonColor: '#705ec8'
        });
        if (!confirm.isConfirmed) return;

        const response = await fetch('/api/communicate/login-credentials/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messageTo: messageTo,
                notificationType: notificationType,
                studentIds: selected,
                classLabel: currentClassLabel
            })
        });
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to send login credentials');
        }

        Swal.fire({
            icon: 'success',
            title: 'Sent',
            text: data.message || 'Login credentials send recorded successfully!',
            timer: 1800,
            showConfirmButton: false
        });

        tableBody.querySelectorAll('.row-checkbox:checked').forEach(function (box) {
            box.checked = false;
        });
        if (selectAll) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }
    }

    function getTableData() {
        const headers = ['#', 'Admission No', 'Student Name', 'Class', 'Date Of Birth', 'Gender', 'Mobile Number'];
        const data = getFiltered().map(function (item, index) {
            return [
                index + 1,
                item.admissionNo || '',
                item.studentName || '',
                item.classLabel || '',
                formatDate(item.dateOfBirth),
                item.gender || '',
                item.mobileNumber || ''
            ];
        });
        return { headers: headers, data: data };
    }

    function toggleColumn(columnIndex, visible) {
        if (!table) return;
        table.querySelectorAll('tr').forEach(function (row) {
            const cell = row.children[columnIndex];
            if (cell) cell.style.display = visible ? '' : 'none';
        });
    }

    if (classSelect) classSelect.addEventListener('change', populateSections);

    if (criteriaForm) {
        criteriaForm.addEventListener('submit', function (event) {
            event.preventDefault();
            searchStudents().catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#705ec8' });
            });
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

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            tableBody.querySelectorAll('.row-checkbox').forEach(function (box) {
                box.checked = selectAll.checked;
            });
            selectAll.indeterminate = false;
        });
    }

    if (tableBody) {
        tableBody.addEventListener('change', function (event) {
            if (event.target.classList.contains('row-checkbox')) syncSelectAllState();
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', function () {
            sendCredentials().catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#705ec8' });
            });
        });
    }

    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFiltered();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (btn.getAttribute('data-nav') === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (btn.getAttribute('data-page')) currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            renderRows();
        });
    }

    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function () {
            columnVisibilityDropdown.classList.remove('active');
        });
        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (input) {
            input.addEventListener('change', function () {
                toggleColumn(parseInt(input.dataset.column, 10), input.checked);
            });
        });
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
            XLSX.utils.book_append_sheet(wb, ws, 'Login Credentials');
            XLSX.writeFile(wb, 'login-credentials-send.xlsx');
        });
    }

    ['csvBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'csvBtn') {
                const result = getTableData();
                const lines = [result.headers.join(',')].concat(result.data.map(function (row) {
                    return row.map(function (value) {
                        return '"' + String(value).replace(/"/g, '""') + '"';
                    }).join(',');
                }));
                const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'login-credentials-send.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else if (id === 'pdfBtn' && window.jspdf) {
                const result = getTableData();
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: 'landscape' });
                doc.autoTable({
                    head: [result.headers],
                    body: result.data,
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [112, 94, 200] }
                });
                doc.save('login-credentials-send.pdf');
            } else {
                window.print();
            }
        });
    });

    loadClasses().catch(function (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load classes.', confirmButtonColor: '#705ec8' });
    });
});
