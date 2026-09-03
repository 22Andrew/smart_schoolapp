let incomeRecords = [];
let filteredRecords = [];
let currentEditId = null;
let currentPage = 1;
let pageSize = 50;

const incomeForm = document.getElementById('incomeForm');
const incomeTableBody = document.getElementById('incomeTableBody');
const searchInput = document.getElementById('searchInput');
const entriesSelect = document.getElementById('entriesSelect');
const incomeHeadSelect = document.getElementById('incomeHead');
const fileUploadArea = document.querySelector('.file-upload-area');
const fileInput = document.getElementById('document');

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
    return window.formatCurrency(value);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

if (fileUploadArea && fileInput) {
    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileUploadArea.querySelector('p').textContent = 'Selected: ' + e.target.files[0].name;
        }
    });

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#8b5cf6';
    });

    fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#334155';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#334155';
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            fileUploadArea.querySelector('p').textContent = 'Selected: ' + e.dataTransfer.files[0].name;
        }
    });
}

async function loadIncomeHeads() {
    const response = await fetch('/api/income-heads');
    if (!response.ok) return;
    const heads = await response.json();
    if (!incomeHeadSelect) return;
    incomeHeadSelect.innerHTML = '<option value="">Select</option>' + heads.map(function (head) {
        return '<option value="' + escapeHtml(head.name) + '">' + escapeHtml(head.name) + '</option>';
    }).join('');
}

function resetForm() {
    if (!incomeForm) return;
    incomeForm.reset();
    currentEditId = null;
    document.getElementById('incomeId').value = '';
    if (fileUploadArea) {
        fileUploadArea.querySelector('p').textContent = 'Drag and drop a file here or click';
    }
}

if (incomeForm) {
    incomeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            incomeHead: document.getElementById('incomeHead').value,
            name: document.getElementById('name').value.trim(),
            invoiceNumber: document.getElementById('invoiceNumber').value.trim() || null,
            date: document.getElementById('date').value,
            amount: parseFloat(document.getElementById('amount').value),
            description: document.getElementById('description').value.trim() || null
        };

        try {
            const url = currentEditId ? '/api/incomes/' + currentEditId : '/api/incomes';
            const method = currentEditId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (response.ok && result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: result.message || 'Income saved successfully',
                    confirmButtonColor: '#8b5cf6'
                });
                resetForm();
                loadIncomeRecords();
            } else {
                throw new Error(result.message || 'Failed to save income record');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message || 'Failed to save income record.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });
}

async function loadIncomeRecords() {
    try {
        const response = await fetch('/api/incomes');
        if (response.ok) {
            incomeRecords = await response.json();
            applySearch();
        }
    } catch (error) {
        console.error('Error loading income records:', error);
    }
}

function applySearch() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    filteredRecords = incomeRecords.filter(function (income) {
        if (!searchTerm) return true;
        return [
            income.name,
            income.description,
            income.invoiceNumber,
            income.incomeHead,
            income.amount,
            income.date
        ].join(' ').toLowerCase().indexOf(searchTerm) !== -1;
    });
    currentPage = 1;
    renderTable();
}

function updatePagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    if (currentPage > totalPages) currentPage = totalPages;

    const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);

    document.getElementById('showingStart').textContent = String(start);
    document.getElementById('showingEnd').textContent = String(end);
    document.getElementById('totalEntries').textContent = String(total);

    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    let html = '<button class="pagination-btn" data-nav="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
    for (let page = 1; page <= totalPages; page++) {
        html += '<button class="pagination-btn' + (page === currentPage ? ' active' : '') + '" data-page="' + page + '">' + page + '</button>';
    }
    html += '<button class="pagination-btn" data-nav="next"' + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
    pagination.innerHTML = html;
}

function renderTable() {
    const total = filteredRecords.length;
    updatePagination(total);

    if (!total) {
        incomeTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No income records found</td></tr>';
        return;
    }

    const start = (currentPage - 1) * pageSize;
    const pageRows = filteredRecords.slice(start, start + pageSize);

    incomeTableBody.innerHTML = pageRows.map(function (income) {
        return '<tr>'
            + '<td>' + escapeHtml(income.name || '') + '</td>'
            + '<td>' + escapeHtml(income.description || '') + '</td>'
            + '<td>' + escapeHtml(income.invoiceNumber || '') + '</td>'
            + '<td>' + escapeHtml(formatDate(income.date)) + '</td>'
            + '<td>' + escapeHtml(income.incomeHead || '') + '</td>'
            + '<td>' + escapeHtml(formatAmount(income.amount)) + '</td>'
            + '<td><div class="action-buttons">'
            + '<button class="btn-action btn-edit" onclick="editIncome(' + income.id + ')" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>'
            + '</button>'
            + '<button class="btn-action btn-delete" onclick="deleteIncome(' + income.id + ')" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
            + '</button>'
            + '</div></td>'
            + '</tr>';
    }).join('');
}

window.editIncome = function (id) {
    const income = incomeRecords.find(function (item) { return item.id === id; });
    if (!income) return;

    currentEditId = income.id;
    document.getElementById('incomeId').value = income.id;
    document.getElementById('incomeHead').value = income.incomeHead || '';
    document.getElementById('name').value = income.name || '';
    document.getElementById('invoiceNumber').value = income.invoiceNumber || '';
    document.getElementById('date').value = income.date || '';
    document.getElementById('amount').value = income.amount || '';
    document.getElementById('description').value = income.description || '';

    document.querySelector('.add-income-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteIncome = async function (id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch('/api/incomes/' + id, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok && data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Income record has been deleted.',
                confirmButtonColor: '#8b5cf6'
            });
            loadIncomeRecords();
        } else {
            throw new Error(data.message || 'Failed to delete');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message || 'Failed to delete income record.',
            confirmButtonColor: '#8b5cf6'
        });
    }
};

if (searchInput) {
    searchInput.addEventListener('input', applySearch);
}

if (entriesSelect) {
    entriesSelect.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderTable();
    });
}

document.getElementById('pagination')?.addEventListener('click', function (event) {
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

function exportRows() {
    return filteredRecords.map(function (income) {
        return {
            Name: income.name || '',
            Description: income.description || '',
            'Invoice Number': income.invoiceNumber || '',
            Date: formatDate(income.date),
            'Income Head': income.incomeHead || '',
            'Amount ($)': formatAmount(income.amount)
        };
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
    XLSX.utils.book_append_sheet(wb, ws, 'Income');
    XLSX.writeFile(wb, 'income.xlsx');
});

document.getElementById('csvBtn')?.addEventListener('click', function () {
    const rows = exportRows();
    if (!rows.length || !window.XLSX) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Income');
    XLSX.writeFile(wb, 'income.csv');
});

document.getElementById('pdfBtn')?.addEventListener('click', function () {
    const rows = exportRows();
    if (!rows.length || !window.jspdf) return;
    const headers = Object.keys(rows[0]);
    const body = rows.map(function (row) { return headers.map(function (key) { return row[key]; }); });
    const doc = new window.jspdf.jsPDF('l', 'pt');
    doc.autoTable({ head: [headers], body: body });
    doc.save('income.pdf');
});

document.getElementById('printBtn')?.addEventListener('click', function () {
    window.print();
});

document.addEventListener('DOMContentLoaded', function () {
    loadIncomeHeads();
    loadIncomeRecords();
});
