(function () {
    'use strict';

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function money(value) {
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(value);
        }
        var num = Number(value);
        if (Number.isNaN(num)) {
            return '0.00';
        }
        return num.toFixed(2);
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

    function statusBadge(status) {
        var key = String(status || 'Unpaid').toLowerCase();
        return '<span class="sp-fees-status ' + escapeHtml(key) + '">' + escapeHtml(status) + '</span>';
    }

    function amountCell(amount, fine) {
        var base = money(amount);
        if (fine && Number(fine) > 0) {
            return escapeHtml(base) + ' <span class="sp-fee-amount-fine">+ ' + escapeHtml(money(fine)) + '</span>';
        }
        return escapeHtml(base);
    }

    function paymentBranchHtml() {
        return ''
            + '<span class="sp-fees-payment-branch">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path>'
            + '</svg></span>';
    }

    function mapApiFees(apiFees) {
        return (apiFees || []).map(function (item) {
            var label = item.feesLabel || item.feeTypeName || 'Fees';
            var slug = item.feesCode || String(item.feeMasterId || '');
            var fine = Number(item.amountExtra || item.fine || 0);
            var payments = (item.payments || []).map(function (payment, index) {
                return {
                    paymentId: payment.paymentRef || ('PAY/' + (index + 1)),
                    mode: payment.paymentMode || '',
                    date: formatDate(payment.paymentDate),
                    discount: payment.discountAmount || 0,
                    fine: payment.fineAmount || 0,
                    paid: payment.paidAmount || 0,
                    balance: 0
                };
            });

            return {
                name: label,
                slug: slug,
                dueDate: formatDate(item.dueDate),
                amount: item.amount || 0,
                fine: fine,
                discount: item.discount || 0,
                paid: item.paid || 0,
                status: item.status || 'Unpaid',
                alert: item.status === 'Partial',
                payments: payments
            };
        });
    }

    function loadFees() {
        var studentId = window.USER_PROFILE_STUDENT_ID;
        if (!studentId) {
            renderFeesTable([]);
            return;
        }

        fetch('/api/student-fees/' + encodeURIComponent(String(studentId)))
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load fees');
                }
                return response.json();
            })
            .then(function (data) {
                renderFeesTable(mapApiFees(data && data.fees));
            })
            .catch(function () {
                renderFeesTable([]);
            });
    }

    function renderFeesTable(fees) {
        var body = document.getElementById('profileFeesBody');
        var foot = document.getElementById('profileFeesFoot');
        if (!body || !foot) {
            return;
        }

        if (!fees.length) {
            body.innerHTML = '<tr><td colspan="11" class="sp-fees-empty">No record found</td></tr>';
            foot.innerHTML = '';
            return;
        }

        var totalAmount = 0;
        var totalFineOnAmount = 0;
        var totalDiscount = 0;
        var totalFine = 0;
        var totalPaid = 0;
        var totalBalance = 0;
        var html = '';

        fees.forEach(function (fee) {
            var balance = Math.max(0, Number(fee.amount) + Number(fee.fine || 0) - Number(fee.discount || 0) - Number(fee.paid || 0));
            totalAmount += Number(fee.amount || 0);
            totalFineOnAmount += Number(fee.fine || 0);
            totalDiscount += Number(fee.discount || 0);
            totalFine += Number(fee.fine || 0);
            totalPaid += Number(fee.paid || 0);
            totalBalance += balance;

            html += '<tr class="' + (fee.alert ? 'sp-fees-row-alert' : '') + '">'
                + '<td><span class="sp-fee-name">' + escapeHtml(fee.name)
                + ' <span class="sp-fee-slug">(' + escapeHtml(fee.slug) + ')</span></span></td>'
                + '<td>' + escapeHtml(fee.dueDate) + '</td>'
                + '<td>' + statusBadge(fee.status) + '</td>'
                + '<td>' + amountCell(fee.amount, fee.fine) + '</td>'
                + '<td></td><td></td><td></td>'
                + '<td></td><td></td><td></td>'
                + '<td>' + escapeHtml(money(balance)) + '</td>'
                + '</tr>';

            (fee.payments || []).forEach(function (payment) {
                html += '<tr class="sp-fees-payment-row">'
                    + '<td>' + paymentBranchHtml() + '</td>'
                    + '<td></td><td></td><td></td>'
                    + '<td>' + escapeHtml(payment.paymentId || '') + '</td>'
                    + '<td>' + escapeHtml(payment.mode || '') + '</td>'
                    + '<td>' + escapeHtml(payment.date || '') + '</td>'
                    + '<td>' + escapeHtml(money(payment.discount)) + '</td>'
                    + '<td>' + escapeHtml(money(payment.fine)) + '</td>'
                    + '<td>' + escapeHtml(money(payment.paid)) + '</td>'
                    + '<td>' + escapeHtml(money(payment.balance)) + '</td>'
                    + '</tr>';
            });
        });

        body.innerHTML = html;
        foot.innerHTML = ''
            + '<tr>'
            + '<td colspan="3" class="sp-fees-grand-label">Grand Total</td>'
            + '<td class="sp-fees-grand-total">' + amountCell(totalAmount, totalFineOnAmount) + '</td>'
            + '<td colspan="3"></td>'
            + '<td>$' + escapeHtml(money(totalDiscount)) + '</td>'
            + '<td>$' + escapeHtml(money(totalFine)) + '</td>'
            + '<td>$' + escapeHtml(money(totalPaid)) + '</td>'
            + '<td>$' + escapeHtml(money(totalBalance)) + '</td>'
            + '</tr>';
    }

    document.addEventListener('DOMContentLoaded', loadFees);
})();
