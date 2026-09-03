(function () {
    'use strict';

    var tableBody = document.getElementById('ualTableBody');
    var table = document.getElementById('ualTable');
    var searchInput = document.getElementById('ualSearchInput');
    var entriesSelect = document.getElementById('ualEntriesSelect');
    var showingInfo = document.getElementById('ualShowingInfo');
    var pagination = document.getElementById('ualPagination');
    var columnsBtn = document.getElementById('ualColumnsBtn');
    var columnsDropdown = document.getElementById('ualColumnsDropdown');
    var modal = document.getElementById('ualModal');
    var overlay = document.getElementById('ualModalOverlay');
    var closeBtn = document.getElementById('ualModalClose');
    var form = document.getElementById('ualForm');
    var titleEl = document.getElementById('ualModalTitle');
    var applyDateInput = document.getElementById('ualApplyDate');
    var fromDateInput = document.getElementById('ualFromDate');
    var toDateInput = document.getElementById('ualToDate');
    var reasonInput = document.getElementById('ualReason');
    var documentInput = document.getElementById('ualDocument');
    var dropzone = document.getElementById('ualDropzone');
    var dropzoneText = document.getElementById('ualDropzoneText');
    var saveBtn = document.getElementById('ualSaveBtn');

    var rows = [];
    var currentPage = 1;
    var pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    var tableFilter = '';
    var sortKey = '';
    var sortDir = 'asc';
    var hiddenColumns = {};
    var editingId = null;
    var selectedFile = null;

    function notify(type, title, text) {
        if (window.Swal) {
            return Swal.fire({
                icon: type,
                title: title,
                text: text,
                confirmButtonColor: '#727cf5'
            });
        }
        window.alert(text || title);
        return Promise.resolve();
    }

    async function confirmAction(title, text, confirmText) {
        if (window.Swal) {
            var result = await Swal.fire({
                icon: 'warning',
                title: title,
                text: text,
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: confirmText || 'Delete'
            });
            return result.isConfirmed;
        }
        return window.confirm(text || title);
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function toIso(usDate) {
        if (!usDate) return '';
        var parts = String(usDate).split('/');
        if (parts.length !== 3) return usDate;
        return parts[2] + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
    }

    function toUs(isoDate) {
        if (!isoDate) return '';
        var parts = String(isoDate).split('-');
        if (parts.length !== 3) return isoDate;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function todayIso() {
        var now = new Date();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        return now.getFullYear() + '-' + month + '-' + day;
    }

    function statusClass(display) {
        var value = String(display || '').toLowerCase();
        if (value.indexOf('approved') === 0) return 'approved';
        if (value.indexOf('disapproved') === 0) return 'disapproved';
        return 'pending';
    }

    function actionButtons(row) {
        if (!row.canEdit) {
            return '';
        }
        var id = escapeHtml(String(row.id));
        return '<div class="ual-actions">'
            + '<button type="button" class="uhw-view-btn" data-edit="' + id + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg></button>'
            + '<button type="button" class="uhw-view-btn" data-delete="' + id + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
            + '</div>';
    }

    function getFiltered() {
        var list = rows.slice();
        var filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                return [
                    row.className, row.section, row.applyDate, row.fromDate, row.toDate,
                    row.reason, row.statusDisplay
                ].join(' ').toLowerCase().indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            list.sort(function (a, b) {
                var as = String(a[sortKey] == null ? '' : a[sortKey]).toLowerCase();
                var bs = String(b[sortKey] == null ? '' : b[sortKey]).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function emptyStateHtml(message) {
        return '<tr class="ugm-empty-row"><td colspan="8">' + escapeHtml(message) + '</td></tr>';
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
        for (var i = 0; i < 8; i++) {
            table.classList.toggle('ugm-col-hidden-' + i, hiddenColumns[i] === true);
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
            var status = row.statusDisplay || 'Pending';
            return '<tr>'
                + '<td>' + escapeHtml(row.className || '') + '</td>'
                + '<td>' + escapeHtml(row.section || '') + '</td>'
                + '<td>' + escapeHtml(row.applyDate || '') + '</td>'
                + '<td>' + escapeHtml(row.fromDate || '') + '</td>'
                + '<td>' + escapeHtml(row.toDate || '') + '</td>'
                + '<td>' + escapeHtml(row.reason || '') + '</td>'
                + '<td><span class="ual-status ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
                + '<td class="ugm-col-center action-cell">' + actionButtons(row) + '</td>'
                + '</tr>';
        }).join('');
        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total
                + (total === 1 ? ' entry' : ' entries');
        }
        renderPagination(total, totalPages);
        applyColumnVisibility();
    }

    function headers() {
        return ['Class', 'Section', 'Apply Date', 'From Date', 'To Date', 'Reason', 'Status'];
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return [
                row.className || '',
                row.section || '',
                row.applyDate || '',
                row.fromDate || '',
                row.toDate || '',
                row.reason || '',
                row.statusDisplay || ''
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
        if (type === 'print') {
            window.print();
            return;
        }
        if (!data.length) return;
        if (type === 'copy') {
            var tsv = [headers().join('\t')].concat(data.map(function (row) {
                return row.join('\t');
            })).join('\n');
            if (navigator.clipboard) navigator.clipboard.writeText(tsv).catch(function () {});
            return;
        }
        if (type === 'csv') {
            var csv = [headers().join(',')].concat(data.map(function (row) {
                return row.map(function (cell) {
                    return '"' + String(cell).replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');
            downloadFile('leave-list.csv', csv, 'text/csv');
            return;
        }
        if (type === 'excel' && window.XLSX) {
            var worksheet = window.XLSX.utils.aoa_to_sheet([headers()].concat(data));
            var workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave List');
            window.XLSX.writeFile(workbook, 'leave-list.xlsx');
            return;
        }
        if (type === 'pdf' && window.jspdf) {
            var doc = new window.jspdf.jsPDF('l', 'pt');
            doc.autoTable({ head: [headers()], body: data });
            doc.save('leave-list.pdf');
        }
    }

    function resetFile() {
        selectedFile = null;
        if (documentInput) documentInput.value = '';
        if (dropzoneText) dropzoneText.textContent = 'Drag and drop a file here or click';
    }

    function openModal(title) {
        titleEl.textContent = title;
        modal.hidden = false;
    }

    function closeModal() {
        modal.hidden = true;
        editingId = null;
        form.reset();
        resetFile();
        if (saveBtn) saveBtn.disabled = false;
    }

    function openAdd() {
        editingId = null;
        form.reset();
        resetFile();
        applyDateInput.value = todayIso();
        fromDateInput.value = '';
        toDateInput.value = '';
        reasonInput.value = '';
        openModal('Add Leave');
    }

    async function openEdit(id) {
        var response = await fetch('/api/user/applyleave/' + encodeURIComponent(id));
        var data = {};
        try { data = await response.json(); } catch (e) { data = {}; }
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load leave');
        }
        editingId = data.id;
        applyDateInput.value = toIso(data.applyDate);
        fromDateInput.value = toIso(data.fromDate);
        toDateInput.value = toIso(data.toDate);
        reasonInput.value = data.reason || '';
        resetFile();
        if (data.documentPath && dropzoneText) {
            dropzoneText.textContent = 'Existing document attached. Choose a file to replace it.';
        }
        openModal('Edit Leave');
    }

    async function saveLeave(event) {
        event.preventDefault();
        if (!applyDateInput.value || !fromDateInput.value || !toDateInput.value) {
            await notify('warning', 'Required Field', 'Apply Date, From Date and To Date are required.');
            return;
        }
        var payload = new FormData();
        payload.append('applyDate', toUs(applyDateInput.value));
        payload.append('fromDate', toUs(fromDateInput.value));
        payload.append('toDate', toUs(toDateInput.value));
        payload.append('reason', reasonInput.value || '');
        if (selectedFile) {
            payload.append('document', selectedFile);
        }
        saveBtn.disabled = true;
        try {
            var url = editingId
                ? '/api/user/applyleave/' + encodeURIComponent(editingId)
                : '/api/user/applyleave';
            var response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                body: payload
            });
            var data = {};
            try { data = await response.json(); } catch (e) { data = {}; }
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save leave');
            }
            closeModal();
            await loadLeaves();
            await notify('success', 'Saved', data.message || 'Leave saved successfully');
        } catch (error) {
            await notify('error', 'Error', error.message || 'Failed to save leave');
        } finally {
            saveBtn.disabled = false;
        }
    }

    async function deleteLeave(id) {
        var confirmed = await confirmAction('Delete leave?', 'This leave request will be removed.', 'Delete');
        if (!confirmed) return;
        var response = await fetch('/api/user/applyleave/' + encodeURIComponent(id), { method: 'DELETE' });
        var data = {};
        try { data = await response.json(); } catch (e) { data = {}; }
        if (!response.ok) {
            await notify('error', 'Error', data.message || 'Failed to delete leave');
            return;
        }
        await loadLeaves();
        await notify('success', 'Deleted', data.message || 'Leave deleted successfully');
    }

    async function loadLeaves() {
        try {
            var response = await fetch('/api/user/applyleave');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load leave list');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            renderTable();
        } catch (error) {
            tableBody.innerHTML = emptyStateHtml(error.message || 'Failed to load leave list');
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
        }
    }

    function bindDropzone() {
        if (!dropzone) return;
        ['dragenter', 'dragover'].forEach(function (eventName) {
            dropzone.addEventListener(eventName, function (event) {
                event.preventDefault();
                dropzone.classList.add('dragover');
            });
        });
        ['dragleave', 'drop'].forEach(function (eventName) {
            dropzone.addEventListener(eventName, function (event) {
                event.preventDefault();
                dropzone.classList.remove('dragover');
            });
        });
        dropzone.addEventListener('drop', function (event) {
            var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
            if (!file) return;
            selectedFile = file;
            dropzoneText.textContent = file.name;
        });
        if (documentInput) {
            documentInput.addEventListener('change', function () {
                selectedFile = documentInput.files && documentInput.files[0] ? documentInput.files[0] : null;
                dropzoneText.textContent = selectedFile
                    ? selectedFile.name
                    : 'Drag and drop a file here or click';
            });
        }
    }

    function bindEvents() {
        document.getElementById('ualAddBtn').addEventListener('click', openAdd);
        if (overlay) overlay.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (form) form.addEventListener('submit', saveLeave);
        bindDropzone();

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
                var editBtn = event.target.closest('[data-edit]');
                if (editBtn) {
                    openEdit(editBtn.getAttribute('data-edit')).catch(function (error) {
                        notify('error', 'Error', error.message || 'Failed to load leave');
                    });
                    return;
                }
                var deleteBtn = event.target.closest('[data-delete]');
                if (deleteBtn) {
                    deleteLeave(deleteBtn.getAttribute('data-delete'));
                }
            });
        }
        ['ualCopyBtn', 'ualExcelBtn', 'ualCsvBtn', 'ualPdfBtn', 'ualPrintBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                var type = 'copy';
                if (id === 'ualExcelBtn') type = 'excel';
                else if (id === 'ualCsvBtn') type = 'csv';
                else if (id === 'ualPdfBtn') type = 'pdf';
                else if (id === 'ualPrintBtn') type = 'print';
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
            columnsDropdown.querySelectorAll('.ual-column-toggle').forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hiddenColumns[Number(checkbox.getAttribute('data-column'))] = !checkbox.checked;
                    applyColumnVisibility();
                });
            });
        }
    }

    bindEvents();
    loadLeaves();
})();
