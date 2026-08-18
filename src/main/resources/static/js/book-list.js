document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('bookTable');
    const addBookBtn = document.getElementById('addBookBtn');
    const importBookBtn = document.getElementById('importBookBtn');
    const bookModal = document.getElementById('bookModal');
    const bookForm = document.getElementById('bookForm');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const tableBody = document.getElementById('bookTableBody');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');

    let books = [];
    let currentPage = 1;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        if (value == null || String(value).trim() === '') return '';
        return String(value);
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value).trim();
        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return isoMatch[2] + '/' + isoMatch[3] + '/' + isoMatch[1];
        }
        return text;
    }

    function todayUs() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return month + '/' + day + '/' + now.getFullYear();
    }

    function formatMoney(value) {
        if (value == null || value === '') return '';
        const num = Number(value);
        if (Number.isNaN(num)) return String(value);
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function pageSize() {
        return parseInt(entriesSelect && entriesSelect.value ? entriesSelect.value : '50', 10) || 50;
    }

    function filteredBooks() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!keyword) return books.slice();
        return books.filter(function (row) {
            return [
                row.title, row.description, row.bookNumber, row.isbn, row.publisher,
                row.author, row.subject, row.rackNumber
            ].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function visibleColumnCount() {
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        if (!toggles.length) return 13;
        let count = 0;
        toggles.forEach(function (toggle) {
            if (toggle.checked) count++;
        });
        return Math.max(1, count);
    }

    function applyColumnVisibility() {
        if (!table) return;
        const toggles = document.querySelectorAll('#columnVisibilityDropdown .column-toggle');
        const visibleCount = visibleColumnCount();

        toggles.forEach(function (toggle) {
            const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
            const isVisible = toggle.checked;
            const headerCells = table.querySelectorAll('thead th');
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = isVisible ? '' : 'none';
            }
        });

        table.querySelectorAll('tbody tr').forEach(function (row) {
            const emptyCell = row.querySelector('.empty-state-cell');
            if (emptyCell) {
                emptyCell.colSpan = visibleCount;
                return;
            }
            const cells = row.querySelectorAll('td');
            toggles.forEach(function (toggle) {
                const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = toggle.checked ? '' : 'none';
                }
            });
        });
    }

    function emptyRowHtml() {
        return ''
            + '<tr><td colspan="' + visibleColumnCount() + '" class="empty-state-cell">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
            + '</svg></div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</td></tr>';
    }

    function actionButtons(id) {
        return ''
            + '<div class="action-buttons">'
            + '<button type="button" class="btn-action btn-edit" data-id="' + escapeHtml(id) + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" data-id="' + escapeHtml(id) + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polyline points="3 6 5 6 21 6"></polyline>'
            + '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'
            + '</svg></button>'
            + '</div>';
    }

    function renderPagination(total, start, end, pages) {
        if (!pagination) return;
        if (!total) {
            pagination.innerHTML = ''
                + '<button type="button" class="pagination-btn" disabled>&lt;</button>'
                + '<button type="button" class="pagination-btn active">1</button>'
                + '<button type="button" class="pagination-btn" disabled>&gt;</button>';
            return;
        }
        let html = '<button type="button" class="pagination-btn" data-page="' + (currentPage - 1) + '"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let page = 1; page <= pages; page++) {
            html += '<button type="button" class="pagination-btn' + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="' + (currentPage + 1) + '"'
            + (currentPage >= pages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        if (!tableBody) return;
        const rows = filteredBooks();
        const size = pageSize();
        const pages = Math.max(1, Math.ceil(rows.length / size));
        if (currentPage > pages) currentPage = pages;
        const startIndex = rows.length ? (currentPage - 1) * size : 0;
        const pageRows = rows.slice(startIndex, startIndex + size);
        const start = rows.length ? startIndex + 1 : 0;
        const end = startIndex + pageRows.length;

        if (!pageRows.length) {
            tableBody.innerHTML = emptyRowHtml();
        } else {
            tableBody.innerHTML = pageRows.map(function (row) {
                return ''
                    + '<tr data-id="' + escapeHtml(row.id) + '">'
                    + '<td>' + escapeHtml(display(row.title)) + '</td>'
                    + '<td>' + escapeHtml(display(row.description)) + '</td>'
                    + '<td>' + escapeHtml(display(row.bookNumber)) + '</td>'
                    + '<td>' + escapeHtml(display(row.isbn)) + '</td>'
                    + '<td>' + escapeHtml(display(row.publisher)) + '</td>'
                    + '<td>' + escapeHtml(display(row.author)) + '</td>'
                    + '<td>' + escapeHtml(display(row.subject)) + '</td>'
                    + '<td>' + escapeHtml(display(row.rackNumber)) + '</td>'
                    + '<td>' + escapeHtml(display(row.qty)) + '</td>'
                    + '<td>' + escapeHtml(display(row.available)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(row.bookPrice)) + '</td>'
                    + '<td>' + escapeHtml(formatDate(row.postDate)) + '</td>'
                    + '<td>' + actionButtons(row.id) + '</td>'
                    + '</tr>';
            }).join('');
        }

        if (showingInfo) {
            showingInfo.textContent = 'Records: ' + start + ' to ' + end + ' of ' + rows.length;
        }
        renderPagination(rows.length, start, end, pages);
        applyColumnVisibility();
    }

    async function loadBooks() {
        try {
            const response = await fetch('/api/books');
            if (!response.ok) {
                throw new Error('Failed to load books');
            }
            const data = await response.json();
            books = Array.isArray(data) ? data : [];
            renderTable();
        } catch (error) {
            console.error(error);
            books = [];
            renderTable();
        }
    }

    function setField(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value == null ? '' : String(value);
    }

    function openBookModal(book) {
        if (!bookModal || !bookForm) return;
        bookForm.reset();
        setField('bookId', book && book.id ? book.id : '');
        document.getElementById('bookModalTitle').textContent = book && book.id ? 'Edit Book' : 'Add Book';
        if (book) {
            setField('bookTitle', book.title);
            setField('bookIsbn', book.isbn);
            setField('bookAuthor', book.author);
            setField('bookRackNumber', book.rackNumber);
            setField('bookPrice', book.bookPrice);
            setField('bookDescription', book.description);
            setField('bookNumber', book.bookNumber);
            setField('bookPublisher', book.publisher);
            setField('bookSubject', book.subject);
            setField('bookQty', book.qty);
            setField('bookPostDate', formatDate(book.postDate) || todayUs());
        } else {
            setField('bookPostDate', todayUs());
        }
        bookModal.classList.add('active');
        bookModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const titleInput = document.getElementById('bookTitle');
        if (titleInput) titleInput.focus();
    }

    function closeBookModal() {
        if (!bookModal) return;
        bookModal.classList.remove('active');
        bookModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function formPayload() {
        return {
            title: document.getElementById('bookTitle').value,
            isbn: document.getElementById('bookIsbn').value,
            author: document.getElementById('bookAuthor').value,
            rackNumber: document.getElementById('bookRackNumber').value,
            bookPrice: document.getElementById('bookPrice').value,
            description: document.getElementById('bookDescription').value,
            bookNumber: document.getElementById('bookNumber').value,
            publisher: document.getElementById('bookPublisher').value,
            subject: document.getElementById('bookSubject').value,
            qty: document.getElementById('bookQty').value,
            postDate: document.getElementById('bookPostDate').value
        };
    }

    if (addBookBtn) {
        addBookBtn.addEventListener('click', function () {
            openBookModal(null);
        });
    }

    const overlay = document.getElementById('bookModalOverlay');
    if (overlay) overlay.addEventListener('click', closeBookModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && bookModal && bookModal.classList.contains('active')) {
            closeBookModal();
        }
    });

    if (importBookBtn) {
        importBookBtn.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Import Book',
                text: 'Book import will be available in a later update.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    }

    if (bookForm) {
        bookForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const title = document.getElementById('bookTitle').value.trim();
            if (!title) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Book Title is required.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const bookId = document.getElementById('bookId').value;
            const url = bookId ? '/api/books/' + encodeURIComponent(bookId) : '/api/books';
            const method = bookId ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formPayload())
                });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to save book');
                }
                closeBookModal();
                await loadBooks();
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: data.message || 'Book saved successfully!',
                    timer: 1600,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save book.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const book = books.find(function (row) { return String(row.id) === String(id); });
                if (book) openBookModal(book);
                return;
            }
            if (!deleteBtn) return;
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Book?',
                text: 'This book will be removed from the library.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            try {
                const response = await fetch('/api/books/' + encodeURIComponent(id), { method: 'DELETE' });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to delete book');
                }
                await loadBooks();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    timer: 1200,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete book.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            const page = parseInt(btn.getAttribute('data-page'), 10);
            if (!page || page === currentPage) return;
            currentPage = page;
            renderTable();
        });
    }

    ['copyBtn', 'excelBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'printBtn' || id === 'pdfBtn') {
                window.print();
                return;
            }
            const text = [['Book Title', 'Description', 'Book Number', 'ISBN Number', 'Publisher', 'Author', 'Subject', 'Rack Number', 'Qty', 'Available', 'Book Price', 'Post Date'].join('\t')]
                .concat(filteredBooks().map(function (row) {
                    return [
                        row.title, row.description, row.bookNumber, row.isbn, row.publisher,
                        row.author, row.subject, row.rackNumber, row.qty, row.available,
                        row.bookPrice, formatDate(row.postDate)
                    ].join('\t');
                })).join('\n');
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
            link.download = 'book-list.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    });

    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!columnVisibilityDropdown.contains(e.target) && !columnVisibilityBtn.contains(e.target)) {
                columnVisibilityDropdown.classList.remove('active');
            }
        });

        columnVisibilityDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        columnVisibilityDropdown.querySelectorAll('.column-toggle').forEach(function (toggle) {
            toggle.addEventListener('change', applyColumnVisibility);
        });
    }

    loadBooks();
});
