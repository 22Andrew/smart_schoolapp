window.TransportUI = (function () {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        if (value == null || String(value).trim() === '') return '';
        return String(value);
    }

    function emptyRow(colspan) {
        return ''
            + '<tr><td colspan="' + colspan + '" class="empty-state-cell">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration"><svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</td></tr>';
    }

    function actionButtons(id, extra) {
        return ''
            + '<div class="action-buttons">'
            + (extra || '')
            + '<button type="button" class="btn-action btn-edit" data-id="' + escapeHtml(id) + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>'
            + '<button type="button" class="btn-action btn-delete" data-id="' + escapeHtml(id) + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
            + '</div>';
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

    function pageSlice(rows, state) {
        const entriesSelect = document.getElementById('entriesSelect');
        const size = parseInt(entriesSelect && entriesSelect.value ? entriesSelect.value : '50', 10) || 50;
        const pages = Math.max(1, Math.ceil(rows.length / size));
        if (state.currentPage > pages) state.currentPage = pages;
        const startIndex = rows.length ? (state.currentPage - 1) * size : 0;
        return {
            size: size,
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
        if (!total) {
            pagination.innerHTML = '<button type="button" class="pagination-btn" disabled>&lt;</button><button type="button" class="pagination-btn active">1</button><button type="button" class="pagination-btn" disabled>&gt;</button>';
            return;
        }
        let html = '<button type="button" class="pagination-btn" data-page="' + (state.currentPage - 1) + '"' + (state.currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let page = 1; page <= slice.pages; page++) {
            html += '<button type="button" class="pagination-btn' + (page === state.currentPage ? ' active' : '') + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="' + (state.currentPage + 1) + '"' + (state.currentPage >= slice.pages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function bindExport(filename, headers, rowsFn) {
        function exportText() {
            return [headers.join('\t')].concat(rowsFn().map(function (values) {
                return values.join('\t');
            })).join('\n');
        }
        ['copyBtn', 'excelBtn', 'csvBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (id === 'printBtn' || id === 'pdfBtn') {
                    window.print();
                    return;
                }
                const text = exportText();
                if (id === 'copyBtn') {
                    navigator.clipboard.writeText(text).then(function () {
                        Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
                    });
                    return;
                }
                const csv = text.split('\n').map(function (line) {
                    return line.split('\t').map(function (value) {
                        return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
                    }).join(',');
                }).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = id === 'excelBtn' ? filename + '.xls' : filename + '.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
        });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok || data.success === false) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function toast(message) {
        Swal.fire({ icon: 'success', title: 'Saved', text: message || 'Saved successfully!', timer: 1500, showConfirmButton: false });
    }

    function error(message) {
        Swal.fire({ icon: 'error', title: 'Error', text: message || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }

    return {
        escapeHtml: escapeHtml,
        display: display,
        emptyRow: emptyRow,
        actionButtons: actionButtons,
        bindPaging: bindPaging,
        pageSlice: pageSlice,
        renderFooter: renderFooter,
        bindExport: bindExport,
        fetchJson: fetchJson,
        toast: toast,
        error: error,
        openModal: openModal,
        closeModal: closeModal
    };
})();
