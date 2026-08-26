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

    function buildDemoFees() {
        var months = [
            ['April', 'apr', '04/01/2026'],
            ['May', 'may', '05/01/2026'],
            ['June', 'jun', '06/01/2026'],
            ['July', 'jul', '07/01/2026'],
            ['August', 'aug', '08/01/2026'],
            ['September', 'sep', '09/01/2026'],
            ['October', 'oct', '10/01/2026'],
            ['November', 'nov', '11/01/2026'],
            ['December', 'dec', '12/01/2026'],
            ['January', 'jan', '01/01/2027'],
            ['February', 'feb', '02/01/2027'],
            ['March', 'mar', '03/01/2027']
        ];

        var fees = months.map(function (item, index) {
            var row = {
                name: item[0] + ' Month Fees',
                slug: item[1] + '-month-fees',
                dueDate: item[2],
                amount: 350,
                fine: 0,
                discount: 0,
                paid: 0,
                status: 'Unpaid',
                alert: false,
                payments: []
            };

            if (index === 0) {
                row.status = 'Paid';
                row.paid = 350;
                row.payments = [{
                    paymentId: '5458/1',
                    mode: 'Cash',
                    date: '04/08/2026',
                    discount: 0,
                    fine: 0,
                    paid: 350,
                    balance: 0
                }];
            } else if (index === 1) {
                row.status = 'Partial';
                row.fine = 50;
                row.paid = 200;
                row.alert = true;
                row.payments = [{
                    paymentId: '5490/1',
                    mode: 'Cash',
                    date: '05/02/2026',
                    discount: 0,
                    fine: 0,
                    paid: 200,
                    balance: 150
                }];
            } else if (index === 3) {
                row.status = 'Paid';
                row.paid = 350;
                row.payments = [{
                    paymentId: '5490/2',
                    mode: 'Cash',
                    date: '07/05/2026',
                    discount: 0,
                    fine: 0,
                    paid: 350,
                    balance: 0
                }];
            }

            return row;
        });

        fees.push({
            name: 'Admission Fees',
            slug: 'admission-fees',
            dueDate: '04/01/2026',
            amount: 2000,
            fine: 0,
            discount: 0,
            paid: 0,
            status: 'Unpaid',
            alert: false,
            payments: []
        });

        for (var i = 1; i <= 6; i++) {
            fees.push({
                name: i + (i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th') + ' Installment Fees',
                slug: i + '-installment-fees',
                dueDate: '0' + Math.min(i + 3, 9) + '/15/2026',
                amount: 2500,
                fine: i === 1 ? 100 : 0,
                discount: 0,
                paid: 0,
                status: 'Unpaid',
                alert: i <= 2,
                payments: []
            });
        }

        months.forEach(function (item, index) {
            fees.push({
                name: item[0] + ' Transport Fees',
                slug: item[1] + '-transport-fees',
                dueDate: item[2],
                amount: 800,
                fine: index === 0 ? 50 : 0,
                discount: 0,
                paid: index === 0 ? 50 : 0,
                status: index === 0 ? 'Partial' : 'Unpaid',
                alert: index === 0,
                payments: index === 0 ? [{
                    paymentId: '5491/1',
                    mode: 'Cash',
                    date: '04/10/2026',
                    discount: 0,
                    fine: 50,
                    paid: 50,
                    balance: 800
                }] : []
            });
        });

        return fees;
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

    function loadFees() {
        var studentId = window.USER_PROFILE_STUDENT_ID;
        if (!studentId) {
            renderFeesTable(buildDemoFees());
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
                var apiFees = mapApiFees(data && data.fees);
                renderFeesTable(apiFees.length ? apiFees : buildDemoFees());
            })
            .catch(function () {
                renderFeesTable(buildDemoFees());
            });
    }

    document.addEventListener('DOMContentLoaded', loadFees);
})();
