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
        return window.formatCurrency(value);
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

    const bookCancelBtn = document.getElementById('bookCancelBtn');
    if (bookCancelBtn) bookCancelBtn.addEventListener('click', closeBookModal);

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (importBookModal && importBookModal.classList.contains('active')) {
            closeImportModal();
            return;
        }
        if (bookModal && bookModal.classList.contains('active')) {
            closeBookModal();
        }
    });

    const importBookModal = document.getElementById('importBookModal');
    const importBookOverlay = document.getElementById('importBookOverlay');
    const importBookDropzone = document.getElementById('importBookDropzone');
    const importBookFileInput = document.getElementById('importBookFileInput');
    const importBookDropzoneContent = document.getElementById('importBookDropzoneContent');
    const importBookFileName = document.getElementById('importBookFileName');
    const downloadSampleImportBtn = document.getElementById('downloadSampleImportBtn');
    const importBookSubmitBtn = document.getElementById('importBookSubmitBtn');
    let importFile = null;

    function setImportFile(file) {
        importFile = file || null;
        if (importBookFileName) {
            importBookFileName.hidden = !importFile;
            importBookFileName.textContent = importFile ? importFile.name : '';
        }
        if (importBookDropzoneContent) {
            importBookDropzoneContent.hidden = !!importFile;
        }
    }

    function openImportModal() {
        if (!importBookModal) return;
        setImportFile(null);
        if (importBookFileInput) importBookFileInput.value = '';
        importBookModal.classList.add('active');
        importBookModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeImportModal() {
        if (!importBookModal) return;
        importBookModal.classList.remove('active');
        importBookModal.setAttribute('aria-hidden', 'true');
        setImportFile(null);
        if (importBookFileInput) importBookFileInput.value = '';
        if (!bookModal || !bookModal.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }

    if (importBookBtn) {
        importBookBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            openImportModal();
        });
    }

    if (importBookOverlay) {
        importBookOverlay.addEventListener('click', closeImportModal);
    }

    const SAMPLE_CSV = 'Book Title,Book Number,ISBN Number,Subject,Rack Number,Publisher,Author,Qty,Book Price,Post Date,Description,Available\n'
        + 'Sample Data,BK-001,978-0000000000,English,R1,Sample Publisher,Sample Author,10,25.00,2018-06-06,Sample Data,10\n';

    function downloadBlob(filename, content, type) {
        const blob = new Blob([content], { type: type || 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function parseCsvText(text) {
        const rows = [];
        let row = [];
        let current = '';
        let inQuotes = false;
        const source = String(text || '').replace(/^\uFEFF/, '');
        for (let i = 0; i < source.length; i++) {
            const ch = source.charAt(i);
            if (inQuotes) {
                if (ch === '"') {
                    if (source.charAt(i + 1) === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += ch;
                }
            } else if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                row.push(current);
                current = '';
            } else if (ch === '\n') {
                row.push(current);
                rows.push(row);
                row = [];
                current = '';
            } else if (ch !== '\r') {
                current += ch;
            }
        }
        if (inQuotes || current || row.length) {
            row.push(current);
            rows.push(row);
        }
        return rows;
    }

    function normalizeHeader(value) {
        return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function cellByHeader(cells, headers, aliases) {
        for (let i = 0; i < headers.length; i++) {
            if (aliases.indexOf(headers[i]) !== -1) {
                return cells[i] == null ? '' : String(cells[i]).trim();
            }
        }
        return '';
    }

    function rowsFromCsv(text) {
        const table = parseCsvText(text);
        if (!table.length) {
            throw new Error('The CSV file is empty');
        }
        const headers = table[0].map(normalizeHeader);
        if (headers.indexOf('booktitle') < 0 && headers.indexOf('title') < 0) {
            throw new Error('CSV must include a Book Title column');
        }
        const payloadRows = [];
        for (let i = 1; i < table.length; i++) {
            const cells = table[i];
            const title = cellByHeader(cells, headers, ['booktitle', 'title']);
            if (!title) {
                continue;
            }
            payloadRows.push({
                title: title,
                bookNumber: cellByHeader(cells, headers, ['booknumber', 'bookno']),
                isbn: cellByHeader(cells, headers, ['isbnnumber', 'isbn']),
                subject: cellByHeader(cells, headers, ['subject']),
                rackNumber: cellByHeader(cells, headers, ['racknumber', 'rack']),
                publisher: cellByHeader(cells, headers, ['publisher']),
                author: cellByHeader(cells, headers, ['author']),
                qty: cellByHeader(cells, headers, ['qty', 'quantity', 'totalcopies']),
                bookPrice: cellByHeader(cells, headers, ['bookprice', 'price']),
                postDate: cellByHeader(cells, headers, ['postdate', 'date']),
                description: cellByHeader(cells, headers, ['description']),
                available: cellByHeader(cells, headers, ['available', 'availablecopies'])
            });
        }
        if (!payloadRows.length) {
            throw new Error('No valid book rows were found in the CSV file');
        }
        return payloadRows;
    }

    async function importBooksFallback(file) {
        const text = await file.text();
        const payloadRows = rowsFromCsv(text);
        let imported = 0;
        let lastError = '';
        for (let i = 0; i < payloadRows.length; i++) {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadRows[i])
            });
            const data = await response.json().catch(function () { return {}; });
            if (!response.ok || data.success === false) {
                lastError = data.message || ('Failed to import row ' + (i + 2));
                continue;
            }
            imported += 1;
        }
        if (!imported) {
            throw new Error(lastError || 'Failed to import books');
        }
        return {
            imported: imported,
            message: imported + (imported === 1 ? ' book imported successfully!' : ' books imported successfully!')
        };
    }

    if (downloadSampleImportBtn) {
        downloadSampleImportBtn.addEventListener('click', async function () {
            try {
                const response = await fetch('/api/library/books/import/sample');
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'import_book_sample_file.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    return;
                }
            } catch (error) {
                /* fall through to local sample */
            }
            downloadBlob('import_book_sample_file.csv', '\uFEFF' + SAMPLE_CSV);
        });
    }

    if (importBookDropzone && importBookFileInput) {
        importBookDropzone.addEventListener('click', function () {
            importBookFileInput.click();
        });
        importBookFileInput.addEventListener('change', function () {
            const file = importBookFileInput.files && importBookFileInput.files[0];
            setImportFile(file || null);
        });
        ['dragenter', 'dragover'].forEach(function (eventName) {
            importBookDropzone.addEventListener(eventName, function (event) {
                event.preventDefault();
                importBookDropzone.classList.add('dragover');
            });
        });
        ['dragleave', 'drop'].forEach(function (eventName) {
            importBookDropzone.addEventListener(eventName, function (event) {
                event.preventDefault();
                importBookDropzone.classList.remove('dragover');
            });
        });
        importBookDropzone.addEventListener('drop', function (event) {
            const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
            setImportFile(file || null);
        });
    }

    if (importBookSubmitBtn) {
        importBookSubmitBtn.addEventListener('click', async function () {
            if (!importFile) {
                Swal.fire({
                    icon: 'warning',
                    title: 'CSV File Required',
                    text: 'Please select a CSV file to import.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            const formData = new FormData();
            formData.append('file', importFile);
            try {
                let data = {};
                const response = await fetch('/api/library/books/import', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    data = await response.json().catch(function () { return {}; });
                } else if (response.status === 404 || response.status === 405) {
                    data = await importBooksFallback(importFile);
                } else {
                    data = await response.json().catch(function () { return {}; });
                    throw new Error(data.message || 'Failed to import books');
                }
                if (data.success === false) {
                    throw new Error(data.message || 'Failed to import books');
                }
                closeImportModal();
                closeBookModal();
                await loadBooks();
                Swal.fire({
                    icon: 'success',
                    title: 'Imported',
                    text: data.message || 'Books imported successfully!',
                    timer: 1800,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Import Failed',
                    text: error.message || 'Failed to import books.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
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
