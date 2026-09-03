document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const searchBtn = document.getElementById('searchBtn');
    const deleteBtn = document.getElementById('deleteCarryForwardBtn');
    const saveBtn = document.getElementById('saveBtn');
    const table = document.getElementById('feesForwardTable');
    const tableBody = document.getElementById('feesForwardTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.querySelector('.showing-info');
    const dueDateInput = document.getElementById('dueDateInput');

    let classes = [];
    let sections = [];
    let students = [];
    let currentPage = 1;
    let pageSize = 50;
    let lastClassId = null;
    let lastSection = null;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length !== 3) return value;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function formatBalance(value) {
        const num = Number(value);
        if (Number.isNaN(num)) return '0.00';
        return num.toFixed(2);
    }

    function defaultDueDate() {
        const d = new Date();
        d.setMonth(d.getMonth() + 2);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;
    }

    function populateClasses() {
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.className || item.name || ('Class ' + item.id);
            classSelect.appendChild(option);
        });
        if (current) classSelect.value = current;
    }

    function populateSectionsForClass() {
        const selected = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
        const current = sectionSelect.value;
        sectionSelect.innerHTML = '<option value="">Select</option>';

        let classSections = [];
        if (selected && Array.isArray(selected.sections) && selected.sections.length) {
            classSections = selected.sections;
        } else {
            classSections = sections.map(function (s) {
                return typeof s === 'string' ? s : (s.sectionName || s.name);
            }).filter(Boolean);
        }

        classSections.forEach(function (name) {
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
        populateClasses();
    }

    async function loadSections() {
        const response = await fetch('/api/sections');
        if (!response.ok) throw new Error('Failed to load sections');
        sections = await response.json();
    }

    function getFilteredStudents() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return students.slice();
        return students.filter(function (item) {
            const haystack = [
                item.studentName,
                item.admissionNo,
                item.admissionDate,
                item.rollNumber,
                item.fatherName,
                item.balance,
                item.status
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

    function syncBalancesFromDom() {
        tableBody.querySelectorAll('tr[data-id]').forEach(function (row) {
            const id = row.getAttribute('data-id');
            const input = row.querySelector('.balance-input');
            const item = students.find(function (s) { return String(s.studentAdmissionId) === String(id); });
            if (item && input) {
                item.balance = input.value === '' ? 0 : Number(input.value);
            }
        });
    }

    function renderStudents() {
        syncBalancesFromDom();
        const filtered = getFilteredStudents();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="7" style="text-align:center;color:#94a3b8;">No students found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pageRows = filtered.slice(startIndex, endIndex);

        tableBody.innerHTML = pageRows.map(function (item) {
            return '<tr data-id="' + escapeHtml(String(item.studentAdmissionId)) + '">'
                + '<td class="col-name">' + escapeHtml(item.studentName || '') + '</td>'
                + '<td class="col-admission">' + escapeHtml(item.admissionNo || '') + '</td>'
                + '<td class="col-adm-date">' + escapeHtml(formatDate(item.admissionDate)) + '</td>'
                + '<td class="col-roll">' + escapeHtml(item.rollNumber || '') + '</td>'
                + '<td class="col-father">' + escapeHtml(item.fatherName || '') + '</td>'
                + '<td><input type="number" min="0" step="0.01" class="balance-input" value="'
                + escapeHtml(formatBalance(item.balance)) + '"></td>'
                + '<td class="status-text">' + escapeHtml(item.status || '') + '</td>'
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

    async function searchStudents() {
        const classId = classSelect.value;
        const section = sectionSelect.value;
        if (!classId) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select a class.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!section) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select a section.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        try {
            const url = '/api/fees-forward?classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section);
            const response = await fetch(url);
            if (!response.ok) throw new Error(await parseErrorMessage(response));
            const data = await response.json();
            students = Array.isArray(data.students) ? data.students : [];
            lastClassId = classId;
            lastSection = section;
            if (data.dueDate) {
                dueDateInput.value = data.dueDate;
            } else if (!dueDateInput.value) {
                dueDateInput.value = defaultDueDate();
            }
            currentPage = 1;
            renderStudents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to search students.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    async function saveBalances() {
        if (!lastClassId || !lastSection) {
            Swal.fire({ icon: 'warning', title: 'Search first', text: 'Please search by class and section before saving.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!students.length) {
            Swal.fire({ icon: 'warning', title: 'No data', text: 'There are no students to save.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        syncBalancesFromDom();
        const items = students.map(function (item) {
            return {
                studentAdmissionId: item.studentAdmissionId,
                balance: item.balance == null || item.balance === '' ? 0 : item.balance
            };
        });

        try {
            const response = await fetch('/api/fees-forward/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: lastClassId,
                    section: lastSection,
                    dueDate: dueDateInput.value || null,
                    items: items
                })
            });
            if (!response.ok) throw new Error(await parseErrorMessage(response));
            await searchStudents();
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Fees carry forward saved to database.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save fees carry forward.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    async function deleteCarryForward() {
        const classId = classSelect.value || lastClassId;
        const section = sectionSelect.value || lastSection;
        if (!classId || !section) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select class and section first.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete Carry Forward?',
            text: 'This will delete saved carry forward balances for the selected class and section.',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) return;

        try {
            const url = '/api/fees-forward?classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section);
            const response = await fetch(url, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) {
                throw new Error(await parseErrorMessage(response));
            }
            await searchStudents();
            Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Carry forward balances deleted.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to delete carry forward.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    if (classSelect) {
        classSelect.addEventListener('change', populateSectionsForClass);
    }
    if (searchBtn) searchBtn.addEventListener('click', searchStudents);
    if (saveBtn) saveBtn.addEventListener('click', saveBalances);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteCarryForward);

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderStudents();
        });
    }

    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderStudents();
        });
    }

    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const filtered = getFilteredStudents();
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (btn.getAttribute('data-nav') === 'prev') {
                currentPage = Math.max(1, currentPage - 1);
            } else if (btn.getAttribute('data-nav') === 'next') {
                currentPage = Math.min(totalPages, currentPage + 1);
            } else if (btn.getAttribute('data-page')) {
                currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
            }
            renderStudents();
        });
    }

    function getVisibleRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(function (row) {
            return !row.classList.contains('no-data-row');
        });
    }

    function getTableData() {
        syncBalancesFromDom();
        const headers = ['Student Name', 'Admission No', 'Admission Date', 'Roll Number', 'Father Name', 'Balance ($)', 'Status'];
        const data = [];
        getVisibleRows().forEach(function (row) {
            data.push([
                row.querySelector('.col-name').textContent.trim(),
                row.querySelector('.col-admission').textContent.trim(),
                row.querySelector('.col-adm-date').textContent.trim(),
                row.querySelector('.col-roll').textContent.trim(),
                row.querySelector('.col-father').textContent.trim(),
                row.querySelector('.balance-input').value,
                row.querySelector('.status-text').textContent.trim()
            ]);
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
                Swal.fire({ icon: 'success', title: 'Copied!', text: 'Table data copied to clipboard', timer: 2000, showConfirmButton: false });
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getTableData();
            const wsData = [result.headers].concat(result.data);
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Fees Carry Forward');
            XLSX.writeFile(wb, 'Fees_Carry_Forward_' + new Date().toISOString().split('T')[0] + '.xlsx');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
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
            link.download = 'Fees_Carry_Forward.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    ['pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () { window.print(); });
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
        columnVisibilityDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
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

    dueDateInput.value = defaultDueDate();

    Promise.all([loadClasses(), loadSections()]).catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load class/section lists.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
