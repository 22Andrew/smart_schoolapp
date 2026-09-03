(function () {
    'use strict';

    var studentId = document.getElementById('feeStudentId') ? document.getElementById('feeStudentId').value : '';
    var sessionYear = document.getElementById('feeSessionYear') ? document.getElementById('feeSessionYear').value : '2026-27';
    var tableBody = document.getElementById('userFeesTableBody');
    var selectAll = document.getElementById('selectAllFees');
    var paySelectedBtn = document.getElementById('paySelectedBtn');
    var printSelectedBtn = document.getElementById('printSelectedBtn');
    var offlineBankBtn = document.getElementById('offlineBankBtn');
    var paySelectedModal = document.getElementById('paySelectedModal');
    var paySelectedOverlay = document.getElementById('paySelectedOverlay');
    var paySelectedCloseBtn = document.getElementById('paySelectedCloseBtn');
    var bulkPayBtn = document.getElementById('bulkPayBtn');
    var offlineBankModal = document.getElementById('offlineBankModal');
    var offlineBankOverlay = document.getElementById('offlineBankOverlay');
    var offlineBankCloseBtn = document.getElementById('offlineBankCloseBtn');
    var offlineBankSubmitBtn = document.getElementById('offlineBankSubmitBtn');

    var fees = [];
    var selectedBulkFees = [];

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(value);
        }
        var num = Number(value);
        if (Number.isNaN(num)) {
            return '0.00';
        }
        return num.toFixed(2);
    }

    function moneyWithDollar(value) {
        var formatted = formatMoney(value);
        return formatted.indexOf('$') === 0 ? formatted : '$' + formatted;
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }
        var text = String(value).trim();
        var isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return isoMatch[2] + '/' + isoMatch[3] + '/' + isoMatch[1];
        }
        return text;
    }

    function todayDisplay() {
        var d = new Date();
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        return mm + '/' + dd + '/' + d.getFullYear();
    }

    function statusClass(status) {
        if (status === 'Paid') {
            return 'status-paid';
        }
        if (status === 'Partial') {
            return 'status-partial';
        }
        return 'status-unpaid';
    }

    function rowClass(status) {
        if (status === 'Paid') {
            return 'row-paid';
        }
        if (status === 'Partial') {
            return 'row-partial';
        }
        return 'row-unpaid';
    }

    function amountDisplay(item) {
        var amount = formatMoney(item.amount);
        var extra = Number(item.amountExtra || item.configuredFine || 0);
        if (extra > 0 && item.status !== 'Paid') {
            return escapeHtml(amount) + ' <span class="ugf-fee-extra">+ ' + escapeHtml(formatMoney(extra)) + '</span>';
        }
        return escapeHtml(amount);
    }

    function paymentBranchHtml() {
        return ''
            + '<span class="ugf-payment-branch">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path>'
            + '</svg></span>';
    }

    function printActionButton() {
        return ''
            + '<div class="ugf-action-btns">'
            + '<button type="button" class="ugf-btn-mini btn-print-one" title="Print">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>'
            + '<rect x="6" y="14" width="12" height="8"></rect></svg>'
            + '</button></div>';
    }

    function normalizeFees(list) {
        return (list || []).map(function (item) {
            var copy = Object.assign({}, item);
            copy.balance = Number(copy.balance != null ? copy.balance : Math.max(0, Number(copy.amount || 0) - Number(copy.paid || 0)));
            copy.payments = Array.isArray(copy.payments) ? copy.payments : [];
            return copy;
        });
    }

    function fillStudent(student) {
        if (!student) {
            return;
        }
        var map = {
            feeStudentName: student.name,
            feeFatherName: student.fatherName,
            feeMobileNumber: student.mobileNumber,
            feeCategory: student.categoryName,
            feeClassSection: student.classSection,
            feeAdmissionNo: student.admissionNo,
            feeRollNumber: student.rollNumber,
            feeRte: student.rte || 'No'
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el && map[id] != null && String(map[id]).trim() !== '') {
                el.textContent = map[id];
            }
        });
    }

    function renderFees() {
        if (!tableBody) {
            return;
        }

        if (!fees.length) {
            tableBody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:#999;padding:24px;">No fees assigned to this student</td></tr>';
            return;
        }

        var html = '';
        fees.forEach(function (item) {
            var canSelect = item.status !== 'Paid';
            html += '<tr class="' + rowClass(item.status) + '" data-fee-master-id="' + escapeHtml(String(item.feeMasterId)) + '">'
                + '<td>' + (canSelect ? '<input type="checkbox" class="fee-check" value="' + escapeHtml(String(item.feeMasterId)) + '">' : '') + '</td>'
                + '<td>' + escapeHtml(item.feesLabel || '') + '</td>'
                + '<td>' + escapeHtml(formatDate(item.dueDate)) + '</td>'
                + '<td><span class="ugf-status-badge ' + statusClass(item.status) + '">' + escapeHtml(item.status) + '</span></td>'
                + '<td>' + amountDisplay(item) + '</td>'
                + '<td></td><td></td><td></td>'
                + '<td>' + escapeHtml(formatMoney(item.discount)) + '</td>'
                + '<td>' + escapeHtml(formatMoney(item.fine)) + '</td>'
                + '<td>' + escapeHtml(formatMoney(item.paid)) + '</td>'
                + '<td>' + escapeHtml(formatMoney(item.balance)) + '</td>'
                + '<td></td>'
                + '</tr>';

            (item.payments || []).forEach(function (payment) {
                html += '<tr class="ugf-payment-row" data-payment-id="' + escapeHtml(String(payment.id || '')) + '">'
                    + '<td>' + paymentBranchHtml() + '</td>'
                    + '<td></td><td></td><td></td><td></td>'
                    + '<td>' + escapeHtml(payment.paymentRef || '') + '</td>'
                    + '<td>' + escapeHtml(payment.paymentMode || '') + '</td>'
                    + '<td>' + escapeHtml(formatDate(payment.paymentDate)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(payment.discountAmount)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(payment.fineAmount)) + '</td>'
                    + '<td>' + escapeHtml(formatMoney(payment.paidAmount)) + '</td>'
                    + '<td></td>'
                    + '<td>' + printActionButton() + '</td>'
                    + '</tr>';
            });
        });

        tableBody.innerHTML = html;
        syncSelectAll();
    }

    function syncSelectAll() {
        if (!selectAll || !tableBody) {
            return;
        }
        var checks = tableBody.querySelectorAll('.fee-check');
        if (!checks.length) {
            selectAll.checked = false;
            return;
        }
        selectAll.checked = Array.from(checks).every(function (c) { return c.checked; });
    }

    function selectedFeeMasterIds() {
        if (!tableBody) {
            return [];
        }
        return Array.from(tableBody.querySelectorAll('.fee-check:checked')).map(function (c) {
            return c.value;
        });
    }

    function selectedBulkPaymentMode() {
        var checked = document.querySelector('input[name="bulkPaymentMode"]:checked');
        return checked ? checked.value : 'Cash';
    }

    function openPaySelectedModal(feeMasterIds) {
        if (!feeMasterIds.length) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select at least one unpaid fee.', confirmButtonColor: '#727cf5' });
            return;
        }

        selectedBulkFees = fees.filter(function (item) {
            return feeMasterIds.indexOf(String(item.feeMasterId)) !== -1 && item.status !== 'Paid';
        });

        if (!selectedBulkFees.length) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select at least one unpaid fee.', confirmButtonColor: '#727cf5' });
            return;
        }

        var totalFees = 0;
        var totalFine = 0;
        var body = document.getElementById('paySelectedFeesBody');
        body.innerHTML = selectedBulkFees.map(function (item) {
            var feeAmount = Number(item.balance > 0 ? item.balance : item.amount) || 0;
            var fineAmount = Number(item.configuredFine || item.amountExtra || 0) || 0;
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
        var cashRadio = document.querySelector('input[name="bulkPaymentMode"][value="Cash"]');
        if (cashRadio) {
            cashRadio.checked = true;
        }

        paySelectedModal.classList.add('active');
        paySelectedModal.setAttribute('aria-hidden', 'false');
    }

    function closePaySelectedModal() {
        paySelectedModal.classList.remove('active');
        paySelectedModal.setAttribute('aria-hidden', 'true');
        selectedBulkFees = [];
    }

    function paySelectedFees() {
        var paymentDate = document.getElementById('bulkPaymentDate').value.trim();
        var payingAmount = document.getElementById('bulkPayingAmount').value.trim();
        var note = document.getElementById('bulkNote').value.trim();
        var feeMasterIds = selectedBulkFees.map(function (item) { return item.feeMasterId; });
        var paymentMode = selectedBulkPaymentMode();

        if (!paymentDate) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter payment date.', confirmButtonColor: '#727cf5' });
            return;
        }
        if (payingAmount === '' || Number(payingAmount) <= 0) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter paying amount.', confirmButtonColor: '#727cf5' });
            return;
        }

        fetch('/api/user/user/fees/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionYear: sessionYear,
                paymentMode: paymentMode,
                paymentDate: paymentDate,
                note: note,
                payingAmount: payingAmount,
                feeMasterIds: feeMasterIds
            })
        }).then(function (response) {
            if (!response.ok) {
                return response.json().then(function (err) {
                    throw new Error(err.message || 'Failed to collect fees');
                }).catch(function () {
                    throw new Error('Failed to collect fees');
                });
            }
            return response.json();
        }).then(function () {
            closePaySelectedModal();
            return loadPage();
        }).then(function () {
            Swal.fire({
                icon: 'success',
                title: 'Paid',
                text: 'Selected fees paid successfully.',
                timer: 1500,
                showConfirmButton: false
            });
        }).catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to pay selected fees.',
                confirmButtonColor: '#727cf5'
            });
        });
    }

    function loadPage() {
        document.getElementById('feeDateLabel').textContent = todayDisplay();
        document.getElementById('feeSessionLabel').textContent = sessionYear;

        return fetch('/api/user/user/fees?sessionYear=' + encodeURIComponent(sessionYear))
            .then(function (response) {
                if (!response.ok) {
                    return response.json().then(function (err) {
                        throw new Error(err.message || 'Failed to load student fees');
                    }).catch(function () {
                        throw new Error('Failed to load student fees');
                    });
                }
                return response.json();
            })
            .then(function (data) {
                fillStudent(data.student || {});
                if (data.sessionYear) {
                    sessionYear = data.sessionYear;
                    document.getElementById('feeSessionLabel').textContent = sessionYear;
                }
                if (data.date) {
                    document.getElementById('feeDateLabel').textContent = formatDate(data.date) || todayDisplay();
                }
                fees = normalizeFees(data.fees);
                renderFees();
            })
            .catch(function (error) {
                fees = [];
                renderFees();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to load student fees.',
                    confirmButtonColor: '#727cf5'
                });
            });
    }

    function loadOfflineBankInstruction() {
        fetch('/api/schsettings/fees')
            .then(function (response) {
                if (!response.ok) {
                    return null;
                }
                return response.json();
            })
            .then(function (data) {
                if (!data) {
                    return;
                }
                var instruction = data.offlineBankPaymentInstruction;
                if (instruction && String(instruction).trim()) {
                    document.getElementById('offlineBankInstruction').textContent = instruction;
                }
            })
            .catch(function () { /* ignore */ });
    }

    function openOfflineBankModal() {
        document.getElementById('offlinePaymentDate').value = todayDisplay();
        document.getElementById('offlineAmount').value = '';
        document.getElementById('offlineNote').value = '';
        offlineBankModal.classList.add('active');
        offlineBankModal.setAttribute('aria-hidden', 'false');
    }

    function closeOfflineBankModal() {
        offlineBankModal.classList.remove('active');
        offlineBankModal.setAttribute('aria-hidden', 'true');
    }

    function submitOfflineBankPayment() {
        var paymentDate = document.getElementById('offlinePaymentDate').value.trim();
        var amount = document.getElementById('offlineAmount').value.trim();
        var note = document.getElementById('offlineNote').value.trim();

        if (!paymentDate) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter payment date.', confirmButtonColor: '#727cf5' });
            return;
        }
        if (amount === '' || Number(amount) <= 0) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please enter a valid amount.', confirmButtonColor: '#727cf5' });
            return;
        }

        fetch('/api/user/user/fees/offline-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentDate: paymentDate,
                amount: amount,
                note: note
            })
        }).then(function (response) {
            if (!response.ok) {
                return response.json().then(function (err) {
                    throw new Error(err.message || 'Failed to submit offline bank payment');
                }).catch(function () {
                    throw new Error('Failed to submit offline bank payment');
                });
            }
            return response.json();
        }).then(function () {
            closeOfflineBankModal();
            Swal.fire({
                icon: 'success',
                title: 'Submitted',
                text: 'Offline bank payment request submitted successfully.',
                timer: 1800,
                showConfirmButton: false
            });
        }).catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to submit offline bank payment.',
                confirmButtonColor: '#727cf5'
            });
        });
    }

    function printSelectedFees() {
        var selected = selectedFeeMasterIds();
        if (!selected.length) {
            Swal.fire({
                icon: 'info',
                title: 'Print Fees',
                text: 'No fees selected. Printing the full fees statement.',
                timer: 1600,
                showConfirmButton: false
            });
        }
        window.print();
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
            if (e.target.classList.contains('fee-check')) {
                syncSelectAll();
            }
        });

        tableBody.addEventListener('click', function (e) {
            if (e.target.closest('.btn-print-one')) {
                window.print();
            }
        });
    }

    if (paySelectedBtn) {
        paySelectedBtn.addEventListener('click', function () {
            openPaySelectedModal(selectedFeeMasterIds());
        });
    }

    if (printSelectedBtn) {
        printSelectedBtn.addEventListener('click', printSelectedFees);
    }

    if (offlineBankBtn) {
        offlineBankBtn.addEventListener('click', openOfflineBankModal);
    }

    if (paySelectedOverlay) {
        paySelectedOverlay.addEventListener('click', closePaySelectedModal);
    }
    if (paySelectedCloseBtn) {
        paySelectedCloseBtn.addEventListener('click', closePaySelectedModal);
    }
    if (bulkPayBtn) {
        bulkPayBtn.addEventListener('click', paySelectedFees);
    }

    if (offlineBankOverlay) {
        offlineBankOverlay.addEventListener('click', closeOfflineBankModal);
    }
    if (offlineBankCloseBtn) {
        offlineBankCloseBtn.addEventListener('click', closeOfflineBankModal);
    }
    if (offlineBankSubmitBtn) {
        offlineBankSubmitBtn.addEventListener('click', submitOfflineBankPayment);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') {
            return;
        }
        if (paySelectedModal && paySelectedModal.classList.contains('active')) {
            closePaySelectedModal();
            return;
        }
        if (offlineBankModal && offlineBankModal.classList.contains('active')) {
            closeOfflineBankModal();
        }
    });

    ['copyBtn', 'excelBtn', 'csvBtn', 'pdfBtn', 'printTableBtn'].forEach(function (id) {
        var btn = document.getElementById(id);
        if (!btn) {
            return;
        }
        btn.addEventListener('click', function () {
            if (id === 'copyBtn') {
                var text = 'Fees\tDue Date\tStatus\tAmount\tPaid\tBalance\n';
                fees.forEach(function (item) {
                    text += [
                        item.feesLabel,
                        formatDate(item.dueDate),
                        item.status,
                        formatMoney(item.amount),
                        formatMoney(item.paid),
                        formatMoney(item.balance)
                    ].join('\t') + '\n';
                });
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        Swal.fire({
                            icon: 'success',
                            title: 'Copied!',
                            text: 'Table data copied to clipboard',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }).catch(function () {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Unable to copy to clipboard.',
                            confirmButtonColor: '#727cf5'
                        });
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Unable to copy to clipboard.',
                        confirmButtonColor: '#727cf5'
                    });
                }
                return;
            }
            window.print();
        });
    });

    loadOfflineBankInstruction();
    loadPage();
})();
