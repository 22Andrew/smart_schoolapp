document.addEventListener('DOMContentLoaded', function () {
    const roleSelect = document.getElementById('roleSelect');
    const attendanceDateInput = document.getElementById('attendanceDate');
    const attendanceFilterForm = document.getElementById('attendanceFilterForm');
    const staffListPanel = document.getElementById('staffListPanel');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const staffTableWrap = document.getElementById('staffTableWrap');
    const staffTableBody = document.getElementById('staffTableBody');
    const bulkAttendanceOptions = document.getElementById('bulkAttendanceOptions');
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

    const STATUSES = [
        'Present',
        'Late',
        'Absent',
        'Half Day',
        'Holiday',
        'Half Day (Second Half)'
    ];

    let staffRows = [];
    let currentAttendanceDate = '';
    let currentRole = '';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function formatDateForApi(value) {
        if (!value) {
            return '';
        }
        const parts = value.split('-');
        if (parts.length === 3) {
            return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        return value;
    }

    function setDefaultDate() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        attendanceDateInput.value = today.getFullYear() + '-' + month + '-' + day;
    }

    function populateRoleSelect(roles) {
        roleSelect.innerHTML = '<option value="">Select</option>' + (roles || []).map(function (role) {
            return '<option value="' + escapeHtml(role) + '">' + escapeHtml(role) + '</option>';
        }).join('');
    }

    function renderBulkOptions() {
        bulkAttendanceOptions.innerHTML = STATUSES.map(function (status, index) {
            return '<label><input type="radio" name="bulkAttendance" value="' + escapeHtml(status) + '"' + (index === 2 ? ' checked' : '') + '> ' + escapeHtml(status) + '</label>';
        }).join('');
    }

    function renderAttendanceRadios(staffId, selectedStatus) {
        return '<div class="attendance-radio-group">' + STATUSES.map(function (status) {
            return '<label><input type="radio" name="attendance-' + escapeHtml(staffId) + '" value="' + escapeHtml(status) + '" data-staff-id="' + escapeHtml(staffId) + '"' + (status === selectedStatus ? ' checked' : '') + '> ' + escapeHtml(status) + '</label>';
        }).join('') + '</div>';
    }

    function showNoRecords() {
        noRecordBanner.hidden = false;
        staffTableWrap.hidden = true;
        staffTableBody.innerHTML = '';
    }

    function renderStaff(rows) {
        staffRows = rows || [];
        if (!staffRows.length) {
            staffListPanel.hidden = false;
            showNoRecords();
            return;
        }

        staffListPanel.hidden = false;
        noRecordBanner.hidden = true;
        staffTableWrap.hidden = false;

        staffTableBody.innerHTML = staffRows.map(function (staff) {
            return '<tr data-id="' + escapeHtml(staff.id) + '">'
                + '<td>' + escapeHtml(staff.rowNumber) + '</td>'
                + '<td>' + escapeHtml(staff.staffId) + '</td>'
                + '<td class="staff-name-cell">' + escapeHtml(staff.staffName) + '</td>'
                + '<td>' + escapeHtml(staff.role) + '</td>'
                + '<td>' + renderAttendanceRadios(staff.id, staff.status || 'Absent') + '</td>'
                + '<td>' + escapeHtml(staff.attendanceDate || currentAttendanceDate) + '</td>'
                + '<td>' + escapeHtml(staff.source || 'N/A') + '</td>'
                + '<td><input type="text" class="attendance-time-input entry-time-input" value="' + escapeHtml(staff.entryTime || '') + '"></td>'
                + '<td><input type="text" class="attendance-time-input exit-time-input" value="' + escapeHtml(staff.exitTime || '') + '"></td>'
                + '<td><input type="text" class="attendance-note-input note-input" value="' + escapeHtml(staff.note || '') + '"></td>'
                + '</tr>';
        }).join('');
    }

    function applyBulkAttendance(status) {
        document.querySelectorAll('.attendance-radio-group input').forEach(function (radio) {
            if (radio.value === status) {
                radio.checked = true;
            }
        });
    }

    function collectRecords() {
        const records = [];
        staffTableBody.querySelectorAll('tr[data-id]').forEach(function (row) {
            const staffId = row.getAttribute('data-id');
            const checked = row.querySelector('.attendance-radio-group input:checked');
            records.push({
                id: staffId,
                status: checked ? checked.value : 'Absent',
                source: 'N/A',
                entryTime: row.querySelector('.entry-time-input').value.trim(),
                exitTime: row.querySelector('.exit-time-input').value.trim(),
                note: row.querySelector('.note-input').value.trim()
            });
        });
        return records;
    }

    async function loadInitialData() {
        const roles = await fetchJson('/api/staff-attendance/roles');
        populateRoleSelect(roles);
        renderBulkOptions();
        setDefaultDate();
    }

    bulkAttendanceOptions.addEventListener('change', function (event) {
        const radio = event.target.closest('input[name="bulkAttendance"]');
        if (radio) {
            applyBulkAttendance(radio.value);
        }
    });

    attendanceFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const role = roleSelect.value;
        const attendanceDate = formatDateForApi(attendanceDateInput.value);

        if (!attendanceDate) {
            showError({ message: 'Attendance Date is required.' });
            return;
        }

        try {
            currentAttendanceDate = attendanceDate;
            currentRole = role;
            const query = '/api/staff-attendance/staff?attendanceDate=' + encodeURIComponent(attendanceDate)
                + (role ? '&role=' + encodeURIComponent(role) : '');
            const rows = await fetchJson(query);
            renderStaff(rows);
        } catch (error) {
            showError(error);
        }
    });

    saveAttendanceBtn.addEventListener('click', async function () {
        if (!staffRows.length) {
            showError({ message: 'No staff records to save attendance for.' });
            return;
        }
        if (!currentAttendanceDate) {
            showError({ message: 'Please search staff before saving attendance.' });
            return;
        }

        try {
            const response = await fetchJson('/api/staff-attendance/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attendanceDate: currentAttendanceDate,
                    records: collectRecords()
                })
            });
            showSuccess(response.message || 'Attendance saved successfully!');
            const query = '/api/staff-attendance/staff?attendanceDate=' + encodeURIComponent(currentAttendanceDate)
                + (currentRole ? '&role=' + encodeURIComponent(currentRole) : '');
            const rows = await fetchJson(query);
            renderStaff(rows);
        } catch (error) {
            showError(error);
        }
    });

    loadInitialData().catch(showError);
});
