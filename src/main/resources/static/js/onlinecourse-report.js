document.addEventListener('DOMContentLoaded', function () {
    const pageRoot = document.querySelector('.onlinecourse-report-page');
    const form = document.getElementById('purchaseReportForm');
    const reportKey = (pageRoot && pageRoot.getAttribute('data-report-key'))
        || (form && form.getAttribute('data-report-key'))
        || 'coursepurchase';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    if (reportKey === 'courserating' || reportKey === 'guestreport') {
        initTableReport(reportKey);
        return;
    }

    const searchType = document.getElementById('searchType');
    const paymentType = document.getElementById('paymentType');
    const paymentStatus = document.getElementById('paymentStatus');
    const usersType = document.getElementById('usersType');
    const searchBtn = document.getElementById('searchPurchaseBtn') || document.getElementById('searchCompleteBtn');
    const tbody = document.getElementById('purchaseReportBody');
    const footer = document.getElementById('purchaseReportFooter');
    const completeUserType = document.getElementById('completeUserType');
    const completeCourse = document.getElementById('completeCourse');
    const completeClass = document.getElementById('completeClass');
    const completeSection = document.getElementById('completeSection');
    const completeClassGroup = document.getElementById('completeClassGroup');
    const completeSectionGroup = document.getElementById('completeSectionGroup');
    let schoolClasses = [];

    function emptyStateHtml() {
        return '<tr class="empty-row"><td colspan="7"><div class="empty-state">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90" viewBox="0 0 120 90" fill="none">'
            + '<rect x="28" y="38" width="64" height="40" rx="4" fill="#e2e8f0"/>'
            + '<path d="M28 46h64v4H28z" fill="#cbd5e1"/>'
            + '<rect x="40" y="22" width="28" height="22" rx="2" fill="#f8fafc" transform="rotate(-12 54 33)"/>'
            + '<rect x="58" y="18" width="28" height="22" rx="2" fill="#f1f5f9" transform="rotate(10 72 29)"/>'
            + '<circle cx="78" cy="24" r="3" fill="#94a3b8"/>'
            + '<circle cx="86" cy="30" r="2" fill="#94a3b8"/>'
            + '</svg></div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</div></td></tr>';
    }

    function renderRows(rows) {
        const list = Array.isArray(rows) ? rows : [];
        if (!list.length) {
            tbody.innerHTML = emptyStateHtml();
            footer.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }

        tbody.innerHTML = list.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.studentOrGuest || '-') + '</td>'
                + '<td>' + escapeHtml(row.date || '-') + '</td>'
                + '<td>' + escapeHtml(row.course || '-') + '</td>'
                + '<td>' + escapeHtml(row.courseProvider || '-') + '</td>'
                + '<td>' + escapeHtml(row.paymentType || '-') + '</td>'
                + '<td>' + escapeHtml(row.paymentMethod || '-') + '</td>'
                + '<td>' + escapeHtml(row.price == null ? '-' : row.price) + '</td>'
                + '</tr>';
        }).join('');
        footer.textContent = 'Showing 1 to ' + list.length + ' of ' + list.length + ' entries';
    }

    function isStudentUserType() {
        return completeUserType && completeUserType.value === 'student';
    }

    function toggleStudentFields() {
        if (!completeClassGroup || !completeSectionGroup) {
            return;
        }
        const showStudentFields = isStudentUserType();
        completeClassGroup.hidden = !showStudentFields;
        completeSectionGroup.hidden = !showStudentFields;
        if (!showStudentFields) {
            if (completeClass) {
                completeClass.value = '';
            }
            if (completeSection) {
                completeSection.innerHTML = '<option value="">Select the Section</option>';
            }
        }
    }

    function populateCompleteSections() {
        if (!completeSection) {
            return;
        }
        completeSection.innerHTML = '<option value="">Select the Section</option>';
        const selected = schoolClasses.find(function (item) {
            return String(item.id) === String(completeClass && completeClass.value);
        });
        const sections = selected && Array.isArray(selected.sections) ? selected.sections : [];
        sections.forEach(function (name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            completeSection.appendChild(option);
        });
    }

    async function loadCompleteCourses() {
        if (!completeCourse) {
            return;
        }
        const response = await fetch('/api/online-courses');
        if (!response.ok) {
            throw new Error('Failed to load courses');
        }
        const courses = await response.json();
        completeCourse.innerHTML = '<option value="">Select the Course</option>';
        (Array.isArray(courses) ? courses : []).forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.title || item.name || ('Course ' + item.id);
            completeCourse.appendChild(option);
        });
    }

    async function loadCompleteClasses() {
        if (!completeClass) {
            return;
        }
        const response = await fetch('/api/classes');
        if (!response.ok) {
            throw new Error('Failed to load classes');
        }
        schoolClasses = await response.json();
        completeClass.innerHTML = '<option value="">Select the Class</option>';
        (Array.isArray(schoolClasses) ? schoolClasses : []).forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            completeClass.appendChild(option);
        });
        populateCompleteSections();
    }

    function buildQuery() {
        const query = new URLSearchParams({
            reportType: reportKey
        });
        if (reportKey === 'coursecomplete') {
            query.set('usersType', (completeUserType && completeUserType.value) || '');
            query.set('courseId', (completeCourse && completeCourse.value) || '');
            if (isStudentUserType()) {
                query.set('classId', (completeClass && completeClass.value) || '');
                query.set('section', (completeSection && completeSection.value) || '');
            }
            return query;
        }
        query.set('searchType', (searchType && searchType.value) || '');
        query.set('paymentType', (paymentType && paymentType.value) || '');
        query.set('paymentStatus', (paymentStatus && paymentStatus.value) || '');
        query.set('usersType', (usersType && usersType.value) || 'all');
        return query;
    }

    async function searchReport() {
        if (reportKey !== 'coursecomplete') {
            if (!searchType || !searchType.value) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Search Type is required.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (!paymentType || !paymentType.value) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Payment Type is required.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
        }

        if (searchBtn) {
            searchBtn.disabled = true;
        }
        try {
            const response = await fetch('/api/online-course-reports/purchase?' + buildQuery().toString());
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to load report');
            }
            const data = await response.json();
            renderRows(data.rows || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load report.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            if (searchBtn) {
                searchBtn.disabled = false;
            }
        }
    }

    if (reportKey === 'coursecomplete') {
        toggleStudentFields();
        loadCompleteCourses().catch(function () { /* keep empty course list */ });
        loadCompleteClasses().catch(function () { /* keep empty class list */ });
        if (completeUserType) {
            completeUserType.addEventListener('change', toggleStudentFields);
        }
        if (completeClass) {
            completeClass.addEventListener('change', populateCompleteSections);
        }
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            searchReport();
        });
    }
});

