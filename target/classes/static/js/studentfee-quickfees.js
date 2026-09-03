document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('quickFeesSearchForm');
    const keywordInput = document.getElementById('keywordInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResultsPanel = document.getElementById('searchResultsPanel');
    const studentResultsBody = document.getElementById('studentResultsBody');
    const feeWorkspace = document.getElementById('feeWorkspace');
    const studentIdInput = document.getElementById('studentId');
    const sessionYearInput = document.getElementById('sessionYear');
    const quickFeesTableBody = document.getElementById('quickFeesTableBody');
    const changeStudentBtn = document.getElementById('changeStudentBtn');
    const fullFeesLink = document.getElementById('fullFeesLink');
    const addFeeModal = document.getElementById('addFeeModal');
    const addFeeOverlay = document.getElementById('addFeeOverlay');
    const addFeeCloseBtn = document.getElementById('addFeeCloseBtn');
    const addFeeCancelBtn = document.getElementById('addFeeCancelBtn');
    const collectFeesBtn = document.getElementById('collectFeesBtn');
    const collectPrintBtn = document.getElementById('collectPrintBtn');

    let fees = [];
    let activeFee = null;
    let sessionYear = sessionYearInput ? sessionYearInput.value || '2026-27' : '2026-27';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        if (window.AppCurrency) return window.AppCurrency.formatMoney(value);
        const num = Number(value);
        if (Number.isNaN(num)) return '0.00';
        return num.toFixed(2);
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length !== 3) return value;
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function todayDisplay() {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return mm + '/' + dd + '/' + d.getFullYear();
    }

    function fullName(item) {
        const first = item.firstName || '';
        const last = item.lastName || '';
        return (first + ' ' + last).trim();
    }

    function statusClass(status) {
        if (status === 'Paid') return 'status-paid';
        if (status === 'Partial') return 'status-partial';
        return 'status-unpaid';
    }

    async function searchStudents(keyword) {
        searchBtn.disabled = true;
        try {
            const url = '/api/student-admissions?keyword=' + encodeURIComponent(keyword);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to search students');
            const rows = await response.json();
            renderSearchResults(Array.isArray(rows) ? rows : []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to search students.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            searchBtn.disabled = false;
        }
    }

    function renderSearchResults(rows) {
        searchResultsPanel.style.display = 'block';
        feeWorkspace.style.display = 'none';

        if (!rows.length) {
            studentResultsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No students found</td></tr>';
            return;
        }

        studentResultsBody.innerHTML = rows.map(function (item) {
            const className = item.className || (item.schoolClass && item.schoolClass.name) || '';
            return '<tr>'
                + '<td>' + escapeHtml(item.admissionNo || '') + '</td>'
                + '<td>' + escapeHtml(fullName(item)) + '</td>'
                + '<td>' + escapeHtml(className) + '</td>'
                + '<td>' + escapeHtml(item.section || '') + '</td>'
                + '<td>' + escapeHtml(item.fatherName || '') + '</td>'
                + '<td><button type="button" class="btn-select-student" data-id="' + escapeHtml(String(item.id)) + '">Select</button></td>'
                + '</tr>';
        }).join('');
    }

    function fillSummary(student, session) {
        document.getElementById('summaryName').textContent = student.name || '-';
        document.getElementById('summaryAdmissionNo').textContent = student.admissionNo || '-';
        document.getElementById('summaryClassSection').textContent = student.classSection || '-';
        document.getElementById('summaryFatherName').textContent = student.fatherName || '-';
        document.getElementById('summaryMobile').textContent = student.mobileNumber || '-';
        document.getElementById('summarySession').textContent = session || sessionYear;
    }

    function renderUnpaidFees() {
        const unpaid = fees.filter(function (item) {
            return item.status !== 'Paid';
        });

        if (!unpaid.length) {
            quickFeesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No unpaid fees for this student</td></tr>';
            return;
        }

        quickFeesTableBody.innerHTML = unpaid.map(function (item) {
            return '<tr>'
                + '<td>' + escapeHtml(item.feesLabel || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(item.dueDate)) + '</td>'
                + '<td><span class="status-badge ' + statusClass(item.status) + '">' + escapeHtml(item.status) + '</span></td>'
                + '<td>' + escapeHtml(formatMoney(item.balance)) + '</td>'
                + '<td><button type="button" class="btn-select-student btn-collect-one" data-id="' + escapeHtml(String(item.feeMasterId)) + '">Collect</button></td>'
                + '</tr>';
        }).join('');
    }

    async function loadStudentFees(studentId) {
        const response = await fetch('/api/student-fees/' + studentId + '?sessionYear=' + encodeURIComponent(sessionYear));
        if (!response.ok) throw new Error('Failed to load student fees');
        const data = await response.json();
        sessionYear = data.sessionYear || sessionYear;
        if (sessionYearInput) sessionYearInput.value = sessionYear;
        fees = Array.isArray(data.fees) ? data.fees : [];
        fillSummary(data.student || {}, sessionYear);
        if (fullFeesLink) {
            fullFeesLink.href = '/studentfee/addfee/' + studentId;
        }
        renderUnpaidFees();
    }

    async function selectStudent(studentId) {
        studentIdInput.value = studentId;
        searchResultsPanel.style.display = 'none';
        feeWorkspace.style.display = 'block';
        try {
            await loadStudentFees(studentId);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load fees.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    function openAddFeeModal(feeMasterId) {
        activeFee = fees.find(function (item) {
            return String(item.feeMasterId) === String(feeMasterId);
        });
        if (!activeFee || activeFee.status === 'Paid') return;

        document.getElementById('addFeeModalTitle').textContent = activeFee.modalTitle || activeFee.feesLabel || 'Collect Fee';
        document.getElementById('modalFeeMasterId').value = activeFee.feeMasterId;
        document.getElementById('modalFeesAmount').textContent = formatMoney(activeFee.amount);
        document.getElementById('modalPaymentDate').value = todayDisplay();
        document.getElementById('modalPayingAmount').value = formatMoney(activeFee.balance > 0 ? activeFee.balance : activeFee.amount);
        document.getElementById('modalDiscountAmount').value = '0';
        document.getElementById('modalFineAmount').value = formatMoney(activeFee.configuredFine || 0);
        document.getElementById('modalNote').value = '';
        document.getElementById('modalDiscountGroup').textContent = 'No Discount Available';
        const cashRadio = document.querySelector('input[name="paymentMode"][value="Cash"]');
        if (cashRadio) cashRadio.checked = true;

        addFeeModal.classList.add('active');
        addFeeModal.setAttribute('aria-hidden', 'false');
    }

    function closeAddFeeModal() {
        addFeeModal.classList.remove('active');
        addFeeModal.setAttribute('aria-hidden', 'true');
        activeFee = null;
    }

    function selectedPaymentMode() {
        const checked = document.querySelector('input[name="paymentMode"]:checked');
        return checked ? checked.value : 'Cash';
    }

    async function submitAddFee(andPrint) {
        const studentId = studentIdInput.value;
        const feeMasterId = document.getElementById('modalFeeMasterId').value;
        const payingAmount = document.getElementById('modalPayingAmount').value.trim();
        const discountAmount = document.getElementById('modalDiscountAmount').value.trim();
        const fineAmount = document.getElementById('modalFineAmount').value.trim();
        const paymentDate = document.getElementById('modalPaymentDate').value.trim();
        const note = document.getElementById('modalNote').value.trim();

        if (!payingAmount || Number(payingAmount) < 0) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter a paying amount.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!paymentDate) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter payment date.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        try {
            const response = await fetch('/api/student-fees/' + studentId + '/collect-one', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feeMasterId: feeMasterId,
                    sessionYear: sessionYear,
                    payingAmount: payingAmount,
                    discountAmount: discountAmount === '' ? 0 : discountAmount,
                    fineAmount: fineAmount === '' ? 0 : fineAmount,
                    paymentMode: selectedPaymentMode(),
                    paymentDate: paymentDate,
                    note: note
                })
            });
            if (!response.ok) {
                let message = 'Failed to collect fee';
                try {
                    const err = await response.json();
                    message = err.message || message;
                } catch (e) { /* ignore */ }
                throw new Error(message);
            }

            closeAddFeeModal();
            await loadStudentFees(studentId);
            if (andPrint) {
                window.print();
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Collected',
                    text: 'Fee collected successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to collect fee.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    searchForm?.addEventListener('submit', function (event) {
        event.preventDefault();
        const keyword = keywordInput.value.trim();
        if (!keyword) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Enter a student keyword to search.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        searchStudents(keyword);
    });

    studentResultsBody?.addEventListener('click', function (event) {
        const btn = event.target.closest('.btn-select-student');
        if (!btn) return;
        selectStudent(btn.getAttribute('data-id'));
    });

    quickFeesTableBody?.addEventListener('click', function (event) {
        const btn = event.target.closest('.btn-collect-one');
        if (!btn) return;
        openAddFeeModal(btn.getAttribute('data-id'));
    });

    changeStudentBtn?.addEventListener('click', function () {
        feeWorkspace.style.display = 'none';
        searchResultsPanel.style.display = 'block';
        studentIdInput.value = '';
        keywordInput.focus();
    });

    addFeeCloseBtn?.addEventListener('click', closeAddFeeModal);
    addFeeCancelBtn?.addEventListener('click', closeAddFeeModal);
    addFeeOverlay?.addEventListener('click', closeAddFeeModal);
    collectFeesBtn?.addEventListener('click', function () { submitAddFee(false); });
    collectPrintBtn?.addEventListener('click', function () { submitAddFee(true); });
});
