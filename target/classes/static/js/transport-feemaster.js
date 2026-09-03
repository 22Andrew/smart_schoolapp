document.addEventListener('DOMContentLoaded', function () {
    const UI = window.TransportUI;
    const form = document.getElementById('feeMasterForm');
    const tableBody = document.getElementById('feeMonthTableBody');
    const copyFirst = document.getElementById('copyFirstFees');
    let months = [];

    function fineRadios(row) {
        const type = row.fineType || 'NONE';
        return ''
            + '<div class="fine-options">'
            + '<label><input type="radio" name="fine-' + row.id + '" value="NONE"' + (type === 'NONE' ? ' checked' : '') + '> None</label>'
            + '<label><input type="radio" name="fine-' + row.id + '" value="PERCENTAGE"' + (type === 'PERCENTAGE' ? ' checked' : '') + '> Percentage</label>'
            + '<label><input type="radio" name="fine-' + row.id + '" value="FIX"' + (type === 'FIX' ? ' checked' : '') + '> Fix Amount</label>'
            + '</div>';
    }

    function render() {
        tableBody.innerHTML = months.map(function (row) {
            const disabledPct = row.fineType === 'PERCENTAGE' ? '' : ' disabled';
            const disabledFix = row.fineType === 'FIX' ? '' : ' disabled';
            return ''
                + '<tr data-id="' + UI.escapeHtml(row.id) + '">'
                + '<td>' + UI.escapeHtml(row.monthName) + '</td>'
                + '<td><input type="date" class="form-control due-date" value="' + UI.escapeHtml(row.dueDate) + '"></td>'
                + '<td>' + fineRadios(row) + '</td>'
                + '<td><input type="number" step="0.01" class="form-control percentage" value="' + UI.escapeHtml(UI.display(row.percentage)) + '"' + disabledPct + '></td>'
                + '<td><input type="number" step="0.01" class="form-control fixed-amount" value="' + UI.escapeHtml(UI.display(row.fixedAmount)) + '"' + disabledFix + '></td>'
                + '</tr>';
        }).join('');
    }

    tableBody.addEventListener('change', function (e) {
        const row = e.target.closest('tr');
        if (!row) return;
        const type = (row.querySelector('input[type="radio"]:checked') || {}).value || 'NONE';
        row.querySelector('.percentage').disabled = type !== 'PERCENTAGE';
        row.querySelector('.fixed-amount').disabled = type !== 'FIX';
        if (copyFirst.checked && row === tableBody.querySelector('tr')) {
            applyFirstToAll();
        }
    });

    copyFirst.addEventListener('change', function () {
        if (copyFirst.checked) applyFirstToAll();
    });

    function applyFirstToAll() {
        const first = tableBody.querySelector('tr');
        if (!first) return;
        const dueDate = first.querySelector('.due-date').value;
        const fineType = (first.querySelector('input[type="radio"]:checked') || {}).value || 'NONE';
        const percentage = first.querySelector('.percentage').value;
        const fixedAmount = first.querySelector('.fixed-amount').value;
        tableBody.querySelectorAll('tr').forEach(function (row) {
            row.querySelector('.due-date').value = dueDate;
            row.querySelectorAll('input[type="radio"]').forEach(function (radio) {
                radio.checked = radio.value === fineType;
            });
            row.querySelector('.percentage').value = percentage;
            row.querySelector('.fixed-amount').value = fixedAmount;
            row.querySelector('.percentage').disabled = fineType !== 'PERCENTAGE';
            row.querySelector('.fixed-amount').disabled = fineType !== 'FIX';
        });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = {
            months: Array.from(tableBody.querySelectorAll('tr')).map(function (row) {
                return {
                    id: row.getAttribute('data-id'),
                    dueDate: row.querySelector('.due-date').value,
                    fineType: (row.querySelector('input[type="radio"]:checked') || {}).value || 'NONE',
                    percentage: row.querySelector('.percentage').value,
                    fixedAmount: row.querySelector('.fixed-amount').value
                };
            })
        };
        try {
            const data = await UI.fetchJson('/api/transport/fee-months', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    UI.fetchJson('/api/transport/fee-months').then(function (data) {
        months = Array.isArray(data) ? data : [];
        render();
    }).catch(function (err) { UI.error(err.message); });
});
