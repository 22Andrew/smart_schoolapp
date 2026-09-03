document.addEventListener('DOMContentLoaded', function () {
    let terms = [];
    let currentPage = 1;
    let pageSize = 100;
    let editingId = null;

    const table = document.getElementById('termTable');
    const tableBody = document.getElementById('termTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const termForm = document.getElementById('termForm');
    const termModal = document.getElementById('termModal');
    const termModalTitle = document.getElementById('termModalTitle');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    function openModal() {
        if (termModal) {
            termModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (termModal) {
            termModal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>'
            + '</button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
            + '</button>';
    }

    function resetModal() {
        editingId = null;
        termForm.reset();
        termModalTitle.textContent = 'Add Term';
    }

    function getFilteredTerms() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return terms.slice();
        return terms.filter(function (item) {
            return [item.termName, item.termCode, item.description].join(' ').toLowerCase().indexOf(term) !== -1;
        });
    }

    function renderTerms() {
        const filtered = getFilteredTerms();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#94a3b8;">No terms found</td></tr>';
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            pagination.innerHTML = '<button type="button" class="pagination-btn" disabled>&lsaquo;</button><button type="button" class="pagination-btn active">1</button><button type="button" class="pagination-btn" disabled>&rsaquo;</button>';
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (item) {
            return '<tr data-id="' + item.id + '">'
                + '<td>' + escapeHtml(item.termName) + '</td>'
                + '<td>' + escapeHtml(item.termCode) + '</td>'
                + '<td class="description-cell">' + escapeHtml(item.description || '') + '</td>'
                + '<td class="action-cell"><div class="action-buttons">' + createActionButtonsHtml() + '</div></td>'
                + '</tr>';
        }).join('');

        showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        let pHtml = '<button type="button" class="pagination-btn" data-nav="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let p = 1; p <= totalPages; p++) {
            pHtml += '<button type="button" class="pagination-btn' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        pHtml += '<button type="button" class="pagination-btn" data-nav="next"' + (currentPage >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = pHtml;
    }

    async function loadTerms() {
        const response = await fetch('/api/cbse-exam-terms');
        if (!response.ok) throw new Error('Failed to load terms');
        terms = await response.json();
        renderTerms();
    }

    document.getElementById('addTermBtn')?.addEventListener('click', function () {
        resetModal();
        openModal();
    });

    termForm?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = {
            termName: document.getElementById('termName').value.trim(),
            termCode: document.getElementById('termCode').value.trim(),
            description: document.getElementById('termDescription').value.trim()
        };

        try {
            const url = editingId ? '/api/cbse-exam-terms/' + editingId : '/api/cbse-exam-terms';
            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save term');
            }
            closeModal();
            await loadTerms();
            Swal.fire({ icon: 'success', title: 'Saved', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            showError(error);
        }
    });

    tableBody?.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');

        if (e.target.closest('.btn-edit')) {
            try {
                const response = await fetch('/api/cbse-exam-terms/' + id);
                if (!response.ok) throw new Error('Failed to load term');
                const data = await response.json();
                editingId = id;
                termModalTitle.textContent = 'Edit Term';
                document.getElementById('termName').value = data.termName || '';
                document.getElementById('termCode').value = data.termCode || '';
                document.getElementById('termDescription').value = data.description || '';
                openModal();
            } catch (error) {
                showError(error);
            }
            return;
        }

        if (e.target.closest('.btn-delete')) {
            const title = row.querySelector('td')?.textContent.trim() || 'this term';
            Swal.fire({
                icon: 'warning',
                title: 'Delete Term?',
                text: '"' + title + '" will be deleted.',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            }).then(async function (result) {
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/cbse-exam-terms/' + id, { method: 'DELETE' });
                    const data = await response.json().catch(function () { return {}; });
                    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete');
                    await loadTerms();
                    Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
                } catch (error) {
                    showError(error);
                }
            });
        }
    });

    searchInput?.addEventListener('input', function () { currentPage = 1; renderTerms(); });
    entriesSelect?.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 100;
        currentPage = 1;
        renderTerms();
    });
    pagination?.addEventListener('click', function (e) {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        const totalPages = Math.max(1, Math.ceil(getFilteredTerms().length / pageSize) || 1);
        if (btn.dataset.page) currentPage = parseInt(btn.dataset.page, 10);
        else if (btn.dataset.nav === 'prev') currentPage = Math.max(1, currentPage - 1);
        else if (btn.dataset.nav === 'next') currentPage = Math.min(totalPages, currentPage + 1);
        renderTerms();
    });

    function getVisibleRows() {
        return Array.from(tableBody.querySelectorAll('tr[data-id]')).filter(function (row) {
            return row.style.display !== 'none';
        });
    }

    function getTableData() {
        const headers = [];
        const data = [];
        if (!table) return { headers: headers, data: data };

        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach(function (th, index) {
            if (index < headerCells.length - 1) headers.push(th.textContent.trim());
        });

        getVisibleRows().forEach(function (row) {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(function (cell, index) {
                if (index < cells.length - 1) rowData.push(cell.textContent.trim().replace(/\s+/g, ' '));
            });
            data.push(rowData);
        });

        return { headers: headers, data: data };
    }

    document.getElementById('copyBtn')?.addEventListener('click', function () {
        const result = getTableData();
        let text = result.headers.join('\t') + '\n';
        result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied!', timer: 2000, showConfirmButton: false });
        });
    });

    document.getElementById('excelBtn')?.addEventListener('click', function () {
        const result = getTableData();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
        XLSX.utils.book_append_sheet(wb, ws, 'Terms');
        XLSX.writeFile(wb, 'Terms_' + new Date().toISOString().split('T')[0] + '.xlsx');
        Swal.fire({ icon: 'success', title: 'Exported!', timer: 2000, showConfirmButton: false });
    });

    document.getElementById('csvBtn')?.addEventListener('click', function () {
        const result = getTableData();
        let csvContent = result.headers.join(',') + '\n';
        result.data.forEach(function (row) {
            csvContent += row.map(function (cell) {
                return (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
            }).join(',') + '\n';
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
        link.download = 'Terms_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
        Swal.fire({ icon: 'success', title: 'Exported!', timer: 2000, showConfirmButton: false });
    });

    document.getElementById('pdfBtn')?.addEventListener('click', function () {
        const result = getTableData();
        const doc = new window.jspdf.jsPDF('p', 'pt', 'a4');
        doc.setFontSize(16);
        doc.text('Term List', 40, 40);
        doc.autoTable({ head: [result.headers], body: result.data, startY: 60, theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } });
        doc.save('Terms_' + new Date().toISOString().split('T')[0] + '.pdf');
        Swal.fire({ icon: 'success', title: 'Exported!', timer: 2000, showConfirmButton: false });
    });

    document.getElementById('printBtn')?.addEventListener('click', function () {
        const result = getTableData();
        let html = '<html><head><title>Term List</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#1e293b;color:#fff}</style></head><body><h1>Term List</h1><table><thead><tr>';
        result.headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
        html += '</tr></thead><tbody>';
        result.data.forEach(function (row) {
            html += '<tr>' + row.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        });
        html += '</tbody></table></body></html>';
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
    });

    loadTerms().catch(showError);
});
