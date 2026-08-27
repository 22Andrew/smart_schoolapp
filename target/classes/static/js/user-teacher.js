(function () {
    'use strict';

    var tableBody = document.getElementById('utrTableBody');
    var table = document.getElementById('utrTable');
    var searchInput = document.getElementById('utrSearchInput');
    var entriesSelect = document.getElementById('utrEntriesSelect');
    var showingInfo = document.getElementById('utrShowingInfo');
    var pagination = document.getElementById('utrPagination');
    var columnsBtn = document.getElementById('utrColumnsBtn');
    var columnsDropdown = document.getElementById('utrColumnsDropdown');

    var rateModal = document.getElementById('utrRateModal');
    var rateOverlay = document.getElementById('utrRateOverlay');
    var rateClose = document.getElementById('utrRateClose');
    var ratingStars = document.getElementById('utrRatingStars');
    var commentInput = document.getElementById('utrCommentInput');
    var saveBtn = document.getElementById('utrSaveBtn');

    var rows = [];
    var currentPage = 1;
    var pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    var tableFilter = '';
    var sortKey = '';
    var sortDir = 'asc';
    var hiddenColumns = {};
    var selectedRating = 0;
    var activeTeacher = null;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function joinLines(values) {
        if (!Array.isArray(values) || !values.length) {
            return '';
        }
        return values.map(function (line) {
            return escapeHtml(line);
        }).join('<br>');
    }

    function renderStars(rating) {
        var value = Math.max(0, Math.min(5, parseInt(rating, 10) || 0));
        if (!value) {
            return '';
        }
        var html = '<span class="utr-rating-stars">';
        for (var i = 1; i <= 5; i++) {
            html += '<span class="utr-star ' + (i <= value ? '' : 'empty') + '">★</span>';
        }
        html += '</span><span class="utr-rating-value">' + value + '</span>';
        return html;
    }

    function sortValue(row, key) {
        if (key === 'myRating') {
            return Number(row.myRating) || 0;
        }
        return row[key] == null ? '' : row[key];
    }

    function getFiltered() {
        var filtered = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            filtered = filtered.filter(function (row) {
                return [
                    row.teacherDisplay, row.teacherName, row.email, row.phone,
                    row.comment, (row.subjectLines || []).join(' '),
                    (row.timeLines || []).join(' '), (row.roomLines || []).join(' ')
                ].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            filtered.sort(function (a, b) {
                var av = sortValue(a, sortKey);
                var bv = sortValue(b, sortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                var as = String(av).toLowerCase();
                var bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }

    function emptyStateHtml(message) {
        return '<tr class="ugm-empty-row"><td colspan="9">' + escapeHtml(message) + '</td></tr>';
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        var html = '<button type="button" class="ugm-page-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (var page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="ugm-page-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="ugm-page-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function applyColumnVisibility() {
        if (!table) return;
        for (var i = 0; i < 9; i++) {
            table.classList.toggle('utr-col-hidden-' + i, hiddenColumns[i] === true);
        }
    }

    function renderTeacherName(row) {
        var html = '<span class="utr-teacher-name">' + escapeHtml(row.teacherDisplay || row.teacherName || '') + '</span>';
        if (row.classTeacher) {
            html += '<span class="utr-class-teacher-badge">Class Teacher</span>';
        }
        return html;
    }

    function renderRateButton(row) {
        if (row.hasRating) {
            return '';
        }
        return '<button type="button" class="utr-rate-add-btn" data-staff-id="'
            + escapeHtml(row.staffIdCode || '') + '" title="Rate">+</button>';
    }

    function renderTable() {
        if (!tableBody) return;
        var filtered = getFiltered();
        var total = filtered.length;
        var totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = emptyStateHtml('No data available in table');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            applyColumnVisibility();
            return;
        }

        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            return '<tr>'
                + '<td>' + renderTeacherName(row) + '</td>'
                + '<td class="utr-multiline-cell">' + joinLines(row.subjectLines) + '</td>'
                + '<td class="utr-multiline-cell">' + joinLines(row.timeLines) + '</td>'
                + '<td class="utr-multiline-cell">' + joinLines(row.roomLines) + '</td>'
                + '<td>' + escapeHtml(row.email || '') + '</td>'
                + '<td>' + escapeHtml(row.phone || '') + '</td>'
                + '<td>' + renderStars(row.myRating) + '</td>'
                + '<td>' + escapeHtml(row.comment || '') + '</td>'
                + '<td class="ugm-col-center">' + renderRateButton(row) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
        applyColumnVisibility();
    }

    function headers() {
        return [
            'Teacher Name', 'Subject', 'Time', 'Room No.', 'Email', 'Phone', 'My Rating', 'Comment'
        ];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.teacherDisplay || row.teacherName || '',
                (row.subjectLines || []).join('; '),
                (row.timeLines || []).join('; '),
                (row.roomLines || []).join('; '),
                row.email || '',
                row.phone || '',
                row.myRating == null ? '' : row.myRating,
                row.comment || ''
            ];
        });
    }

    function downloadFile(filename, content, mimeType) {
        var blob = new Blob([content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportTable(type) {
        var data = exportRows();
        if (!data.length) return;

        if (type === 'copy') {
            var tsv = [headers().join('\t')].concat(data.map(function (row) {
                return row.join('\t');
            })).join('\n');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(tsv).catch(function () {});
            }
            return;
        }
        if (type === 'print') {
            window.print();
            return;
        }
        if (type === 'csv') {
            var csv = [headers().join(',')].concat(data.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('teachers-reviews.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(data));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers Reviews');
            window.XLSX.writeFile(workbook, 'teachers-reviews.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({
                head: [headers()],
                body: data
            });
            doc.save('teachers-reviews.pdf');
        }
    }

    function updateStarSelection(value) {
        selectedRating = value;
        if (!ratingStars) return;
        ratingStars.querySelectorAll('.utr-star-btn').forEach(function (btn) {
            var starValue = parseInt(btn.getAttribute('data-value'), 10);
            btn.classList.toggle('selected', starValue <= value);
        });
    }

    function openRateModal(row) {
        activeTeacher = row;
        selectedRating = 0;
        if (commentInput) commentInput.value = '';
        updateStarSelection(0);
        if (rateModal) rateModal.hidden = false;
    }

    function closeRateModal() {
        activeTeacher = null;
        selectedRating = 0;
        if (rateModal) rateModal.hidden = true;
    }

    async function saveRating() {
        if (!activeTeacher) return;
        if (!selectedRating) {
            alert('Please select a rating.');
            return;
        }
        var comment = commentInput ? commentInput.value.trim() : '';
        if (!comment) {
            alert('Please enter a comment.');
            return;
        }

        if (saveBtn) saveBtn.disabled = true;
        try {
            var response = await fetch('/api/user/teacher/rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staffIdCode: activeTeacher.staffIdCode,
                    rating: selectedRating,
                    comment: comment
                })
            });
            var result = await response.json();
            if (!response.ok || result.success === false || result.success === 'false') {
                throw new Error(result.message || 'Failed to save rating');
            }

            var staffIdCode = activeTeacher.staffIdCode;
            rows = rows.map(function (row) {
                if (row.staffIdCode !== staffIdCode) {
                    return row;
                }
                return Object.assign({}, row, {
                    hasRating: true,
                    myRating: result.rating ? result.rating.myRating : selectedRating,
                    comment: result.rating ? result.rating.comment : comment,
                    ratingId: result.rating ? result.rating.ratingId : null
                });
            });
            closeRateModal();
            renderTable();
        } catch (error) {
            alert(error.message || 'Failed to save rating');
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    }

    function bindEvents() {
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                tableFilter = searchInput.value;
                currentPage = 1;
                renderTable();
            });
        }
        if (entriesSelect) {
            entriesSelect.addEventListener('change', function () {
                pageSize = parseInt(entriesSelect.value, 10) || 50;
                currentPage = 1;
                renderTable();
            });
        }
        if (table) {
            table.querySelectorAll('th[data-sort]').forEach(function (th) {
                th.addEventListener('click', function () {
                    var key = th.getAttribute('data-sort');
                    if (sortKey === key) {
                        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortKey = key;
                        sortDir = 'asc';
                    }
                    renderTable();
                });
            });
            table.addEventListener('click', function (event) {
                var btn = event.target.closest('.utr-rate-add-btn');
                if (!btn) return;
                var staffId = btn.getAttribute('data-staff-id');
                var row = rows.find(function (item) {
                    return item.staffIdCode === staffId;
                });
                if (row) {
                    openRateModal(row);
                }
            });
        }
        if (pagination) {
            pagination.addEventListener('click', function (event) {
                var btn = event.target.closest('.ugm-page-btn');
                if (!btn || btn.disabled) return;
                if (btn.dataset.nav === 'prev') currentPage -= 1;
                else if (btn.dataset.nav === 'next') currentPage += 1;
                else if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
                renderTable();
            });
        }
        ['utrCopyBtn', 'utrExcelBtn', 'utrCsvBtn', 'utrPdfBtn', 'utrPrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'copy';
                if (id === 'utrExcelBtn') type = 'excel';
                else if (id === 'utrCsvBtn') type = 'csv';
                else if (id === 'utrPdfBtn') type = 'pdf';
                else if (id === 'utrPrintBtn') type = 'print';
                exportTable(type);
            });
        });
        if (columnsBtn && columnsDropdown) {
            columnsBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                columnsDropdown.classList.toggle('active');
            });
            document.addEventListener('click', function (event) {
                if (!columnsDropdown.contains(event.target) && event.target !== columnsBtn) {
                    columnsDropdown.classList.remove('active');
                }
            });
            columnsDropdown.querySelectorAll('.utr-column-toggle').forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                    applyColumnVisibility();
                });
            });
        }
        if (ratingStars) {
            ratingStars.querySelectorAll('.utr-star-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    updateStarSelection(parseInt(btn.getAttribute('data-value'), 10));
                });
            });
        }
        if (rateOverlay) rateOverlay.addEventListener('click', closeRateModal);
        if (rateClose) rateClose.addEventListener('click', closeRateModal);
        if (saveBtn) saveBtn.addEventListener('click', saveRating);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && rateModal && !rateModal.hidden) {
                closeRateModal();
            }
        });
    }

    async function loadTeachers() {
        try {
            var response = await fetch('/api/user/teacher');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load teachers');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load teachers');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    bindEvents();
    loadTeachers();
})();
