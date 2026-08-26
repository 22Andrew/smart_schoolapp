(function () {
    'use strict';

    var tableBody = document.getElementById('uhwTableBody');
    var table = document.getElementById('uhwTable');
    var searchInput = document.getElementById('uhwSearchInput');
    var entriesSelect = document.getElementById('uhwEntriesSelect');
    var showingInfo = document.getElementById('uhwShowingInfo');
    var pagination = document.getElementById('uhwPagination');
    var columnsBtn = document.getElementById('uhwColumnsBtn');
    var columnsDropdown = document.getElementById('uhwColumnsDropdown');
    var modal = document.getElementById('uhwModal');
    var overlay = document.getElementById('uhwModalOverlay');
    var closeBtn = document.getElementById('uhwModalClose');
    var form = document.getElementById('uhwSubmitForm');
    var messageInput = document.getElementById('uhwMessage');
    var documentInput = document.getElementById('uhwDocument');
    var dropzone = document.getElementById('uhwDropzone');
    var dropzoneText = document.getElementById('uhwDropzoneText');
    var saveBtn = document.getElementById('uhwSaveBtn');

    var rows = [];
    var currentTab = 'upcoming';
    var currentPage = 1;
    var pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    var tableFilter = '';
    var sortKey = '';
    var sortDir = 'asc';
    var hiddenColumns = {};
    var currentHomeworkId = null;
    var selectedFile = null;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function statusClass(status) {
        var value = String(status || '').toLowerCase();
        if (value === 'submitted' || value === 'evaluated') {
            return value;
        }
        return 'pending';
    }

    function sortValue(row, key) {
        return row[key] == null ? '' : row[key];
    }

    function getFiltered() {
        var list = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return [
                    row.className, row.section, row.subject, row.homeworkDate, row.submissionDate,
                    row.evaluationDate, row.maxMarks, row.marksObtained, row.note, row.status
                ].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            list.sort(function (a, b) {
                var as = String(sortValue(a, sortKey)).toLowerCase();
                var bs = String(sortValue(b, sortKey)).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function emptyStateHtml(message) {
        return '<tr class="ugm-empty-row"><td colspan="11">' + escapeHtml(message) + '</td></tr>';
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
        for (var i = 0; i < 11; i++) {
            table.classList.toggle('uhw-col-hidden-' + i, hiddenColumns[i] === true);
        }
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
            return;
        }

        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            var status = row.status || 'Pending';
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td>' + escapeHtml(row.className || '') + '</td>'
                + '<td>' + escapeHtml(row.section || '') + '</td>'
                + '<td>' + escapeHtml(row.subject || '') + '</td>'
                + '<td>' + escapeHtml(row.homeworkDate || '') + '</td>'
                + '<td>' + escapeHtml(row.submissionDate || '') + '</td>'
                + '<td>' + escapeHtml(row.evaluationDate || '') + '</td>'
                + '<td>' + escapeHtml(row.maxMarks || '') + '</td>'
                + '<td>' + escapeHtml(row.marksObtained || '') + '</td>'
                + '<td>' + escapeHtml(row.note || '') + '</td>'
                + '<td><span class="uhw-status ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
                + '<td class="ugm-col-center action-cell">'
                + '<button type="button" class="uhw-view-btn" data-id="' + escapeHtml(String(row.id)) + '" title="View">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line>'
                + '</svg></button></td></tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total
                + (total === 1 ? ' entry' : ' entries');
        }
        renderPagination(total, totalPages);
        applyColumnVisibility();
    }

    function headers() {
        return ['Class', 'Section', 'Subject', 'Homework Date', 'Submission Date', 'Evaluation Date',
            'Max Marks', 'Marks Obtained', 'Note', 'Status'];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.className || '', row.section || '', row.subject || '', row.homeworkDate || '',
                row.submissionDate || '', row.evaluationDate || '', row.maxMarks || '',
                row.marksObtained || '', row.note || '', row.status || ''
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
        var list = exportRows();
        if (!list.length) return;
        if (type === 'copy') {
            var tsv = [headers().join('\t')].concat(list.map(function (row) { return row.join('\t'); })).join('\n');
            if (navigator.clipboard) navigator.clipboard.writeText(tsv).catch(function () {});
            return;
        }
        if (type === 'print') {
            window.print();
            return;
        }
        if (type === 'csv') {
            var csv = [headers().join(',')].concat(list.map(function (row) {
                return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
            })).join('\n');
            downloadFile('homework.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(list));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Homework');
            window.XLSX.writeFile(workbook, 'homework.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({ head: [headers()], body: list });
            doc.save('homework.pdf');
        }
    }

    function fillSummary(data) {
        document.getElementById('uhwDescription').textContent = data.description || '';
        document.getElementById('uhwSummaryHomeworkDate').textContent = data.homeworkDate || '';
        document.getElementById('uhwSummarySubmissionDate').textContent = data.submissionDate || '';
        document.getElementById('uhwSummaryEvaluationDate').textContent = data.evaluationDate || '';
        document.getElementById('uhwSummaryCreatedBy').textContent = data.createdBy || '';
        document.getElementById('uhwSummaryEvaluatedBy').textContent = data.evaluatedBy || '';
        document.getElementById('uhwSummaryClass').textContent = data.className || '';
        document.getElementById('uhwSummarySection').textContent = data.section || '';
        document.getElementById('uhwSummarySubject').textContent = data.subject || '';
        var statusEl = document.getElementById('uhwSummaryStatus');
        statusEl.textContent = data.status || 'Pending';
        statusEl.className = 'uhw-status ' + statusClass(data.status);
        if (messageInput) messageInput.value = data.message || '';
        selectedFile = null;
        if (documentInput) documentInput.value = '';
        if (dropzoneText) {
            dropzoneText.textContent = data.documentName
                ? data.documentName
                : 'Drag and drop a file here or click';
        }
    }

    function closeModal() {
        if (modal) modal.hidden = true;
        currentHomeworkId = null;
        selectedFile = null;
    }

    async function openModal(id) {
        var response = await fetch('/api/user/homework/' + id);
        if (!response.ok) {
            var err = {};
            try { err = await response.json(); } catch (e) { err = {}; }
            throw new Error(err.message || 'Failed to load homework details');
        }
        currentHomeworkId = id;
        fillSummary(await response.json());
        if (modal) modal.hidden = false;
        if (messageInput) messageInput.focus();
    }

    async function submitHomework(event) {
        event.preventDefault();
        if (!currentHomeworkId) return;
        var message = messageInput ? messageInput.value.trim() : '';
        if (!message) {
            window.alert('Message is required');
            return;
        }
        var formData = new FormData();
        formData.append('message', message);
        if (selectedFile) {
            formData.append('document', selectedFile);
        } else if (documentInput && documentInput.files && documentInput.files[0]) {
            formData.append('document', documentInput.files[0]);
        }
        if (saveBtn) saveBtn.disabled = true;
        try {
            var response = await fetch('/api/user/homework/' + currentHomeworkId + '/submit', {
                method: 'POST',
                body: formData
            });
            var result = {};
            try { result = await response.json(); } catch (e) { result = {}; }
            if (!response.ok || result.success === false) {
                throw new Error(result.message || 'Failed to save homework');
            }
            closeModal();
            await loadHomework();
        } catch (error) {
            window.alert(error.message || 'Failed to save homework');
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    }

    function setSelectedFile(file) {
        selectedFile = file || null;
        if (dropzoneText) {
            dropzoneText.textContent = selectedFile
                ? selectedFile.name
                : 'Drag and drop a file here or click';
        }
    }

    async function loadHomework() {
        if (tableBody) tableBody.innerHTML = emptyStateHtml('Loading homework...');
        try {
            var response = await fetch('/api/user/homework?tab=' + encodeURIComponent(currentTab));
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load homework');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            currentPage = 1;
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load homework');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    document.querySelectorAll('.uhw-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.uhw-tab').forEach(function (item) { item.classList.remove('active'); });
            tab.classList.add('active');
            currentTab = tab.getAttribute('data-tab') || 'upcoming';
            loadHomework();
        });
    });

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
                if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                else { sortKey = key; sortDir = 'asc'; }
                renderTable();
            });
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
    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            var button = event.target.closest('.uhw-view-btn');
            if (!button) return;
            openModal(button.getAttribute('data-id')).catch(function (error) {
                window.alert(error.message || 'Failed to load homework details');
            });
        });
    }
    document.querySelectorAll('[data-export]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            exportTable(btn.getAttribute('data-export'));
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
        columnsDropdown.querySelectorAll('.uhw-column-toggle').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                applyColumnVisibility();
            });
        });
    }
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (form) form.addEventListener('submit', submitHomework);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
    });
    if (documentInput) {
        documentInput.addEventListener('change', function () {
            setSelectedFile(documentInput.files && documentInput.files[0] ? documentInput.files[0] : null);
        });
    }
    if (dropzone) {
        ['dragenter', 'dragover'].forEach(function (type) {
            dropzone.addEventListener(type, function (event) {
                event.preventDefault();
                dropzone.classList.add('dragover');
            });
        });
        ['dragleave', 'drop'].forEach(function (type) {
            dropzone.addEventListener(type, function (event) {
                event.preventDefault();
                dropzone.classList.remove('dragover');
            });
        });
        dropzone.addEventListener('drop', function (event) {
            var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
            setSelectedFile(file || null);
        });
    }

    loadHomework();
})();
