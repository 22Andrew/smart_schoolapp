document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('disabledStudentTable');
    const tableBody = document.getElementById('disabledStudentTableBody');
    const tabs = document.querySelectorAll('.view-tab');
    const listPanel = document.getElementById('listViewPanel');
    const detailsPanel = document.getElementById('detailsViewPanel');
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const keywordSearch = document.getElementById('keywordSearch');
    const classSectionSearchBtn = document.getElementById('classSectionSearchBtn');
    const keywordSearchBtn = document.getElementById('keywordSearchBtn');
    const searchInput = document.getElementById('searchInput') || document.querySelector('.table-search-input');
    const showingInfo = document.querySelector('.showing-info');
    const entriesSelect = document.getElementById('entriesSelect');

    let classes = [];
    let students = [];
    let currentPage = 1;
    let pageSize = 50;

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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
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
                item.admissionNo, item.studentName, item.classLabel, item.fatherName,
                item.disableReason, item.gender, item.mobileNumber
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
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="8" style="text-align:center;color:#94a3b8;">No disabled students found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0, 1);
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item) {
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td>' + escapeHtml(item.admissionNo || '') + '</td>'
                + '<td><a class="student-link" href="/student/view/' + escapeHtml(item.id) + '">' + escapeHtml(item.studentName || '') + '</a></td>'
                + '<td>' + escapeHtml(item.classLabel || '') + '</td>'
                + '<td>' + escapeHtml(item.fatherName || '') + '</td>'
                + '<td>' + escapeHtml(item.disableReason || '') + '</td>'
                + '<td>' + escapeHtml(item.gender || '') + '</td>'
                + '<td>' + escapeHtml(item.mobileNumber || '') + '</td>'
                + '<td><button type="button" class="btn-action btn-enable" data-id="' + escapeHtml(item.id) + '">Enable</button></td>'
                + '</tr>';
        }).join('');

        updateShowingInfo(start + 1, Math.min(start + pageSize, total), total);
        renderPagination(total, totalPages);
    }

    async function searchDisabled(params) {
        const query = new URLSearchParams();
        query.set('disabled', 'true');
        if (params.classId) query.set('classId', params.classId);
        if (params.section) query.set('section', params.section);
        if (params.keyword) query.set('keyword', params.keyword);
        const response = await fetch('/api/student-admissions?' + query.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to search disabled students');
        }
        students = await response.json();
        currentPage = 1;
        renderRows();
    }

    async function enableStudent(id) {
        const confirm = await Swal.fire({
            icon: 'question',
            title: 'Enable student?',
            text: 'This will restore the student as active.',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            confirmButtonText: 'Enable'
        });
        if (!confirm.isConfirmed) return;
        const response = await fetch('/api/student-admissions/' + encodeURIComponent(id) + '/enable', { method: 'POST' });
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(data.message || 'Failed to enable student');
        await searchDisabled({
            classId: classSelect.value,
            section: sectionSelect.value,
            keyword: keywordSearch ? keywordSearch.value.trim() : ''
        });
        Swal.fire({ icon: 'success', title: 'Enabled', timer: 1400, showConfirmButton: false });
    }

    if (classSelect) classSelect.addEventListener('change', populateSections);

    if (classSectionSearchBtn) {
        classSectionSearchBtn.addEventListener('click', function () {
            searchDisabled({
                classId: classSelect.value,
                section: sectionSelect.value
            }).catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }

    if (keywordSearchBtn) {
        keywordSearchBtn.addEventListener('click', function () {
            const keyword = keywordSearch ? keywordSearch.value.trim() : '';
            if (!keyword) {
                Swal.fire({ icon: 'warning', title: 'Keyword Required', text: 'Please enter a keyword.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            searchDisabled({ keyword: keyword }).catch(function (error) {
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
            const btn = e.target.closest('.btn-enable');
            if (!btn) return;
            enableStudent(btn.getAttribute('data-id')).catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }

    Promise.all([loadClasses(), searchDisabled({})]).catch(function (error) {
        console.error(error);
        tableBody.innerHTML = '<tr class="no-data-row"><td colspan="8" style="text-align:center;color:#94a3b8;">Failed to load disabled students</td></tr>';
    });
});
