document.addEventListener('DOMContentLoaded', function () {
    const UI = window.TransportUI;
    const classSelect = document.getElementById('criteriaClassSelect');
    const sectionSelect = document.getElementById('criteriaSectionSelect');
    const tableBody = document.getElementById('studentFeesTableBody');
    const monthsBody = document.getElementById('assignMonthsBody');
    const studentIdInput = document.getElementById('assignStudentId');
    const state = { rows: [], classes: [], currentPage: 1 };

    function filtered() {
        const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return [row.admissionNo, row.studentName, row.className, row.fatherName, row.routeTitle, row.vehicleNumber, row.pickupPoint].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        tableBody.innerHTML = slice.pageRows.length
            ? slice.pageRows.map(function (row) {
                const assignBtn = '<button type="button" class="btn-action btn-assign" data-id="' + UI.escapeHtml(row.id) + '" title="Assign Fees">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                    + '<rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20"></path>'
                    + '</svg></button>';
                return '<tr>'
                    + '<td>' + UI.escapeHtml(row.admissionNo) + '</td>'
                    + '<td>' + UI.escapeHtml(row.studentName) + '</td>'
                    + '<td>' + UI.escapeHtml(row.className + (row.section ? ' (' + row.section + ')' : '')) + '</td>'
                    + '<td>' + UI.escapeHtml(row.fatherName) + '</td>'
                    + '<td>' + UI.escapeHtml(row.dateOfBirth) + '</td>'
                    + '<td>' + UI.escapeHtml(row.routeTitle) + '</td>'
                    + '<td>' + UI.escapeHtml(row.vehicleNumber) + '</td>'
                    + '<td>' + UI.escapeHtml(row.pickupPoint) + '</td>'
                    + '<td><div class="action-buttons">' + assignBtn + '</div></td>'
                    + '</tr>';
            }).join('')
            : UI.emptyRow(9);
        UI.renderFooter(data.length, slice, state);
    }

    function fillSections() {
        const selected = state.classes.find(function (item) { return String(item.id) === classSelect.value; });
        const sections = selected && selected.sections ? selected.sections : [];
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + UI.escapeHtml(section) + '">' + UI.escapeHtml(section) + '</option>';
        }).join('');
    }

    classSelect.addEventListener('change', fillSections);

    document.getElementById('criteriaForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!classSelect.value) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Class is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const params = new URLSearchParams({ classId: classSelect.value });
            if (sectionSelect.value) params.set('section', sectionSelect.value);
            state.rows = await UI.fetchJson('/api/transport/student-fees?' + params.toString());
            state.currentPage = 1;
            render();
        } catch (err) {
            UI.error(err.message);
        }
    });

    function formatDate(value) {
        const text = UI.display(value);
        const parts = text.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        return text;
    }

    function formatMoney(value) {
        if (window.AppCurrency) return window.AppCurrency.formatCurrency(value);
        if (value == null || String(value).trim() === '') return '';
        const number = Number(value);
        return Number.isNaN(number) ? String(value) : number.toFixed(2);
    }

    function formatDistance(value) {
        if (value == null || String(value).trim() === '') return '';
        const number = Number(value);
        return Number.isNaN(number) ? String(value) : number.toFixed(1);
    }

    function fineLabel(type) {
        if (type === 'PERCENTAGE') return 'Percentage';
        if (type === 'FIX') return 'Fix';
        return 'None';
    }

    function metaItem(label, value) {
        return '<div class="assign-fees-meta-item"><strong>' + UI.escapeHtml(label) + '</strong> ' + UI.escapeHtml(UI.display(value)) + '</div>';
    }

    tableBody.addEventListener('click', async function (e) {
        const btn = e.target.closest('.btn-assign');
        if (!btn) return;
        try {
            const detail = await UI.fetchJson('/api/transport/student-fees/' + encodeURIComponent(btn.getAttribute('data-id')));
            studentIdInput.value = detail.id;
            const classSection = detail.className + (detail.section ? ' (' + detail.section + ')' : '');
            document.getElementById('assignStudentMeta').innerHTML = ''
                + metaItem('Name:', detail.studentName)
                + metaItem('Class (Section):', classSection)
                + metaItem('Father Name:', detail.fatherName)
                + metaItem('Admission No:', detail.admissionNo)
                + metaItem('Mobile Number:', detail.mobileNumber)
                + metaItem('Roll Number:', detail.rollNumber)
                + metaItem('Pickup:', detail.pickupPoint)
                + metaItem('Pickup Time:', detail.pickupTime)
                + metaItem('Fees ($):', formatMoney(detail.fees))
                + metaItem('Distance (km):', formatDistance(detail.distance));
            const months = detail.months || [];
            monthsBody.innerHTML = months.map(function (month) {
                return '<tr>'
                    + '<td><label class="month-cell"><input type="checkbox" class="month-check" value="' + UI.escapeHtml(month.monthName) + '"' + (month.assigned ? ' checked' : '') + '> ' + UI.escapeHtml(month.monthName) + '</label></td>'
                    + '<td>' + UI.escapeHtml(formatDate(month.dueDate)) + '</td>'
                    + '<td>' + UI.escapeHtml(fineLabel(month.fineType)) + '</td>'
                    + '<td class="amount-col">' + UI.escapeHtml(formatMoney(month.amount)) + '</td>'
                    + '</tr>';
            }).join('');
            const selectAll = document.getElementById('selectAllMonths');
            const checks = monthsBody.querySelectorAll('.month-check');
            selectAll.checked = checks.length > 0 && Array.from(checks).every(function (input) { return input.checked; });
            UI.openModal('assignFeesModal');
        } catch (err) {
            UI.error(err.message);
        }
    });

    document.getElementById('selectAllMonths').addEventListener('change', function () {
        const checked = document.getElementById('selectAllMonths').checked;
        monthsBody.querySelectorAll('.month-check').forEach(function (input) {
            input.checked = checked;
        });
    });
    monthsBody.addEventListener('change', function () {
        const checks = monthsBody.querySelectorAll('.month-check');
        const selectAll = document.getElementById('selectAllMonths');
        selectAll.checked = checks.length > 0 && Array.from(checks).every(function (input) { return input.checked; });
    });
    document.getElementById('assignFeesClose').addEventListener('click', function () { UI.closeModal('assignFeesModal'); });
    document.getElementById('assignFeesOverlay').addEventListener('click', function () { UI.closeModal('assignFeesModal'); });
    document.getElementById('assignFeesForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const months = Array.from(monthsBody.querySelectorAll('.month-check:checked')).map(function (input) { return input.value; });
        if (!months.length) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Select at least one month.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const data = await UI.fetchJson('/api/transport/student-fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: studentIdInput.value, months: months })
            });
            UI.closeModal('assignFeesModal');
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    UI.bindPaging(state, render);
    UI.bindExport('student-transport-fees', ['Admission No', 'Student Name', 'Class', 'Father Name', 'DOB', 'Route', 'Vehicle', 'Pickup Point'], function () {
        return filtered().map(function (row) {
            return [row.admissionNo, row.studentName, row.className, row.fatherName, row.dateOfBirth, row.routeTitle, row.vehicleNumber, row.pickupPoint];
        });
    });

    fetch('/api/classes').then(function (response) { return response.json(); }).then(function (data) {
        state.classes = Array.isArray(data) ? data : [];
        classSelect.innerHTML = '<option value="">Select</option>' + state.classes.map(function (item) {
            return '<option value="' + UI.escapeHtml(item.id) + '">' + UI.escapeHtml(item.name) + '</option>';
        }).join('');
    }).catch(function () {});
    render();
});
