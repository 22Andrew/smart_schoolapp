window.FrontCms = (function () {
    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('T')[0].split('-');
        if (parts.length !== 3) return String(value);
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    async function api(url, options) {
        const response = await fetch(url, options);
        const result = await response.json().catch(function () { return {}; });
        if (!response.ok || result.success === false) {
            throw new Error(result.message || 'Request failed');
        }
        return result;
    }

    function setPreview(prefix, url, fileName) {
        const preview = document.getElementById(prefix + 'ImagePreview');
        const area = document.getElementById(prefix + 'FileUploadArea');
        const label = document.getElementById(prefix + 'ImageLabel');
        const deleteBtn = document.getElementById(prefix + 'DeleteImageBtn');
        if (preview) {
            if (url) {
                preview.src = url;
                preview.classList.add('visible');
                if (area) area.classList.add('has-preview');
            } else {
                preview.removeAttribute('src');
                preview.classList.remove('visible');
                if (area) area.classList.remove('has-preview');
            }
        }
        if (label) label.textContent = fileName || 'Drag and drop a file here or click';
        if (deleteBtn) deleteBtn.classList.toggle('visible', Boolean(url));
    }

    function bindSeo(prefix) {
        const toggle = document.getElementById(prefix + 'SeoToggle');
        if (!toggle) return;
        toggle.addEventListener('click', function () {
            const fields = document.getElementById(prefix + 'SeoFields');
            const plus = document.getElementById(prefix + 'SeoPlus');
            const open = fields.classList.toggle('open');
            plus.textContent = open ? '−' : '+';
        });
    }

    function bindMediaInsert(prefix) {
        const btn = document.getElementById(prefix + 'AddMediaBtn');
        const input = document.getElementById(prefix + 'MediaInput');
        const area = document.getElementById(prefix + 'Description');
        if (!btn || !input || !area) return;
        btn.addEventListener('click', function () { input.click(); });
        input.addEventListener('change', async function () {
            const file = input.files && input.files[0];
            input.value = '';
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            try {
                const result = await api('/api/front/editor-media', { method: 'POST', body: formData });
                const url = result.data && result.data.url;
                if (url) area.value += (area.value ? '\n' : '') + '<img src="' + url + '" alt="' + file.name + '">\n';
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
            }
        });
    }

    function tableState() {
        return { rows: [], currentPage: 1, sortKey: '', sortDir: 'asc' };
    }

    function pageSize() {
        const select = document.getElementById('entriesSelect');
        return parseInt(select && select.value, 10) || 50;
    }

    function columnVisible(index) {
        const toggle = document.querySelector('#columnVisibilityDropdown .column-toggle[data-column="' + index + '"]');
        return !toggle || toggle.checked;
    }

    function bindToolbar(state, render, exportRows, headers, fileName) {
        const searchInput = document.getElementById('searchInput');
        const entriesSelect = document.getElementById('entriesSelect');
        if (searchInput) searchInput.addEventListener('input', function () { state.currentPage = 1; render(); });
        if (entriesSelect) entriesSelect.addEventListener('change', function () { state.currentPage = 1; render(); });
        const pagination = document.getElementById('pagination');
        if (pagination) {
            pagination.addEventListener('click', function (e) {
                const btn = e.target.closest('.pagination-btn');
                if (!btn || btn.disabled) return;
                if (btn.dataset.page) state.currentPage = parseInt(btn.dataset.page, 10);
                if (btn.dataset.nav === 'prev') state.currentPage -= 1;
                if (btn.dataset.nav === 'next') state.currentPage += 1;
                render();
            });
        }
        document.querySelectorAll('th.sortable').forEach(function (th) {
            th.addEventListener('click', function () {
                if (state.sortKey === th.dataset.sort) {
                    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortKey = th.dataset.sort;
                    state.sortDir = 'asc';
                }
                render();
            });
        });
        const columnBtn = document.getElementById('columnVisibilityBtn');
        const columnDropdown = document.getElementById('columnVisibilityDropdown');
        if (columnBtn && columnDropdown) {
            columnBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                columnDropdown.classList.toggle('active');
            });
            columnDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
            document.addEventListener('click', function () { columnDropdown.classList.remove('active'); });
            columnDropdown.querySelectorAll('.column-toggle').forEach(function (toggle) {
                toggle.addEventListener('change', render);
            });
        }
        document.getElementById('copyBtn') && document.getElementById('copyBtn').addEventListener('click', function () {
            const text = [headers].concat(exportRows()).map(function (row) { return row.join('\t'); }).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
            });
        });
        document.getElementById('excelBtn') && document.getElementById('excelBtn').addEventListener('click', function () {
            if (!window.XLSX) return;
            const sheet = XLSX.utils.aoa_to_sheet([headers].concat(exportRows()));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, sheet, fileName);
            XLSX.writeFile(wb, fileName + '.xlsx');
        });
        document.getElementById('csvBtn') && document.getElementById('csvBtn').addEventListener('click', function () {
            const csv = [headers].concat(exportRows()).map(function (row) {
                return row.map(function (value) { return '"' + String(value || '').replace(/"/g, '""') + '"'; }).join(',');
            }).join('\n');
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
            link.download = fileName + '.csv';
            link.click();
        });
        document.getElementById('printBtn') && document.getElementById('printBtn').addEventListener('click', function () { window.print(); });
        document.getElementById('pdfBtn') && document.getElementById('pdfBtn').addEventListener('click', function () { window.print(); });
    }

    function paginate(state, data, renderRow, colCount) {
        const size = pageSize();
        const totalPages = Math.max(1, Math.ceil(data.length / size) || 1);
        if (state.currentPage > totalPages) state.currentPage = totalPages;
        const start = (state.currentPage - 1) * size;
        const pageRows = data.slice(start, start + size);
        const tableBody = document.getElementById('cmsTableBody');
        tableBody.innerHTML = pageRows.length ? pageRows.map(renderRow).join('')
            : '<tr><td colspan="' + colCount + '" class="empty-message">No data available in table</td></tr>';
        const from = data.length ? start + 1 : 0;
        const to = Math.min(start + size, data.length);
        document.getElementById('showingInfo').textContent = 'Showing ' + from + ' to ' + to + ' of ' + data.length + ' entries';
        let html = '<button type="button" class="pagination-btn" data-nav="prev"' + (state.currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= totalPages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === state.currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"' + (state.currentPage >= totalPages ? ' disabled' : '') + '>&gt;</button>';
        document.getElementById('pagination').innerHTML = html;
        document.querySelectorAll('#cmsTable thead th').forEach(function (th, index) {
            th.style.display = columnVisible(index) ? '' : 'none';
            if (th.dataset.sort) {
                th.classList.toggle('sorted-asc', state.sortKey === th.dataset.sort && state.sortDir === 'asc');
                th.classList.toggle('sorted-desc', state.sortKey === th.dataset.sort && state.sortDir === 'desc');
            }
        });
    }

    async function confirmDelete(text) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete?',
            text: text,
            showCancelButton: true,
            confirmButtonColor: '#dc2626'
        });
        return result.isConfirmed;
    }

    return {
        escapeHtml: escapeHtml,
        formatDate: formatDate,
        api: api,
        setPreview: setPreview,
        bindSeo: bindSeo,
        bindMediaInsert: bindMediaInsert,
        tableState: tableState,
        columnVisible: columnVisible,
        bindToolbar: bindToolbar,
        paginate: paginate,
        confirmDelete: confirmDelete
    };
})();
