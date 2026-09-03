window.CertificateUI = (function () {
    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(data.message || 'Request failed');
        return data.data !== undefined && (options && options.expectWrap) ? data : data;
    }

    async function postJson(url, body, method) {
        const response = await fetch(url, {
            method: method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        });
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(data.message || 'Request failed');
        return data;
    }

    function pageSize() {
        return parseInt((document.getElementById('entriesSelect') || {}).value, 10) || 10;
    }

    function pageSlice(rows, state) {
        const size = pageSize();
        const totalPages = Math.max(1, Math.ceil(rows.length / size) || 1);
        if (state.currentPage > totalPages) state.currentPage = totalPages;
        const start = (state.currentPage - 1) * size;
        return { pageRows: rows.slice(start, start + size), start: rows.length ? start + 1 : 0, end: Math.min(start + size, rows.length), totalPages: totalPages };
    }

    function renderFooter(total, slice, state) {
        const info = document.getElementById('showingInfo');
        const pagination = document.getElementById('pagination');
        if (info) info.textContent = 'Showing ' + slice.start + ' to ' + slice.end + ' of ' + total + ' entries';
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"' + (state.currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= slice.totalPages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === state.currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"' + (state.currentPage >= slice.totalPages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function bindPaging(state, render) {
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
        const entries = document.getElementById('entriesSelect');
        if (entries) entries.addEventListener('change', function () { state.currentPage = 1; render(); });
        const search = document.getElementById('searchInput');
        if (search) search.addEventListener('input', function () { state.currentPage = 1; render(); });
    }

    function emptyRow(cols, message) {
        return '<tr><td colspan="' + cols + '" class="empty-state-cell"><p class="empty-message">' + escapeHtml(message || 'No data available in table') + '</p></td></tr>';
    }

    function error(message) {
        Swal.fire({ icon: 'error', title: 'Error', text: message || 'Something went wrong', confirmButtonColor: '#8b5cf6' });
    }

    function success(message) {
        Swal.fire({ icon: 'success', title: 'Success', text: message, confirmButtonColor: '#8b5cf6', timer: 1400, showConfirmButton: false });
    }

    async function loadClasses(classSelect, sectionSelect, state) {
        const data = await fetch('/api/classes').then(function (r) { return r.json(); }).catch(function () { return []; });
        state.classes = Array.isArray(data) ? data : [];
        classSelect.innerHTML = '<option value="">Select</option>' + state.classes.map(function (item) {
            return '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
        classSelect.addEventListener('change', function () {
            const selected = state.classes.find(function (item) { return String(item.id) === classSelect.value; });
            const sections = selected && selected.sections ? selected.sections : [];
            sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
                return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
            }).join('');
        });
    }

    return { escapeHtml: escapeHtml, fetchJson: fetchJson, postJson: postJson, pageSlice: pageSlice, renderFooter: renderFooter, bindPaging: bindPaging, emptyRow: emptyRow, error: error, success: success, loadClasses: loadClasses };
})();
