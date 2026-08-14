document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.view-tab');
    const listPanel = document.getElementById('listViewPanel');
    const detailsPanel = document.getElementById('detailsViewPanel');
    const classSectionSearchBtn = document.getElementById('classSectionSearchBtn');
    const keywordSearchBtn = document.getElementById('keywordSearchBtn');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const keywordSearch = document.getElementById('keywordSearch');
    const studentTableBody = document.getElementById('studentTableBody');
    const showingInfo = document.getElementById('showingInfo') || document.querySelector('.showing-info');
    const detailsList = document.getElementById('detailsList');
    const detailsEmptyState = document.getElementById('detailsEmptyState');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const pagination = document.getElementById('pagination');
    const studentTable = document.getElementById('studentTable');

    let classes = [];
    let masterSections = [];
    let students = [];
    let currentPage = 1;
    let pageSize = 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function studentFullName(row) {
        return [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
    }

    function classLabel(row) {
        const className = row.className || '';
        const section = row.section || '';
        if (className && section) return className + '(' + section + ')';
        return className || section || '';
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value).trim();
        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return isoMatch[2] + '/' + isoMatch[3] + '/' + isoMatch[1];
        }
        return text;
    }

    function avatarHtml(photoUrl, altText) {
        if (photoUrl) {
            return ''
                + '<div class="detail-avatar">'
                + '<img src="' + escapeHtml(photoUrl) + '" alt="' + escapeHtml(altText || 'Student') + '">'
                + '</div>';
        }
        return ''
            + '<div class="detail-avatar" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">'
            + '<circle cx="40" cy="28" r="14" fill="#9aa5b1"/>'
            + '<path d="M16 72c4-18 14-26 24-26s20 8 24 26" fill="#9aa5b1"/>'
            + '</svg></div>';
    }

    function actionButtonsHtml(viewUrl, studentId) {
        const href = viewUrl || '#';
        const editUrl = studentId
            ? '/student/edit/' + encodeURIComponent(String(studentId))
            : '#';
        const feesUrl = studentId
            ? '/studentfee/addfee/' + encodeURIComponent(String(studentId))
            : '#';
        return ''
            + '<a href="' + href + '" class="btn-action btn-menu" title="View">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>'
            + '</svg></a>'
            + '<a href="' + editUrl + '" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
            + '</svg></a>'
            + '<a href="' + feesUrl + '" class="btn-action btn-fees" title="Collect Fees">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="12" y1="1" x2="12" y2="23"></line>'
            + '<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
            + '</svg></a>'
            + '<button type="button" class="btn-action btn-print" title="Print">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polyline points="6 9 6 2 18 2 18 9"></polyline>'
            + '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>'
            + '<rect x="6" y="14" width="12" height="8"></rect>'
            + '</svg></button>';
    }

    function detailsActionButtonsHtml(viewUrl, studentId) {
        return '<div class="detail-actions">' + actionButtonsHtml(viewUrl, studentId) + '</div>';
    }

    function emptyStateHtml(colspan) {
        return ''
            + '<tr class="empty-row"><td colspan="' + colspan + '">'
            + '<div class="empty-state">'
            + '<p class="empty-message">No data available in table</p>'
            + '<div class="empty-illustration">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="100" viewBox="0 0 120 100" fill="none">'
            + '<rect x="30" y="35" width="60" height="45" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>'
            + '<path d="M30 45h60" stroke="#cbd5e1" stroke-width="2"/>'
            + '<path d="M45 35v-8a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v8" stroke="#94a3b8" stroke-width="2" fill="none"/>'
            + '</svg></div>'
            + '<p class="empty-hint">← Add new record or search with different criteria.</p>'
            + '</div></td></tr>';
    }

    function sortValue(row, key) {
        switch (key) {
            case 'admissionNo': return row.admissionNo || '';
            case 'name': return studentFullName(row);
            case 'rollNumber': return row.rollNumber || '';
            case 'class': return classLabel(row);
            case 'fatherName': return row.fatherName || '';
            case 'dateOfBirth': return row.dateOfBirth || '';
            case 'gender': return row.gender || '';
            case 'category': return row.categoryName || '';
            case 'mobileNumber': return row.mobileNumber || '';
            default: return '';
        }
    }

    function getFilteredStudents() {
        let rows = students.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.admissionNo,
                    studentFullName(row),
                    row.rollNumber,
                    classLabel(row),
                    row.fatherName,
                    formatDate(row.dateOfBirth),
                    row.gender,
                    row.categoryName,
                    row.mobileNumber
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
                const av = String(sortValue(a, sortKey)).toLowerCase();
                const bv = String(sortValue(b, sortKey)).toLowerCase();
                if (av < bv) return sortDir === 'asc' ? -1 : 1;
                if (av > bv) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function fillClassSelect() {
        if (!classSelect) return;
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
        if (current) classSelect.value = current;
    }

    function fillSectionSelect(preferred) {
        if (!sectionSelect) return;
        sectionSelect.innerHTML = '<option value="">Select</option>';

        const selectedClass = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
        const classSections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (s) { return s.sectionName || s.name || s; });

        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            sectionSelect.appendChild(option);
        });

        if (preferred) sectionSelect.value = preferred;
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

    function renderListTable() {
        const filtered = getFilteredStudents();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            studentTableBody.innerHTML = emptyStateHtml(10);
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        studentTableBody.innerHTML = pageRows.map(function (row) {
            const name = studentFullName(row) || 'Student';
            const viewUrl = '/student/view/' + encodeURIComponent(String(row.id));
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.admissionNo || '') + '</td>'
                + '<td><a href="' + viewUrl + '" class="student-link">' + escapeHtml(name) + '</a></td>'
                + '<td>' + escapeHtml(row.rollNumber || '') + '</td>'
                + '<td>' + escapeHtml(classLabel(row)) + '</td>'
                + '<td>' + escapeHtml(row.fatherName || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(row.dateOfBirth)) + '</td>'
                + '<td>' + escapeHtml(row.gender || '') + '</td>'
                + '<td>' + escapeHtml(row.categoryName || '') + '</td>'
                + '<td>' + escapeHtml(row.mobileNumber || '') + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(viewUrl, row.id) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    function renderDetails() {
        if (!students.length) {
            detailsList.innerHTML = '';
            if (detailsEmptyState) detailsEmptyState.style.display = '';
            return;
        }

        if (detailsEmptyState) detailsEmptyState.style.display = 'none';

        detailsList.innerHTML = students.map(function (row) {
            const phone = row.guardianPhone || row.mobileNumber || '';
            const viewUrl = '/student/view/' + encodeURIComponent(String(row.id));
            const fullName = studentFullName(row) || 'Student';
            return ''
                + '<div class="student-detail-card" data-id="' + escapeHtml(String(row.id)) + '">'
                + avatarHtml(row.photoUrl || row.photoPath || '', fullName)
                + '<div class="detail-main">'
                + '<h3 class="detail-name"><a href="' + viewUrl + '" class="student-link">'
                + escapeHtml(fullName) + '</a></h3>'
                + '<div class="detail-columns">'
                + '<div class="detail-col">'
                + '<p><strong>Class:</strong> ' + escapeHtml(classLabel(row) || '-') + '</p>'
                + '<p><strong>Admission No:</strong> ' + escapeHtml(row.admissionNo || '-') + '</p>'
                + '<p><strong>Date Of Birth:</strong> ' + escapeHtml(formatDate(row.dateOfBirth) || '-') + '</p>'
                + '</div>'
                + '<div class="detail-col">'
                + '<p><strong>Local Identification Number:</strong> ' + escapeHtml(row.localId || '-') + '</p>'
                + '<p><strong>Guardian Name:</strong> ' + escapeHtml(row.guardianName || row.fatherName || '-') + '</p>'
                + '<p class="detail-phone"><strong>Guardian Phone:</strong> '
                + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>'
                + '</svg> '
                + escapeHtml(phone || '-') + '</p>'
                + '</div>'
                + '</div>'
                + '</div>'
                + detailsActionButtonsHtml(viewUrl, row.id)
                + '</div>';
        }).join('');
    }

    function renderStudents() {
        renderListTable();
        renderDetails();
    }

    function rowsToTsv(rows) {
        const headers = [
            'Admission No', 'Student Name', 'Roll No.', 'Class', 'Father Name',
            'Date Of Birth', 'Gender', 'Category', 'Mobile Number'
        ];
        const lines = [headers.join('\t')];
        rows.forEach(function (row) {
            lines.push([
                row.admissionNo || '',
                studentFullName(row),
                row.rollNumber || '',
                classLabel(row),
                row.fatherName || '',
                formatDate(row.dateOfBirth),
                row.gender || '',
                row.categoryName || '',
                row.mobileNumber || ''
            ].join('\t'));
        });
        return lines.join('\n');
    }

    function downloadCsv(rows) {
        const headers = [
            'Admission No', 'Student Name', 'Roll No.', 'Class', 'Father Name',
            'Date Of Birth', 'Gender', 'Category', 'Mobile Number'
        ];
        const lines = [headers.join(',')];
        rows.forEach(function (row) {
            const values = [
                row.admissionNo || '',
                studentFullName(row),
                row.rollNumber || '',
                classLabel(row),
                row.fatherName || '',
                formatDate(row.dateOfBirth),
                row.gender || '',
                row.categoryName || '',
                row.mobileNumber || ''
            ].map(function (value) {
                const text = String(value).replace(/"/g, '""');
                return '"' + text + '"';
            });
            lines.push(values.join(','));
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'student-details.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect();
        fillSectionSelect();
    }

    async function loadSections() {
        const response = await fetch('/api/sections');
        if (!response.ok) throw new Error('Failed to load sections');
        masterSections = await response.json();
        fillSectionSelect();
    }

    async function searchStudents(params) {
        const query = new URLSearchParams();
        if (params.classId) query.set('classId', params.classId);
        if (params.section) query.set('section', params.section);
        if (params.keyword) query.set('keyword', params.keyword);

        const response = await fetch('/api/student-admissions?' + query.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to search students');
        }
        students = await response.json();
        currentPage = 1;
        renderStudents();

        if (!students.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Results',
                text: 'No students found for the selected criteria.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');

            const view = tab.getAttribute('data-view');
            if (view === 'details') {
                listPanel.classList.remove('active');
                detailsPanel.classList.add('active');
            } else {
                detailsPanel.classList.remove('active');
                listPanel.classList.add('active');
            }
        });
    });

    if (classSelect) {
        classSelect.addEventListener('change', function () {
            fillSectionSelect();
        });
    }

    if (classSectionSearchBtn) {
        classSectionSearchBtn.addEventListener('click', async function () {
            const classValue = classSelect ? classSelect.value : '';
            if (!classValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Class Required',
                    text: 'Please select a class to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            try {
                await searchStudents({
                    classId: classValue,
                    section: sectionSelect ? sectionSelect.value : ''
                });
    } catch (error) {
                console.error(error);
        Swal.fire({
            icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to search students.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (keywordSearchBtn) {
        keywordSearchBtn.addEventListener('click', async function () {
            const keyword = keywordSearch ? keywordSearch.value.trim() : '';
            if (!keyword) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Keyword Required',
                    text: 'Please enter a keyword to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            try {
                await searchStudents({ keyword: keyword });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to search students.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (keywordSearch) {
        keywordSearch.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                keywordSearchBtn.click();
            }
        });
    }

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            tableFilter = tableSearchInput.value;
            currentPage = 1;
            renderListTable();
        });
    }

    if (entriesSelect) {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 50;
            currentPage = 1;
            renderListTable();
        });
    }

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
            renderListTable();
        });
    }

    if (studentTable) {
        studentTable.querySelectorAll('th[data-sort]').forEach(function (th) {
            th.addEventListener('click', function () {
                const key = th.getAttribute('data-sort');
                if (sortKey === key) {
                    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    sortKey = key;
                    sortDir = 'asc';
                }
                renderListTable();
            });
        });
    }

    const copyBtn = document.getElementById('copyBtn');
    const excelBtn = document.getElementById('excelBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    if (copyBtn) {
        copyBtn.addEventListener('click', async function () {
            const text = rowsToTsv(getFilteredStudents());
            try {
                await navigator.clipboard.writeText(text);
                Swal.fire({
                    icon: 'success',
                    title: 'Copied',
                    text: 'Student list copied to clipboard.',
                    timer: 1200,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Unable to copy to clipboard.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            downloadCsv(getFilteredStudents());
        });
    }

    if (pdfBtn || printBtn) {
        const printHandler = function () {
            window.print();
        };
        if (pdfBtn) pdfBtn.addEventListener('click', printHandler);
        if (printBtn) printBtn.addEventListener('click', printHandler);
    }

    studentTableBody.addEventListener('click', function (e) {
        if (e.target.closest('.btn-print')) {
            e.preventDefault();
            window.print();
        }
    });

    if (detailsList) {
        detailsList.addEventListener('click', function (e) {
            if (e.target.closest('.btn-print')) {
                e.preventDefault();
                window.print();
            }
        });
    }

    Promise.all([loadClasses(), loadSections()]).catch(function (error) {
        console.error(error);
    Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load Class or Section lists.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
