document.addEventListener('DOMContentLoaded', function () {
    const page = document.getElementById('issuePage');
    const memberId = page ? page.getAttribute('data-member-id') : '';
    const issueForm = document.getElementById('issueForm');
    const bookSelect = document.getElementById('issueBookSelect');
    const dueReturnDate = document.getElementById('dueReturnDate');
    const searchInput = document.getElementById('issuedSearchInput');
    const table = document.getElementById('issuedTable');
    const tableBody = document.getElementById('issuedTableBody');

    let issues = [];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        if (value == null || String(value).trim() === '') return '';
        return String(value);
    }

    function todayUs() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return month + '/' + day + '/' + now.getFullYear();
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value == null || value === '' ? '-' : String(value);
    }

    function placeholderPhoto() {
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.4">'
            + '<rect x="3" y="3" width="18" height="18" rx="2" fill="#f3f4f6"/>'
            + '<circle cx="12" cy="9" r="3"/>'
            + '<path d="M6 19c1.5-3 4-4.5 6-4.5S16.5 16 18 19"/>'
            + '</svg>'
        );
    }

    function drawBarcode(value) {
        const svg = document.getElementById('memberBarcode');
        const label = document.getElementById('memberBarcodeLabel');
        if (label) label.textContent = value || '';
        if (!svg || !value) return;
        if (typeof JsBarcode === 'function') {
            JsBarcode(svg, String(value), {
                format: 'CODE128',
                displayValue: false,
                height: 46,
                margin: 0,
                width: 1.6
            });
        }
    }

    function drawQr(value) {
        const canvas = document.getElementById('memberQr');
        if (!canvas || !value) return;
        if (window.QRCode && typeof QRCode.toCanvas === 'function') {
            QRCode.toCanvas(canvas, String(value), { width: 88, margin: 1 }, function () {});
        }
    }

    function applyColumnVisibility() {
        if (!table) return;
        const toggles = document.querySelectorAll('.issued-column-toggle');
        toggles.forEach(function (toggle) {
            const columnIndex = parseInt(toggle.getAttribute('data-column'), 10);
            const headerCells = table.querySelectorAll('thead th');
            if (headerCells[columnIndex]) {
                headerCells[columnIndex].style.display = toggle.checked ? '' : 'none';
            }
            table.querySelectorAll('tbody tr').forEach(function (row) {
                if (row.querySelector('.empty-cell')) return;
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) {
                    cells[columnIndex].style.display = toggle.checked ? '' : 'none';
                }
            });
        });
    }

    function filteredIssues() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!keyword) return issues.slice();
        return issues.filter(function (row) {
            return [row.bookTitle, row.bookNumber, row.issueDate, row.dueDate, row.returnDate]
                .some(function (value) {
                    return String(value || '').toLowerCase().includes(keyword);
                });
        });
    }

    function returnButton(row) {
        if (row.returned) return '';
        return ''
            + '<button type="button" class="btn-return" data-id="' + escapeHtml(row.id) + '" title="Return">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polyline points="1 4 1 10 7 10"></polyline>'
            + '<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>'
            + '</svg></button>';
    }

    function renderIssues() {
        if (!tableBody) return;
        const rows = filteredIssues();
        if (!rows.length) {
            tableBody.innerHTML = '<tr><td class="empty-cell" colspan="6">No data available in table</td></tr>';
            return;
        }
        tableBody.innerHTML = rows.map(function (row) {
            return ''
                + '<tr>'
                + '<td>' + escapeHtml(display(row.bookTitle)) + '</td>'
                + '<td>' + escapeHtml(display(row.bookNumber)) + '</td>'
                + '<td>' + escapeHtml(display(row.issueDate)) + '</td>'
                + '<td>' + escapeHtml(display(row.dueDate)) + '</td>'
                + '<td>' + escapeHtml(display(row.returnDate)) + '</td>'
                + '<td>' + returnButton(row) + '</td>'
                + '</tr>';
        }).join('');
        applyColumnVisibility();
    }

    async function loadMember() {
        const response = await fetch('/api/library/members/' + encodeURIComponent(memberId));
        if (!response.ok) throw new Error('Failed to load member');
        const member = await response.json();
        setText('memberName', member.name);
        setText('detailMemberId', member.id);
        setText('detailCardNo', member.libraryCardNo);
        setText('detailAdmissionNo', member.admissionNo);
        setText('detailGender', member.gender);
        setText('detailMemberType', member.memberType);
        setText('detailPhone', member.phone);
        setText('detailSession', member.sessionYear || '2023-24');
        const photo = document.getElementById('memberPhoto');
        if (photo) {
            photo.src = member.photoPath ? member.photoPath : placeholderPhoto();
            photo.onerror = function () { photo.src = placeholderPhoto(); };
        }
        const codeValue = member.barcodeValue || member.admissionNo || String(member.id);
        drawBarcode(codeValue);
        drawQr(codeValue);
    }

    async function loadBooks() {
        const response = await fetch('/api/library/issue-books');
        if (!response.ok) throw new Error('Failed to load books');
        const books = await response.json();
        if (!bookSelect) return;
        const current = bookSelect.value;
        bookSelect.innerHTML = '<option value="">Select</option>' + (Array.isArray(books) ? books : []).map(function (book) {
            const label = display(book.title) + (book.bookNumber ? ' (' + book.bookNumber + ')' : '');
            return '<option value="' + escapeHtml(book.id) + '">' + escapeHtml(label) + '</option>';
        }).join('');
        bookSelect.value = current;
    }

    async function loadIssues() {
        const response = await fetch('/api/library/members/' + encodeURIComponent(memberId) + '/issues');
        if (!response.ok) throw new Error('Failed to load issued books');
        const data = await response.json();
        issues = Array.isArray(data) ? data : [];
        renderIssues();
    }

    if (dueReturnDate && !dueReturnDate.value) {
        dueReturnDate.value = todayUs();
    }

    if (issueForm) {
        issueForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const bookId = bookSelect ? bookSelect.value : '';
            if (!bookId) {
                Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please select a book.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            try {
                const response = await fetch('/api/library/members/' + encodeURIComponent(memberId) + '/issues', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: bookId, dueDate: dueReturnDate.value })
                });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to issue book');
                }
                issueForm.reset();
                dueReturnDate.value = todayUs();
                await Promise.all([loadBooks(), loadIssues()]);
                Swal.fire({ icon: 'success', title: 'Saved', text: data.message || 'Book issued successfully!', timer: 1400, showConfirmButton: false });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to issue book.', confirmButtonColor: '#8b5cf6' });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', async function (e) {
            const btn = e.target.closest('.btn-return');
            if (!btn) return;
            const issueId = btn.getAttribute('data-id');
            const confirm = await Swal.fire({
                icon: 'question',
                title: 'Return Book?',
                text: 'Mark this book as returned?',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Return'
            });
            if (!confirm.isConfirmed) return;
            try {
                const response = await fetch('/api/library/issues/' + encodeURIComponent(issueId) + '/return', { method: 'POST' });
                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to return book');
                }
                await Promise.all([loadBooks(), loadIssues()]);
                Swal.fire({ icon: 'success', title: 'Returned', timer: 1200, showConfirmButton: false });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to return book.', confirmButtonColor: '#8b5cf6' });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderIssues);
    }

    const colBtn = document.getElementById('issuedColumnVisibilityBtn');
    const colDropdown = document.getElementById('issuedColumnVisibilityDropdown');
    if (colBtn && colDropdown) {
        colBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            colDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function (e) {
            if (!colDropdown.contains(e.target) && !colBtn.contains(e.target)) {
                colDropdown.classList.remove('active');
            }
        });
        colDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
        colDropdown.querySelectorAll('.issued-column-toggle').forEach(function (toggle) {
            toggle.addEventListener('change', applyColumnVisibility);
        });
    }

    ['issuedCopyBtn', 'issuedExcelBtn', 'issuedCsvBtn', 'issuedPdfBtn', 'issuedPrintBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'issuedPrintBtn' || id === 'issuedPdfBtn') {
                window.print();
                return;
            }
            const text = [['Book Title', 'Book Number', 'Issue Date', 'Due Return Date', 'Return Date'].join('\t')]
                .concat(filteredIssues().map(function (row) {
                    return [row.bookTitle, row.bookNumber, row.issueDate, row.dueDate, row.returnDate].join('\t');
                })).join('\n');
            if (id === 'issuedCopyBtn') {
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
            link.download = 'book-issued.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    });

    if (!memberId) {
        Swal.fire({ icon: 'error', title: 'Missing member', text: 'Member ID was not provided in the URL.' });
        return;
    }

    Promise.all([loadMember(), loadBooks(), loadIssues()]).catch(function (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load issue return page.', confirmButtonColor: '#8b5cf6' });
    });
});
