document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('searchPaymentForm');
    const paymentIdInput = document.getElementById('paymentIdInput');
    const searchBtn = document.getElementById('searchPaymentBtn');
    const resultsPanel = document.getElementById('resultsPanel');
    const resultsBody = document.getElementById('paymentResultsBody');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        return window.formatCurrency(value);
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value);
        if (text.includes('-')) {
            const parts = text.split('-');
            if (parts.length === 3) {
                return parts[1] + '/' + parts[2] + '/' + parts[0];
            }
        }
        return text;
    }

    function renderRows(rows) {
        if (!rows.length) {
            resultsBody.innerHTML = '<tr class="empty-row"><td colspan="11">No payment found for this Payment ID</td></tr>';
            return;
        }

        resultsBody.innerHTML = rows.map(function (row) {
            const studentId = row.studentAdmissionId;
            const action = studentId
                ? '<a class="btn-view-student" href="/studentfee/addfee/' + escapeHtml(studentId) + '">View Fees</a>'
                : '';
            return '<tr>' +
                '<td>' + escapeHtml(row.paymentRef) + '</td>' +
                '<td>' + escapeHtml(formatDate(row.paymentDate)) + '</td>' +
                '<td>' + escapeHtml(row.studentName || '') + '</td>' +
                '<td>' + escapeHtml(row.admissionNo || '') + '</td>' +
                '<td>' + escapeHtml(row.classSection || '') + '</td>' +
                '<td>' + escapeHtml(row.feesLabel || '') + '</td>' +
                '<td>' + escapeHtml(row.paymentMode || '') + '</td>' +
                '<td>' + formatMoney(row.paidAmount) + '</td>' +
                '<td>' + formatMoney(row.discountAmount) + '</td>' +
                '<td>' + formatMoney(row.fineAmount) + '</td>' +
                '<td>' + action + '</td>' +
                '</tr>';
        }).join('');
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const paymentId = (paymentIdInput.value || '').trim();
        if (!paymentId) {
            Swal.fire({
                icon: 'warning',
                title: 'Payment ID required',
                text: 'Please enter a Payment ID to search.'
            });
            paymentIdInput.focus();
            return;
        }

        searchBtn.disabled = true;
        try {
            const response = await fetch('/api/fee-payments/search?paymentId=' + encodeURIComponent(paymentId));
            const data = await response.json().catch(function () { return []; });
            if (!response.ok) {
                const message = data && data.message ? data.message : 'Failed to search fee payments';
                throw new Error(message);
            }
            resultsPanel.style.display = 'block';
            renderRows(Array.isArray(data) ? data : []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Search failed',
                text: error.message || 'Failed to search fee payments'
            });
        } finally {
            searchBtn.disabled = false;
        }
    });
});
