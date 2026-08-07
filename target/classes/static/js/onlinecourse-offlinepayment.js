document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const studentSelect = document.getElementById('studentSelect');
    const searchBtn = document.getElementById('searchOfflineBtn');
    const searchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const table = document.getElementById('offlinePaymentTable');
    const tableBody = document.getElementById('offlinePaymentTableBody');
    const showingInfo = document.querySelector('.onlinecourse-offlinepayment-page .showing-info');

    const feesModal = document.getElementById('feesPayModal');
    const feesOverlay = document.getElementById('feesPayOverlay');
    const closeFeesPayBtn = document.getElementById('closeFeesPayBtn');
    const feesPayForm = document.getElementById('feesPayForm');
    const feesCourseIdInput = document.getElementById('feesCourseId');
    const feesCourseName = document.getElementById('feesCourseName');
    const feesPaymentDate = document.getElementById('feesPaymentDate');
    const feesNote = document.getElementById('feesNote');
    const feesTotalPay = document.getElementById('feesTotalPay');
    const confirmFeesPayBtn = document.getElementById('confirmFeesPayBtn');

    let classes = [];
    let students = [];
    let rows = [];
    let currentPage = 1;
    let selectedStudentLabel = '';
    let pendingPayItem = null;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function money(value) {
        const num = Number(value);
        if (Number.isNaN(num)) return '0.00';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function studentLabel(item) {
        const name = ((item.firstName || '') + ' ' + (item.lastName || '')).trim();
        const admissionNo = item.admissionNo || '';
        return admissionNo ? (name + ' (' + admissionNo + ')') : name;
    }

    function populateSections() {
        const selected = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
        sectionSelect.innerHTML = '<option value="">Select</option>';
        studentSelect.innerHTML = '<option value="">Select</option>';
        students = [];
        const sections = selected && Array.isArray(selected.sections) ? selected.sections : [];
        sections.forEach(function (name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            sectionSelect.appendChild(option);
        });
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
    }

    async function loadStudents() {
        const classId = classSelect.value;
        const section = sectionSelect.value;
        studentSelect.innerHTML = '<option value="">Select</option>';
        students = [];
        if (!classId || !section) return;

        const params = [
            'classId=' + encodeURIComponent(classId),
            'section=' + encodeURIComponent(section)
        ];
        const response = await fetch('/api/student-admissions?' + params.join('&'));
        if (!response.ok) throw new Error('Failed to load students');
        students = await response.json();
        students.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = studentLabel(item);
            studentSelect.appendChild(option);
        });
    }

    function getPageSize() {
        return entriesSelect ? parseInt(entriesSelect.value, 10) || 100 : 100;
    }

    function getFilteredRows() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return rows.slice();
        return rows.filter(function (item) {
            const haystack = [
                item.course,
                item.sectionCount,
                item.lessonCount,
                item.quizCount,
                item.examCount,
                item.assignmentCount,
                item.courseProvider,
                item.price,
                item.currentPrice
            ].join(' ').toLowerCase();
            return haystack.indexOf(term) !== -1;
        });
    }

    function updateShowingInfo(start, end, total) {
        if (!showingInfo) return;
        if (total === 0) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        showingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + total + ' entries';
    }

    function renderPagination(total) {
        const pagination = document.querySelector('.onlinecourse-offlinepayment-page .pagination');
        if (!pagination) return;
        const pageSize = getPageSize();
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        pagination.innerHTML = '';
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'pagination-btn';
        prev.textContent = '<';
        prev.disabled = currentPage <= 1;
        prev.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                renderRows();
            }
        });
        pagination.appendChild(prev);

        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = 'pagination-btn active';
        pageBtn.textContent = String(currentPage);
        pagination.appendChild(pageBtn);

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'pagination-btn';
        next.textContent = '>';
        next.disabled = currentPage >= totalPages || total === 0;
        next.addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                renderRows();
            }
        });
        pagination.appendChild(next);
    }

    function actionButtonsHtml(item) {
        if (item.paid) {
            return ''
                + '<button type="button" class="btn-action btn-revert" title="Revert" data-action="revert">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>'
                + '</svg></button>'
                + '<button type="button" class="btn-action btn-print-row" title="Print" data-action="print">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="6 9 6 2 18 2 18 9"></polyline>'
                + '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>'
                + '<rect x="6" y="14" width="12" height="8"></rect>'
                + '</svg></button>';
        }
        return ''
            + '<button type="button" class="btn-action btn-pay" title="Pay" data-action="pay">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>'
            + '<line x1="1" y1="10" x2="23" y2="10"></line>'
            + '</svg></button>';
    }

    function renderRows() {
        const filtered = getFilteredRows();
        const pageSize = getPageSize();
        const total = filtered.length;
        const startIndex = (currentPage - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);

        tableBody.innerHTML = '';
        if (!pageItems.length) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="10" class="loading-cell">No courses found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0);
            return;
        }

        pageItems.forEach(function (item) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-course-id', String(item.courseId));
            if (item.paymentId) tr.setAttribute('data-payment-id', String(item.paymentId));
            tr.innerHTML = ''
                + '<td class="course-name">' + escapeHtml(item.course) + '</td>'
                + '<td>' + escapeHtml(item.sectionCount) + '</td>'
                + '<td>' + escapeHtml(item.lessonCount) + '</td>'
                + '<td>' + escapeHtml(item.quizCount) + '</td>'
                + '<td>' + escapeHtml(item.examCount) + '</td>'
                + '<td>' + escapeHtml(item.assignmentCount) + '</td>'
                + '<td>' + escapeHtml(item.courseProvider || 'Youtube') + '</td>'
                + '<td>' + money(item.price) + '</td>'
                + '<td>' + money(item.currentPrice) + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(item) + '</td>';
            tableBody.appendChild(tr);
        });

        updateShowingInfo(startIndex + 1, startIndex + pageItems.length, total);
        renderPagination(total);
    }

    async function searchCourses() {
        const classId = classSelect.value;
        const section = sectionSelect.value;
        const studentId = studentSelect.value;

        if (!classId || !section || !studentId) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select Class, Section and Student.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        selectedStudentLabel = studentSelect.options[studentSelect.selectedIndex].textContent;
        tableBody.innerHTML = '<tr class="no-data-row"><td colspan="10" class="loading-cell">Loading...</td></tr>';

        try {
            const response = await fetch('/api/online-course-offline-payments?studentAdmissionId='
                + encodeURIComponent(studentId));
            if (!response.ok) {
                const data = await response.json().catch(function () { return {}; });
                throw new Error(data.message || 'Failed to load courses');
            }
            rows = await response.json();
            currentPage = 1;
            renderRows();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load courses.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    function todayInputValue() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return now.getFullYear() + '-' + month + '-' + day;
    }

    function openFeesModal(item) {
        pendingPayItem = item;
        feesCourseIdInput.value = String(item.courseId);
        feesCourseName.textContent = item.course || '—';
        feesPaymentDate.value = todayInputValue();
        feesNote.value = '';
        feesTotalPay.textContent = '$' + money(item.currentPrice);
        const cashRadio = feesPayForm.querySelector('input[name="paymentMode"][value="Cash"]');
        if (cashRadio) cashRadio.checked = true;
        feesModal.classList.add('open');
        feesModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeFeesModal() {
        feesModal.classList.remove('open');
        feesModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        pendingPayItem = null;
        confirmFeesPayBtn.disabled = false;
    }

    function openPayModal(courseId) {
        if (!studentSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select a student first.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        const item = rows.find(function (r) { return String(r.courseId) === String(courseId); });
        if (!item) return;
        openFeesModal(item);
    }

    async function submitFeesPayment() {
        if (!pendingPayItem) return;
        const studentId = studentSelect.value;
        const paymentDate = feesPaymentDate.value;
        if (!paymentDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select a date.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const modeInput = feesPayForm.querySelector('input[name="paymentMode"]:checked');
        const paymentMethod = modeInput ? modeInput.value : 'Cash';

        confirmFeesPayBtn.disabled = true;
        try {
            const response = await fetch('/api/online-course-offline-payments/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: pendingPayItem.courseId,
                    studentAdmissionId: studentId,
                    paymentMethod: paymentMethod,
                    paymentDate: paymentDate,
                    note: feesNote.value.trim()
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(function () { return {}; });
                throw new Error(data.message || 'Failed to save payment');
            }
            closeFeesModal();
            await searchCourses();
            Swal.fire({
                icon: 'success',
                title: 'Paid',
                text: 'Offline payment saved to database.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            confirmFeesPayBtn.disabled = false;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save payment.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    async function revertPayment(paymentId) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Revert Payment?',
            text: 'This will mark the offline payment as reverted.',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Revert'
        });
        if (!result.isConfirmed) return;

        try {
            const response = await fetch('/api/online-course-offline-payments/' + encodeURIComponent(paymentId) + '/revert', {
                method: 'POST'
            });
            if (!response.ok) {
                const data = await response.json().catch(function () { return {}; });
                throw new Error(data.message || 'Failed to revert payment');
            }
            await searchCourses();
            Swal.fire({
                icon: 'success',
                title: 'Reverted',
                text: 'Payment reverted successfully.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to revert payment.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    function printReceipt(item) {
        const html = ''
            + '<!DOCTYPE html><html><head><title>Offline Payment Receipt</title><style>'
            + 'body{font-family:Arial,sans-serif;margin:24px;color:#111}'
            + 'h1{font-size:20px;margin:0 0 12px}'
            + 'table{border-collapse:collapse;width:100%;margin-top:16px}'
            + 'td,th{border:1px solid #ddd;padding:8px;text-align:left}'
            + '</style></head><body>'
            + '<h1>Offline Payment Receipt</h1>'
            + '<p><strong>Student:</strong> ' + escapeHtml(selectedStudentLabel || item.studentLabel || '') + '</p>'
            + '<p><strong>Date:</strong> ' + new Date().toLocaleString() + '</p>'
            + '<table><tbody>'
            + '<tr><th>Course</th><td>' + escapeHtml(item.course) + '</td></tr>'
            + '<tr><th>Course Provider</th><td>' + escapeHtml(item.courseProvider || 'Youtube') + '</td></tr>'
            + '<tr><th>Price ($)</th><td>' + money(item.price) + '</td></tr>'
            + '<tr><th>Current Price ($)</th><td>' + money(item.currentPrice) + '</td></tr>'
            + '<tr><th>Payment Method</th><td>' + escapeHtml(item.paymentMethod || 'Cash') + '</td></tr>'
            + '<tr><th>Status</th><td>Paid</td></tr>'
            + '</tbody></table></body></html>';
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-action]');
            const row = e.target.closest('tr');
            if (!btn || !row) return;
            const courseId = row.getAttribute('data-course-id');
            const paymentId = row.getAttribute('data-payment-id');
            const item = rows.find(function (r) { return String(r.courseId) === String(courseId); });
            if (!item) return;

            const action = btn.getAttribute('data-action');
            if (action === 'pay') openPayModal(courseId);
            if (action === 'revert') revertPayment(paymentId);
            if (action === 'print') printReceipt(item);
        });
    }

    if (closeFeesPayBtn) closeFeesPayBtn.addEventListener('click', closeFeesModal);
    if (feesOverlay) feesOverlay.addEventListener('click', closeFeesModal);
    if (confirmFeesPayBtn) confirmFeesPayBtn.addEventListener('click', submitFeesPayment);
    if (feesPayForm) {
        feesPayForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitFeesPayment();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && feesModal && feesModal.classList.contains('open')) {
            closeFeesModal();
        }
    });

    classSelect.addEventListener('change', function () {
        populateSections();
        rows = [];
        renderRows();
    });
    sectionSelect.addEventListener('change', function () {
        loadStudents().catch(function (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        });
        rows = [];
        renderRows();
    });
    searchBtn.addEventListener('click', searchCourses);
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderRows();
        });
    }
    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            currentPage = 1;
            renderRows();
        });
    }

    function getVisibleRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(function (row) {
            return !row.classList.contains('no-data-row');
        });
    }

    function getTableData() {
        const headers = [];
        const data = [];
        table.querySelectorAll('thead th').forEach(function (th, index, list) {
            if (index < list.length - 1) headers.push(th.textContent.trim());
        });
        getVisibleRows().forEach(function (row) {
            const rowData = [];
            row.querySelectorAll('td').forEach(function (cell, index, list) {
                if (index < list.length - 1) rowData.push(cell.textContent.trim().replace(/\s+/g, ' '));
            });
            data.push(rowData);
        });
        return { headers: headers, data: data };
    }

    document.getElementById('copyBtn').addEventListener('click', function () {
        const result = getTableData();
        let text = result.headers.join('\t') + '\n';
        result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied!', timer: 1500, showConfirmButton: false });
        });
    });

    document.getElementById('excelBtn').addEventListener('click', function () {
        const result = getTableData();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
        XLSX.utils.book_append_sheet(wb, ws, 'Offline Payments');
        XLSX.writeFile(wb, 'Offline_Payments_' + new Date().toISOString().split('T')[0] + '.xlsx');
    });

    document.getElementById('csvBtn').addEventListener('click', function () {
        const result = getTableData();
        let csv = result.headers.join(',') + '\n';
        result.data.forEach(function (row) {
            csv += row.map(function (cell) {
                return (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1)
                    ? '"' + cell.replace(/"/g, '""') + '"'
                    : cell;
            }).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Offline_Payments_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
    });

    document.getElementById('pdfBtn').addEventListener('click', function () {
        const result = getTableData();
        const doc = new window.jspdf.jsPDF('l', 'pt', 'a4');
        doc.text('Offline Payment', 40, 40);
        doc.autoTable({
            head: [result.headers],
            body: result.data,
            startY: 55,
            styles: { fontSize: 8 }
        });
        doc.save('Offline_Payments_' + new Date().toISOString().split('T')[0] + '.pdf');
    });

    document.getElementById('printBtn').addEventListener('click', function () {
        const result = getTableData();
        let html = '<html><head><title>Offline Payment</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#1e293b;color:#fff}</style></head><body><h1>Offline Payment</h1><table><thead><tr>';
        result.headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
        html += '</tr></thead><tbody>';
        result.data.forEach(function (row) {
            html += '<tr>';
            row.forEach(function (cell) { html += '<td>' + cell + '</td>'; });
            html += '</tr>';
        });
        html += '</tbody></table></body></html>';
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
    });

    loadClasses().catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load classes.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
