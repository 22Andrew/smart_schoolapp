document.addEventListener('DOMContentLoaded', function () {
    const studentId = document.getElementById('studentId').value;
    const sessionYear = document.getElementById('sessionYear').value || '2026-27';
    const tableBody = document.getElementById('studentFeesTableBody');
    const selectAll = document.getElementById('selectAllFees');
    const collectBtn = document.getElementById('collectSelectedBtn');
    const printSelectedBtn = document.getElementById('printSelectedBtn');
    const addFeeModal = document.getElementById('addFeeModal');
    const addFeeOverlay = document.getElementById('addFeeOverlay');
    const addFeeCloseBtn = document.getElementById('addFeeCloseBtn');
    const addFeeCancelBtn = document.getElementById('addFeeCancelBtn');
    const collectFeesBtn = document.getElementById('collectFeesBtn');
    const collectPrintBtn = document.getElementById('collectPrintBtn');
    const collectSelectedModal = document.getElementById('collectSelectedModal');
    const collectSelectedOverlay = document.getElementById('collectSelectedOverlay');
    const collectSelectedCloseBtn = document.getElementById('collectSelectedCloseBtn');
    const bulkPayBtn = document.getElementById('bulkPayBtn');

    let fees = [];
    let activeFee = null;
    let selectedBulkFees = [];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
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

    function openAddFeeModal(feeMasterId) {
        activeFee = fees.find(function (item) {
            return String(item.feeMasterId) === String(feeMasterId);
        });
        if (!activeFee) return;
        if (activeFee.status === 'Paid') {
            Swal.fire({ icon: 'info', title: 'Already Paid', text: 'This fee is already fully paid.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        document.getElementById('addFeeModalTitle').textContent = activeFee.modalTitle || activeFee.feesLabel || 'Add Fee';
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
            await loadPage();
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

    function displayOrDash(value) {
        if (value == null || String(value).trim() === '') return '';
        return String(value);
    }

    function statusClass(status) {
        if (status === 'Paid') return 'status-paid';
        if (status === 'Partial') return 'status-partial';
        return 'status-unpaid';
    }

    function rowClass(status) {
        if (status === 'Paid') return 'row-paid';
        if (status === 'Partial') return 'row-partial';
        return 'row-unpaid';
    }

    function amountDisplay(item) {
        const amount = formatMoney(item.amount);
        const extra = Number(item.amountExtra || 0);
        if (extra > 0) return amount + ' + ' + formatMoney(extra);
        return amount;
    }

    function actionButtons(item) {
        return ''
            + '<div class="action-btns">'
            + '<button type="button" class="btn-mini btn-collect-one" data-id="' + escapeHtml(String(item.feeMasterId)) + '" title="Add Fee">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
            + '</button>'
            + '<button type="button" class="btn-mini btn-print-one" title="Print">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>'
            + '</button>'
            + '</div>';
    }

    function paymentActionButtons(paymentId) {
        return ''
            + '<div class="action-btns">'
            + '<button type="button" class="btn-mini btn-reverse" data-payment-id="' + escapeHtml(String(paymentId)) + '" title="Reverse Payment">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>'
            + '</button>'
            + '</div>';
    }

    function fillStudent(student) {
        document.getElementById('studentName').textContent = displayOrDash(student.name);
        document.getElementById('fatherName').textContent = displayOrDash(student.fatherName);
        document.getElementById('mobileNumber').textContent = displayOrDash(student.mobileNumber);
        document.getElementById('categoryName').textContent = displayOrDash(student.categoryName);
        document.getElementById('classSection').textContent = displayOrDash(student.classSection);
        document.getElementById('admissionNo').textContent = displayOrDash(student.admissionNo);
        document.getElementById('rollNumber').textContent = displayOrDash(student.rollNumber);
        document.getElementById('rteValue').textContent = displayOrDash(student.rte || 'No');

        const photo = document.getElementById('studentPhoto');
        const placeholder = document.getElementById('photoPlaceholder');
        if (student.photoUrl) {
            photo.src = student.photoUrl.startsWith('/') ? student.photoUrl : '/' + student.photoUrl;
            photo.style.display = 'block';
            placeholder.style.display = 'none';
        }
    }

    function renderFees() {
        if (!fees.length) {
            tableBody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:#94a3b8;">No fees assigned to this student</td></tr>';
            return;
        }

        let html = '';
        fees.forEach(function (item) {
            const canSelect = item.status !== 'Paid';
            html += '<tr class="' + rowClass(item.status) + '" data-fee-master-id="' + escapeHtml(String(item.feeMasterId)) + '">'
                + '<td>' + (canSelect ? '<input type="checkbox" class="fee-check" value="' + escapeHtml(String(item.feeMasterId)) + '">' : '') + '</td>'
                + '<td>' + escapeHtml(item.feesLabel || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(item.dueDate)) + '</td>'
                + '<td><span class="status-badge ' + statusClass(item.status) + '">' + escapeHtml(item.status) + '</span></td>'
                + '<td>' + escapeHtml(amountDisplay(item)) + '</td>'
                + '<td></td><td></td><td></td>'
                + '<td>' + escapeHtml(formatMoney(item.discount)) + '</td>'
                + '<td>' + escapeHtml(formatMoney(item.fine)) + '</td>'
                + '<td>' + escapeHtml(formatMoney(item.paid)) + '</td>'
                + '<td>' + escapeHtml(formatMoney(item.balance)) + '</td>'
                + '<td>' + actionButtons(item) + '</td>'
                + '</tr>';

            (item.payments || []).forEach(function (payment) {
                html += '<tr class="payment-row" data-payment-id="' + escapeHtml(String(payment.id)) + '">'
                    + '<td></td>'
                    + '<td>↳ Payment</td>'
                    + '<td></td><td></td><td></td>'
                    + '<td>' + escapeHtml(payment.paymentRef || '') + '</td>'
                    + '<td>' + escapeHtml(payment.paymentMode || '') + '</td>'
                    + '<td>' + escapeHtml(formatDate(payment.paymentDate)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(payment.discountAmount)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(payment.fineAmount)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(payment.paidAmount)) + '</td>'
                    + '<td></td>'
                    + '<td>' + paymentActionButtons(payment.id) + '</td>'
                    + '</tr>';
            });
        });

        tableBody.innerHTML = html;
        syncSelectAll();
    }

    function syncSelectAll() {
        const checks = tableBody.querySelectorAll('.fee-check');
        if (!checks.length) {
            selectAll.checked = false;
            return;
        }
        selectAll.checked = Array.from(checks).every(function (c) { return c.checked; });
    }

    function selectedFeeMasterIds() {
        return Array.from(tableBody.querySelectorAll('.fee-check:checked')).map(function (c) {
            return c.value;
        });
    }

    async function loadPage() {
        const response = await fetch('/api/student-fees/' + studentId + '?sessionYear=' + encodeURIComponent(sessionYear));
        if (!response.ok) throw new Error('Failed to load student fees');
        const data = await response.json();
        fillStudent(data.student || {});
        document.getElementById('sessionLabel').textContent = data.sessionYear || sessionYear;
        document.getElementById('dateLabel').textContent = formatDate(data.date) || '';
        fees = Array.isArray(data.fees) ? data.fees : [];
        renderFees();
    }

    function moneyWithDollar(value) {
        return '$' + formatMoney(value);
    }

    function selectedBulkPaymentMode() {
        const checked = document.querySelector('input[name="bulkPaymentMode"]:checked');
        return checked ? checked.value : 'Cash';
    }

    function openCollectSelectedModal(feeMasterIds) {
        if (!feeMasterIds.length) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select at least one unpaid fee.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        selectedBulkFees = fees.filter(function (item) {
            return feeMasterIds.indexOf(String(item.feeMasterId)) !== -1 && item.status !== 'Paid';
        });

        if (!selectedBulkFees.length) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select at least one unpaid fee.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        let totalFees = 0;
        let totalFine = 0;
        const body = document.getElementById('collectSelectedFeesBody');
        body.innerHTML = selectedBulkFees.map(function (item) {
            const feeAmount = Number(item.balance > 0 ? item.balance : item.amount) || 0;
            const fineAmount = Number(item.configuredFine || 0) || 0;
            totalFees += feeAmount;
            totalFine += fineAmount;
            return '<tr>'
                + '<td>' + escapeHtml(item.feesLabel || '') + '</td>'
                + '<td>' + (fineAmount > 0 ? escapeHtml(moneyWithDollar(fineAmount)) : '') + '</td>'
                + '<td>' + escapeHtml(moneyWithDollar(feeAmount)) + '</td>'
                + '</tr>';
        }).join('');

        document.getElementById('collectTotalFine').textContent = moneyWithDollar(totalFine);
        document.getElementById('collectTotalFees').textContent = moneyWithDollar(totalFees);
        document.getElementById('bulkPayingAmount').value = formatMoney(totalFees);
        document.getElementById('bulkPaymentDate').value = todayDisplay();
        document.getElementById('bulkNote').value = '';
        const cashRadio = document.querySelector('input[name="bulkPaymentMode"][value="Cash"]');
        if (cashRadio) cashRadio.checked = true;

        collectSelectedModal.classList.add('active');
        collectSelectedModal.setAttribute('aria-hidden', 'false');
    }

    function closeCollectSelectedModal() {
        collectSelectedModal.classList.remove('active');
        collectSelectedModal.setAttribute('aria-hidden', 'true');
        selectedBulkFees = [];
    }

    async function paySelectedFees() {
        const paymentDate = document.getElementById('bulkPaymentDate').value.trim();
        const payingAmount = document.getElementById('bulkPayingAmount').value.trim();
        const note = document.getElementById('bulkNote').value.trim();
        const feeMasterIds = selectedBulkFees.map(function (item) { return item.feeMasterId; });

        if (!paymentDate) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter payment date.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (payingAmount === '' || Number(payingAmount) <= 0) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter paying amount.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        try {
            const response = await fetch('/api/student-fees/' + studentId + '/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionYear: sessionYear,
                    paymentMode: selectedBulkPaymentMode(),
                    paymentDate: paymentDate,
                    note: note,
                    payingAmount: payingAmount,
                    feeMasterIds: feeMasterIds
                })
            });
            if (!response.ok) {
                let message = 'Failed to collect fees';
                try {
                    const err = await response.json();
                    message = err.message || message;
                } catch (e) { /* ignore */ }
                throw new Error(message);
            }
            closeCollectSelectedModal();
            await loadPage();
            Swal.fire({
                icon: 'success',
                title: 'Paid',
                text: 'Selected fees collected successfully.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to collect fees.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            tableBody.querySelectorAll('.fee-check').forEach(function (checkbox) {
                checkbox.checked = selectAll.checked;
            });
        });
    }

    if (tableBody) {
        tableBody.addEventListener('change', function (e) {
            if (e.target.classList.contains('fee-check')) syncSelectAll();
        });

        tableBody.addEventListener('click', async function (e) {
            const collectOne = e.target.closest('.btn-collect-one');
            const reverseBtn = e.target.closest('.btn-reverse');
            const printOne = e.target.closest('.btn-print-one');

            if (collectOne) {
                openAddFeeModal(collectOne.getAttribute('data-id'));
                return;
            }

            if (printOne) {
                window.print();
                return;
            }

            if (reverseBtn) {
                const paymentId = reverseBtn.getAttribute('data-payment-id');
                const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Reverse Payment?',
                    text: 'This will remove the payment transaction.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Reverse'
                });
                if (!result.isConfirmed) return;
                try {
                    const response = await fetch('/api/student-fees/' + studentId + '/payments/' + paymentId, {
                        method: 'DELETE'
                    });
                    if (!response.ok && response.status !== 204) throw new Error('Failed to reverse payment');
                    await loadPage();
                    Swal.fire({ icon: 'success', title: 'Reversed', text: 'Payment reversed.', timer: 1400, showConfirmButton: false });
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to reverse payment.', confirmButtonColor: '#8b5cf6' });
                }
            }
        });
    }

    if (collectBtn) {
        collectBtn.addEventListener('click', function () {
            openCollectSelectedModal(selectedFeeMasterIds());
        });
    }

    if (printSelectedBtn) {
        printSelectedBtn.addEventListener('click', function () {
            window.print();
        });
    }

    if (addFeeOverlay) addFeeOverlay.addEventListener('click', closeAddFeeModal);
    if (addFeeCloseBtn) addFeeCloseBtn.addEventListener('click', closeAddFeeModal);
    if (addFeeCancelBtn) addFeeCancelBtn.addEventListener('click', closeAddFeeModal);
    if (collectFeesBtn) collectFeesBtn.addEventListener('click', function () { submitAddFee(false); });
    if (collectPrintBtn) collectPrintBtn.addEventListener('click', function () { submitAddFee(true); });

    if (collectSelectedOverlay) collectSelectedOverlay.addEventListener('click', closeCollectSelectedModal);
    if (collectSelectedCloseBtn) collectSelectedCloseBtn.addEventListener('click', closeCollectSelectedModal);
    if (bulkPayBtn) bulkPayBtn.addEventListener('click', paySelectedFees);

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (collectSelectedModal.classList.contains('active')) {
            closeCollectSelectedModal();
            return;
        }
        if (addFeeModal.classList.contains('active')) {
            closeAddFeeModal();
        }
    });

    ['copyBtn', 'excelBtn', 'csvBtn', 'pdfBtn', 'printBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (id === 'copyBtn') {
                let text = 'Fees\tDue Date\tStatus\tAmount\tPaid\tBalance\n';
                fees.forEach(function (item) {
                    text += [item.feesLabel, formatDate(item.dueDate), item.status, formatMoney(item.amount), formatMoney(item.paid), formatMoney(item.balance)].join('\t') + '\n';
                });
                navigator.clipboard.writeText(text);
                return;
            }
            window.print();
        });
    });

    loadPage().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load student fees.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
