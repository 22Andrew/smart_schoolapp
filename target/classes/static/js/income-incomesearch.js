document.addEventListener('DOMContentLoaded', function () {
    const typeSearchForm = document.getElementById('typeSearchForm');
    const keywordSearchForm = document.getElementById('keywordSearchForm');
    const searchType = document.getElementById('searchType');
    const keywordInput = document.getElementById('keywordInput');
    const tableBody = document.getElementById('incomeSearchTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const incomeSearchTable = document.getElementById('incomeSearchTable');

    let incomeRows = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length === 3) {
            return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return month + '/' + day + '/' + year;
    }

    function formatAmount(value) {
        if (window.AppCurrency) return window.AppCurrency.formatCurrency(value);
        const amount = Number(value);
        if (Number.isNaN(amount)) return '$0.00';
        return '$' + amount.toFixed(2);
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchIncomes(searchTypeValue, keyword) {
        const params = new URLSearchParams();
        if (searchTypeValue) params.set('searchType', searchTypeValue);
        if (keyword) params.set('keyword', keyword);

        const response = await fetch('/api/incomes/search?' + params.toString());
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load income records');
        }
        return response.json();
    }

    async function searchByType() {
        try {
            incomeRows = await fetchIncomes(searchType.value, '');
            currentPage = 1;
            renderTable();
        } catch (error) {
            showError(error);
        }
    }

    async function searchByKeyword() {
        const keyword = keywordInput.value.trim();
        if (!keyword) return;

        try {
            incomeRows = await fetchIncomes('all', keyword);
            currentPage = 1;
            renderTable();
        } catch (error) {
            showError(error);
        }
    }

    function sortValue(row, key) {
        switch (key) {
            case 'name': return row.name || '';
            case 'invoiceNumber': return row.invoiceNumber || '';
            case 'incomeHead': return row.incomeHead || '';
            case 'date': return row.date || '';
            case 'amount': return row.amount == null ? 0 : Number(row.amount);
            default: return '';
        }
    }

    function getFiltered() {
        let rows = incomeRows.slice();
        const filter = tableFilter.trim().toLowerCase();

        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.name,
                    row.invoiceNumber,
                    row.incomeHead,
                    formatDate(row.date),
                    formatAmount(row.amount)
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }

        if (sortKey) {
            rows.sort(function (a, b) {
                const av = sortValue(a, sortKey);
                const bv = sortValue(b, sortKey);
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rows;
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';

        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }

        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        if (!tableBody) return;

        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            tableBody.innerHTML = ''
                + '<tr class="empty-row"><td colspan="5">'
                + '<div class="empty-state"><p class="empty-message">No income records found</p></div>'
                + '</td></tr>';
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(0, 1);
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        tableBody.innerHTML = pageRows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.name || '') + '</td>'
                + '<td>' + escapeHtml(row.invoiceNumber || '') + '</td>'
                + '<td>' + escapeHtml(row.incomeHead || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(row.date)) + '</td>'
                + '<td class="amount-col">' + escapeHtml(formatAmount(row.amount)) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    function exportRows() {
        return getFiltered().map(function (row) {
            return {
                Name: row.name || '',
                'Invoice Number': row.invoiceNumber || '',
                'Income Head': row.incomeHead || '',
                Date: formatDate(row.date),
                'Amount ($)': formatAmount(row.amount)
            };
        });
    }

    if (typeSearchForm) {
        typeSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            searchByType();
        });
    }

    if (keywordSearchForm) {
        keywordSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            searchByKeyword();
        });
    }

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            tableFilter = tableSearchInput.value;
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

    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const btn = event.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.page) {
                currentPage = parseInt(btn.dataset.page, 10);
            } else if (btn.dataset.nav === 'prev') {
                currentPage -= 1;
            } else if (btn.dataset.nav === 'next') {
                currentPage += 1;
            }
            renderTable();
        });
    }

    if (incomeSearchTable) {
        incomeSearchTable.querySelectorAll('th[data-sort]').forEach(function (th) {
            th.addEventListener('click', function () {
                const key = th.dataset.sort;
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

    document.getElementById('copyBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        let text = headers.join('\t') + '\n';
        rows.forEach(function (row) {
            text += headers.map(function (key) { return row[key]; }).join('\t') + '\n';
        });
        navigator.clipboard.writeText(text);
        Swal.fire({ icon: 'success', title: 'Copied!', text: 'Income list copied to clipboard', timer: 1500, showConfirmButton: false });
    });

    document.getElementById('excelBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.XLSX) return;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Income Search');
        XLSX.writeFile(wb, 'income-search.xlsx');
    });

    document.getElementById('csvBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        let csv = headers.join(',') + '\n';
        rows.forEach(function (row) {
            csv += headers.map(function (key) {
                const value = String(row[key] || '').replace(/"/g, '""');
                return '"' + value + '"';
            }).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'income-search.csv';
        link.click();
    });

    document.getElementById('pdfBtn')?.addEventListener('click', function () {
        const rows = exportRows();
        if (!rows.length || !window.jspdf) return;
        const doc = new window.jspdf.jsPDF('l', 'pt');
        doc.text('Income Search Report', 40, 40);
        doc.autoTable({
            startY: 60,
            head: [['Name', 'Invoice Number', 'Income Head', 'Date', 'Amount ($)']],
            body: rows.map(function (row) {
                return [row.Name, row['Invoice Number'], row['Income Head'], row.Date, row['Amount ($)']];
            })
        });
        doc.save('income-search.pdf');
    });

    document.getElementById('printBtn')?.addEventListener('click', function () {
        window.print();
    });

    searchByType();
});