function initTableReport(reportKey) {
    const isGuest = reportKey === 'guestreport';
    const tbody = document.getElementById(isGuest ? 'guestReportBody' : 'ratingReportBody');
    const footer = document.getElementById(isGuest ? 'guestReportFooter' : 'ratingReportFooter');
    const searchInput = document.getElementById(isGuest ? 'guestSearchInput' : 'ratingSearchInput');
    const entriesSelect = document.getElementById(isGuest ? 'guestEntriesSelect' : 'ratingEntriesSelect');
    const colCount = isGuest ? 9 : 5;
    let allRows = [];
    let sortKey = isGuest ? 'admissionNo' : 'title';
    let sortDir = 1;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function starsHtml(rating) {
        const value = Math.max(0, Math.min(5, Number(rating) || 0));
        let html = '<span class="rating-stars" aria-label="' + value + ' star rating">';
        for (let i = 1; i <= 5; i++) {
            html += '<span class="star' + (i <= value ? ' filled' : '') + '">★</span>';
        }
        html += '</span>';
        return html;
    }

    function avatarHtml(row) {
        const name = row.fullName || '';
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) {
            return part.charAt(0).toUpperCase();
        }).join('') || '?';
        const src = row.imageUrl || '';
        if (!src) {
            return '<span class="guest-avatar-fallback">' + escapeHtml(initials) + '</span>';
        }
        return '<img class="guest-avatar" src="' + escapeHtml(src) + '" alt="' + escapeHtml(name) + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-flex\'">'
            + '<span class="guest-avatar-fallback" style="display:none">' + escapeHtml(initials) + '</span>';
    }

    function emptyStateHtml() {
        return '<tr class="empty-row"><td colspan="' + colCount + '"><div class="empty-state">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</div></td></tr>';
    }

    function filteredRows() {
        const query = ((searchInput && searchInput.value) || '').trim().toLowerCase();
        let rows = allRows.slice();
        if (query) {
            rows = rows.filter(function (row) {
                return Object.values(row).some(function (value) {
                    return String(value == null ? '' : value).toLowerCase().indexOf(query) !== -1;
                });
            });
        }
        rows.sort(function (a, b) {
            const left = a[sortKey] == null ? '' : a[sortKey];
            const right = b[sortKey] == null ? '' : b[sortKey];
            if (typeof left === 'number' && typeof right === 'number') {
                return (left - right) * sortDir;
            }
            return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' }) * sortDir;
        });
        return rows;
    }

    function visibleRows(rows) {
        const limit = Number(entriesSelect && entriesSelect.value) || 100;
        return rows.slice(0, limit);
    }

    function render() {
        if (!tbody || !footer) {
            return;
        }
        const rows = filteredRows();
        const pageRows = visibleRows(rows);
        if (!pageRows.length) {
            tbody.innerHTML = emptyStateHtml();
            footer.textContent = 'Showing 0 to 0 of ' + rows.length + ' entries';
            return;
        }
        tbody.innerHTML = pageRows.map(function (row) {
            if (isGuest) {
                return '<tr>'
                    + '<td>' + avatarHtml(row) + '</td>'
                    + '<td>' + escapeHtml(row.fullName || '') + '</td>'
                    + '<td>' + escapeHtml(row.admissionNo || '') + '</td>'
                    + '<td>' + escapeHtml(row.email || '') + '</td>'
                    + '<td>' + escapeHtml(row.mobileNumber || '') + '</td>'
                    + '<td>' + escapeHtml(row.dateOfBirth || '') + '</td>'
                    + '<td>' + escapeHtml(row.gender || '') + '</td>'
                    + '<td>' + escapeHtml(row.address || '') + '</td>'
                    + '<td><button type="button" class="report-action-btn guest-delete-btn" data-id="' + escapeHtml(row.id) + '" title="Delete">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                    + '</button></td></tr>';
            }
            return '<tr>'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td>' + escapeHtml(row.classLabel || '') + '</td>'
                + '<td>' + starsHtml(row.rating) + '</td>'
                + '<td>' + escapeHtml(row.reviewCount == null ? '' : row.reviewCount) + '</td>'
                + '<td><button type="button" class="report-action-btn rating-view-btn" data-id="' + escapeHtml(row.id == null ? '' : row.id) + '" data-title="' + escapeHtml(row.title) + '" title="View">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>'
                + '</button></td></tr>';
        }).join('');
        footer.textContent = 'Showing 1 to ' + pageRows.length + ' of ' + rows.length + ' entries';
    }

    function exportRows(format) {
        const rows = visibleRows(filteredRows());
        const headers = isGuest
            ? ['Name', 'Admission No', 'Email', 'Mobile Number', 'Date Of Birth', 'Gender', 'Address']
            : ['Title', 'Class', 'Rating', 'Review Count'];
        const sheetData = [headers].concat(rows.map(function (row) {
            return isGuest
                ? [row.fullName, row.admissionNo, row.email, row.mobileNumber, row.dateOfBirth, row.gender, row.address]
                : [row.title, row.classLabel, row.rating, row.reviewCount];
        }));
        if (format === 'copy') {
            const text = sheetData.map(function (line) { return line.join('\t'); }).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied', text: 'Table copied to clipboard.', timer: 1200, showConfirmButton: false });
            });
            return;
        }
        if (format === 'csv') {
            const csv = sheetData.map(function (line) {
                return line.map(function (cell) {
                    const value = cell == null ? '' : String(cell);
                    return '"' + value.replace(/"/g, '""') + '"';
                }).join(',');
            }).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = reportKey + '.csv';
            link.click();
            return;
        }
        if (format === 'excel' && window.XLSX) {
            const worksheet = window.XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            window.XLSX.writeFile(workbook, reportKey + '.xlsx');
            return;
        }
        window.print();
    }

    const ratingModal = document.getElementById('ratingDetailsModal');
    const ratingModalBody = document.getElementById('ratingDetailsBody');
    let ratingDetailRows = [];
    let ratingDetailCourseId = '';
    let ratingDetailTitle = '';

    function demoRatingDetails() {
        return [{
            id: 'demo',
            studentName: 'Edward Thomas (Student -1800011)',
            rating: 4,
            review: 'NICE'
        }];
    }

    function renderRatingDetails(rows) {
        ratingDetailRows = Array.isArray(rows) ? rows : [];
        if (!ratingModalBody) {
            return;
        }
        if (!ratingDetailRows.length) {
            ratingModalBody.innerHTML = '<tr><td colspan="4">No rating details available.</td></tr>';
            return;
        }
        ratingModalBody.innerHTML = ratingDetailRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.studentName || '') + '</td>'
                + '<td>' + starsHtml(row.rating) + '</td>'
                + '<td>' + escapeHtml(row.review || '') + '</td>'
                + '<td><button type="button" class="report-action-btn rating-delete-btn" data-id="' + escapeHtml(row.id) + '" title="Delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="3 6 5 6 21 6"></polyline>'
                + '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>'
                + '<path d="M10 11v6"></path><path d="M14 11v6"></path>'
                + '<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>'
                + '</svg></button></td></tr>';
        }).join('');
    }

    function closeRatingDetails() {
        if (ratingModal) {
            ratingModal.hidden = true;
        }
    }

    async function openRatingDetails(courseId, title) {
        ratingDetailCourseId = courseId || '';
        ratingDetailTitle = title || '';
        let rows = [];
        try {
            const query = new URLSearchParams();
            if (ratingDetailCourseId) {
                query.set('courseId', ratingDetailCourseId);
            }
            if (ratingDetailTitle) {
                query.set('title', ratingDetailTitle);
            }
            const response = await fetch('/api/online-course-reports/ratings/details?' + query.toString());
            if (response.ok) {
                const data = await response.json();
                rows = Array.isArray(data.rows) ? data.rows : [];
            }
        } catch (error) {
            rows = [];
        }
        if (!rows.length) {
            rows = demoRatingDetails();
        }
        renderRatingDetails(rows);
        if (ratingModal) {
            ratingModal.hidden = false;
        }
    }

    async function loadRows() {
        const url = isGuest ? '/api/online-course-reports/guests' : '/api/online-course-reports/ratings';
        const response = await fetch(url);
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load report');
        }
        const data = await response.json();
        allRows = Array.isArray(data.rows) ? data.rows : [];
        render();
    }

    if (searchInput) {
        searchInput.addEventListener('input', render);
    }
    if (entriesSelect) {
        entriesSelect.addEventListener('change', render);
    }
    const prefix = isGuest ? 'guest' : 'rating';
    document.getElementById(prefix + 'CopyBtn')?.addEventListener('click', function () { exportRows('copy'); });
    document.getElementById(prefix + 'ExcelBtn')?.addEventListener('click', function () { exportRows('excel'); });
    document.getElementById(prefix + 'CsvBtn')?.addEventListener('click', function () { exportRows('csv'); });
    document.getElementById(prefix + 'PdfBtn')?.addEventListener('click', function () { exportRows('print'); });
    document.getElementById(prefix + 'PrintBtn')?.addEventListener('click', function () { exportRows('print'); });

    document.getElementById('ratingDetailsClose')?.addEventListener('click', closeRatingDetails);
    document.getElementById('ratingDetailsOverlay')?.addEventListener('click', closeRatingDetails);
    document.getElementById('ratingDetailsBody')?.addEventListener('click', async function (event) {
        const deleteBtn = event.target.closest('.rating-delete-btn');
        if (!deleteBtn) {
            return;
        }
        const id = deleteBtn.getAttribute('data-id');
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete rating?',
            text: 'This review will be removed from Rating Details.',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#dc2626'
        });
        if (!result.isConfirmed) {
            return;
        }
        if (id && id !== 'demo') {
            const response = await fetch('/api/online-course-reports/ratings/details/' + encodeURIComponent(id), { method: 'DELETE' });
            if (response.ok) {
                await openRatingDetails(ratingDetailCourseId, ratingDetailTitle);
                await loadRows();
                return;
            }
        }
        ratingDetailRows = ratingDetailRows.filter(function (row) {
            return String(row.id) !== String(id);
        });
        renderRatingDetails(ratingDetailRows);
        await loadRows();
    });

    if (tbody) {
        tbody.addEventListener('click', async function (event) {
            const viewBtn = event.target.closest('.rating-view-btn');
            if (viewBtn) {
                openRatingDetails(viewBtn.getAttribute('data-id'), viewBtn.getAttribute('data-title'));
                return;
            }
            const deleteBtn = event.target.closest('.guest-delete-btn');
            if (!deleteBtn) {
                return;
            }
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete guest?',
                text: 'This guest will be removed from the report.',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                confirmButtonColor: '#dc2626'
            });
            if (!result.isConfirmed) {
                return;
            }
            const response = await fetch('/api/online-course-reports/guests/' + encodeURIComponent(id), { method: 'DELETE' });
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to delete guest.' });
                return;
            }
            await loadRows();
        });
    }

    loadRows().catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load report.'
        });
    });
}
