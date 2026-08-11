document.addEventListener('DOMContentLoaded', function () {
    const feesDetailsBody = document.getElementById('feesDetailsBody');
    const transportFeesBody = document.getElementById('transportFeesBody');
    const studentAdmissionBody = document.getElementById('studentAdmissionBody');
    const libraryDetailsBody = document.getElementById('libraryDetailsBody');
    const printBtn = document.getElementById('printOverviewBtn');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        if (value == null || value === '') return '$0.00';
        return '$' + Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatNumber(value) {
        if (value == null || value === '') return '0';
        return Number(value).toLocaleString('en-US');
    }

    function emptyRow(colspan) {
        return '<tr><td colspan="' + colspan + '" class="empty-state-cell">No data available</td></tr>';
    }

    function renderFeesDetails(rows) {
        if (!feesDetailsBody) return;
        if (!rows || !rows.length) {
            feesDetailsBody.innerHTML = emptyRow(6);
            return;
        }
        feesDetailsBody.innerHTML = rows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.branch) + '</td>'
                + '<td>' + escapeHtml(row.currentSession) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatNumber(row.totalStudents)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.totalFees)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.totalPaidFees)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.totalBalanceFees)) + '</td>'
                + '</tr>';
        }).join('');
    }

    function renderTransportFees(rows) {
        if (!transportFeesBody) return;
        if (!rows || !rows.length) {
            transportFeesBody.innerHTML = emptyRow(5);
            return;
        }
        transportFeesBody.innerHTML = rows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.branch) + '</td>'
                + '<td>' + escapeHtml(row.currentSession) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.totalFees)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.totalPaidFees)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatMoney(row.totalBalanceFees)) + '</td>'
                + '</tr>';
        }).join('');
    }

    function renderStudentAdmission(rows) {
        if (!studentAdmissionBody) return;
        if (!rows || !rows.length) {
            studentAdmissionBody.innerHTML = emptyRow(4);
            return;
        }
        studentAdmissionBody.innerHTML = rows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.branch) + '</td>'
                + '<td>' + escapeHtml(row.currentSession) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatNumber(row.offlineAdmission)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatNumber(row.onlineAdmission)) + '</td>'
                + '</tr>';
        }).join('');
    }

    function renderLibraryDetails(rows) {
        if (!libraryDetailsBody) return;
        if (!rows || !rows.length) {
            libraryDetailsBody.innerHTML = emptyRow(4);
            return;
        }
        libraryDetailsBody.innerHTML = rows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.branch) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatNumber(row.totalBooks)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatNumber(row.members)) + '</td>'
                + '<td class="text-end">' + escapeHtml(formatNumber(row.booksIssued)) + '</td>'
                + '</tr>';
        }).join('');
    }

    async function loadOverview() {
        const response = await fetch('/api/multibranch/overview');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load overview data');
        }
        const data = await response.json();
        renderFeesDetails(data.feesDetails);
        renderTransportFees(data.transportFeesDetails);
        renderStudentAdmission(data.studentAdmission);
        renderLibraryDetails(data.libraryDetails);
    }

    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    loadOverview().catch(function (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load overview data.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
