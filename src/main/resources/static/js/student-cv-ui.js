window.StudentCvUI = (function () {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        return value == null ? '' : String(value);
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok || data.success === false) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function emptyRow(colspan) {
        return '<tr><td colspan="' + colspan + '" class="empty-state-cell">No data available in table</td></tr>';
    }

    function pageSlice(rows, state) {
        const size = parseInt((document.getElementById('entriesSelect') || {}).value || '50', 10) || 50;
        const pages = Math.max(1, Math.ceil(rows.length / size));
        if (state.currentPage > pages) state.currentPage = pages;
        const startIndex = rows.length ? (state.currentPage - 1) * size : 0;
        return {
            pages: pages,
            start: rows.length ? startIndex + 1 : 0,
            end: startIndex + Math.min(size, rows.length - startIndex),
            pageRows: rows.slice(startIndex, startIndex + size)
        };
    }

    function renderFooter(total, slice, state) {
        const showingInfo = document.getElementById('showingInfo');
        const pagination = document.getElementById('pagination');
        if (showingInfo) {
            showingInfo.textContent = total
                ? 'Showing ' + slice.start + ' to ' + slice.end + ' of ' + total + ' entries'
                : 'Showing 0 to 0 of 0 entries';
        }
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-page="' + (state.currentPage - 1) + '"' + (state.currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let page = 1; page <= slice.pages; page++) {
            html += '<button type="button" class="pagination-btn' + (page === state.currentPage ? ' active' : '') + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="' + (state.currentPage + 1) + '"' + (state.currentPage >= slice.pages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function bindPaging(state, render) {
        const searchInput = document.getElementById('searchInput');
        const entriesSelect = document.getElementById('entriesSelect');
        const pagination = document.getElementById('pagination');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                state.currentPage = 1;
                render();
            });
        }
        if (entriesSelect) {
            entriesSelect.addEventListener('change', function () {
                state.currentPage = 1;
                render();
            });
        }
        if (pagination) {
            pagination.addEventListener('click', function (e) {
                const btn = e.target.closest('.pagination-btn');
                if (!btn || btn.disabled) return;
                const page = parseInt(btn.getAttribute('data-page'), 10);
                if (!page || page === state.currentPage) return;
                state.currentPage = page;
                render();
            });
        }
    }

    function toast(message) {
        Swal.fire({ icon: 'success', title: 'Saved', text: message || 'Saved successfully!', timer: 1500, showConfirmButton: false });
    }

    function error(message) {
        Swal.fire({ icon: 'error', title: 'Error', text: message || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    return {
        escapeHtml: escapeHtml,
        display: display,
        fetchJson: fetchJson,
        emptyRow: emptyRow,
        pageSlice: pageSlice,
        renderFooter: renderFooter,
        bindPaging: bindPaging,
        toast: toast,
        error: error
    };
})();
