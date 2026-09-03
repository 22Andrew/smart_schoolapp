document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('purchaseReportForm');
    const searchType = document.getElementById('searchType');
    const paymentType = document.getElementById('paymentType');
    const paymentStatus = document.getElementById('paymentStatus');
    const usersType = document.getElementById('usersType');
    const searchBtn = document.getElementById('searchPurchaseBtn');
    const tbody = document.getElementById('purchaseReportBody');
    const footer = document.getElementById('purchaseReportFooter');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function emptyStateHtml() {
        return '<tr class="empty-row"><td colspan="7"><div class="empty-state">'
            + '<div class="empty-message">No data available in table</div>'
            + '<div class="empty-illustration" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90" viewBox="0 0 120 90" fill="none">'
            + '<rect x="28" y="38" width="64" height="40" rx="4" fill="#e2e8f0"/>'
            + '<path d="M28 46h64v4H28z" fill="#cbd5e1"/>'
            + '<rect x="40" y="22" width="28" height="22" rx="2" fill="#f8fafc" transform="rotate(-12 54 33)"/>'
            + '<rect x="58" y="18" width="28" height="22" rx="2" fill="#f1f5f9" transform="rotate(10 72 29)"/>'
            + '<circle cx="78" cy="24" r="3" fill="#94a3b8"/>'
            + '<circle cx="86" cy="30" r="2" fill="#94a3b8"/>'
            + '</svg></div>'
            + '<div class="empty-hint">← Add new record or search with different criteria.</div>'
            + '</div></td></tr>';
    }

    function renderRows(rows) {
        const list = Array.isArray(rows) ? rows : [];
        if (!list.length) {
            tbody.innerHTML = emptyStateHtml();
            footer.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }

        tbody.innerHTML = list.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.studentOrGuest || '-') + '</td>'
                + '<td>' + escapeHtml(row.date || '-') + '</td>'
                + '<td>' + escapeHtml(row.course || '-') + '</td>'
                + '<td>' + escapeHtml(row.courseProvider || '-') + '</td>'
                + '<td>' + escapeHtml(row.paymentType || '-') + '</td>'
                + '<td>' + escapeHtml(row.paymentMethod || '-') + '</td>'
                + '<td>' + escapeHtml(row.price == null ? '-' : row.price) + '</td>'
                + '</tr>';
        }).join('');
        footer.textContent = 'Showing 1 to ' + list.length + ' of ' + list.length + ' entries';
    }

    async function searchReport() {
        if (!searchType.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Search Type is required.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        if (!paymentType.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Payment Type is required.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const reportKey = (form && form.getAttribute('data-report-key')) || 'coursepurchase';
        const query = new URLSearchParams({
            reportType: reportKey,
            searchType: searchType.value,
            paymentType: paymentType.value,
            paymentStatus: paymentStatus.value || '',
            usersType: usersType.value || 'all'
        });

        searchBtn.disabled = true;
        try {
            const response = await fetch('/api/online-course-reports/purchase?' + query.toString());
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to load report');
            }
            const data = await response.json();
            renderRows(data.rows || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load report.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            searchBtn.disabled = false;
        }
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            searchReport();
        });
    }
});
